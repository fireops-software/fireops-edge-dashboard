import useSettings from "../../state/useSettings";
import FireOpsLogo from "./assets/fireops_logo.png"

const Header = () => {
  const { settings } = useSettings()

  return (
    <>
      <div className="w-full flex p-3 items-center shadow-md">
        <div className="flex justify-end">
          <img className="w-48" src={settings?.LogoUrl} />
        </div>
        <div className="lg:flex flex-grow justify-center hidden">
          <h1 className="text-4xl">{settings?.Name}</h1>
        </div>
        <div className="lg:flex justify-start hidden">
          <img className="w-48" src={FireOpsLogo} />
        </div>
      </div>
    </>
  )
}
export default Header;
