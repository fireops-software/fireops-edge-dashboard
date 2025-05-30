import { useEffect, useState } from "react";
import { FireDepInfo } from "../domain/FireDepInfo";
import AppConfig from "../AppConfig";
import { Health } from "../domain/Health";

const Footer = ({fireDepInfo}: {fireDepInfo: FireDepInfo}) => {
  const [datetime, setDateTime] = useState(new Date())
  const [health, setHealth] = useState<Health[]>([])

  useEffect(() => {
    const intervalId: number = setInterval(() => setDateTime(new Date()), 1000)
    return () => clearInterval(intervalId)
  }, []);

  useEffect(() => {
    const es: EventSource = new EventSource(`${AppConfig.backendBaseUrl}/api/v1/health`);
    es.onerror = (e) => console.error(e)
    es.onmessage = msg => {
      let u: Health[] = JSON.parse(msg.data)
      if (u) {
        setHealth(u)
      } else {
        setHealth([])
      }
    }
    return () => es.close()
  }, [])

  const checkServiceReady = (h: Health): boolean => {
    const now = Date.now()
    const timestamp = new Date(h.Timestamp)
    return h.State == "READY" && now - timestamp.getTime() < AppConfig.maxTimeBetweenHealthUpdates 
  }

  return (
    <div className="w-full max-h-16 flex p-4 bg-secondary text-secondary-content text-xl">
      <div className="flex justify-start">
        <p>{ datetime.toLocaleDateString('de-DE') } | { datetime.toLocaleTimeString('de-DE') }</p>
      </div>
      <div className="flex flex-grow justify-center">
        <div className="flex flex-col items-center">
          <span className="text-sm">© FireOps</span>
          <span className="text-xs">Version { fireDepInfo.dashboardVersion }</span>
        </div>
      </div>
      <div className="flex justify-end text-xs">
        {health.map(h => 
          <div className="flex items-center flex-nowrap">
            <div className="inline-grid *:[grid-area:1/1] ml-2 mr-1">
              <div className={`status animate-ping ${checkServiceReady(h) ? "status-success" : "status-error"}`}></div>
              <div className={`status ${checkServiceReady(h) ? "status-success" : "status-error"}`}></div>
            </div> {h.ServiceName}
          </div>
        )}
      </div>
    </div>
  )
}
export default Footer;
