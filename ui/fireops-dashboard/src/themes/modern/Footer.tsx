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
    <div className="w-full flex items-center justify-between shadow-lg border border-neutral-200 py-4 text-neutral-400 text-sm z-10">
      <div className="flex items-center justify-end ml-30">
        <IconSchedule className="h-6 fill-neutral-400" />
        <span className="ml-3">{datetime.toLocaleDateString('de-DE')} | {datetime.toLocaleTimeString('de-DE')}</span>
      </div>
      <div className="flex flex-wrap justify-start mr-30">
        <span className="mr-4">System Status:</span>
        {health.map(h =>
          <div key={h.ServiceName} className="flex items-center flex-nowrap ml-2">
            <div className="inline-grid *:[grid-area:1/1] ml-2 mr-2">
              <div className={`status animate-ping ${checkServiceReady(h) ? "status-success" : "status-error"}`}></div>
              <div className={`status ${checkServiceReady(h) ? "status-success" : "status-error"}`}></div>
            </div> {h.DisplayName ? h.DisplayName : h.ServiceName}
          </div>
        )}
      </div>
    </div>
  )
}
export default Footer;
