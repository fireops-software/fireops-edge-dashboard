import { create } from "zustand"
import { Event } from "../domain/Event"

type EventsState = {
    events: Event[],
    setEvents: (data: Event[]) => void
}

const useEvents = create<EventsState>((set) => ({
    events: [],
    setEvents: (e: Event[]) => set({ events: e })
}))

export default useEvents
