
import { Link, useNavigate } from "react-router-dom";
import { User, LogOut } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const Header = () => {
  const {
    user,
    signOut,
    userRole
  } = useAuth();
  const navigate = useNavigate();
  
  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <header className="bg-gradient-to-r from-white via-gray-50 to-white border-b border-gray-200/50 backdrop-blur-lg sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo and menu trigger */}
          <div className="flex items-center gap-3">
            <SidebarTrigger className="hover:bg-gray-100/50 transition-colors" />
            <Link to="/" className="flex items-center group">
              <div className="h-12 w-52 flex items-center justify-center rounded-lg bg-gradient-to-r from-accent-green/10 to-light-green/20 group-hover:from-accent-green/20 group-hover:to-light-green/30 transition-all duration-300">
                <span className="font-bold text-xl bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Lugar & Olivia CRM
                </span>
              </div>
            </Link>
          </div>

          {/* User profile dropdown */}
          <div className="flex items-center gap-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border-gray-200/50 hover:bg-white hover:shadow-md transition-all duration-300"
                  >
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-accent-green to-green-400 flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <span className="hidden md:inline font-medium text-gray-700">{user.email}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="w-56 bg-white/95 backdrop-blur-lg border-gray-200/50 shadow-xl"
                >
                  <DropdownMenuLabel className="font-medium">Учетная запись</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {userRole && (
                    <DropdownMenuItem className="text-gray-500 focus:bg-gray-50">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-accent-green"></div>
                        Роль: {userRole}
                      </div>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link 
                      to="/settings" 
                      className="focus:bg-gray-50 cursor-pointer"
                    >
                      Настройки
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleSignOut} 
                    className="text-red-500 cursor-pointer focus:bg-red-50 focus:text-red-600"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Выйти
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                variant="outline" 
                asChild
                className="bg-white/80 backdrop-blur-sm border-gray-200/50 hover:bg-white hover:shadow-md transition-all duration-300"
              >
                <Link to="/login">Войти</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
