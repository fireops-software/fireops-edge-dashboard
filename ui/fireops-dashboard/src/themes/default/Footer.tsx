import { useEffect, useState } from "react";
import AppConfig from "../../AppConfig";
import { Health } from "../../domain/Health";
import useSettings from "../../state/useSettings";
import useHealth from "../../state/useHealth";

const Footer = () => {
  const [datetime, setDateTime] = useState(new Date())
  const { health } = useHealth()
  const { settings } = useSettings()

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
    <div className="w-full max-h-16 p-4 bg-secondary text-secondary-content text-xl flex justify-center">
      <div className="lg:flex hidden justify-start">
        <p>{datetime.toLocaleDateString('de-DE')} | {datetime.toLocaleTimeString('de-DE')}</p>
      </div>
      <div className="hidden lg:flex flex-grow justify-center">
        <div className="flex flex-col items-center">
          <span className="text-sm">© FireOps</span>
          <span className="text-xs">Version {settings?.DashboardVersion}</span>
        </div>
      </div>
      <div className="flex justify-end text-xs">
        {health.map(h =>
          <div key={h.ServiceName} className="flex items-center flex-nowrap">
            <div className="inline-grid *:[grid-area:1/1] ml-2 mr-1">
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
