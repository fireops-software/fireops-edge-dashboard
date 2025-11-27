import { useEffect, useMemo, useRef, useState } from "react"
import { Settings } from "./domain/Settings"
import AppConfig from "./AppConfig"
import useSettings from "./state/useSettings"
import { getSmallerTimeStamp, isTimeInRange } from "./utils/TimeUtil"
import useEvents from "./state/useEvents"
import useUnits from "./state/useUnits"
import { Event } from "./domain/Event";
import useHealth from "./state/useHealth"
import { LiveMsg } from "./domain/LiveMsg"
import { UnitState } from "./domain/UnitState"
import DefaultTheme from "./themes/default/DefaultTheme"
import ModernTheme from "./themes/modern/ModernTheme"


function App() {
  const { settings, setSettings } = useSettings()
  const { events, setEvents } = useEvents()
  const { setUnits } = useUnits()
  const { setHealth } = useHealth()

  const [blanking, setBlanking] = useState<boolean>(false)
  const [datetime, setDateTime] = useState(new Date())
  const timeoutRef = useRef<number | null>(null);

  // Get App Settings
  useEffect(() => {
    fetch(`${AppConfig.backendBaseUrl}/api/v1/settings`)
      .then((data) => data.json())
      .then((s: Settings) =>
        setSettings(s))
  }, []);

  // Time
  useEffect(() => {
    const intervalId: number = setInterval(() => setDateTime(new Date()), 1000)
    return () => clearInterval(intervalId)
  }, []);

  // Check for daytime
  const isNight = useMemo<boolean>(() => {
    if (settings) {
      return isTimeInRange(settings.StartNightMode, settings.EndNightMode)
    }
    return false
  }, [datetime])

  // Get LiveData
  useEffect(() => {
    const es: EventSource = new EventSource(`${AppConfig.backendBaseUrl}/api/v1/live`);
    es.onerror = (e) => console.error(e);
    es.onmessage = (e) => {
      let msg: LiveMsg<any> = JSON.parse(e.data)
      switch (msg.MsgType) {
        case "EVENTS":
          msg.Body.sort((a: Event, b: Event) => {
            const tsA: Date | undefined = getSmallerTimeStamp(a.firstdispatch_time, a.create_time);
            const tsB: Date | undefined = getSmallerTimeStamp(b.firstdispatch_time, b.create_time);
            if (tsA == tsB || !tsA || !tsB)
              return 0;
            return tsB.getTime() - tsA.getTime();
          });
          setEvents(msg.Body)
          break
        case "UNITS":
          msg.Body.sort((a: UnitState, b: UnitState) => {
            if (a == b || !a.unid_long || !b.unid_long)
              return 0
            else
              return a.unid_long < b.unid_long ? -1 : 1
          })
          setUnits(msg.Body)
          break
        case "HEALTH":
          setHealth(msg.Body)
          break
      }
    }
    return () => es.close();
  }, []);


  // Screen blanking
  useEffect(() => {
    // Reset the timer whenever eventStream changes
    const resetTimer = () => {
      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Hide the idle message since there's activity
      setBlanking(false);

      // Set new timeout
      if (events.length <= 0 && settings && settings.ScreenBlankingDelay > 0 && isNight) {
        timeoutRef.current = setTimeout(() => {
          setBlanking(true);
        }, settings.ScreenBlankingDelay * 1000);
      }
    };
    resetTimer();
    // Cleanup on unmount or when dependencies change
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [events.length, settings?.ScreenBlankingDelay, isNight]);

  return (
    <div className="flex flex-col w-screen h-screen">
      {blanking ?
        <div className="h-full w-full bg-black flex flex-col justify-center items-center">
          <p className="text-6xl text-neutral-600">{datetime.toLocaleDateString('de-DE')} | {datetime.toLocaleTimeString('de-DE')}</p>
          <p className="mt-8">&copy; FireOPS</p>
        </div>
        :
        settings?.SelectedTheme == "modern-light" || settings?.SelectedTheme == "modern-dark" ?
        <ModernTheme />
        :
        <DefaultTheme />
      }
    </div>
  )
}
export default App
