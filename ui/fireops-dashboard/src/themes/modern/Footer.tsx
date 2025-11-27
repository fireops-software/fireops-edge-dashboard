import { useEffect, useState } from "react";
import AppConfig from "../../AppConfig";
import { Health } from "../../domain/Health";
import useHealth from "../../state/useHealth";
import IconSchedule from "./assets/schedule.svg?react"


const Footer = () => {
  const [datetime, setDateTime] = useState(new Date())
  const { health } = useHealth()

  useEffect(() => {
    const intervalId: number = setInterval(() => setDateTime(new Date()), 1000)
    return () => clearInterval(intervalId)
  }, []);

  const checkServiceReady = (h: Health): boolean => {
    const now = Date.now()
    const timestamp = new Date(h.Timestamp)
    return h.State == "READY" && now - timestamp.getTime() < AppConfig.maxTimeBetweenHealthUpdates 
  }

  return (
    <footer className="glass-card border-t border-white/10 p-4 shadow-modern-lg">
      <div className="max-w-screen-2xl mx-auto flex items-center justify-between text-sm">
        {/* Date/Time */}
        <div className="hidden lg:flex items-center space-x-2 text-neutral/80">
          <IconSchedule className="h-6 fill-base-content" />
          <span className="font-medium">
            {datetime.toLocaleDateString('de-DE')} | {datetime.toLocaleTimeString('de-DE')}
          </span>
        </div>

        {/* Health Status */}
        <div className="flex items-center space-x-4">
          <span className="hidden md:inline text-neutral/60 text-xs font-medium">
            System Status:
          </span>
          <div className="flex items-center space-x-3">
            {health.map(h => 
              <div key={h.ServiceName} className="flex items-center space-x-2 px-3 py-1 rounded-full bg-base-200/50">
                <div className="relative">
                  <div className={`w-2 h-2 rounded-full ${checkServiceReady(h) ? 'bg-success' : 'bg-error'}`}></div>
                  {checkServiceReady(h) && (
                    <div className="absolute inset-0 w-2 h-2 bg-success rounded-full animate-ping"></div>
                  )}
                </div>
                <span className="text-xs font-medium text-neutral">
                  {h.DisplayName ? h.DisplayName : h.ServiceName}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  )
}
export default Footer;
