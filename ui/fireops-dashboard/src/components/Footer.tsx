import { useEffect, useState } from "react";

const Footer = () => {
  const [datetime, setDateTime] = useState(new Date())

  useEffect(() => {
    const intervalId: number = setInterval(() => setDateTime(new Date()), 1000)
    return () => clearInterval(intervalId)
  }, []);

  return (
    <div className="w-full flex p-4 bg-secondary text-secondary-content text-xl">
      <div className="flex justify-start">
        <p>{ datetime.toLocaleDateString('de-DE') }</p>
      </div>
      <div className="flex flex-grow justify-center">
        © FireOps
      </div>
      <div className="flex justify-end">
        <p className="">{ datetime.toLocaleTimeString('de-DE') }</p>
      </div>
    </div>
  )
}
export default Footer;
