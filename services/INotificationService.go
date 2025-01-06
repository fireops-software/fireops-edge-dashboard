package services

import "github.com/uoul/go-common/async"

type INotificationService[T any] interface {
	IService
	Subscribe() async.Stream[T]
	Unsubscribe(sub async.Stream[T])
}
