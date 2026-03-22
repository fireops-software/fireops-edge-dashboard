export class Event {
  constructor(
    public eid?: number,      
    public num_1?: string,
    public location?: string,           // adresse
    public location_info?: string,      // e.g. company name
    public location_involved?: string,  // hausname
    public category?: string,           // Kategorie
    public typ_eng?: string,            // z.B.: Brand Abfall im Freien
    public sub_eng?: string,            // z.B.: Brand Container im Freien
    public alarm_lev?: number,          // Alarmstufe
    public event_alarmtext?: string,    // Freitext Infofeld
    public create_time?: string,        // timestamp created from lfk
    public firstdispatch_time?: string, // timestamp created from lfk
    public latitude?: number,           // lat einsatzziel
    public longitude?: number,          // lon einsatzziel
    public caller_name?: string,        // Anfufer
    public caller_number?: string,      // Telefonnummer
    public destinations?: [{            // Alarmierte Kräfte
      id?: number
      name?: string
    }],
    public user_responses?: {           // Komme/Komme-Nicht
      accepted?: string[],
      declined?: string[],
    },
    public fullChain?: boolean,         // Complete alert chain
    public alert_state?: string,        // "Alarmiert" oder "Ausgerückt"
  ){}
}
