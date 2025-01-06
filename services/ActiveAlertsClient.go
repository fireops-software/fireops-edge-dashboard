package services

import (
	"encoding/json"
	"fmt"

	"github.com/uoul/fireops-edge-dashboard/domain"
	"github.com/uoul/go-common/async"

	amqp "github.com/rabbitmq/amqp091-go"
	appError "github.com/uoul/fireops-edge-dashboard/error"
)

// ----------------------------------------------------------------------
// Type
// ----------------------------------------------------------------------

type ActiveAlertsClient struct {
	host       string
	port       uint16
	user       string
	password   string
	exchange   string
	buffersize uint
	stop       chan any

	clients map[async.Stream[[]domain.Operation]]bool
}

// ----------------------------------------------------------------------
// Public
// ----------------------------------------------------------------------
func (a *ActiveAlertsClient) Subscribe() async.Stream[[]domain.Operation] {
	var newStream async.Stream[[]domain.Operation]
	if a.buffersize > 0 {
		newStream = async.NewBufferedStream[[]domain.Operation](a.buffersize)
	} else {
		newStream = async.NewStream[[]domain.Operation]()
	}
	a.clients[newStream] = true
	return newStream
}

func (a *ActiveAlertsClient) Unsubscribe(sub async.Stream[[]domain.Operation]) {
	delete(a.clients, sub)
}

func (a *ActiveAlertsClient) Close() error {
	a.stop <- true
	return nil
}

func (a *ActiveAlertsClient) Run() error {
	conn, err := amqp.Dial(fmt.Sprintf("amqp://%s:%s@%s:%d", a.user, a.password, a.host, a.port))
	if err != nil {
		return appError.NewErrRabbitMq("failed to dial rabbitmq - %v", err)
	}
	defer conn.Close()

	ch, err := conn.Channel()
	if err != nil {
		return appError.NewErrRabbitMq("failed to create channel - %v", err)
	}
	defer ch.Close()

	q, err := ch.QueueDeclare(
		"",    // name
		false, // durable
		false, // delete when unused
		true,  // exclusive
		false, // no-wait
		nil,   // arguments
	)
	if err != nil {
		return appError.NewErrRabbitMq("failed to create queue - %v", err)
	}

	err = ch.QueueBind(
		q.Name,     // queue name
		"",         // routing key
		a.exchange, // exchange
		false,
		nil,
	)
	if err != nil {
		return appError.NewErrRabbitMq("failed to bind queue - %v", err)
	}

	msgs, err := ch.Consume(
		q.Name, // queue
		"",     // consumer
		true,   // auto-ack
		false,  // exclusive
		false,  // no-local
		false,  // no-wait
		nil,    // args
	)
	if err != nil {
		return appError.NewErrRabbitMq("failed to create consumer - %v", err)
	}

LP1:
	for {
		select {
		case <-a.stop:
			break LP1
		case msg := <-msgs:
			// Parse incomming message
			wasMsg := domain.WasMsg{}
			err = json.Unmarshal(msg.Body, &wasMsg)
			if err != nil {
				a.notify(async.ActionResult[[]domain.Operation]{
					Result: nil,
					Error:  err,
				})
				break
			}
			// Convert incomming message to needed domain object
			operations, err := convertWasMsgToOperations(&wasMsg)
			// Return current operations
			a.notify(async.ActionResult[[]domain.Operation]{
				Result: operations,
				Error:  err,
			})
		}
	}
	return nil
}

// ----------------------------------------------------------------------
// Private
// ----------------------------------------------------------------------
func convertWasMsgToOperations(wasMsg *domain.WasMsg) ([]domain.Operation, error) {
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
	return operations, nil
}

func (a *ActiveAlertsClient) notify(msg async.ActionResult[[]domain.Operation]) {
	for c := range a.clients {
		c <- msg
	}
}

// ----------------------------------------------------------------------
// Options
// ----------------------------------------------------------------------
func WithActiveAlertsClientBufferSize(size uint) func(*ActiveAlertsClient) {
	return func(aac *ActiveAlertsClient) {
		aac.buffersize = size
	}
}

// ----------------------------------------------------------------------
// Constructor
// ----------------------------------------------------------------------
func NewActiveAlertsClient(host string, port uint16, user, password, exchange string) INotificationService[[]domain.Operation] {
	return &ActiveAlertsClient{
		host:       host,
		port:       port,
		user:       user,
		password:   password,
		exchange:   exchange,
		buffersize: 0,
		stop:       make(chan any),
		clients:    map[async.Stream[[]domain.Operation]]bool{},
	}
}
