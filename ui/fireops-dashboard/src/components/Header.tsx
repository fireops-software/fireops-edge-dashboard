import useSettings from "../state/useSettings";

const Header = () => {
  const { settings } = useSettings()

  return (
    <>
      <div className="w-full flex p-3 items-center shadow-md">
        <div className="flex justify-end">
          <img className="h-20" src={settings?.LogoUrl} />
        </div>
        <div className="lg:flex flex-grow justify-center hidden">
          <h1 className="text-4xl">{settings?.Name}</h1>
        </div>
        <div className="lg:flex justify-start hidden">
          <img className="h-12" src="fireops_logo.png" />
        </div>
      </div>
    </>
  )
}
export default Header;
