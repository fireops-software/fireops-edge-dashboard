const getSmallerTimeStamp = (a?: string, b?: string) => {
  if(!a && !b)
    return undefined;
  if(!a)
    return new Date(b!);
  if(!b)
    return new Date(a!);
  return a < b ? new Date(a) : new Date(b);
}

export { getSmallerTimeStamp }
