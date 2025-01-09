package services

import (
	"bytes"
	"context"
	"encoding/gob"
	"hash/crc32"
	"sync"
	"time"

	"github.com/fireops-software/fireops-edge-dashboard/dal/fireops"
	"github.com/fireops-software/fireops-edge-dashboard/domain"
	"github.com/uoul/go-common/async"
	"github.com/uoul/go-common/log"
)

// -------------------------------------------------------------------------------
// Type
// -------------------------------------------------------------------------------
type ActiveAlertsCache struct {
	activeAlertsClient INotificationService[[]domain.Operation]
	fireOpsApi         fireops.IFireOpsApi
	logger             log.ILogger
	fireOpsTickRate    time.Duration

	clients map[async.Stream[[]domain.Operation]]bool
	stop    chan any

	mux        sync.Mutex
	operations map[string]domain.Operation
}

// -------------------------------------------------------------------------------
// Public
// -------------------------------------------------------------------------------

// Close implements INotificationService.
func (a *ActiveAlertsCache) Close() error {
	a.stop <- true
	return nil
}

// Run implements INotificationService.
func (a *ActiveAlertsCache) Run() error {
	// Subscribe on WAS events
	wasMsgCh := a.activeAlertsClient.Subscribe()
	defer a.activeAlertsClient.Unsubscribe(wasMsgCh)

	// Create ticker for polling on fireOps api
	ticker := time.NewTicker(a.fireOpsTickRate)
	defer ticker.Stop()

	// Run
LP1:
	for {
		select {
		case <-a.stop:
			break LP1
		case wasMsg := <-wasMsgCh:
			backup := crc(a.operations)
			if wasMsg.Error != nil {
				a.logger.Errorf("%v", wasMsg.Error)
				break
			}
			// Add new operations
			for _, msg := range wasMsg.Result {
				if msg.Num1 != nil {
					if _, exists := a.operations[*msg.Num1]; !exists {
						a.mux.Lock()
						a.operations[*msg.Num1] = msg
						a.mux.Unlock()
					}
				}
			}
			// Remove old
			for num_1 := range a.operations {
				if !operationsContain(wasMsg.Result, num_1) {
					a.mux.Lock()
					delete(a.operations, num_1)
					a.mux.Unlock()
				}
			}
			if backup != crc(a.operations) {
				a.notify(async.ActionResult[[]domain.Operation]{
					Result: a.getCurrentOperations(),
					Error:  nil,
				})
			}
		case <-ticker.C:
			backup := crc(a.operations)
			for num_1 := range a.operations {
				timeoutCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
				o := <-a.fireOpsApi.GetOperation(timeoutCtx, num_1)
				cancel()
				if o.Error != nil {
					a.logger.Errorf("%v", o.Error)
					continue
				}
				a.mux.Lock()
				a.operations[num_1] = o.Result
				a.mux.Unlock()
			}
			if backup != crc(a.operations) {
				a.notify(async.ActionResult[[]domain.Operation]{
					Result: a.getCurrentOperations(),
					Error:  nil,
				})
			}
		}
	}
	return nil
}

// Subscribe implements INotificationService.
func (a *ActiveAlertsCache) Subscribe() async.Stream[[]domain.Operation] {
	newStream := async.NewBufferedStream[[]domain.Operation](1)
	newStream <- async.ActionResult[[]domain.Operation]{
		Result: a.getCurrentOperations(),
		Error:  nil,
	}
	a.clients[newStream] = true
	return newStream
}

// Unsubscribe implements INotificationService.
func (a *ActiveAlertsCache) Unsubscribe(sub async.Stream[[]domain.Operation]) {
	delete(a.clients, sub)
}

// Get active operations
func (a *ActiveAlertsCache) GetOperations() []domain.Operation {
	return a.getCurrentOperations()
}

// -------------------------------------------------------------------------------
// Private
// -------------------------------------------------------------------------------
func operationsContain(operations []domain.Operation, num_1 string) bool {
	for _, o := range operations {
		if *o.Num1 == num_1 {
			return true
		}
	}
	return false
}

func crc(o any) uint32 {
	var buf bytes.Buffer
	encoder := gob.NewEncoder(&buf)
	encoder.Encode(o)
	return crc32.ChecksumIEEE(buf.Bytes())
}

func (a *ActiveAlertsCache) getCurrentOperations() []domain.Operation {
	r := make([]domain.Operation, len(a.operations))
	i := 0
	for _, o := range a.operations {
		r[i] = o
		i++
	}
	return r
}

func (a *ActiveAlertsCache) notify(msg async.ActionResult[[]domain.Operation]) {
	for c := range a.clients {
		c <- msg
	}
}

// -------------------------------------------------------------------------------
// Options
// -------------------------------------------------------------------------------
func WithFireOpsRefreshRate(rate time.Duration) func(*ActiveAlertsCache) {
	return func(aac *ActiveAlertsCache) {
		aac.fireOpsTickRate = rate
	}
}

// ----------------------------------------------------------------------
// Constructor
// ----------------------------------------------------------------------
func NewActiveAlertsCache(activeAlertsClient INotificationService[[]domain.Operation], fireOpsApi fireops.IFireOpsApi, logger log.ILogger, opts ...func(*ActiveAlertsCache)) *ActiveAlertsCache {
	aac := &ActiveAlertsCache{
		activeAlertsClient: activeAlertsClient,
		fireOpsApi:         fireOpsApi,
		logger:             logger,
		fireOpsTickRate:    20 * time.Second,

		clients:    map[async.Stream[[]domain.Operation]]bool{},
		operations: map[string]domain.Operation{},
	}
	for _, option := range opts {
		option(aac)
	}
	return aac
}
