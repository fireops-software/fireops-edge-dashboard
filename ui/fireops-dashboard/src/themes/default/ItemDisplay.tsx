const ItemDisplay = ({name, value}: {name: any, value: any}) => {
  if(name && value){
    return (
      <div className="mb-2 border-b-2 border-base-300">
        <p className="font-bold">{name}:</p>
        <p className="mb-2">{value}</p>
      </div>
    )
  }
}
export default ItemDisplay;
