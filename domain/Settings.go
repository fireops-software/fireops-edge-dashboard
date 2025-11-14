package domain

type Settings struct {
	DashboardVersion    string
	Name                string
	Address             string
	LogoUrl             string
	MaxTimeTextToSpeech uint
	ScreenBlankingDelay uint
	StartNightMode      string
	EndNightMode        string
}
