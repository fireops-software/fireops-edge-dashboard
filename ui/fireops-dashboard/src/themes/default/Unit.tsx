import { UnitState } from "../../domain/UnitState";

const Unit = ({unit}: {unit: UnitState}) => {
  if (unit.unityp == "FEUERW") {
    return (
      <div className="h-32 w-48 flex m-4 text-white items-end">
        <div className="w-1/4 h-full text-white flex flex-col items-center" style={{ backgroundColor: unit.unit_status_color ?? "gray" }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" className="fill-white mb-4 mt-2 w-4/5"><path d="M240-400q0 52 21 98.5t60 81.5q-1-5-1-9v-9q0-32 12-60t35-51l113-111 113 111q23 23 35 51t12 60v9q0 4-1 9 39-35 60-81.5t21-98.5q0-50-18.5-94.5T648-574q-20 13-42 19.5t-45 6.5q-62 0-107.5-41T401-690q-39 33-69 68.5t-50.5 72Q261-513 250.5-475T240-400Zm240 52-57 56q-11 11-17 25t-6 29q0 32 23.5 55t56.5 23q33 0 56.5-23t23.5-55q0-16-6-29.5T537-292l-57-56Zm0-492v132q0 34 23.5 57t57.5 23q18 0 33.5-7.5T622-658l18-22q74 42 117 117t43 163q0 134-93 227T480-80q-134 0-227-93t-93-227q0-129 86.5-245T480-840Z"/></svg>
          <span className="-rotate-90 text-nowrap">{unit.unit_status_id ? `(${unit.unit_status_id}) ` : "" }{unit.unit_status}</span>
        </div>
        <div className="w-3/4 h-3/4 bg-red-600 flex flex-col flex-wrap items-center justify-center text-center">
          <span className="text-xl">{unit.unid_long}</span>
          <span className="text-sm">(Status: {unit.status_florianstation})</span>
        </div>
      </div>
    )
  } else {
    return (
      <div className="h-24 w-48 flex m-4 text-white">
        <div className="w-1/5 h-full text-white flex" style={{ backgroundColor: unit.unit_status_color ?? "gray" }}>
          <span className="-rotate-90 translate-x-8 text-nowrap">{unit.unit_status_id ? `(${unit.unit_status_id}) ` : "" }{unit.unit_status}</span>
        </div>
        <div className="w-4/5 h-full bg-red-600 flex flex-col flex-wrap items-center justify-center text-center">
          <span className="text-2xl">{unit.unityp}</span>
          <span className="text-sm">({unit.unid_long})</span>
        </div>
      </div>
    )
  }
}
export default Unit;
