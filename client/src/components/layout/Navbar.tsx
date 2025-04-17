import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";

const Navbar = () => {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-black shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/">
                <img 
                  src="/attached_assets/logo.png" 
                  alt="Cloma Production" 
                  className="h-10 cursor-pointer"
                />
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <NavLink href="/" label="Home" />
              <NavLink href="/about" label="About" />
              <NavLink href="/works" label="Works" />
              <NavLink href="/fundraiser" label="Fundraiser" />
              <NavLink href="/careers" label="Careers" />
              <NavLink href="/contact" label="Contact" />
            </div>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {user ? (
              user.isAdmin ? (
                <Button 
                  onClick={() => navigate("/admin")}
                  className="bg-primary hover:bg-primary/90 text-white"
                >
                  Admin Dashboard
                </Button>
              ) : (
                <span className="text-white mr-2">
                  Welcome, {user.username}
                </span>
              )
            ) : (
              <Button 
                onClick={() => navigate("/auth")}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                Sign In
              </Button>
            )}
          </div>
          
          <div className="flex items-center sm:hidden">
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-gray-800">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open main menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[250px] sm:w-[350px]">
                <div className="py-4">
                  <MobileNavLink 
                    href="/"
                    label="Home"
                    onClick={() => setIsMenuOpen(false)}
                  />
                  <MobileNavLink 
                    href="/about"
                    label="About"
                    onClick={() => setIsMenuOpen(false)}
                  />
                  <MobileNavLink 
                    href="/works"
                    label="Works"
                    onClick={() => setIsMenuOpen(false)}
                  />
                  <MobileNavLink 
                    href="/fundraiser"
                    label="Fundraiser"
                    onClick={() => setIsMenuOpen(false)}
                  />
                  <MobileNavLink 
                    href="/careers"
                    label="Careers"
                    onClick={() => setIsMenuOpen(false)}
                  />
                  <MobileNavLink 
                    href="/contact"
                    label="Contact"
                    onClick={() => setIsMenuOpen(false)}
                  />
                  <div className="pt-4 pb-3 border-t border-gray-200">
                    {user ? (
                      user.isAdmin ? (
                        <MobileNavLink 
                          href="/admin"
                          label="Admin Dashboard"
                          onClick={() => setIsMenuOpen(false)}
                        />
                      ) : (
                        <div className="px-4 py-2 text-base font-medium text-gray-500">
                          Welcome, {user.username}
                        </div>
                      )
                    ) : (
                      <MobileNavLink 
                        href="/auth"
                        label="Sign In"
                        onClick={() => setIsMenuOpen(false)}
                      />
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

const NavLink = ({ href, label }: { href: string; label: string }) => {
  const [location] = useLocation();
  const isActive = location === href;
  
  return (
    <Link href={href} className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
      isActive
      ? "border-primary text-white"
      : "border-transparent text-gray-400 hover:border-gray-500 hover:text-white"
    }`}>
      {label}
    </Link>
  );
};

const MobileNavLink = ({ 
  href, 
  label, 
  onClick 
}: { 
  href: string; 
  label: string;
  onClick: () => void;
}) => {
  const [location] = useLocation();
  const isActive = location === href;
  
  return (
    <Link 
      href={href} 
      className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
        isActive
          ? "bg-primary/10 border-primary text-primary"
          : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
      }`}
      onClick={onClick}
    >
      {label}
    </Link>
  );
};

export default Navbar;
