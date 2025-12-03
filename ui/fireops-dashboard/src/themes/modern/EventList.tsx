import { Event } from "../../domain/Event";
import EventListItem from "./EventListItem";

const EventList = ({ Events }: { Events: Event[] }) => {

  return (
    <div className="w-full lg:w-80 lg:mr-6">
      <div className="p-4 mb-4">
        <h2 className="text-xl font-semibold text-neutral mb-4 flex items-center">
          Aktuelle Einsätze
          <span className="ml-auto bg-primary text-primary-content text-sm px-3 py-1 rounded-full font-medium">
            {Events.length}
          </span>
        </h2>
      </div>
      <div className="h-[calc(100%-72px)] overflow-y-auto">
        {Events.map((event, index) => (
            <EventListItem key={index} event={event} />
        ))}
      </div>
    </div>
  )
}
export default EventList;
