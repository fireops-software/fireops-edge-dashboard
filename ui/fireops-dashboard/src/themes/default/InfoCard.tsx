import { PropsWithChildren } from "react"

const InfoCard = (props: PropsWithChildren) => {
  return (
    <div className="flex flex-col shadow rounded-lg p-4 border border-neutral-300 mt-2">
      {props.children}
    </div>
  )
}
export default InfoCard
