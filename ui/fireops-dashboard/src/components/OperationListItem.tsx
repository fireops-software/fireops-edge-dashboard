import { Operation } from "../domain/Operation";
import { getSmallerTimeStamp } from "../utils/TimeUtil";

const OperationListItem = ({operation}: {operation: Operation}) => {
  const creationTime = getSmallerTimeStamp(operation.firstdispatch_time, operation.create_time)
  return (
    <div className="flex w-full mt-2 mb-2 shadow-md bg-base-10 text-base">
      <div className="flex justify-center items-center w-4 bg-base-300 text-primary-content mr-2 text-xl">
        {operation.alarm_lev}
      </div>
      <div className="w-full">
        <p className="text-xl">{operation.num_1}</p>
        { creationTime ? <p>{creationTime.toLocaleString('de-DE')}</p> : <></> }
        <p>{operation.category}</p>
        <p>{operation.location}</p>
    </div>
    </div>
  )
}
export default OperationListItem;
