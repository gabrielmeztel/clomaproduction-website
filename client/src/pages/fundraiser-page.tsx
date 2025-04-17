import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function FundraiserPage() {
  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative bg-primary py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white sm:text-5xl font-heading">
              Fundraiser
            </h1>
            <p className="mt-4 text-xl text-white/90 max-w-3xl mx-auto">
              Support our upcoming animation projects and be part of bringing new stories to life.
            </p>
          </div>
        </div>
      </div>
      
      {/* Coming Soon Section */}
      <div className="py-24 bg-black flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block p-4 rounded-full bg-primary/20 mb-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <h2 className="text-3xl sm:text-4xl font-bold text-white">Coming Soon!</h2>
          <p className="mt-6 text-xl text-gray-400 max-w-2xl mx-auto">
            We're currently preparing our fundraising campaign for our next big animation project. 
            Stay tuned for more information about how you can support our work.
          </p>
          
          <div className="mt-12 space-y-4 sm:space-y-0 sm:flex sm:justify-center sm:gap-4">
            <Link href="/contact">
              <Button className="bg-primary hover:bg-primary/90 text-white px-6 py-3 text-lg">
                Get Notified
              </Button>
            </Link>
            <Link href="/works">
              <Button className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 text-lg">
                View Our Projects
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Info Section */}
      <div className="py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-bold text-white mb-4">Why Support Us?</h3>
              <p className="text-gray-300">
                Your support helps independent animators create original content and bring diverse stories to life.
                By backing our projects, you're directly contributing to the future of animation.
              </p>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-bold text-white mb-4">What You'll Get</h3>
              <p className="text-gray-300">
                Our backers will receive exclusive behind-the-scenes content, digital downloads, and special recognition
                in the credits. Higher tier supporters may receive personalized animated characters and more.
              </p>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-bold text-white mb-4">Our Promise</h3>
              <p className="text-gray-300">
                We're committed to transparency throughout the production process. We'll provide regular updates on our
                progress and ensure that we deliver a high-quality animated project that justifies your support.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}