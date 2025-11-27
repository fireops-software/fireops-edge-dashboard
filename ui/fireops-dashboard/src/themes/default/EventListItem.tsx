import { Event } from "../../domain/Event";
import { getSmallerTimeStamp } from "../../utils/TimeUtil";

const EventListItem = ({Event}: {Event: Event}) => {
  const creationTime = getSmallerTimeStamp(Event.firstdispatch_time, Event.create_time)
  return (
    <div className="flex w-full mt-2 mb-2 shadow-md text-base">
      <div className="flex justify-center items-center w-4 bg-secondary text-secondary-content mr-2 text-xl">
        {Event.alarm_lev}
      </div>
      <div className="w-full">
        <p className="text-xl">{Event.num_1}</p>
        { creationTime ? <p>{creationTime.toLocaleString('de-DE')}</p> : <></> }
        <p>{Event.typ_eng}</p>
        <p>{Event.location}</p>
    </div>
    </div>
  )
}
export default EventListItem;
