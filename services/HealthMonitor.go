package services

import (
	"context"
	"encoding/json"

	"github.com/fireops-software/fireops-edge-dashboard/domain"
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

	healthStates []domain.Health

	subs map[async.Stream[[]domain.Health]]bool
}

// -------------------------------------------------------------------------------
// Public
// -------------------------------------------------------------------------------

// Run implements IService.
func (h *HealthMonitor) Run() {
	notifications := h.messenger.Subscribe(h.exchange)
	defer h.messenger.Unsubscribe(notifications)

	for {
		select {
		case <-h.ctx.Done():
			return
		case s := <-notifications:
			if s.Error != nil {
				h.logger.Error(s.Error.Error())
				break
			}
			// Parse incomming health state message
			var state domain.Health
			if err := json.Unmarshal(s.Result.Body, &state); err != nil {
				h.logger.Errorf("failed to parse message - %v", err)
				break
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
			h.notify(h.healthStates)
		}
	}
}

// Subscribe implements INotificationService.
func (h *HealthMonitor) Subscribe() async.Stream[[]domain.Health] {
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
	delete(h.subs, sub)
}

// -------------------------------------------------------------------------------
// Private
// -------------------------------------------------------------------------------

func (h *HealthMonitor) notify(msg []domain.Health) {
	for sub := range h.subs {
		sub <- async.ActionResult[[]domain.Health]{
			Result: msg,
			Error:  nil,
		}
	}
}

// -------------------------------------------------------------------------------
// Constructor
// -------------------------------------------------------------------------------

func NewHealthMonitor(ctx context.Context, logger log.ILogger, messanger messaging.IMessenger[messaging.RabbitMqExchange, amqp091.Delivery], exchange messaging.RabbitMqExchange) INotificationService[[]domain.Health] {
	return &HealthMonitor{
		ctx:          ctx,
		logger:       logger,
		messenger:    messanger,
		exchange:     exchange,
		healthStates: []domain.Health{},
		subs:         map[async.Stream[[]domain.Health]]bool{},
	}
}
