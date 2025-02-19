package error

import "fmt"

type ErrUnavailable string

// Error implements error.
func (e ErrUnavailable) Error() string {
	return fmt.Sprintf("ErrUnavailable: %s", string(e))
}

func NewErrUnavailable(format string, args ...any) error {
	return ErrUnavailable(fmt.Sprintf(format, args...))
}
