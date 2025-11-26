export interface LiveMsg<T> {
  MsgId: string;
  MsgType: "EVENTS" | "UNITS" | "HEALTH";
  Timestamp: string;
  Body: T;
}
