package dto

import "time"

type LiveMsgType string

const (
	EVENTS = LiveMsgType("EVENTS")
	UNITS  = LiveMsgType("UNITS")
	HEALTH = LiveMsgType("HEALTH")
	RELOAD = LiveMsgType("RELOAD")
)

type LiveMsg[T any] struct {
	MsgId     string
	MsgType   LiveMsgType
	Timestamp time.Time
	Body      T
}
