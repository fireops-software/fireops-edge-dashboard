package services

import "encoding/json"

type IService interface {
	Run()
	Close() error
}

// -------------------------------------------------------------------------------
// Common
// -------------------------------------------------------------------------------
func mustJson(v any) string {
	j, _ := json.Marshal(v)
	return string(j)
}
