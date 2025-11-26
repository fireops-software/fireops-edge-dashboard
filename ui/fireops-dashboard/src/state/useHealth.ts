import { create } from "zustand"
import { Health } from "../domain/Health"

type HealthState = {
    health: Health[],
    setHealth: (data: Health[]) => void
}

const useHealth = create<HealthState>((set) => ({
    health: [],
    setHealth: (e: Health[]) => set({ health: e })
}))

export default useHealth
