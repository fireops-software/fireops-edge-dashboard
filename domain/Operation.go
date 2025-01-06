package domain

type Operation struct {
	Eid               *int     `json:"eid"`
	Num1              *string  `json:"num_1"`
	Location          *string  `json:"location"`
	LocationInfo      *string  `json:"location_info"`
	LocationInvolved  *string  `json:"location_involved"`
	Category          *string  `json:"category"`
	TypEng            *string  `json:"typ_eng"`
	SubEng            *string  `json:"sub_eng"`
	AlarmLev          *uint    `json:"alarm_lev"`
	EventAlarmtext    *string  `json:"event_alarmtext"`
	CreateTime        *string  `json:"create_time"`
	FirstdispatchTime *string  `json:"firstdispatch_time"`
	Latitude          *float64 `json:"latitude"`
	Longitude         *float64 `json:"longitude"`
	CallerName        *string  `json:"caller_name"`
	CallerNumber      *string  `json:"caller_number"`
}
