package error

import "fmt"

type ErrDataParsing string

func (e ErrDataParsing) Error() string {
	return fmt.Sprintf("ErrDataParsing: %s", string(e))
}

func NewErrDataParsing(fomat string, args ...any) error {
	return ErrDataParsing(fmt.Sprintf(fomat, args...))
}
