import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BlogPost } from "@shared/schema";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ChatWidget from "@/components/chat/ChatWidget";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useLocation } from "wouter";
import { Search, Filter, Tag } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function BlogPage() {
  const [location] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const { data: blogs, isLoading } = useQuery<BlogPost[]>({
    queryKey: ["/api/blogs"],
  });
  
  const categories = blogs 
    ? [...new Set(blogs.map(blog => blog.category))]
    : [];
  
  const filteredBlogs = blogs?.filter(blog => {
    const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          blog.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          blog.author.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory ? blog.category === selectedCategory : true;
    
    return matchesSearch && matchesCategory;
  });
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-grow bg-gray-50">
        {/* Hero section */}
        <div className="bg-white py-10 border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl font-heading">
                Blog & Resources
              </h1>
              <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
                Discover the latest insights, tips, and success stories from the EventConnect community.
              </p>
            </div>
          </div>
        </div>
        
        {/* Search and filter */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <Input
                type="text"
                placeholder="Search blog posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-0 sm:ml-2">
                  <Filter className="mr-2" size={16} />
                  {selectedCategory ? selectedCategory : "All Categories"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setSelectedCategory(null)}>
                  All Categories
                </DropdownMenuItem>
                {categories.map((category) => (
                  <DropdownMenuItem 
                    key={category} 
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
            {selectedCategory && (
              <Badge className="ml-2 bg-primary" onClick={() => setSelectedCategory(null)}>
                {selectedCategory} <span className="ml-1 cursor-pointer">×</span>
              </Badge>
            )}
          </div>
        </div>
        
        {/* Blog posts */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading blog posts...</p>
            </div>
          ) : filteredBlogs && filteredBlogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBlogs.map(blog => (
                <BlogCard key={blog.id} blog={blog} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No blog posts found matching your search criteria.</p>
              <Button 
                variant="link" 
                className="mt-2"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory(null);
                }}
              >
                Clear filters
              </Button>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
      <ChatWidget />
    </div>
  );
}

interface BlogCardProps {
  blog: BlogPost;
}

const BlogCard = ({ blog }: BlogCardProps) => {
  return (
    <Card className="overflow-hidden">
      <div className="h-48 overflow-hidden">
        <img 
          src={`https://source.unsplash.com/random/800x600?${blog.category.toLowerCase().replace(/\s+/g, '-')}`}
          alt={blog.title}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            <Tag size={12} className="mr-1" />
            {blog.category}
          </Badge>
          <span className="text-xs text-gray-500">{blog.readTime || 5} min read</span>
        </div>
        <CardTitle className="mt-2 line-clamp-2">{blog.title}</CardTitle>
        <CardDescription className="line-clamp-2">
          <div dangerouslySetInnerHTML={{ __html: blog.content.replace(/<[^>]*>/g, '') }} />
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="mt-2 flex items-center">
          <div className="flex-shrink-0">
            <span className="sr-only">{blog.author}</span>
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
              {blog.author.charAt(0).toUpperCase()}
            </div>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">{blog.author}</p>
            <div className="text-xs text-gray-500">
              {new Date(blog.publishedAt || '').toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Link href={`/blogs/${blog.id}`}>
          <Button variant="outline" className="w-full">
            Read more
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};
