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
    // Create text to read
    const alertText = `${event.sub_eng ?? event.category ?? ""} - ${event.event_alarmtext ?? ""} - Alarmstufe ${event.alarm_lev} - ${event.location ?? ""}`;
    const utterance = new SpeechSynthesisUtterance(alertText);

    // Select german language
    //const voices = speechSynthesis.getVoices().filter((voice) => voice.lang === "de-DE");
    getVoices().then((v: SpeechSynthesisVoice[]) => {
      utterance.voice = v.filter((voice) => voice.lang === AppConfig.getVoiceLanguage)[0]
      // Start voice output
      speechSynthesis.speak(utterance);
    }).catch(err => console.error(err))

    // Register onend handler for looping
    utterance.onend = () => {
      speechSynthesis.speak(utterance);
    };

    // On timeout -> Stop voice output
    const timeout = setTimeout(() => speechSynthesis.cancel(), (settings ? settings.MaxTimeTextToSpeech : 0) * 1000)

    // Cleanup
    return () => {
      speechSynthesis.cancel();
      clearTimeout(timeout)
    };

  }, [event.num_1]);

  return (
    <div className="lg:flex flex-grow hidden">
      <div className="w-5/12 flex flex-col flex-grow mr-4">
        { /* General Event Information */}
        <InfoCard>
          <div className="flex justify-between items-center">
            <h1 className="text-3xl">{event.typ_eng}</h1>
            <div className="badge badge-xl badge-primary badge-soft text-nowrap">Alarmstufe {event.alarm_lev}</div>
          </div>
          <span className="text-neutral-400 text-lg">{event.create_time}</span>
          {event.event_alarmtext ?
            <div className="flex items-center mt-4 text-xl text-wrap">
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
              {event.location}
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

        { /* Members */}
        <InfoCard>
          <div className="flex justify-between">
            <div className="flex items-center">
              <IconGroup className="h-6" />
              <h2 className="ml-2 text-xl">Mitglieder</h2>
            </div>
            {/*
            <div className="join flex">
              <div className="flex p-2 join-item">
                <IconFireTruck className="h-6 mr-1" />
                <span>1</span>
              </div>
              <div className="flex p-2 join-item">
                <IconAs className="h-6 mr-1" />
                <span>0</span>
              </div>
            </div>
            */}
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
          <div className="flex items-center text-xl">
            <IconFireDep className="h-6 mr-2" />
            Feuerwehren
          </div>
          <div className="flex mt-4">
            {event.destinations?.map(d =>
              <div className="badge badge-soft badge-neutral mr-1">{d.name}</div>
            )}
          </div>
        </InfoCard>

      </div>
      <div className="w-7/12 flex flex-col">
        <div className="shadow-md border-2 border-base-300 flex-grow">
          {destAddr ? <iframe width="100%" height="100%" src={createGoogleMapsNavUrl(settings ? settings.Address : "", destAddr)}></iframe> : <></>}
        </div>
      </div>
    </div>
  )
}
export default Mainevent;
