import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

type Project = {
  id: number;
  title: string;
  category: string;
  year: string;
  image: string;
  description: string;
};

// Sample project data
const projects: Project[] = [
  {
    id: 1,
    title: "Character Design Project",
    category: "character-design",
    year: "2023",
    image: "/attached_assets/project1.jpg",
    description: "Original character designs for animated series."
  },
  {
    id: 2,
    title: "Short Animation",
    category: "animation",
    year: "2023",
    image: "/attached_assets/project2.jpg",
    description: "2D animated short film featuring original characters."
  },
  {
    id: 3,
    title: "Visual Development",
    category: "visual-dev",
    year: "2022",
    image: "/attached_assets/studio.jpg",
    description: "Background art and scene design for animation projects."
  },
  {
    id: 4,
    title: "Client Animation Project",
    category: "commercial",
    year: "2022",
    image: "/attached_assets/project4.jpg",
    description: "Commercial animation work for advertising campaign."
  },
  {
    id: 5,
    title: "Featured Story Development",
    category: "storyboard",
    year: "2022",
    image: "/attached_assets/featured-project.jpg", 
    description: "Storyboard and narrative development for animated feature."
  },
  {
    id: 6,
    title: "Kickstarter Animation",
    category: "animation",
    year: "2021",
    image: "/attached_assets/kickstarter-project.jpg",
    description: "Promotional animation for crowdfunding campaign."
  }
];

// Filter categories
const categories = [
  { id: "all", label: "All Projects" },
  { id: "animation", label: "Animation" },
  { id: "character-design", label: "Character Design" },
  { id: "visual-dev", label: "Visual Development" },
  { id: "storyboard", label: "Storyboarding" },
  { id: "commercial", label: "Commercial Projects" }
];

export default function WorksPage() {
  const [activeFilter, setActiveFilter] = useState("all");
  
  const filteredProjects = activeFilter === "all" 
    ? projects 
    : projects.filter(project => project.category === activeFilter);
  
  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative bg-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white sm:text-5xl font-heading">
              Our Animation Works
            </h1>
            <p className="mt-4 text-xl text-gray-300 max-w-3xl mx-auto">
              A showcase of our animation projects, character designs, and visual development work.
            </p>
          </div>
        </div>
      </div>
      
      {/* Filter Buttons */}
      <div className="py-8 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map(category => (
              <button
                key={category.id}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                  ${activeFilter === category.id 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                onClick={() => setActiveFilter(category.id)}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Projects Grid */}
      <div className="py-12 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map(project => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
          
          {filteredProjects.length === 0 && (
            <div className="text-center py-12">
              <p className="text-xl text-gray-400">No projects found in this category.</p>
            </div>
          )}
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="py-16 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white">Interested in Working with Us?</h2>
          <p className="mt-4 text-xl text-gray-300 max-w-2xl mx-auto">
            We're always looking for new projects and collaborations. Get in touch to discuss your ideas.
          </p>
          <div className="mt-8">
            <Link href="/contact">
              <Button className="bg-primary hover:bg-primary/90 text-white text-lg px-6 py-3">
                Contact Our Team
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

const ProjectCard = ({ project }: { project: Project }) => {
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg transition-transform duration-300 hover:-translate-y-2">
      <div className="h-64 overflow-hidden">
        <img 
          src={project.image} 
          alt={project.title} 
          className="w-full h-full object-cover transform transition duration-500 hover:scale-105"
        />
      </div>
      <div className="p-6">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-bold text-white">{project.title}</h3>
          <span className="inline-block px-3 py-1 rounded-full text-sm bg-gray-700 text-gray-300">
            {project.year}
          </span>
        </div>
        <p className="mt-3 text-gray-400">{project.description}</p>
        <div className="mt-4">
          <span className="inline-block px-3 py-1 rounded-full text-xs bg-primary/20 text-primary">
            {categories.find(cat => cat.id === project.category)?.label || project.category}
          </span>
        </div>
      </div>
    </div>
  );
};