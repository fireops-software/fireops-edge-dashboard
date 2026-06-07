import { useEffect } from "react";
import { Event } from "../../domain/Event";
import { createGoogleMapsNavUrl } from "../../utils/MapUtil";
import ItemDisplay from "./ItemDisplay";
import AppConfig from "../../AppConfig";
import useSettings from "../../state/useSettings";
import IconGroup from "./assets/group.svg?react"
import IconFireDep from "./assets/local_fire_department.svg?react"
import IconLocationOn from "./assets/location_on.svg?react"
import IconCall from "./assets/call.svg?react"
import InfoCard from "./InfoCard";



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
    <div className="flex-1 lg:flex hidden">
      <div className="w-2/5 flex flex-col space-y-3 h-full overflow-y-auto custom-scrollbar">
        {/* Header Card with Response Status */}
        <InfoCard>
            <div className="grid grid-cols-10 gap-4">
              {/* Left Column - Event Title (70%) */}
              <div className="col-span-7 flex flex-col">
                <h2 className="text-xl font-bold text-neutral mb-2">Einsatzdetails</h2>
                <div className="text-3xl font-bold text-neutral leading-tight break-words">
                  {event.event_alarmtext}
                </div>
              </div>

              {/* Right Column - Pills (30%) */}
              <div className="col-span-3 flex flex-col items-end gap-2 text-nowrap">
                <div className={`px-3 py-2 rounded-full text-sm font-semibold border ${event.alarm_lev?.toString() === '0' ? 'text-white border-[#ecaf80]' :
                  event.alarm_lev?.toString() === '1' ? 'text-white border-[#e98e6c]' :
                    event.alarm_lev?.toString() === '2' ? 'text-white border-[#df5f5b]' :
                      event.alarm_lev?.toString() === '3' ? 'text-white border-[#9b366f]' :
                        'bg-neutral/10 text-neutral border-neutral/20'
                  }`} style={{
                    backgroundColor: event.alarm_lev?.toString() === '0' ? '#ecaf80' :
                      event.alarm_lev?.toString() === '1' ? '#e98e6c' :
                        event.alarm_lev?.toString() === '2' ? '#df5f5b' :
                          event.alarm_lev?.toString() === '3' ? '#9b366f' :
                            undefined
                  }}>
                  Alarmstufe {event.alarm_lev}
                </div>
                {event.destinations && event.destinations.length > 0 && (
                  <div className="flex flex-nowrap items-center bg-gray-100 text-gray-700 px-3 py-2 rounded-full text-sm font-semibold border border-gray-200">
                    <IconFireDep className="h-6 fill-neutral" />
                    {event.destinations.length} FF
                  </div>
                )}
                <div className="flex flex-nowrap items-center bg-green-100 text-green-800 px-3 py-2 rounded-full text-sm font-semibold border border-green-200">
                  <IconGroup className="mr-1 h-6 fill-success-content" />
                  {event.user_responses?.accepted?.length || 0} kommen
                </div>
              </div>
            </div>
        </InfoCard>


        {/* Location Info Card - moved above contact */}
        <InfoCard>
          <h3 className="text-lg font-semibold text-neutral mb-2 flex items-center">
            <IconLocationOn className="mr-2 fill-neutral h-6" />
            Einsatzort
          </h3>
          <div className="grid grid-cols-1 gap-2">
            <div className="p-2">
              <dd className="text-2xl font-bold text-neutral leading-tight break-words">
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
              </dd>
            </div>
          </div>
        </InfoCard>

        {/* Contact Info Card */}
        <InfoCard>
          <h3 className="text-lg font-semibold text-neutral mb-2 flex items-center">
            <IconCall className="mr-2 fill-neutral h-6" />
            Kontaktinformationen
          </h3>
          <div className="grid grid-cols-1 gap-2">
            {event.caller_name && (
              <div className="p-2">
                <div className="text-lg font-bold text-neutral leading-tight break-words">
                  {event.caller_name}
                </div>
              </div>
            )}
            {event.caller_number && (
              <div className="p-2">
                <div className="text-lg font-bold text-neutral leading-tight break-words">
                  {event.caller_number}
                </div>
              </div>
            )}
          </div>
        </InfoCard>

        {/* Mannschaft Card */}
        <InfoCard>
          <h3 className="text-lg font-semibold text-neutral mb-3 flex items-center">
            <IconGroup className="h-6 mr-2 fill-neutral" />
            Mannschaft
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {event.user_responses?.accepted && event.user_responses.accepted.length > 0 ? (
              event.user_responses.accepted.map((name, index) => (
                <div key={index} className="flex items-center p-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 flex-shrink-0"></div>
                  <span className="text-neutral font-medium text-sm truncate" title={name}>{name}</span>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-4 text-neutral/60">
                <IconGroup className="h-8 fill-neutral/40 mx-auto" />
                <p className="text-sm">Noch keine Zusagen</p>
              </div>
            )}
          </div>
        </InfoCard>

        {/* Feuerwehren Card */}
        <InfoCard>
          <h3 className="text-lg font-semibold text-neutral mb-3 flex items-center">
            <IconFireDep className="mr-2 fill-neutral h-6" />
            Feuerwehren
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {event.destinations?.map((destination, index) => (
              <div key={index} className="flex items-center p-2 rounded-lg border border-base-200/50">
                <div className="w-2 h-2 bg-gray-600 rounded-full mr-2 flex-shrink-0"></div>
                <span className="text-neutral font-medium text-sm truncate" title={destination.name}>{destination.name}</span>
              </div>
            ))}
          </div>
        </InfoCard>
      </div>

      {/* Map Section - clean without card */}
      <div className="w-3/5 flex flex-col h-full">
        <div className="rounded-xl overflow-hidden shadow-modern-lg flex-1 h-full">
          {destAddr ? (
            <iframe
              width="100%"
              height="100%"
              src={createGoogleMapsNavUrl(settings ? settings.Address : "", destAddr)}
              className="border-0 rounded-xl"
              title="Einsatzort Navigation"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-base-200 text-neutral/60 rounded-xl">
              <div className="text-center">
                <span className="material-symbols-outlined mx-auto mb-4 text-neutral/40" style={{ fontSize: '64px', display: 'block' }}>location_on</span>
                <p>Keine Adressdaten verfügbar</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
export default Mainevent;
