import { useState, useEffect } from "react";
import { Event } from "../domain/Event";
import { FireDepInfo } from "../domain/FireDepInfo";
import { getSmallerTimeStamp } from "../utils/TimeUtil";
import AppConfig from "../AppConfig";
import { UnitState } from "../domain/UnitState";
import Unit from "./Unit";
import EventList from "./EventList";
import MainEvent from "./MainEvent";

const View = ({fireDepInfo}: {fireDepInfo: FireDepInfo}) => {
  const [events, setEvents] = useState<Event[]>([])
  const [units, setUnits] = useState<UnitState[]>([])
  
  useEffect(()=>{
    const es: EventSource = new EventSource(`${AppConfig.backendBaseUrl}/api/v1/events`);
    es.onerror = (e) => console.error(e);
    es.onmessage = (e) => {
      let o: Event[] = JSON.parse(e.data);
      o.sort((a: Event, b: Event) => {
        const tsA: Date | undefined = getSmallerTimeStamp(a.firstdispatch_time, a.create_time);
        const tsB: Date | undefined = getSmallerTimeStamp(b.firstdispatch_time, b.create_time);
        if(tsA == tsB || !tsA || !tsB)
            return 0;     
        return tsB.getTime() - tsA.getTime();
      });
      setEvents(o);
    }
    return () => es.close();
  }, []);

  useEffect(() => {
    const es: EventSource = new EventSource(`${AppConfig.backendBaseUrl}/api/v1/units`);
    es.onerror = (e) => console.error(e)
    es.onmessage = msg => {
      let u: UnitState[] = JSON.parse(msg.data)
      if (u) {
        u?.sort((a: UnitState, b: UnitState) => {
          if(a == b || !a.unid_long || !b.unid_long)
            return 0
          else
            return a.unid_long < b.unid_long ? -1 : 1
        })
        setUnits(u)
      } else {
        setUnits([])
      }
      
    }
    return () => es.close()
  }, [])

  let content;
  if(events.length > 0) {
    content = 
      <div className="m-4 flex w-full">
        { events.length > 1 ? <EventList Events={events} /> : <></>}
        <MainEvent fireDepInfo={fireDepInfo} event={events[0]}/>
      </div>
    
  } else {
    content = 
      <div className="flex flex-col w-full h-full">
        <p className="flex justify-center items-center text-3xl opacity-25 flex-grow">Keine laufenden Einsätze</p>
        <div className="flex justify-center mb-8 flex-wrap items-end">
          {units.sort((a, b) => {
            if(a.unityp == "FEUERW" && b.unityp == "FEUERW")
              return 0;
            if(a.unityp == "FEUERW")
              return 1;
            return 0;
          }).map(u => <Unit unit={u} key={u.unid_long} />)}
        </div>
      </div>
    
  }
  return (
    <div className="flex flex-grow bg-[url('/bg_wheel.svg')] bg-no-repeat bg-contain bg-fixed bg-right-bottom overflow-auto">
      {content}
    </div>
  )
}
export default View;
