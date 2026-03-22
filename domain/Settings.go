package domain

type Settings struct {
	DashboardVersion               string
	Name                           string
	Address                        string
	LogoUrl                        string
	MaxTimeTextToSpeech            uint
	CountTextToSpeechWhenDispached uint
	ScreenBlankingDelay            uint
	StartNightMode                 string
	EndNightMode                   string
	SelectedTheme                  string
}
