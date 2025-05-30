package domain

import "time"

const (
	STATE_UNKNOWN   = HealthState("UNKNOWN")
	STATE_NOT_READY = HealthState("NOT READY")
	STATE_READY     = HealthState("READY")
)

type HealthState string

type Health struct {
	ServiceName string
	Timestamp   time.Time
	State       HealthState
	Errors      []string
	Description string
}
