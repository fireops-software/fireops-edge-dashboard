import { Event } from "../domain/Event";
import EventListItem from "./EventListItem";

const EventList = ({Events}: {Events: Event[]}) => {

  return (
    <div className="w-full lg:w-80 lg:border-r-2 lg:mr-4 lg:border-base-300">
      { Events.map(o => <EventListItem key={o.num_1} Event={o} />) }
    </div>
  )
}
export default EventList;
