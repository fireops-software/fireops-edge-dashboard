package error

import "fmt"

type ErrShutdown string

// Error implements error.
func (e ErrShutdown) Error() string {
	return fmt.Sprintf("ErrShutdown: %s", string(e))
}

func NewErrShutdown(format string, args ...any) error {
	return ErrShutdown(fmt.Sprintf(format, args...))
}
