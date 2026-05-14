package domain

type Event struct {
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
	Destinations      []struct {
		Id   uint   `json:"id"`
		Name string `json:"name"`
	} `json:"destinations"`
	AlertedUnits []struct {
		UnidLong *string `json:"unid_long"`
		SName    *string `json:"s_name"`
		UniTyp   *string `json:"unityp"`
		Priority *int    `json:"priority"`
	} `json:"alerted_units"`
	UserResponses struct {
		Accepted []string `json:"accepted"`
		Declined []string `json:"declined"`
	} `json:"user_responses"`
	AlertState *string `json:"alert_state"`
	FullChain  *bool   `json:"fullChain"`
}
