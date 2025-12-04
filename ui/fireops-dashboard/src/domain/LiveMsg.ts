export interface LiveMsg<T> {
  MsgId: string;
  MsgType: "EVENTS" | "UNITS" | "HEALTH" | "RELOAD";
  Timestamp: string;
  Body: T;
}
