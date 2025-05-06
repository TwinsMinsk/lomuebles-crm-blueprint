
import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";

const Header = () => {
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo area */}
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <div className="h-10 w-40 bg-slate-100 flex items-center justify-center rounded">
              <span className="text-gray-500 font-medium">lomuebles.es</span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        {isMobile ? (
          <div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden" 
              onClick={toggleMenu}
            >
              <Menu />
            </Button>

            {/* Mobile menu */}
            <nav
              className={cn(
                "absolute top-full left-0 w-full bg-white shadow-md transition-all duration-300 ease-in-out",
                isMenuOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0 overflow-hidden"
              )}
            >
              <div className="container mx-auto px-4 py-3">
                <ul className="space-y-4">
                  <li>
                    <Link to="/" className="block py-2 hover:text-blue-600" onClick={() => setIsMenuOpen(false)}>
                      Главная
                    </Link>
                  </li>
                  <li>
                    <Link to="/leads" className="block py-2 hover:text-blue-600" onClick={() => setIsMenuOpen(false)}>
                      Лиды
                    </Link>
                  </li>
                  <li>
                    <Link to="/contacts" className="block py-2 hover:text-blue-600" onClick={() => setIsMenuOpen(false)}>
                      Контакты
                    </Link>
                  </li>
                </ul>
              </div>
            </nav>
          </div>
        ) : (
          <nav className="hidden md:block">
            <ul className="flex space-x-8">
              <li>
                <Link to="/" className="py-2 hover:text-blue-600">
                  Главная
                </Link>
              </li>
              <li>
                <Link to="/leads" className="py-2 hover:text-blue-600">
                  Лиды
                </Link>
              </li>
              <li>
                <Link to="/contacts" className="py-2 hover:text-blue-600">
                  Контакты
                </Link>
              </li>
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
