import { UnitState } from "../../domain/UnitState";

// Icon mapping function based on unit type and name
const getUnitIcon = (unityp?: string, unid_long?: string): string => {
  if (unityp === "FEUERW") {
    return "local_fire_department";
  }
  
  const unitName = (unid_long || "").toUpperCase();
  
  // Boat units
  if (unitName.includes("BOOT") || unitName.includes("BOAT")) {
    return "directions_boat";
  }
  
  // Command unit
  if (unitName.includes("KDO") || unitName.includes("KOMMANDO")) {
    return "admin_panel_settings";
  }
  
  // Firefighting vehicles (RLF, TLF, etc.)
  if (unitName.includes("RLF") || unitName.includes("TLF") || unitName.includes("LF") || unitName.includes("TANK")) {
    return "fire_truck";
  }
  
  // Default fallback
  return "emergency";
};

const Unit = ({unit}: {unit: UnitState}) => {
  const unitIcon = getUnitIcon(unit.unityp, unit.unid_long);
  const isFireDept = unit.unityp == "FEUERW";
  
  if (isFireDept) {
    return (
      <div className="group relative animate-slide-up hover:-translate-y-1 transition-all duration-300">
        <div className="glass-card rounded-2xl shadow-modern hover:shadow-modern-lg overflow-hidden w-56 h-36 m-4 border border-white/20">
          <div className="flex h-full">
            {/* Status Bar */}
            <div 
              className="w-16 flex flex-col items-center justify-between py-3 text-white relative"
              style={{ backgroundColor: unit.unit_status_color ?? "#6b7280" }}
            >
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <span className="material-symbols-outlined text-white" style={{ fontSize: '32px' }}>{unitIcon}</span>
              </div>
              <div className="transform -rotate-90 whitespace-nowrap text-xs font-medium">
                {unit.unit_status_id ? `(${unit.unit_status_id})` : ""}
              </div>
              <div className="transform -rotate-90 whitespace-nowrap text-xs">
                {unit.unit_status}
              </div>
            </div>
            
            {/* Main Content */}
            <div className="flex-1 bg-white text-neutral flex flex-col justify-center items-center text-center p-4 relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-1">
                  {unit.unid_long}
                </h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  } else {
    return (
      <div className="group relative animate-slide-up hover:-translate-y-1 transition-all duration-300">
        <div className="glass-card rounded-2xl shadow-modern hover:shadow-modern-lg overflow-hidden w-56 h-28 m-4 border border-white/20">
          <div className="flex h-full">
            {/* Status Bar */}
            <div 
              className="w-12 flex flex-col items-center justify-center text-white relative"
              style={{ backgroundColor: unit.unit_status_color ?? "#6b7280" }}
            >
              <div className="transform -rotate-90 whitespace-nowrap text-xs font-medium">
                {unit.unit_status_id ? `(${unit.unit_status_id})` : ""}
              </div>
              <div className="transform -rotate-90 whitespace-nowrap text-xs mt-2">
                {unit.unit_status}
              </div>
            </div>
            
            {/* Main Content */}
            <div className="flex-1 bg-white text-neutral flex flex-col justify-center items-center text-center p-4 relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-1">
                  {unit.unityp}
                </h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
export default Unit;
