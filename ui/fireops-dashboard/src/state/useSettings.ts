import { create } from "zustand"
import { Settings } from "../domain/Settings"

type SettingsState = {
    settings: Settings | null,
    setSettings: (data: Settings) => void
}

const useSettings = create<SettingsState>((set) => ({
    settings: null,
    setSettings: (s: Settings) => set({ settings: s })
}))

export default useSettings
