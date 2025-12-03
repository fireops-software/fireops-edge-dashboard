import Unit from "./Unit";
import EventList from "./EventList";
import MainEvent from "./MainEvent";
import useEvents from "../../state/useEvents";
import useUnits from "../../state/useUnits";
import IconCheckCircle from "./assets/check_circle.svg?react"

const View = () => {
  const { events } = useEvents()
  const { units } = useUnits()

  return (
    <div className="flex flex-grow bg-base-200 overflow-hidden">
      {events.length > 0 ?
        <div className="flex w-full p-6 space-x-6 ">
          {events.length > 1 ? <EventList Events={events} /> : <></>}
          <MainEvent event={events[0]} />
        </div>
        :
        <div className="flex flex-col w-full h-full ">
          {/* Banner */}
          <div className="flex flex-col flex-grow justify-center items-center">
            <div className="flex flex-col items-center shadow-2xl rounded-2xl overflow-hidden border border-neutral-200 bg-base-100 p-8">
              <IconCheckCircle className="mx-auto fill-neutral/30 h-20" />
              <h2 className="text-2xl font-bold text-neutral mb-3">Alles ruhig</h2>
              <p className="text-neutral/70 text-lg leading-relaxed">
                Keine laufenden Einsätze
              </p>
            </div>
          </div>
          {/* Units Display */}
          <div className="pb-8">
            <div className="flex flex-wrap justify-center items-end">
              {units.sort((a, b) => {
                if (a.unityp == "FEUERW" && b.unityp == "FEUERW")
                  return 0;
                if (a.unityp == "FEUERW")
                  return -1;
                return 1;
              }).map((unit) => (
                <Unit unit={unit} key={unit.unid_long} />
              ))}
            </div>
          </div>
        </div>
      }
    </div>
  )
}
export default View;
