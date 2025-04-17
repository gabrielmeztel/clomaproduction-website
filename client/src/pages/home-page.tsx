import { Link } from "wouter";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ChatWidget from "@/components/chat/ChatWidget";
import VideoPlayer from "@/components/VideoPlayer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { BlogPost, GalleryImage } from "@shared/schema";
import { useState } from "react";

// Import assets
import heroBgPath from "@assets/hero-bg.jpg";
import logoPath from "@assets/logo.png";
import partnerLogoPath from "@assets/partner-logo.jpg";
import project1Path from "@assets/project1.jpg";
import project2Path from "@assets/project2.jpg";
import studioPath from "@assets/studio.jpg";
import gopVideoPath from "@assets/gop_002.mp4";

export default function HomePage() {
  const [email, setEmail] = useState("");
  
  const { data: blogs, isLoading: blogsLoading } = useQuery<BlogPost[]>({
    queryKey: ["/api/blogs"],
  });
  
  const { data: images, isLoading: imagesLoading } = useQuery<GalleryImage[]>({
    queryKey: ["/api/gallery"],
  });
  
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send the email to a backend service
    alert(`Thank you for subscribing with: ${email}`);
    setEmail("");
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroBgPath}
            alt="Cloma Production Hero"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black opacity-50"></div>
        </div>
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <div className="pt-10 sm:pt-16 lg:pt-8 lg:pb-14 lg:overflow-hidden">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="lg:grid lg:grid-cols-2 lg:gap-8">
                  <div className="mx-auto max-w-md px-4 sm:max-w-2xl sm:px-6 sm:text-center lg:px-0 lg:text-left lg:flex lg:items-center">
                    <div>
                      <h1 className="mt-4 text-4xl tracking-tight font-bold text-white sm:mt-5 sm:text-5xl lg:mt-6 xl:text-5xl font-heading">
                        <span className="block">Bringing Stories</span>
                        <span className="block text-primary">to Life</span>
                      </h1>
                      <p className="mt-3 text-base text-gray-300 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                        An online-based animation studio with artists from all over the world creating bold, heartfelt stories through the art of animation.
                      </p>
                      <div className="mt-8 sm:mt-10">
                        <form className="sm:flex" onSubmit={handleSubscribe}>
                          <label htmlFor="email-address" className="sr-only">Email address</label>
                          <Input
                            id="email-address"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                            className="w-full px-5 py-3"
                          />
                          <div className="mt-3 sm:mt-0 sm:ml-3">
                            <Button 
                              type="submit" 
                              className="w-full bg-primary hover:bg-primary/90 text-white font-medium"
                            >
                              Get Started
                            </Button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Removing the duplicate hero image */}
      </div>
      
      {/* Featured Animation */}
      <div className="py-12 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center mb-6">
            <h2 className="text-base text-primary font-semibold tracking-wide uppercase">Featured Animation</h2>
            <p className="mt-2 text-3xl leading-8 font-bold tracking-tight text-white sm:text-4xl font-heading">Our Latest Work</p>
            <p className="mt-4 max-w-2xl text-xl text-gray-400 lg:mx-auto">Experience the quality and creativity of our animation production.</p>
          </div>
          
          <div className="mt-8 flex justify-center">
            <div className="relative w-full max-w-4xl overflow-hidden rounded-xl shadow-2xl">
              <VideoPlayer 
                src={gopVideoPath}
                className="w-full h-auto"
                autoPlay={true}
                loop={true}
                muted={true}
                controls={false}
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                <h3 className="text-xl font-bold text-white">GOP Animation Preview</h3>
                <p className="mt-2 text-gray-300">A sample of our animation style and quality.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Services Section */}
      <div className="py-12 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-primary font-semibold tracking-wide uppercase">Our Services</h2>
            <p className="mt-2 text-3xl leading-8 font-bold tracking-tight text-white sm:text-4xl font-heading">Animation Services We Offer</p>
            <p className="mt-4 max-w-2xl text-xl text-gray-400 lg:mx-auto">Professional animation services for projects of all sizes, from concept to final delivery.</p>
          </div>

          <div className="mt-10">
            <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              <Feature
                icon={<i className="fas fa-video"></i>}
                title="2D Animation"
                description="Creative 2D animation services for commercials, explainer videos, and social media content."
              />
              <Feature
                icon={<i className="fas fa-cube"></i>}
                title="Character Design"
                description="Custom character designs that bring your story to life with personality and style."
              />
              <Feature
                icon={<i className="fas fa-pencil-alt"></i>}
                title="Storyboarding"
                description="Detailed storyboards to visualize your narrative and plan your production effectively."
              />
              <Feature
                icon={<i className="fas fa-paint-brush"></i>}
                title="Visual Development"
                description="Background art and scene design to establish the perfect mood and setting for your story."
              />
            </dl>
          </div>
        </div>
      </div>
      
      {/* Fundraiser Banner */}
      <div className="py-16 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl font-heading">Fundraiser</h2>
          <p className="mt-4 text-xl text-white/90 max-w-2xl mx-auto">
            Coming Soon! Stay tuned for our upcoming animation project fundraising campaign.
          </p>
          <div className="mt-6">
            <Link href="/fundraiser">
              <Button className="bg-white text-primary hover:bg-gray-100 font-semibold">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Partners Section */}
      <div className="py-12 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl font-heading">Our Partners</h2>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-300 sm:mt-4">
              We collaborate with leading studios and creators in the animation industry.
            </p>
          </div>

          <div className="mt-12 max-w-xl mx-auto">
            <div className="bg-gray-900 rounded-lg shadow-xl overflow-hidden p-8">
              <div className="flex flex-col sm:flex-row items-center gap-8">
                <div className="flex-shrink-0">
                  <img 
                    src={partnerLogoPath} 
                    alt="AC Comic Studios Logo" 
                    className="h-32 w-32 object-cover rounded-full"
                  />
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-2xl font-bold text-white">AC Comic Studios</h3>
                  <p className="mt-2 text-gray-300">
                    Working together to create compelling animated stories and characters that resonate with audiences worldwide.
                  </p>
                  <div className="mt-4">
                    <Button className="bg-primary hover:bg-primary/90 text-white">
                      Visit Partner
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Blog Section */}
      <div className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl font-heading">Latest Blog Posts</h2>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
              Discover the latest insights, tips, and stories from our animation studio.
            </p>
          </div>

          <div className="mt-12 max-w-lg mx-auto grid gap-5 lg:grid-cols-3 lg:max-w-none">
            {blogsLoading ? (
              <div className="col-span-3 text-center py-10">Loading blog posts...</div>
            ) : blogs && blogs.length > 0 ? (
              blogs.slice(0, 3).map((post) => (
                <BlogCard key={post.id} post={post} />
              ))
            ) : (
              <div className="col-span-3 text-center py-10">No blog posts available.</div>
            )}
          </div>

          <div className="mt-10 text-center">
            <Link href="/blogs">
              <Button className="bg-primary hover:bg-primary/90 text-white">
                View All Blog Posts
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Projects Section */}
      <div className="py-12 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl font-heading">Our Animation Projects</h2>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-400 sm:mt-4">
              Check out some of our recent animation work and creative collaborations.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="overflow-hidden rounded-lg shadow-lg">
              <img 
                src={project1Path} 
                alt="Animation Project 1"
                className="w-full h-64 object-cover transform transition duration-500 hover:scale-105"
              />
            </div>
            <div className="overflow-hidden rounded-lg shadow-lg">
              <img 
                src={project2Path} 
                alt="Animation Project 2"
                className="w-full h-64 object-cover transform transition duration-500 hover:scale-105"
              />
            </div>
            <div className="overflow-hidden rounded-lg shadow-lg">
              <img 
                src={studioPath} 
                alt="Animation Project 3"
                className="w-full h-64 object-cover transform transition duration-500 hover:scale-105"
              />
            </div>
          </div>

          <div className="mt-10 text-center">
            <Link href="/works">
              <Button className="bg-primary hover:bg-primary/90 text-white">
                View All Projects
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      <Footer />
      <ChatWidget />
    </div>
  );
}

// Feature component
const Feature = ({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
}) => {
  return (
    <div className="relative">
      <dt>
        <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary text-white">
          {icon}
        </div>
        <p className="ml-16 text-lg leading-6 font-medium text-white">{title}</p>
      </dt>
      <dd className="mt-2 ml-16 text-base text-gray-400">{description}</dd>
    </div>
  );
};

// Blog card component
const BlogCard = ({ post }: { post: BlogPost }) => {
  return (
    <div className="flex flex-col rounded-lg shadow-lg overflow-hidden">
      <div className="flex-shrink-0">
        <img 
          className="h-48 w-full object-cover" 
          src={`https://source.unsplash.com/random/800x600?${post.category.toLowerCase().replace(/\s+/g, '-')}`} 
          alt={post.title} 
        />
      </div>
      <div className="flex-1 bg-white p-6 flex flex-col justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-primary">
            <Link href={`/blogs?category=${post.category}`} className="hover:underline">
              {post.category}
            </Link>
          </p>
          <Link href={`/blogs/${post.id}`} className="block mt-2">
            <p className="text-xl font-semibold text-gray-900">{post.title}</p>
            <div className="mt-3 text-base text-gray-500" dangerouslySetInnerHTML={{ __html: post.content.slice(0, 150) + '...' }} />
          </Link>
        </div>
        <div className="mt-6 flex items-center">
          <div className="flex-shrink-0">
            <span className="sr-only">{post.author}</span>
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
              {post.author.charAt(0).toUpperCase()}
            </div>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">{post.author}</p>
            <div className="flex space-x-1 text-sm text-gray-500">
              <time dateTime={post.publishedAt?.toString() || ''}>
                {new Date(post.publishedAt || '').toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </time>
              <span aria-hidden="true">&middot;</span>
              <span>{post.readTime || 5} min read</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Gallery item component
const GalleryItem = ({ image }: { image: GalleryImage }) => {
  return (
    <div className="overflow-hidden rounded-lg shadow-lg">
      <img 
        src={image.imageUrl} 
        alt={image.title}
        className="w-full h-64 object-cover transform transition duration-500 hover:scale-105"
      />
    </div>
  );
};
