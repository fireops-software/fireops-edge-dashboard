import { useEffect } from "react";
import { Event } from "../../domain/Event";
import { createGoogleMapsNavUrl } from "../../utils/MapUtil";
import AppConfig from "../../AppConfig";
import useSettings from "../../state/useSettings";
import IconLocation from "./assets/location_on.svg?react"
import IconInfo from "./assets/info.svg?react"
import IconPhone from "./assets/call.svg?react"
import InfoCard from "./InfoCard";
import IconGroup from "./assets/group.svg?react"
import IconAccept from "./assets/accept.svg?react"
import IconDecline from "./assets/decline.svg?react"
import IconFireDep from "./assets/local_fire_department.svg?react"
import IconFireTruck from "./assets/fire_truck.svg?react"

const Mainevent = ({ event }: { event: Event }) => {

  const { settings } = useSettings()

  // Prefer coordinates
  const destAddr = event.latitude && event.longitude ? `${event.latitude},${event.longitude}` : event.location

  const getVoices = () => {
    return new Promise<SpeechSynthesisVoice[]>((resolve, reject) => {
      let errorCounter = 0;
      const id = setInterval(() => {
        const voices = speechSynthesis.getVoices()
        if (voices.length !== 0) {
          resolve(voices)
          clearInterval(id)
        } else {
          if (errorCounter >= AppConfig.getVoiceRetries) {
            clearInterval(id)
            reject("failed to get voices")
          }
          errorCounter++;
        }
      }, AppConfig.getVoiceRetryInterval)
    })
  }

  useEffect(() => {
    // Check if voice needed
    if(event.category?.toUpperCase() == "SELBST") return

    // Create text to read
    const alertText = `${event.sub_eng ?? event.category ?? ""} - ${event.event_alarmtext ?? ""} - Alarmstufe ${event.alarm_lev} - ${event.location ?? ""}`;
    const utterance = new SpeechSynthesisUtterance(alertText);

    // Register onend handler for looping
    let count = 0;
    utterance.onend = () => {
      count++;
      if(event.alert_state == "Ausgerückt" && count < (settings ? settings.CountTextToSpeechWhenDispached : 0) || event.alert_state != "Ausgerückt"){
        speechSynthesis.speak(utterance);
      }
    };

    // Select german language
    getVoices().then((v: SpeechSynthesisVoice[]) => {
      utterance.voice = v.filter((voice) => voice.lang === AppConfig.getVoiceLanguage)[0]
      // Start voice output
      speechSynthesis.speak(utterance);
    }).catch(err => console.error(err))

    // On timeout -> Stop voice output
    const timeout = setTimeout(() => speechSynthesis.cancel(), (settings ? settings.MaxTimeTextToSpeech : 0) * 1000)

    // Cleanup
    return () => {
      speechSynthesis.cancel();
      clearTimeout(timeout)
    };

  }, [event.num_1, event.alert_state]);

  return (
    <div className="lg:flex grow hidden">
      <div className="w-5/12 flex flex-col grow pr-8 pl-4 pt-2">
        { /* General Event Information */}
        <InfoCard className="indicator w-full">
          <div className="indicator-item indicator-start ">
            <div className="relative">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" className="h-12 fill-primary">
                <path d="M80-560q0-100 44.5-183.5T244-882l47 64q-60 44-95.5 111T160-560H80Zm720 0q0-80-35.5-147T669-818l47-64q75 55 119.5 138.5T880-560h-80ZM160-200v-80h80v-280q0-83 50-147.5T420-792v-28q0-25 17.5-42.5T480-880q25 0 42.5 17.5T540-820v28q80 20 130 84.5T720-560v280h80v80H160Zm320-300Zm0 420q-33 0-56.5-23.5T400-160h160q0 33-23.5 56.5T480-80ZM320-280h320v-280q0-66-47-113t-113-47q-66 0-113 47t-47 113v280Z" />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-primary">{event.alarm_lev}</span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <h1 className="text-3xl">{event.typ_eng}</h1>
            {event.alert_state == "Alarmiert" ?
            <div className="flex space-x-2">
              <div className="flex items-center justify-center fill-warning bg-warning/20 rounded-lg px-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" className="h-6"><path d="M200-160v-80h64l79-263q8-26 29.5-41.5T420-560h120q26 0 47.5 15.5T617-503l79 263h64v80H200Zm148-80h264l-72-240H420l-72 240Zm92-400v-200h80v200h-80Zm238 99-57-57 142-141 56 56-141 142Zm42 181v-80h200v80H720ZM282-541 141-683l56-56 142 141-57 57ZM40-360v-80h200v80H40Zm440 120Z"/></svg>
                <span className="text-warning text-lg px-1">{event.alert_state}</span>
              </div>
            </div>
            :
            event.alert_state == "Ausgerückt" ?
            <div className="flex space-x-2">
              <div className="flex items-center justify-center fill-success bg-success/20 rounded-lg px-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" className="h-6"><path d="M467-360Zm-24 80ZM320-440h80v-120q0-33 23.5-56.5T480-640v-80q-66 0-113 47t-47 113v120ZM160-120q-33 0-56.5-23.5T80-200v-80q0-33 23.5-56.5T160-360h40v-200q0-117 81.5-198.5T480-840q117 0 198.5 81.5T760-560v43q-10-2-19.5-2.5T720-520q-11 0-20.5.5T680-517v-43q0-83-58.5-141.5T480-760q-83 0-141.5 58.5T280-560v200h187q-9 19-15 39t-9 41H160v80h283q3 21 9 41t15 39H160Zm418.5 21.5Q520-157 520-240t58.5-141.5Q637-440 720-440t141.5 58.5Q920-323 920-240T861.5-98.5Q803-40 720-40T578.5-98.5ZM691-150l139-138-42-42-97 95-39-39-42 43 81 81Z"/></svg>
                <span className="text-success text-lg px-1">{event.alert_state}</span>
              </div>
            </div>
            :
            <div className="flex items-center justify-center fill-warning bg-warning/20 rounded-lg px-2">
              <span className="text-warning text-lg px-1">{event.alert_state}</span>
            </div>
            }
          </div>
          <span className="text-neutral-400 text-lg mb-4">{event.create_time}</span>

          {event.event_alarmtext ?
            <div className="flex items-center text-xl text-wrap">
              <IconInfo className="h-6 mr-2" />
              {event.event_alarmtext}
            </div>
            :
            <></>
          }
        </InfoCard>

        { /* Location */}
        {event.location ?
          <InfoCard>
            <div className="flex items-center text-xl">
              <IconLocation className="h-6 mr-2" />
              <div className="flex flex-col">
                {event.location && (
                  <span>{event.location}</span>
                )}
                {event.location_info && (
                  <span>{event.location_info}</span>
                )}
                {event.location_involved && (
                  <span>Betroffen: {event.location_involved}</span>
                )}
              </div>
            </div>
          </InfoCard>
          :
          <></>
        }

        { /* Caller */}
        {event.caller_name || event.caller_number ?
          <InfoCard>
            <div className="flex items-center text-xl">
              <IconPhone className="h-6 mr-2" />
              {event.caller_name && event.caller_number ?
                <span>{event.caller_name} | {event.caller_number}</span>
                :
                event.caller_name ?
                  <span>{event.caller_name}</span>
                  :
                  <span>{event.caller_number}</span>
              }
            </div>
          </InfoCard>
          :
          <></>
        }

        { /* Required Units */}
        {event.alerted_units && event.alerted_units.length > 0 ? 
          <InfoCard>
            <div className="flex flex-wrap gap-2">
              <IconFireTruck className="h-6" />
              {event.alerted_units.sort((a, b) => !a.priority ? 1 : !b.priority ? -1 : a.priority - b.priority).map((u, i) =>
                <div className="badge badge-soft badge-outline badge-lg badge-primary text-nowrap" key={u.unid_long}>{i + 1}. {u.unityp}</div>
              )}
            </div>
          </InfoCard>
          :
          <></>
        }

        { /* Members */}
        <InfoCard>
          <div className="flex justify-between">
            <div className="flex items-center">
              <IconGroup className="h-6" />
              <h2 className="ml-2 text-xl">Mitglieder</h2>
            </div>
          </div>
          {event.user_responses?.accepted && event.user_responses.accepted.length > 0 || event.user_responses?.declined && event.user_responses.declined.length > 0 ?
            <div className="w-full flex mt-2">
              <div className="w-1/2 flex flex-wrap">
                {event.user_responses?.accepted?.map(n =>
                  <div className="flex items-center mr-2" key={n}>
                    <IconAccept className="h-5 fill-green-600 mr-1" />
                    <span className="text-sm text-nowrap">{n}</span>
                  </div>
                )}
              </div>
              <div className="w-1/2 flex flex-wrap">
                {event.user_responses?.declined?.map(n =>
                  <div className="flex items-center mr-2" key={n}>
                    <IconDecline className="h-5 fill-red-600 mr-1" />
                    <span className="text-sm text-nowrap">{n}</span>
                  </div>
                )}
              </div>
            </div>
            :
            <span className="flex justify-center py-4 text-neutral-400 text-lg">Keine Rückmeldungen</span>
          }
        </InfoCard>

        {/* Destinations */}
        <InfoCard>
          <div className="flex flex-wrap gap-1.5">
            <IconFireDep className="h-6" />
            {event.destinations?.map(d =>
              <div className="badge badge-soft badge-neutral text-nowrap" key={d.name}>{d.name}</div>
            )}
          </div>
        </InfoCard>

      </div>
      <div className="w-7/12 flex flex-col">
        <div className="shadow-md border-2 border-base-300 grow">
          {destAddr ? <iframe width="100%" height="100%" src={createGoogleMapsNavUrl(settings ? settings.Address : "", destAddr)}></iframe> : <></>}
        </div>
      </div>
    </div>
  )
}
export default Mainevent;
