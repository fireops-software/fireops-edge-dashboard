import { Event } from "../../domain/Event";
import EventListItem from "./EventListItem";

const EventList = ({Events}: {Events: Event[]}) => {

  return (
    <div className="w-full lg:w-80 lg:mr-6 animate-slide-up">
      <div className="glass-card p-4 shadow-modern-lg rounded-2xl mb-4">
        <h2 className="text-xl font-semibold text-neutral mb-4 flex items-center">
          <div className="w-1 h-6 primary-gradient rounded-full mr-3"></div>
          Aktuelle Einsätze
          <span className="ml-auto bg-primary text-primary-content text-sm px-3 py-1 rounded-full font-medium">
            {Events.length}
          </span>
        </h2>
      </div>
      <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto custom-scrollbar">
        { Events.map((event, index) => (
          <div 
            key={event.num_1} 
            className="animate-slide-up"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
                         <EventListItem event={event} />
          </div>
        )) }
      </div>
    </div>
  )
}
export default EventList;
