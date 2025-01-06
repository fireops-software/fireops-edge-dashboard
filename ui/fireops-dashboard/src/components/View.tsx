import { useState, useEffect } from "react";
import { Operation } from "../domain/Operation";
import OperationList from "./OperationList";
import MainOperation from "./MainOperation";
import { FireDepInfo } from "../domain/FireDepInfo";
import { getSmallerTimeStamp } from "../utils/TimeUtil";

const View = ({fireDepInfo}: {fireDepInfo: FireDepInfo}) => {
  const [operations, setOperations] = useState<Operation[]>([])
  
  useEffect(()=>{
    const es: EventSource = new EventSource("/api/v1/operations/notification");
    es.onerror = (e) => console.error(e);
    es.onmessage = (e) => setOperations(JSON.parse(e.data))
    return () => es.close();
  }, []);
  
  operations.sort((a: Operation, b: Operation) => {
    const tsA = getSmallerTimeStamp(a.firstdispatch_time, a.create_time);
    const tsB = getSmallerTimeStamp(b.firstdispatch_time, b.create_time);
    if(tsA == tsB || !tsA || !tsB)
        return 0;     
    return tsA.getTime() - tsB.getTime();
  })

  let content;
  if(operations.length > 0) {
    content = 
      <div className="m-4 flex w-full">
        <OperationList operations={operations} />
        <MainOperation fireDepInfo={fireDepInfo} operation={operations[0]}/>
      </div>
    
  } else {
    content = 
      <div className="flex items-center justify-center w-full">
        <p className="text-3xl opacity-25">Keine laufenden Einsätze</p>
      </div>
    
  }
  return (
    <div className="flex flex-grow bg-[url('/bg_wheel.svg')] bg-no-repeat bg-contain bg-fixed bg-right-bottom overflow-auto">
      {content}
    </div>
  )
}
export default View;
