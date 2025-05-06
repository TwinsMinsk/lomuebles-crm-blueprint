
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import NavigationMenu from "@/components/navigation/NavigationMenu";
import { useAuth } from "@/context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut, userRole } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth/login");
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo area */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <div className="h-10 w-48 bg-slate-100 flex items-center justify-center rounded">
                <span className="text-gray-500 font-medium">lomuebles.es CRM</span>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="hidden md:inline">{user.email}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Учетная запись</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {userRole && <DropdownMenuItem className="text-gray-500">Роль: {userRole}</DropdownMenuItem>}
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-500 cursor-pointer">
                    <LogOut className="h-4 w-4 mr-2" />
                    Выйти
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="outline" asChild>
                <Link to="/auth/login">Войти</Link>
              </Button>
            )}

            {isMobile ? (
              <div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="md:hidden" 
                  onClick={toggleMenu}
                >
                  {isMenuOpen ? <X /> : <Menu />}
                </Button>

                {/* Mobile menu */}
                <div
                  className={cn(
                    "absolute top-full left-0 w-full bg-white shadow-md transition-all duration-300 ease-in-out",
                    isMenuOpen ? "max-h-[80vh] opacity-100 overflow-y-auto" : "max-h-0 opacity-0 overflow-hidden"
                  )}
                >
                  <div className="container mx-auto px-4 py-3">
                    <NavigationMenu onItemClick={closeMenu} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="hidden md:block">
                <NavigationMenu />
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
