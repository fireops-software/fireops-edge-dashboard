package services

import (
	"bytes"
	"context"
	"encoding/gob"
	"encoding/json"
	"hash/crc32"
	"sync"
	"time"

	"github.com/fireops-software/fireops-edge-dashboard/dal/fireops"
	"github.com/fireops-software/fireops-edge-dashboard/domain"
	"github.com/rabbitmq/amqp091-go"
	"github.com/uoul/go-common/async"
	"github.com/uoul/go-common/log"
	"github.com/uoul/go-common/messaging"
)

// -------------------------------------------------------------------------------
// Type
// -------------------------------------------------------------------------------
type ActiveAlertsCache struct {
	messenger       messaging.IMessenger[messaging.RabbitMqExchange, amqp091.Delivery]
	exchange        messaging.RabbitMqExchange
	fireOpsApi      fireops.IFireOpsApi
	logger          log.ILogger
	fireOpsTickRate time.Duration
	ctx             context.Context

	clients map[async.Stream[[]domain.Operation]]bool

	mux        sync.Mutex
	operations map[string]domain.Operation
}

// -------------------------------------------------------------------------------
// Public
// -------------------------------------------------------------------------------

// Run implements INotificationService.
func (a *ActiveAlertsCache) Run() {
	// Subscribe on WAS events
	wasMsgCh := a.messenger.Subscribe(a.exchange)
	defer a.messenger.Unsubscribe(wasMsgCh)

	// Create ticker for polling on fireOps api
	ticker := time.NewTicker(a.fireOpsTickRate)
	defer ticker.Stop()

	// Run
LP1:
	for {
		select {
		case <-a.ctx.Done():
			break LP1
		case rmsg := <-wasMsgCh:
			if rmsg.Error != nil {
				a.logger.Errorf("%v", rmsg.Error)
				break
			}
			// Backup old operations
			backup := crc(a.operations)
			// Parse incomming alert from rabbitMq
			var msg domain.WasMsg
			err := json.Unmarshal(rmsg.Result.Body, &msg)
			if err != nil {
				a.logger.Errorf("failed to parse message from rabbitmq - %v", err)
				break
			}
			wasMsg := convertWasMsgToOperations(&msg)

			// Add new operations
			for _, msg := range wasMsg {
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
				if !operationsContain(wasMsg, num_1) {
					a.mux.Lock()
					delete(a.operations, num_1)
					a.mux.Unlock()
				}
			}
			if backup != crc(a.operations) {
				current := a.getCurrentOperations()
				a.logger.Infof("active alerts changed: %s", mustJson(current))
				a.notify(async.ActionResult[[]domain.Operation]{
					Result: current,
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
				current := a.getCurrentOperations()
				a.logger.Infof("active alerts changed: %s", mustJson(current))
				a.notify(async.ActionResult[[]domain.Operation]{
					Result: current,
					Error:  nil,
				})
			}
		}
	}
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

func convertWasMsgToOperations(wasMsg *domain.WasMsg) []domain.Operation {
	operations := []domain.Operation{}
	for alertId, alert := range wasMsg.Alerts {
		o := domain.Operation{
			Eid:               nil,
			Num1:              &alertId,
			Location:          &alert.Location,
			LocationInfo:      nil,
			LocationInvolved:  nil,
			Category:          &alert.Program,
			TypEng:            &alert.OperationName,
			SubEng:            nil,
			AlarmLev:          &alert.Level,
			EventAlarmtext:    &alert.Info,
			CreateTime:        &alert.ReceiveTad,
			FirstdispatchTime: nil,
			Latitude:          nil,
			Longitude:         nil,
			CallerName:        &alert.Contact.Name,
			CallerNumber:      &alert.Contact.PhoneNumber,
		}
		operations = append(operations, o)
	}
	return operations
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
func NewActiveAlertsCache(ctx context.Context, messenger messaging.IMessenger[messaging.RabbitMqExchange, amqp091.Delivery], exchange messaging.RabbitMqExchange, fireOpsApi fireops.IFireOpsApi, logger log.ILogger, opts ...func(*ActiveAlertsCache)) INotificationService[[]domain.Operation] {
	aac := &ActiveAlertsCache{
		messenger:       messenger,
		exchange:        exchange,
		fireOpsApi:      fireOpsApi,
		logger:          logger,
		fireOpsTickRate: 20 * time.Second,
		ctx:             ctx,

		clients:    map[async.Stream[[]domain.Operation]]bool{},
		operations: map[string]domain.Operation{},
	}
	for _, option := range opts {
		option(aac)
	}
	return aac
}
