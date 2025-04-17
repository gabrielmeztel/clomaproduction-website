import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";

export default function CareersPage() {
  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative bg-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white sm:text-5xl font-heading">
              Join Our Team
            </h1>
            <p className="mt-4 text-xl text-gray-300 max-w-3xl mx-auto">
              Be part of a creative animation studio with artists from around the world.
            </p>
          </div>
        </div>
      </div>
      
      {/* Career Opportunities */}
      <div className="py-16 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white">Current Opportunities</h2>
            <p className="mt-4 text-xl text-gray-300 max-w-3xl mx-auto">
              We are always looking for animators, layout artists, background painters, and creative minds to collaborate with us — remotely or on-site.
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-10 mt-12">
            <CareerPosition 
              title="2D Animator (Freelance)"
              description="We are seeking experienced 2D animators for upcoming short films and PVs. Must have a strong portfolio demonstrating character animation skills."
              responsibilities={[
                "Create character animations following style guides",
                "Work with directors to execute their vision",
                "Handle clean-up and in-betweens as needed",
                "Collaborate remotely with an international team"
              ]}
              requirements={[
                "2+ years of experience in 2D animation",
                "Strong understanding of animation principles",
                "Ability to work within established art styles",
                "English communication skills",
                "Experience with industry-standard software"
              ]}
              location="Remote"
              type="Freelance"
              email="clomaproduction@gmail.com"
            />
            
            <CareerPosition 
              title="Layout Artist (Training Program)"
              description="Join our 2-month mentorship track for aspiring layout artists. Beginners welcome! Learn fundamental skills while working on actual production."
              responsibilities={[
                "Create background layouts under supervision",
                "Participate in weekly feedback sessions",
                "Apply learning to assigned production tasks",
                "Complete training exercises and assignments"
              ]}
              requirements={[
                "Basic understanding of perspective drawing",
                "Strong interest in animation production",
                "Ability to take direction and implement feedback",
                "Commitment to the full 2-month program",
                "Access to a computer with required software"
              ]}
              location="Remote"
              type="Training Program"
              email="clomaproduction@gmail.com"
            />
            
            <CareerPosition 
              title="Background Artist (Part-time)"
              description="We're looking for background artists to create high-quality environment art for our animated projects following established style guides."
              responsibilities={[
                "Paint digital backgrounds based on layout drawings",
                "Match artistic direction and color scripts",
                "Create multiple variations of backgrounds (day/night, seasons)",
                "Work closely with the art director to achieve desired look"
              ]}
              requirements={[
                "Experience in digital painting",
                "Understanding of color theory and lighting",
                "Ability to work within deadlines",
                "Familiarity with industry software (Photoshop, Clip Studio)",
                "Portfolio demonstrating environment art skills"
              ]}
              location="Remote"
              type="Part-time"
              email="clomaproduction@gmail.com"
            />
          </div>
        </div>
      </div>
      
      {/* General Applications */}
      <div className="py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white">Don't See Your Role?</h2>
          <p className="mt-4 text-xl text-gray-300 max-w-2xl mx-auto">
            We're always on the lookout for talented individuals. Send us your portfolio and tell us how you'd like to contribute to our projects.
          </p>
          <div className="mt-8">
            <Button 
              className="bg-primary hover:bg-primary/90 text-white py-3 px-8"
              onClick={() => window.location.href = "mailto:clomaproduction@gmail.com?subject=General Application"}
            >
              Submit General Application
            </Button>
          </div>
        </div>
      </div>
      
      {/* Studio Culture */}
      <div className="py-16 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white">Our Studio Culture</h2>
            <p className="mt-4 text-xl text-gray-300 max-w-3xl mx-auto">
              At Cloma Production, we foster a collaborative, inclusive, and creative environment.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-bold text-white mb-4">Global Collaboration</h3>
              <p className="text-gray-300">
                We embrace remote work to bring together the best talent from around the world. Our team spans multiple time zones and cultures, creating a diverse creative environment.
              </p>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-bold text-white mb-4">Learning & Growth</h3>
              <p className="text-gray-300">
                We believe in continuous improvement. All team members have opportunities to learn new skills, receive mentorship, and advance their careers in animation.
              </p>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-bold text-white mb-4">Creative Freedom</h3>
              <p className="text-gray-300">
                While we maintain high standards of quality, we also value creative input from everyone on the team. Your ideas matter and can shape our projects.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

interface CareerPositionProps {
  title: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  location: string;
  type: string;
  email: string;
}

const CareerPosition = ({ 
  title, 
  description, 
  responsibilities, 
  requirements, 
  location, 
  type,
  email
}: CareerPositionProps) => {
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden transition-all hover:shadow-xl">
      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h3 className="text-2xl font-bold text-white">{title}</h3>
          <div className="flex gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-700 text-gray-200">
              {location}
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary">
              {type}
            </span>
          </div>
        </div>
        
        <p className="text-gray-300 mb-6">{description}</p>
        
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-white mb-3">Responsibilities:</h4>
          <ul className="list-disc pl-5 space-y-2 text-gray-300">
            {responsibilities.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
        
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-white mb-3">Requirements:</h4>
          <ul className="list-disc pl-5 space-y-2 text-gray-300">
            {requirements.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
        
        <div className="mt-8">
          <Button 
            className="w-full bg-primary hover:bg-primary/90 text-white"
            onClick={() => window.location.href = `mailto:${email}?subject=${encodeURIComponent(`Application for ${title}`)}`}
          >
            Apply Now
          </Button>
        </div>
      </div>
    </div>
  );
};