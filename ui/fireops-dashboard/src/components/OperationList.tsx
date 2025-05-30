import { Operation } from "../domain/Operation";
import OperationListItem from "./OperationListItem";

const OperationList = ({operations}: {operations: Operation[]}) => {

  return (
    <div className="w-full lg:w-80 lg:border-r-2 lg:mr-4 lg:border-base-300">
      { operations.map(o => <OperationListItem key={o.num_1} operation={o} />) }
    </div>
  )
}
export default OperationList;
