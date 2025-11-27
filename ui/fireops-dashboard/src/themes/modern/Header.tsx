import useSettings from "../../state/useSettings";
import FireOpsLogo from "./assets/fireops_logo_black.svg"


const Header = () => {

  const { settings } = useSettings()
  
  return (
    <header className="w-full glass-card p-4 shadow-modern-lg border-b border-white/10 animate-fade-in relative">
      <div className="flex items-center justify-between max-w-screen-2xl mx-auto">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <img 
              className="h-14 w-auto object-contain hover:scale-105 transition-transform duration-300" 
              src={settings?.LogoUrl} 
              alt="Feuerwehr Logo"
            />
          </div>
        </div>
        
        <div className="flex items-center">
          <div className="relative">
            <img 
              className="h-8 w-auto object-contain hover:scale-105 transition-transform duration-300" 
              src={FireOpsLogo}
              alt="FireOPS Logo"
            />
          </div>
        </div>
      </div>
    </header>
  )
}
export default Header;
