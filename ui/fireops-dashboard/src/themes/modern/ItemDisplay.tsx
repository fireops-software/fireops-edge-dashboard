const ItemDisplay = ({name, value}: {name: any, value: any}) => {
  if(name && value){
    return (
      <div className="p-2 rounded-lg">
        <div className="flex items-start justify-between">
          <dt className="text-sm font-medium text-neutral/70 mb-1">
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
