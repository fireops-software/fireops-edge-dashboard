import { useMemo } from "react";
import { UnitState } from "../../domain/UnitState";
import IconLocalFireDep from "./assets/local_fire_department.svg?react"

const Unit = ({ unit }: { unit: UnitState }) => {
  const isFireDep = useMemo(()=>unit.unityp === "FEUERW", [unit.unityp])
  return (
    <div className={`flex w-56 ${isFireDep ? "h-36" : "h-28"} shadow-xl rounded-2xl overflow-hidden border border-neutral-200 bg-base-100 m-4`}>
      {/* Header */}
      <div className={`${isFireDep ? "w-14" : "w-12"} h-full text-white flex flex-col items-center justify-between`} style={{ backgroundColor: unit.unit_status_color ?? "gray" }}>
        { isFireDep ? <IconLocalFireDep className="w-full fill-base-100 p-2" /> : <></>}
        <span className={`-rotate-90 ${isFireDep ? "-translate-y-11" : "translate-y-11"} text-nowrap`}>{unit.unit_status_id ? `(${unit.unit_status_id}) ` : ""}{unit.unit_status}</span>
      </div>
      {/* Body */}
      <div className="w-4/5 h-full flex flex-col flex-wrap items-center justify-center text-center">
        <span className="text-2xl">{isFireDep ? "Florian" : unit.unityp}</span>
      </div>
    </div>
  )
}

export default Unit;
