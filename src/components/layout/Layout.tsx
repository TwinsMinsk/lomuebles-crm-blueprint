
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarContent,
  SidebarTrigger
} from "@/components/ui/sidebar";
import SidebarNavigation from "./SidebarNavigation";

const Layout = () => {
  return (
    <SidebarProvider>
      <div className="flex flex-col min-h-screen w-full">
        <Header />
        <div className="flex flex-1">
          <Sidebar>
            <SidebarContent>
              <SidebarNavigation />
            </SidebarContent>
          </Sidebar>
          <main className="flex-grow overflow-auto">
            <div className="container mx-auto px-4 py-6">
              <Outlet />
            </div>
          </main>
        </div>
        <Footer />
      </div>
    </SidebarProvider>
  );
};

export default Layout;
