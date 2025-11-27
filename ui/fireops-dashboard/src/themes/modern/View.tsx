import Unit from "./Unit";
import EventList from "./EventList";
import MainEvent from "./MainEvent";
import useEvents from "../../state/useEvents";
import useUnits from "../../state/useUnits";
import IconCheckCircle from "./assets/check_circle.svg?react"

const View = () => {
  const { events } = useEvents()
  const { units } = useUnits()


  let content;
  if(events.length > 0) {
    content = 
      <div className="flex w-full p-6 space-x-6 animate-fade-in">
        { events.length > 1 ? <EventList Events={events} /> : <></>}
        <MainEvent event={events[0]}/>
      </div>
    
  } else {
    content = 
      <div className="flex flex-col w-full h-full animate-fade-in">
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="glass-card p-12 rounded-3xl shadow-modern-lg text-center max-w-md">
            <div className="mb-6">
              <IconCheckCircle className="mx-auto fill-neutral/30 h-20" />
            </div>
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
              if(a.unityp == "FEUERW" && b.unityp == "FEUERW")
                return 0;
              if(a.unityp == "FEUERW")
                return 1;
              return 0;
            }).map((unit, index) => (
              <div 
                key={unit.unid_long}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <Unit unit={unit} />
              </div>
            ))}
          </div>
        </div>
      </div>
    
  }
  return (
    <main className="flex flex-grow gradient-bg bg-[url('/bg_wheel.svg')] bg-no-repeat bg-contain bg-fixed bg-right-bottom overflow-auto">
      {content}
    </main>
  )
}
export default View;
