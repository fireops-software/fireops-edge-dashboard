package services

import (
	"time"

	"github.com/uoul/go-common/async"
)

type BrokerMsg struct {
	MsgId     string
	Timestamp time.Time
	Topic     string
	Body      []byte
}

type IMsgBrokerService interface {
	IService
	Subscribe(topic string) async.Stream[BrokerMsg]
	Unsubscribe(stream async.Stream[BrokerMsg])
}
