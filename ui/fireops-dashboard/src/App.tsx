import { useEffect, useState } from "react"
import Footer from "./components/Footer"
import Header from "./components/Header"
import View from "./components/View"
import { FireDepInfo } from "./domain/FireDepInfo"

function App() {
  const [ffInfo, setFfInfo] = useState(new FireDepInfo());
  useEffect(() => {
    fetch("/api/v1/fireDepInfo")
      .then((data) => data.json().then((fdi: FireDepInfo) => setFfInfo(fdi)))
  }, []);

  return (
    <div className="flex flex-col w-screen h-screen">
      <Header fireDepInfo={ffInfo}/>
      <View fireDepInfo={ffInfo}/>
      <Footer />
    </div>
  )
}
export default App
