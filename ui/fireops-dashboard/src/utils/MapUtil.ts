const createGoogleMapsNavUrl = (srcAddr: string, destAddr: string) => {
  const src = srcAddr.replaceAll(' ', '+');
  const dest = destAddr.replaceAll(' ', '+');
  const url = `https://maps.google.com/maps?ie=UTF8&amp;output=embed&amp;saddr=${src}&amp;daddr=${dest}&amp;dirflg=d`;
  return url.replaceAll('&amp;', '&');
}

const createGoogleMapsPosMarkUrl = (addr: string) => {
  const a = addr.replaceAll(' ', '+');
  const url = `https://maps.google.com/maps?q=${a}&amp;z=15&amp;ie=UTF8&amp;output=embed`;
  return url.replaceAll('&amp;', '&');
}

export { createGoogleMapsNavUrl, createGoogleMapsPosMarkUrl }
