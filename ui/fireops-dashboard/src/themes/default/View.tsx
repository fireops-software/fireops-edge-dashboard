import Unit from "./Unit";
import EventList from "./EventList";
import MainEvent from "./MainEvent";
import useEvents from "../../state/useEvents";
import useUnits from "../../state/useUnits";

const View = () => {
  const { events } = useEvents()
  const { units } = useUnits()

  let content;
  if(events.length > 0) {
    content = 
      <div className="m-4 flex w-full">
        { events.length > 1 ? <EventList Events={events} /> : <></>}
        <MainEvent event={events[0]}/>
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
    <div className={`flex flex-grow bg-[url('/bg_wheel.svg')] bg-no-repeat bg-contain bg-fixed bg-right-bottom overflow-auto`}>
      {content}
    </div>
  )
}
export default View;
