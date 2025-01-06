package domain

type WasMsg struct {
	Alerts map[string]struct {
		Origin struct {
			Tid  uint   `json:"tid"`
			Name string `json:"name"`
		} `json:"origin"`
		ReceiveTad    string `json:"receiveTad"`
		OperationName string `json:"operationName"`
		Program       string `json:"program"`
		Level         uint   `json:"level"`
		Contact       struct {
			Name        string `json:"name"`
			PhoneNumber string `json:"phoneNumber"`
		} `json:"contact"`
		Location     string            `json:"location"`
		Info         string            `json:"info"`
		Destinations map[string]string `json:"destinations"`
	} `json:"alerts"`
}
