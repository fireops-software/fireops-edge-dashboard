import { UnitState } from "../domain/UnitState";

const Unit = ({unit}: {unit: UnitState}) => {
  return (
    <div className="h-24 w-48 flex m-4 text-white">
      <div className="w-1/5 h-full text-white flex" style={{ backgroundColor: unit.unit_status_color ?? "gray" }}>
        <span className="-rotate-90 translate-x-8 text-nowrap">{unit.unit_status_id ? `(${unit.unit_status_id}) ` : "" }{unit.unit_status}</span>
      </div>
      <div className="w-4/5 h-full bg-red-600 flex flex-col flex-wrap items-center justify-center">
        <span className="text-2xl">{unit.unityp}</span>
        <span className="text-xs">({unit.unid_long})</span>
      </div>
    </div>
  )
}
export default Unit;
