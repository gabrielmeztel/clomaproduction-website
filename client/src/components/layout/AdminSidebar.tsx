import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard, 
  FileText, 
  Image, 
  Calendar, 
  Settings, 
  LogOut,
  Menu,
  X
} from "lucide-react";

interface AdminSidebarProps {
  isMobile?: boolean;
}

const AdminSidebar = ({ isMobile = false }: AdminSidebarProps) => {
  const { logoutMutation } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Only render mobile sidebar toggle if in mobile mode
  if (isMobile) {
    return (
      <>
        <button
          type="button"
          className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary md:hidden"
          onClick={() => setMobileSidebarOpen(true)}
        >
          <span className="sr-only">Open sidebar</span>
          <Menu className="h-6 w-6" />
        </button>

        {/* Mobile sidebar */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 flex z-40 md:hidden" role="dialog" aria-modal="true">
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" aria-hidden="true" onClick={() => setMobileSidebarOpen(false)}></div>
            <div className="relative flex-1 flex flex-col max-w-xs w-full pt-5 pb-4 bg-gray-800">
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  type="button"
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  onClick={() => setMobileSidebarOpen(false)}
                >
                  <span className="sr-only">Close sidebar</span>
                  <X className="h-6 w-6 text-white" />
                </button>
              </div>
              <div className="flex-shrink-0 flex items-center px-4">
                <span className="text-white text-2xl font-bold font-heading">EventConnect Admin</span>
              </div>
              <div className="mt-5 flex-1 h-0 overflow-y-auto">
                <nav className="px-2 space-y-1">
                  <SidebarLink 
                    href="/admin" 
                    label="Dashboard" 
                    icon={<LayoutDashboard />} 
                    onClick={() => setMobileSidebarOpen(false)}
                  />
                  <SidebarLink 
                    href="/admin/blogs" 
                    label="Blog Posts" 
                    icon={<FileText />} 
                    onClick={() => setMobileSidebarOpen(false)}
                  />
                  <SidebarLink 
                    href="/admin/gallery" 
                    label="Image Gallery" 
                    icon={<Image />} 
                    onClick={() => setMobileSidebarOpen(false)}
                  />
                  <SidebarLink 
                    href="/admin/settings" 
                    label="Settings" 
                    icon={<Settings />} 
                    onClick={() => setMobileSidebarOpen(false)}
                  />
                  <div className="pt-4 mt-4 border-t border-gray-700">
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-gray-300 hover:bg-gray-700 hover:text-white"
                      onClick={() => {
                        logoutMutation.mutate();
                        setMobileSidebarOpen(false);
                      }}
                    >
                      <LogOut className="mr-3 h-5 w-5 text-gray-400" />
                      Sign Out
                    </Button>
                  </div>
                </nav>
              </div>
            </div>
            <div className="flex-shrink-0 w-14" aria-hidden="true">
              {/* Dummy element to force sidebar to shrink to fit close icon */}
            </div>
          </div>
        )}
      </>
    );
  }

  // Desktop sidebar
  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64">
        <div className="flex flex-col h-0 flex-1">
          <div className="flex items-center h-16 flex-shrink-0 px-4 bg-gray-900">
            <span className="text-white text-xl font-bold font-heading">EventConnect Admin</span>
          </div>
          <div className="flex-1 flex flex-col overflow-y-auto">
            <nav className="flex-1 px-2 py-4 bg-gray-800 space-y-1">
              <SidebarLink href="/admin" label="Dashboard" icon={<LayoutDashboard />} />
              <SidebarLink href="/admin/blogs" label="Blog Posts" icon={<FileText />} />
              <SidebarLink href="/admin/gallery" label="Image Gallery" icon={<Image />} />
              <SidebarLink href="/admin/settings" label="Settings" icon={<Settings />} />
              <div className="pt-4 mt-4 border-t border-gray-700">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-gray-300 hover:bg-gray-700 hover:text-white"
                  onClick={() => logoutMutation.mutate()}
                >
                  <LogOut className="mr-3 h-5 w-5 text-gray-400" />
                  Sign Out
                </Button>
              </div>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

interface SidebarLinkProps {
  href: string;
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
}

const SidebarLink = ({ href, label, icon, onClick }: SidebarLinkProps) => {
  const [location] = useLocation();
  const isActive = location === href;

  return (
    <Link href={href}>
      <a 
        className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
          isActive
            ? "bg-gray-900 text-white"
            : "text-gray-300 hover:bg-gray-700 hover:text-white"
        }`}
        onClick={onClick}
      >
        <span className={`mr-3 h-5 w-5 ${isActive ? "text-gray-300" : "text-gray-400"}`}>
          {icon}
        </span>
        {label}
      </a>
    </Link>
  );
};

export default AdminSidebar;
