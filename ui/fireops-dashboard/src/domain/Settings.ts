export class Settings {
  constructor(
    public DashboardVersion: string = "",
    public Name: string = "",
    public Address: string = "",
    public LogoUrl: string = "",
    public MaxTimeTextToSpeech: number = 0,
    public ScreenBlankingDelay: number = 0,
    public StartNightMode: string = "",
    public EndNightMode: string = "",
    public SelectedTheme: "default" | "modern-light" | "modern-dark",
  ){}
}