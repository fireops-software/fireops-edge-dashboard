import { useEffect } from "react";
import { Event } from "../domain/Event";
import { createGoogleMapsNavUrl } from "../utils/MapUtil";
import ItemDisplay from "./ItemDisplay";
import AppConfig from "../AppConfig";
import useSettings from "../state/useSettings";

const Mainevent = ({event}: {event: Event}) => {

  const { settings } = useSettings()

  // Prefer coordinates
  const destAddr = event.latitude && event.longitude ? `${event.latitude},${event.longitude}` : event.location

  const getVoices = () => {
    return new Promise<SpeechSynthesisVoice[]>((resolve, reject) => {
      let errorCounter = 0;
      const id = setInterval(()=>{
        const voices = speechSynthesis.getVoices()
        if(voices.length !== 0){
          resolve(voices)
          clearInterval(id)
        } else {
          if(errorCounter >= AppConfig.getVoiceRetries) {
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
    const timeout = setTimeout(()=> speechSynthesis.cancel(), (settings ? settings.MaxTimeTextToSpeech : 0) * 1000)

    // Cleanup
    return () => {
      speechSynthesis.cancel(); 
      clearTimeout(timeout)
    };

  }, [event.num_1]);

  return (
    <div className="lg:flex flex-grow hidden">
      <div className="w-5/12 flex flex-col flex-grow text-xl mr-4">
        <ItemDisplay name={"Einsatznummer"} value={event.num_1} />
        <ItemDisplay name={"Kategorie"} value={event.category} />
        <ItemDisplay name={"Art"} value={event.sub_eng ? event.sub_eng : event.typ_eng} />
        <ItemDisplay name={"Alarmstufe"} value={event.alarm_lev} />
        <ItemDisplay name={"Anrufer"} value={event.caller_name} />
        <ItemDisplay name={"Telefon"} value={event.caller_number} />
        <ItemDisplay name={"Ort"} value={event.location} />
        <ItemDisplay name={"Ortsinfo"} value={event.location_info} />
        <ItemDisplay name={"Info"} value={event.event_alarmtext} />
        <div className="flex justify-center pt-2 text-xl">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" className="h-6 fill-green-700"><path d="M720-120H280v-520l280-280 50 50q7 7 11.5 19t4.5 23v14l-44 174h258q32 0 56 24t24 56v80q0 7-2 15t-4 15L794-168q-9 20-30 34t-44 14Zm-360-80h360l120-280v-80H480l54-220-174 174v406Zm0-406v406-406Zm-80-34v80H160v360h120v80H80v-520h200Z"/></svg>
            <span className="mx-2">{ event.user_responses?.accepted?.length } kommen</span>
          </div>
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" className="h-6 fill-red-700"><path d="M240-840h440v520L400-40l-50-50q-7-7-11.5-19t-4.5-23v-14l44-174H120q-32 0-56-24t-24-56v-80q0-7 2-15t4-15l120-282q9-20 30-34t44-14Zm360 80H240L120-480v80h360l-54 220 174-174v-406Zm0 406v-406 406Zm80 34v-80h120v-360H680v-80h200v520H680Z"/></svg>
            <span className="mx-2">{ event.user_responses?.declined?.length } kommen nicht</span>
          </div>
        </div>
      </div>
      <div className="w-7/12 flex flex-col">
        <div className="shadow-md border-2 border-base-300 flex-grow">
          { destAddr ? <iframe width="100%" height="100%" src={createGoogleMapsNavUrl(settings ? settings.Address : "", destAddr)}></iframe> : <></> }
        </div>
      </div>
    </div>
  )
}
export default Mainevent;
