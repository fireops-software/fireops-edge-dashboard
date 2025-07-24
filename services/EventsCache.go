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
	"github.com/uoul/go-common/log"
	"github.com/uoul/go-common/messaging"
)

// -------------------------------------------------------------------------------
// Type
// -------------------------------------------------------------------------------
type EventsCache struct {
	ctx      context.Context
	rabbitMq messaging.IMessenger[messaging.RabbitMqExchange, amqp091.Delivery]
	exchange messaging.RabbitMqExchange
	logger   log.ILogger

	clients map[async.Stream[[]domain.Event]]bool

	mux   sync.Mutex
	cache []domain.Event

	retryInterval time.Duration
}

// -------------------------------------------------------------------------------
// Public
// -------------------------------------------------------------------------------

// Subscribe implements INotificationService.
func (a *EventsCache) Subscribe() async.Stream[[]domain.Event] {
	a.mux.Lock()
	defer a.mux.Unlock()
	sub := async.NewBufferedStream[[]domain.Event](1)
	a.clients[sub] = true
	sub <- async.ActionResult[[]domain.Event]{
		Result: a.cache,
		Error:  nil,
	}
	return sub
}

// Unsubscribe implements INotificationService.
func (a *EventsCache) Unsubscribe(sub async.Stream[[]domain.Event]) {
	a.mux.Lock()
	defer a.mux.Unlock()
	delete(a.clients, sub)
}

// -------------------------------------------------------------------------------
// Private
// -------------------------------------------------------------------------------

func (e *EventsCache) run() error {
	// Subscribe for events on rabbitmq
	eventCh := e.rabbitMq.Subscribe(e.exchange)
	defer e.rabbitMq.Unsubscribe(eventCh)

	for {
		select {
		case <-e.ctx.Done():
			// Shutdown service
			return nil
		case msg := <-eventCh:
			if msg.Error != nil {
				return msg.Error
			}
			// Parse body
			events := []domain.Event{}
			if err := json.Unmarshal(msg.Result.Body, &events); err != nil {
				return appError.NewErrDataParsing("Failed to parse incomming message body - %v", err)
			}
			// Cache events
			e.cache = events
			// Notify all
			e.notify()
		}
	}
}

func (a *EventsCache) notify() {
	for c := range a.clients {
		c <- async.ActionResult[[]domain.Event]{
			Result: a.cache,
			Error:  nil,
		}
	}
}

// ----------------------------------------------------------------------
// Constructor
// ----------------------------------------------------------------------
func NewEventsCache(ctx context.Context, logger log.ILogger, rabbitMq messaging.IMessenger[messaging.RabbitMqExchange, amqp091.Delivery], exchange messaging.RabbitMqExchange, opts ...func(*EventsCache)) *EventsCache {
	// Create instance
	aac := &EventsCache{
		ctx:      ctx,
		logger:   logger,
		rabbitMq: rabbitMq,
		exchange: exchange,

		mux:     sync.Mutex{},
		cache:   []domain.Event{},
		clients: map[async.Stream[[]domain.Event]]bool{},

		retryInterval: 10 * time.Second,
	}
	// Apply Options
	for _, option := range opts {
		option(aac)
	}
	// Run service
	go func() {
		for {
			err := aac.run()
			if err == nil {
				// Service shutdown
				break
			}
			logger.Errorf("%v", err)
			time.Sleep(aac.retryInterval)
		}
	}()
	// Return instance
	return aac
}
