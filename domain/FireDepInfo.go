package domain

type FireDepInfo struct {
	DashboardVersion    string `json:"dashboardVersion"`
	Name                string `json:"name"`
	Address             string `json:"address"`
	LogoUrl             string `json:"logoUrl"`
	MaxTimeTextToSpeech uint   `json:"maxTimeTextToSpeech"`
}
