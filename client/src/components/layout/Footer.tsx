import { Link } from "wouter";
import { 
  FacebookIcon, 
  TwitterIcon, 
  InstagramIcon, 
  YoutubeIcon 
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-black text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center">
              <img 
                src="/attached_assets/logo.png" 
                alt="Cloma Production" 
                className="h-10 mr-3"
              />
            </div>
            <p className="mt-4 text-gray-300">Animating Dreams, One Frame at a Time</p>
            <div className="mt-6 flex space-x-6">
              <SocialLink href="#" icon={<FacebookIcon className="h-5 w-5" />} />
              <SocialLink href="#" icon={<TwitterIcon className="h-5 w-5" />} />
              <SocialLink href="#" icon={<InstagramIcon className="h-5 w-5" />} />
              <SocialLink href="#" icon={<YoutubeIcon className="h-5 w-5" />} />
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Quick Links</h3>
            <ul className="mt-4 space-y-4">
              <FooterLink href="/" label="Home" />
              <FooterLink href="/about" label="About" />
              <FooterLink href="/works" label="Works" />
              <FooterLink href="/fundraiser" label="Fundraiser" />
              <FooterLink href="/blogs" label="Blog" />
              <FooterLink href="/contact" label="Contact" />
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Contact Us</h3>
            <ul className="mt-4 space-y-4">
              <li className="text-base text-gray-300">
                Email: <a href="mailto:clomaproduction@gmail.com" className="hover:text-primary">clomaproduction@gmail.com</a>
              </li>
              <li className="text-base text-gray-300">
                Phone: +2349129426172
              </li>
              <li className="text-base text-gray-300">
                <p>Lagos, Nigeria</p>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-800 pt-8">
          <p className="text-base text-gray-400 text-center">&copy; {new Date().getFullYear()} Cloma Production. All rights reserved.</p>
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
