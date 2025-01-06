const getSmallerTimeStamp = (a: Date | undefined, b: Date | undefined) => {
  if(!a && !b)
    return undefined;
  if(!a)
    return b;
  if(!b)
    return a;
  return a < b ? a : b;
}

export { getSmallerTimeStamp }
