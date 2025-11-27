const ItemDisplay = ({name, value}: {name: any, value: any}) => {
  if(name && value){
    return (
      <div className="group hover:bg-base-100/50 p-2 rounded-lg transition-all duration-200">
        <div className="flex items-start justify-between">
          <dt className="text-sm font-medium text-neutral/70 mb-1 group-hover:text-neutral transition-colors">
            {name}:
          </dt>
        </div>
        <dd className="text-base font-semibold text-neutral leading-tight break-words">
          {value}
        </dd>
      </div>
    )
  }
  return null
}
export default ItemDisplay;
