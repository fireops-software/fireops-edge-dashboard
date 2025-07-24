package services

import (
	"context"
	"encoding/json"
	"sync"
	"time"

	"github.com/fireops-software/fireops-edge-dashboard/domain"
	appError "github.com/fireops-software/fireops-edge-dashboard/error"
	"github.com/rabbitmq/amqp091-go"
	"github.com/uoul/go-common/async"
	"github.com/uoul/go-common/collections"
	"github.com/uoul/go-common/log"
	"github.com/uoul/go-common/messaging"
)

// -------------------------------------------------------------------------------
// Type
// -------------------------------------------------------------------------------

type HealthMonitor struct {
	ctx       context.Context
	logger    log.ILogger
	messenger messaging.IMessenger[messaging.RabbitMqExchange, amqp091.Delivery]
	exchange  messaging.RabbitMqExchange

	mux          sync.Mutex
	healthStates []domain.Health

	subs          map[async.Stream[[]domain.Health]]bool
	retryInterval time.Duration
}

// -------------------------------------------------------------------------------
// Public
// -------------------------------------------------------------------------------

// Subscribe implements INotificationService.
func (h *HealthMonitor) Subscribe() async.Stream[[]domain.Health] {
	h.mux.Lock()
	defer h.mux.Unlock()
	sub := async.NewBufferedStream[[]domain.Health](1)
	sub <- async.ActionResult[[]domain.Health]{
		Result: h.healthStates,
		Error:  nil,
	}
	h.subs[sub] = true
	return sub
}

// Unsubscribe implements INotificationService.
func (h *HealthMonitor) Unsubscribe(sub async.Stream[[]domain.Health]) {
	h.mux.Lock()
	defer h.mux.Unlock()
	delete(h.subs, sub)
}

// -------------------------------------------------------------------------------
// Private
// -------------------------------------------------------------------------------

func (h *HealthMonitor) notify() {
	for sub := range h.subs {
		sub <- async.ActionResult[[]domain.Health]{
			Result: h.healthStates,
			Error:  nil,
		}
	}
}

func (h *HealthMonitor) run() error {
	// Subscribe for health status updates
	notifications := h.messenger.Subscribe(h.exchange)
	defer h.messenger.Unsubscribe(notifications)

	for {
		select {
		case <-h.ctx.Done():
			return nil
		case s := <-notifications:
			if s.Error != nil {
				return s.Error
			}
			// Parse incomming health state message
			var state domain.Health
			if err := json.Unmarshal(s.Result.Body, &state); err != nil {
				return appError.NewErrDataParsing("Failed to parse incomming message body - %v", err)
			}
			// Check if service already known
			if !collections.ContainsSlice(h.healthStates, func(s domain.Health) bool { return s.ServiceName == state.ServiceName }) {
				// Add service to monitored items
				h.healthStates = append(h.healthStates, state)
			} else {
				// Update state of entry, that has changed
				h.healthStates = collections.MapSlice(h.healthStates, func(s domain.Health) domain.Health {
					if s.ServiceName == state.ServiceName {
						return state
					}
					return s
				})
			}
			h.notify()
		}
	}
}

// -------------------------------------------------------------------------------
// Constructor
// -------------------------------------------------------------------------------

func NewHealthMonitor(ctx context.Context, logger log.ILogger, messanger messaging.IMessenger[messaging.RabbitMqExchange, amqp091.Delivery], exchange messaging.RabbitMqExchange, opts ...func(*HealthMonitor)) *HealthMonitor {
	h := &HealthMonitor{
		ctx:           ctx,
		logger:        logger,
		messenger:     messanger,
		exchange:      exchange,
		mux:           sync.Mutex{},
		healthStates:  []domain.Health{},
		subs:          map[async.Stream[[]domain.Health]]bool{},
		retryInterval: 10 * time.Second,
	}
	for _, o := range opts {
		o(h)
	}
	go func() {
		for {
			err := h.run()
			if err == nil {
				// Service shutdown
				break
			}
			logger.Errorf("%v", err)
			time.Sleep(h.retryInterval)
		}
	}()
	return h
}
