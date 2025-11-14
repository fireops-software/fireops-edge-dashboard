const getSmallerTimeStamp = (a?: string, b?: string) => {
  if (!a && !b) return undefined;
  if (!a) return new Date(b!);
  if (!b) return new Date(a!);
  return a < b ? new Date(a) : new Date(b);
};

const parseTime = (timeStr: string): number | null => {
  const match = timeStr.match(/^(\d{1,2}):(\d{2})$/)
  if (!match) return null

  const hour = parseInt(match[1], 10)
  const minute = parseInt(match[2], 10)

  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    return null
  }

  return hour * 60 + minute
};

const isTimeInRange = (startTime: string, endTime: string): boolean => {
  const startMinutes = parseTime(startTime)
  const endMinutes = parseTime(endTime)

  if (startMinutes === null || endMinutes === null) {
    return false
  }

  const now = new Date()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()

  if (startMinutes <= endMinutes) {
    return currentMinutes >= startMinutes && currentMinutes < endMinutes
  }

  return currentMinutes >= startMinutes || currentMinutes < endMinutes
};

export { getSmallerTimeStamp, isTimeInRange }
