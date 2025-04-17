import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { BlogPost, GalleryImage, ChatMessage } from "@shared/schema";
import AdminSidebar from "@/components/layout/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation, Link } from "wouter";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  Search,
  Newspaper,
  Image as ImageIcon,
  Users,
  MessageSquare,
  Calendar,
  ChevronRight,
  Edit,
  Tag,
  User,
} from "lucide-react";
import { generateBlogIdeas } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [blogIdeas, setBlogIdeas] = useState<string[]>([]);
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);

  // Fetch blog posts
  const { data: blogs, isLoading: blogsLoading } = useQuery<BlogPost[]>({
    queryKey: ["/api/blogs"],
  });

  // Fetch gallery images
  const { data: images, isLoading: imagesLoading } = useQuery<GalleryImage[]>({
    queryKey: ["/api/gallery"],
  });

  // Example chat message count - in real app would load from backend
  const chatCount = 563;

  useEffect(() => {
    if (!user || !user.isAdmin) {
      navigate("/auth");
    }
  }, [user, navigate]);

  // Prepare data for charts
  const categoryCounts = blogs
    ? Object.entries(
        blogs.reduce((acc, blog) => {
          acc[blog.category] = (acc[blog.category] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      ).map(([name, value]) => ({ name, value }))
    : [];

  const monthlyPostsData = blogs
    ? [
        { name: "Jan", count: blogs.filter(b => new Date(b.publishedAt || "").getMonth() === 0).length },
        { name: "Feb", count: blogs.filter(b => new Date(b.publishedAt || "").getMonth() === 1).length },
        { name: "Mar", count: blogs.filter(b => new Date(b.publishedAt || "").getMonth() === 2).length },
        { name: "Apr", count: blogs.filter(b => new Date(b.publishedAt || "").getMonth() === 3).length },
        { name: "May", count: blogs.filter(b => new Date(b.publishedAt || "").getMonth() === 4).length },
        { name: "Jun", count: blogs.filter(b => new Date(b.publishedAt || "").getMonth() === 5).length },
      ]
    : [];

  const COLORS = ['#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981'];

  const handleGenerateIdeas = async () => {
    setIsGeneratingIdeas(true);
    try {
      const ideas = await generateBlogIdeas("animation studio");
      setBlogIdeas(ideas);
    } catch (error) {
      toast({
        title: "Failed to generate blog ideas",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingIdeas(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Desktop sidebar */}
      <AdminSidebar />
      
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
          {/* Mobile sidebar button */}
          <AdminSidebar isMobile />
          
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex">
              <div className="w-full flex md:ml-0">
                <label htmlFor="search-field" className="sr-only">Search</label>
                <div className="relative w-full text-gray-400 focus-within:text-gray-600">
                  <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 ml-3" />
                  </div>
                  <input
                    id="search-field"
                    className="block w-full h-full pl-10 pr-3 py-2 border-transparent text-gray-900 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-0 focus:border-transparent sm:text-sm"
                    placeholder="Search"
                    type="search"
                  />
                </div>
              </div>
            </div>
            <div className="ml-4 flex items-center md:ml-6">
              <div className="ml-3 relative">
                <div className="flex items-center">
                  <span className="hidden md:inline-block text-sm text-gray-700 mr-2">
                    Welcome, {user?.username}
                  </span>
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white">
                    {user?.username?.charAt(0).toUpperCase()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {/* Dashboard Content */}
              <div className="py-4">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <StatCard 
                    title="Total Blog Posts" 
                    value={blogs?.length || 0} 
                    icon={<Newspaper className="text-primary" />} 
                    isLoading={blogsLoading} 
                  />
                  <StatCard 
                    title="Gallery Images" 
                    value={images?.length || 0} 
                    icon={<ImageIcon className="text-primary" />} 
                    isLoading={imagesLoading} 
                  />
                  <StatCard 
                    title="Total Subscribers" 
                    value={2451} 
                    icon={<Users className="text-primary" />} 
                    isLoading={false} 
                  />
                  <StatCard 
                    title="Chat Interactions" 
                    value={chatCount} 
                    icon={<MessageSquare className="text-primary" />} 
                    isLoading={false} 
                  />
                </div>

                {/* Charts */}
                <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardContent className="pt-6">
                      <h2 className="text-lg font-medium text-gray-900 mb-4">Monthly Blog Post Activity</h2>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            width={500}
                            height={300}
                            data={monthlyPostsData}
                            margin={{
                              top: 5,
                              right: 30,
                              left: 20,
                              bottom: 5,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="count" fill="#3B82F6" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <h2 className="text-lg font-medium text-gray-900 mb-4">Blog Categories</h2>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart width={400} height={400}>
                            <Pie
                              data={categoryCounts}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {categoryCounts.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Blog Posts */}
                <div className="mt-8">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-medium text-gray-900">Recent Blog Posts</h2>
                    <Link href="/admin/blogs">
                      <Button variant="link" className="text-primary">
                        View All
                      </Button>
                    </Link>
                  </div>
                  <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <ul role="list" className="divide-y divide-gray-200">
                      {blogsLoading ? (
                        <li className="px-4 py-4 sm:px-6 text-center text-gray-500">Loading blogs...</li>
                      ) : blogs && blogs.length > 0 ? (
                        blogs.slice(0, 4).map((blog) => (
                          <li key={blog.id}>
                            <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-primary truncate">{blog.title}</p>
                                <div className="ml-2 flex-shrink-0 flex">
                                  <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    blog.isDraft 
                                      ? 'bg-yellow-100 text-yellow-800' 
                                      : 'bg-green-100 text-green-800'
                                  }`}>
                                    {blog.isDraft ? 'Draft' : 'Published'}
                                  </p>
                                </div>
                              </div>
                              <div className="mt-2 sm:flex sm:justify-between">
                                <div className="sm:flex">
                                  <p className="flex items-center text-sm text-gray-500">
                                    <User className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                    {blog.author}
                                  </p>
                                  <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                                    <Tag className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                    {blog.category}
                                  </p>
                                </div>
                                <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                  <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                  <p>
                                    {new Date(blog.publishedAt || '').toLocaleDateString('en-US', { 
                                      year: 'numeric', 
                                      month: 'short', 
                                      day: 'numeric' 
                                    })}
                                  </p>
                                </div>
                              </div>
                              <div className="mt-2 flex justify-end">
                                <Link href={`/admin/blogs?edit=${blog.id}`}>
                                  <Button size="sm" variant="ghost" className="text-primary">
                                    <Edit className="h-4 w-4 mr-1" />
                                    Edit
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          </li>
                        ))
                      ) : (
                        <li className="px-4 py-4 sm:px-6 text-center text-gray-500">No blog posts found.</li>
                      )}
                    </ul>
                  </div>
                </div>

                {/* AI Blog Ideas Generator */}
                <div className="mt-8">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-medium text-gray-900">AI Blog Ideas Generator</h2>
                        <Button 
                          onClick={handleGenerateIdeas}
                          disabled={isGeneratingIdeas}
                          className="bg-primary hover:bg-primary/90"
                        >
                          {isGeneratingIdeas ? "Generating..." : "Generate Ideas"}
                        </Button>
                      </div>
                      
                      <div className="border rounded-md p-4 bg-gray-50 min-h-[200px]">
                        {isGeneratingIdeas ? (
                          <div className="flex justify-center items-center h-full">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                          </div>
                        ) : blogIdeas.length > 0 ? (
                          <ul className="space-y-2">
                            {blogIdeas.map((idea, index) => (
                              <li key={index} className="flex items-start">
                                <ChevronRight className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                                <span>{idea}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="text-center text-gray-500 h-full flex items-center justify-center">
                            <p>Click "Generate Ideas" to get AI-powered blog post suggestions</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Access Cards */}
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <QuickAccessCard 
                    title="Create New Blog Post" 
                    description="Write and publish a new article for your audience" 
                    buttonText="Create Blog" 
                    href="/admin/blogs?new=true" 
                    icon={<Newspaper className="h-6 w-6" />}
                  />
                  <QuickAccessCard 
                    title="Upload Images" 
                    description="Add new animation samples and project showcases" 
                    buttonText="Upload Images" 
                    href="/admin/gallery?upload=true" 
                    icon={<ImageIcon className="h-6 w-6" />}
                  />
                  <QuickAccessCard 
                    title="View Chat Analytics" 
                    description="Check client interactions with your AI production assistant" 
                    buttonText="View Analytics" 
                    href="/admin/settings" 
                    icon={<MessageSquare className="h-6 w-6" />}
                  />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  isLoading: boolean;
}

const StatCard = ({ title, value, icon, isLoading }: StatCardProps) => {
  return (
    <div className="bg-white shadow rounded-lg p-4">
      <div className="flex items-center">
        <div className="flex-shrink-0 bg-primary/10 rounded-md p-3">
          {icon}
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
            <dd>
              <div className="text-lg font-medium text-gray-900">
                {isLoading ? (
                  <div className="animate-pulse bg-gray-200 h-6 w-16 rounded"></div>
                ) : (
                  value
                )}
              </div>
            </dd>
          </dl>
        </div>
      </div>
    </div>
  );
};

interface QuickAccessCardProps {
  title: string;
  description: string;
  buttonText: string;
  href: string;
  icon: React.ReactNode;
}

const QuickAccessCard = ({ title, description, buttonText, href, icon }: QuickAccessCardProps) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start mb-4">
          <div className="flex-shrink-0 bg-primary/10 rounded-md p-3 mr-4">
            {icon}
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          </div>
        </div>
        <div className="mt-4">
          <Link href={href}>
            <Button className="w-full bg-primary hover:bg-primary/90">
              {buttonText}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};
