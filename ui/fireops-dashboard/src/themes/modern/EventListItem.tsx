import { Event } from "../../domain/Event";
import { getSmallerTimeStamp } from "../../utils/TimeUtil";

const EventListItem = ({event}: {event: Event}) => {
  const creationTime = getSmallerTimeStamp(event.firstdispatch_time, event.create_time)
  
  const getAlarmLevelColor = (level: string | number | undefined) => {
    switch(level?.toString()) {
      case '1': return 'bg-info text-info-content';
      case '2': return 'bg-warning text-warning-content';
      case '3': return 'bg-error text-error-content';
      case '4': return 'bg-error text-error-content';
      default: return 'bg-neutral text-neutral-content';
    }
  }

  return (
    <div className="p-4 shadow-xl rounded-xl border border-neutral-300 mb-2">
      <div className="flex items-start space-x-4">
        <div className={`flex items-center justify-center w-12 h-12 rounded-lg text-lg font-bold shadow-lg ${getAlarmLevelColor(event.alarm_lev)}`}>
          {event.alarm_lev}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-neutral truncate">
              {event.num_1}
            </h3>
            {creationTime && (
              <span className="text-sm text-neutral/60 bg-base-200 px-2 py-1 rounded-md">
                {creationTime.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
          <div className="space-y-1">
            <p className="text-base font-medium text-primary line-clamp-2">
              {event.category}
            </p>
            <p className="text-sm text-neutral/80 line-clamp-2 leading-relaxed">
              {event.location}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
export default EventListItem;
