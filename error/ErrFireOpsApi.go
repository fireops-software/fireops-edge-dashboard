package error

import "fmt"

type ErrFireOpsApi string

// Error implements error.
func (e ErrFireOpsApi) Error() string {
	return fmt.Sprintf("ErrFireOpsApi: %s", string(e))
}

func NewErrFireOpsApi(format string, args ...any) error {
	return ErrFireOpsApi(fmt.Sprintf(format, args...))
}
