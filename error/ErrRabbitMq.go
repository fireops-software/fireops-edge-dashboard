package error

import "fmt"

type ErrRabbitMq string

// Error implements error.
func (e ErrRabbitMq) Error() string {
	return fmt.Sprintf("ErrRabbitMq: %s", string(e))
}

func NewErrRabbitMq(format string, args ...any) error {
	return ErrRabbitMq(fmt.Sprintf(format, args...))
}
