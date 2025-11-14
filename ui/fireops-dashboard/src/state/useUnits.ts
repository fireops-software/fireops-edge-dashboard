import { create } from "zustand"
import { UnitState } from "../domain/UnitState"

type UnitsState = {
    units: UnitState[],
    setUnits: (data: UnitState[]) => void
}

const useUnits = create<UnitsState>((set) => ({
    units: [],
    setUnits: (u: UnitState[]) => set({ units: u })
}))

export default useUnits
