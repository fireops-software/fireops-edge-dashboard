import { useEffect } from "react";
import { FireDepInfo } from "../domain/FireDepInfo";
import { Operation } from "../domain/Operation";
import { createGoogleMapsNavUrl } from "../utils/MapUtil";
import ItemDisplay from "./ItemDisplay";

const MainOperation = ({fireDepInfo, operation}: {fireDepInfo: FireDepInfo, operation: Operation}) => {

  // Prefer coordinates
  const destAddr = operation.latitude && operation.longitude ? `${operation.latitude},${operation.longitude}` : operation.location

  useEffect(() => {
    // Create text to read
    const alertText = `${operation.sub_eng ?? operation.category ?? ""} - ${operation.event_alarmtext ?? ""} - Alarmstufe ${operation.alarm_lev} - ${operation.location ?? ""}`;
    const utterance = new SpeechSynthesisUtterance(alertText);

    // Select german language
    const voices = speechSynthesis.getVoices().filter((voice) => voice.lang === "de-DE");
    utterance.voice = voices[0]; 
  
    // Register onend handler for looping
    utterance.onend = () => {
      speechSynthesis.speak(utterance);
    };
  
    // Start voice output
    speechSynthesis.speak(utterance);

    // On timeout -> Stop voice output
    const timeout = setTimeout(()=> speechSynthesis.cancel(), fireDepInfo.maxTimeTextToSpeech * 1000)
  
    // Cleanup
    return () => {
      speechSynthesis.cancel(); 
      clearTimeout(timeout)
    };
  }, [operation]);

  return (
    <div className="lg:flex flex-grow hidden">
      <div className="w-5/12 flex flex-col flex-grow text-xl mr-4">
        <ItemDisplay name={"Einsatznummer"} value={operation.num_1} />
        <ItemDisplay name={"Kategorie"} value={operation.category} />
        <ItemDisplay name={"Art"} value={operation.sub_eng ? operation.sub_eng : operation.typ_eng} />
        <ItemDisplay name={"Alarmstufe"} value={operation.alarm_lev} />
        <ItemDisplay name={"Anrufer"} value={operation.caller_name} />
        <ItemDisplay name={"Telefon"} value={operation.caller_number} />
        <ItemDisplay name={"Ort"} value={operation.location} />
        <ItemDisplay name={"Ortsinfo"} value={operation.location_info} />
        <ItemDisplay name={"Info"} value={operation.event_alarmtext} />
      </div>
      <div className="w-7/12 shadow-md border-2 border-secondary">
        { destAddr ? <iframe width="100%" height="100%" src={createGoogleMapsNavUrl(fireDepInfo.address, destAddr)}></iframe> : <></> }
      </div>
    </div>
  )
}
export default MainOperation;
