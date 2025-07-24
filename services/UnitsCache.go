package services

import (
	"context"
	"encoding/json"
	"sync"
	"time"

	"github.com/fireops-software/fireops-edge-dashboard/domain"
	"github.com/rabbitmq/amqp091-go"
	"github.com/uoul/go-common/async"
	"github.com/uoul/go-common/log"
	"github.com/uoul/go-common/messaging"

	appError "github.com/fireops-software/fireops-edge-dashboard/error"
)

// -------------------------------------------------------------------------------
// Type
// -------------------------------------------------------------------------------

type UnitsCache struct {
	ctx      context.Context
	logger   log.ILogger
	rabbitMq messaging.IMessenger[messaging.RabbitMqExchange, amqp091.Delivery]
	exchange messaging.RabbitMqExchange

	mux     sync.Mutex
	clients map[async.Stream[[]domain.Unit]]bool
	cache   []domain.Unit

	retryInterval time.Duration
}

// -------------------------------------------------------------------------------
// Public
// -------------------------------------------------------------------------------

// Subscribe implements INotificationService.
func (u *UnitsCache) Subscribe() async.Stream[[]domain.Unit] {
	client := async.NewBufferedStream[[]domain.Unit](1)
	client <- async.ActionResult[[]domain.Unit]{
		Result: u.cache,
		Error:  nil,
	}
	u.clients[client] = true
	return client
}

// Unsubscribe implements INotificationService.
func (u *UnitsCache) Unsubscribe(sub async.Stream[[]domain.Unit]) {
	delete(u.clients, sub)
}

// -------------------------------------------------------------------------------
// Private
// -------------------------------------------------------------------------------

func (u *UnitsCache) run() error {
	// Subscribe for unit state
	unitsCh := u.rabbitMq.Subscribe(u.exchange)
	defer u.rabbitMq.Unsubscribe(unitsCh)

	for {
		select {
		case <-u.ctx.Done():
			// Shutdown service
			return nil
		case msg := <-unitsCh:
			if msg.Error != nil {
				return msg.Error
			}
			// Parse message
			units := []domain.Unit{}
			if err := json.Unmarshal(msg.Result.Body, &units); err != nil {
				return appError.NewErrDataParsing("Failed to parse incomming message body - %v", err)
			}
			// Cache units
			u.cache = units
			// Notify all
			u.notify()
		}
	}
}

func (a *UnitsCache) notify() {
	for c := range a.clients {
		c <- async.ActionResult[[]domain.Unit]{
			Result: a.cache,
			Error:  nil,
		}
	}
}

// ----------------------------------------------------------------------
// Constructor
// ----------------------------------------------------------------------
func NewUnitStateCache(ctx context.Context, logger log.ILogger, rabbitMq messaging.IMessenger[messaging.RabbitMqExchange, amqp091.Delivery], exchange messaging.RabbitMqExchange, opts ...func(*UnitsCache)) *UnitsCache {
	// Create instance
	u := &UnitsCache{
		ctx:      ctx,
		logger:   logger,
		rabbitMq: rabbitMq,
		exchange: exchange,

		mux:     sync.Mutex{},
		clients: map[async.Stream[[]domain.Unit]]bool{},
		cache:   []domain.Unit{},

		retryInterval: 10 * time.Second,
	}
	// Apply Options
	for _, o := range opts {
		o(u)
	}
	// Run service
	go func() {
		for {
			err := u.run()
			if err == nil {
				// Service shutdown
				break
			}
			logger.Errorf("%v", err)
			time.Sleep(u.retryInterval)
		}
	}()
	// Return instance
	return u
}
