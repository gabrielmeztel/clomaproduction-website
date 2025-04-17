import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative bg-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white sm:text-5xl font-heading">
              About Cloma Production
            </h1>
            <p className="mt-4 text-xl text-gray-300 max-w-3xl mx-auto">
              A fully remote, globally distributed animation studio bringing stories to life through animation.
            </p>
          </div>
        </div>
      </div>
      
      {/* About Content */}
      <div className="py-16 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-12 items-start">
            <div className="w-full lg:w-1/2">
              <h2 className="text-3xl font-bold text-white mb-6">Our Story</h2>
              <div className="space-y-4 text-gray-300">
                <p>
                  Cloma Production is an online-based animation studio with artists from all over the world, creating bold, heartfelt 
                  stories through the art of animation.
                </p>
                <p>
                  Founded with a vision to bring diverse voices and unique perspectives to the animation industry, our team collaborates 
                  remotely across different time zones and cultures to produce captivating animated content.
                </p>
                <p>
                  We believe that animation is a powerful medium to tell stories that resonate with people of all ages and backgrounds, 
                  breaking barriers and creating connections through visual storytelling.
                </p>
                <p>
                  With a commitment to quality and creativity, we work closely with our clients and partners to bring their visions to life, 
                  from concept to final delivery.
                </p>
              </div>
            </div>
            
            <div className="w-full lg:w-1/2 mt-8 lg:mt-0">
              <div className="rounded-lg overflow-hidden">
                <img 
                  src="/attached_assets/studio.jpg" 
                  alt="Cloma Production Studio" 
                  className="w-full object-cover h-auto rounded-lg"
                />
              </div>
              
              <div className="mt-8 bg-gray-800 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-white mb-4">Mission Statement</h3>
                <p className="text-gray-300">
                  Our mission is to create authentic, engaging animated content that tells diverse stories, showcases unique perspectives,
                  and pushes the boundaries of animation as an art form while nurturing the next generation of animation talent from around the world.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Team Section */}
      <div className="py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white">Our Global Team</h2>
            <p className="mt-4 text-xl text-gray-300 max-w-3xl mx-auto">
              A diverse group of talented artists, animators, and storytellers from around the world.
            </p>
          </div>
          
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <TeamMember 
              name="Gabriel Ezigbo" 
              role="Founder & Creative Director" 
              image="/attached_assets/studio.jpg"
            />
            <TeamMember 
              name="Animation Artist" 
              role="Character Designer" 
              image="/attached_assets/studio.jpg"
            />
            <TeamMember 
              name="Animation Artist" 
              role="Background Artist" 
              image="/attached_assets/studio.jpg"
            />
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="py-16 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white">Ready to Bring Your Story to Life?</h2>
          <p className="mt-4 text-xl text-white/90 max-w-2xl mx-auto">
            Let's collaborate on your next animation project. Get in touch with our team today.
          </p>
          <div className="mt-8">
            <Link href="/contact">
              <Button className="bg-white text-primary hover:bg-gray-100 text-lg px-8 py-6">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

const TeamMember = ({ name, role, image }: { name: string; role: string; image: string }) => {
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden transition-transform duration-300 hover:-translate-y-2">
      <img 
        src={image} 
        alt={name} 
        className="w-full h-64 object-cover"
      />
      <div className="p-6">
        <h3 className="text-xl font-bold text-white">{name}</h3>
        <p className="text-gray-400">{role}</p>
      </div>
    </div>
  );
};