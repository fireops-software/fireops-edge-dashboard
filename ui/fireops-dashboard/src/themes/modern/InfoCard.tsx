import { PropsWithChildren } from "react"

const InfoCard = (props: PropsWithChildren) => {
  return (
    <div className="flex flex-col shadow-xl rounded-xl p-4 border border-neutral-300 mr-4">
      {props.children}
    </div>
  )
}
export default InfoCard
