import useSettings from "../../state/useSettings";
import FireOpsLogo from "./assets/fireops_logo_black.svg"


const Header = () => {

  const { settings } = useSettings()

  return (
    <div className="w-full flex items-center justify-between shadow-lg border border-neutral-200 py-4 z-10">
      <div className="flex justify-end ml-30">
        <img className="h-14 w-auto object-contain" src={settings?.LogoUrl} />
      </div>
      <div className="flex justify-start mr-30">
        <img className="h-8 w-auto object-contain" src={FireOpsLogo} />
      </div>
    </div>
  )
}
export default Header;
