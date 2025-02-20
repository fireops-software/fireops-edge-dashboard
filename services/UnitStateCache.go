package services

import (
	"context"
	"reflect"
	"time"

	"github.com/fireops-software/fireops-edge-dashboard/dal/fireops"
	"github.com/fireops-software/fireops-edge-dashboard/domain"
	"github.com/uoul/go-common/async"
	"github.com/uoul/go-common/log"
)

// -------------------------------------------------------------------------------
// Type
// -------------------------------------------------------------------------------

type UnitStateCache struct {
	logger     log.ILogger
	fireOpsApi fireops.IFireOpsApi

	clients map[async.Stream[[]domain.Unit]]bool
	stop    chan any
	units   []domain.Unit

	pollInterval time.Duration
}

// -------------------------------------------------------------------------------
// Public
// -------------------------------------------------------------------------------

// Close implements INotificationService.
func (u *UnitStateCache) Close() error {
	u.stop <- true
	return nil
}

// Run implements INotificationService.
func (u *UnitStateCache) Run() {
	// Create ticker
	ticker := time.NewTicker(u.pollInterval)
	defer ticker.Stop()
	// Run service
LP1:
	for {
		select {
		case <-u.stop:
			break LP1
		case <-ticker.C:
			ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
			units := <-u.fireOpsApi.GetUnits(ctx)
			cancel()
			if units.Error != nil {
				u.logger.Errorf("%v", units.Error)
				continue
			}
			if !reflect.DeepEqual(units.Result, u.units) {
				u.logger.Infof("state of units has changed: %v", mustJson(units.Result))
				u.units = units.Result
				u.notify(async.ActionResult[[]domain.Unit]{
					Result: u.units,
					Error:  nil,
				})
			}
		}
	}
}

// Subscribe implements INotificationService.
func (u *UnitStateCache) Subscribe() async.Stream[[]domain.Unit] {
	client := async.NewBufferedStream[[]domain.Unit](1)
	client <- async.ActionResult[[]domain.Unit]{
		Result: u.units,
		Error:  nil,
	}
	u.clients[client] = true
	return client
}

// Unsubscribe implements INotificationService.
func (u *UnitStateCache) Unsubscribe(sub async.Stream[[]domain.Unit]) {
	delete(u.clients, sub)
}

// -------------------------------------------------------------------------------
// Private
// -------------------------------------------------------------------------------
func (a *UnitStateCache) notify(msg async.ActionResult[[]domain.Unit]) {
	for c := range a.clients {
		c <- msg
	}
}

// -------------------------------------------------------------------------------
// Options
// -------------------------------------------------------------------------------
func WithUnitPollInterval(interval time.Duration) func(*UnitStateCache) {
	return func(usc *UnitStateCache) {
		usc.pollInterval = interval
	}
}

// ----------------------------------------------------------------------
// Constructor
// ----------------------------------------------------------------------
func NewUnitStateCache(fireOpsApi fireops.IFireOpsApi, logger log.ILogger, opts ...func(*UnitStateCache)) *UnitStateCache {
	usc := &UnitStateCache{
		logger:     logger,
		fireOpsApi: fireOpsApi,

		clients: map[async.Stream[[]domain.Unit]]bool{},
		stop:    make(chan any),

		pollInterval: time.Minute,
	}
	for _, o := range opts {
		o(usc)
	}
	return usc
}
