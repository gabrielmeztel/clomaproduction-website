import { Link } from "wouter";
import { 
  FacebookIcon, 
  TwitterIcon, 
  InstagramIcon, 
  LinkedinIcon 
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold text-white font-heading">Cloma Production</h3>
            <p className="mt-2 text-gray-300">Bringing Stories to Life through Animation</p>
            <div className="mt-4 flex space-x-6">
              <SocialLink href="#" icon={<FacebookIcon className="h-5 w-5" />} />
              <SocialLink href="#" icon={<TwitterIcon className="h-5 w-5" />} />
              <SocialLink href="#" icon={<InstagramIcon className="h-5 w-5" />} />
              <SocialLink href="#" icon={<LinkedinIcon className="h-5 w-5" />} />
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Resources</h3>
            <ul className="mt-4 space-y-4">
              <FooterLink href="/blogs" label="Blog" />
              <FooterLink href="/gallery" label="Gallery" />
              <FooterLink href="#" label="Events" />
              <FooterLink href="#" label="Success Stories" />
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Company</h3>
            <ul className="mt-4 space-y-4">
              <FooterLink href="#" label="About" />
              <FooterLink href="#" label="Contact" />
              <FooterLink href="#" label="Privacy Policy" />
              <FooterLink href="#" label="Terms of Service" />
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-700 pt-8">
          <p className="text-base text-gray-400 text-center">&copy; {new Date().getFullYear()} EventConnect. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

const SocialLink = ({ href, icon }: { href: string; icon: React.ReactNode }) => {
  return (
    <a 
      href={href} 
      className="text-gray-400 hover:text-white"
      target="_blank"
      rel="noopener noreferrer"
    >
      {icon}
    </a>
  );
};

const FooterLink = ({ href, label }: { href: string; label: string }) => {
  return (
    <li>
      <Link href={href} className="text-base text-gray-300 hover:text-white">
        {label}
      </Link>
    </li>
  );
};

export default Footer;
