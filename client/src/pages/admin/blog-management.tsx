import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { BlogPost } from "@shared/schema";
import AdminSidebar from "@/components/layout/AdminSidebar";
import BlogEditor from "@/components/editor/BlogEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  MoreVertical,
  Eye,
  Calendar,
  Tag,
  User,
  Filter,
  ArrowUpDown,
} from "lucide-react";

export default function BlogManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"date" | "title" | "author">("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [showEditor, setShowEditor] = useState(false);
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState<BlogPost | null>(null);

  const { data: blogs, isLoading } = useQuery<BlogPost[]>({
    queryKey: ["/api/blogs"],
  });

  useEffect(() => {
    if (!user || !user.isAdmin) {
      setLocation("/auth");
      return;
    }

    // Check for URL params
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has("new") && urlParams.get("new") === "true") {
      setShowEditor(true);
      setEditingBlog(null);
    } else if (urlParams.has("edit")) {
      const blogId = parseInt(urlParams.get("edit") || "0");
      if (blogId > 0 && blogs) {
        const blog = blogs.find(b => b.id === blogId);
        if (blog) {
          setShowEditor(true);
          setEditingBlog(blog);
        }
      }
    }
  }, [user, setLocation, blogs]);

  const deleteMutation = useMutation({
    mutationFn: async (blogId: number) => {
      await apiRequest("DELETE", `/api/blogs/${blogId}`);
    },
    onSuccess: () => {
      toast({
        title: "Blog post deleted",
        description: "The blog post was successfully deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/blogs"] });
      setBlogToDelete(null);
      setDeleteDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error deleting blog post",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDeleteBlog = () => {
    if (!blogToDelete) return;
    deleteMutation.mutate(blogToDelete.id);
  };

  const handleEditBlog = (blog: BlogPost) => {
    setEditingBlog(blog);
    setShowEditor(true);
    // Update URL for a better user experience
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set("edit", blog.id.toString());
    window.history.pushState({}, "", `${window.location.pathname}?${urlParams.toString()}`);
  };

  const handleNewBlog = () => {
    setEditingBlog(null);
    setShowEditor(true);
    // Update URL for a better user experience
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set("new", "true");
    window.history.pushState({}, "", `${window.location.pathname}?${urlParams.toString()}`);
  };

  const handleCloseEditor = () => {
    setShowEditor(false);
    setEditingBlog(null);
    // Clean up URL
    window.history.pushState({}, "", window.location.pathname);
  };

  const categories = blogs
    ? [...new Set(blogs.map(blog => blog.category))]
    : [];

  const toggleSortDirection = () => {
    setSortDirection(prev => (prev === "asc" ? "desc" : "asc"));
  };

  const changeSort = (newSortBy: "date" | "title" | "author") => {
    if (sortBy === newSortBy) {
      toggleSortDirection();
    } else {
      setSortBy(newSortBy);
      setSortDirection("asc");
    }
  };

  const filteredAndSortedBlogs = blogs
    ? blogs
        .filter(blog => {
          const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                               blog.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                               blog.author.toLowerCase().includes(searchTerm.toLowerCase());
          
          const matchesCategory = categoryFilter ? blog.category === categoryFilter : true;
          
          return matchesSearch && matchesCategory;
        })
        .sort((a, b) => {
          if (sortBy === "date") {
            const dateA = new Date(a.publishedAt || "").getTime();
            const dateB = new Date(b.publishedAt || "").getTime();
            return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
          } else if (sortBy === "title") {
            return sortDirection === "asc" 
              ? a.title.localeCompare(b.title)
              : b.title.localeCompare(a.title);
          } else {
            return sortDirection === "asc" 
              ? a.author.localeCompare(b.author)
              : b.author.localeCompare(a.author);
          }
        })
    : [];

  if (showEditor) {
    return (
      <div className="min-h-screen flex bg-gray-100">
        {/* Desktop sidebar */}
        <AdminSidebar />
        
        <div className="flex flex-col w-0 flex-1 overflow-hidden">
          <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
            {/* Mobile sidebar button */}
            <AdminSidebar isMobile />
            
            <div className="flex-1 px-4 flex justify-between">
              <div className="flex-1 flex items-center">
                <h1 className="text-xl font-semibold text-gray-900">
                  {editingBlog ? "Edit Blog Post" : "Create New Blog Post"}
                </h1>
              </div>
              <div className="ml-4 flex items-center">
                <Button 
                  variant="outline" 
                  onClick={handleCloseEditor}
                >
                  Back to List
                </Button>
              </div>
            </div>
          </div>

          <main className="flex-1 relative overflow-y-auto focus:outline-none p-4 sm:p-6">
            <BlogEditor 
              blogPost={editingBlog || undefined} 
              onSave={handleCloseEditor} 
            />
          </main>
        </div>
      </div>
    );
  }

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
                <label htmlFor="search-field" className="sr-only">Search blogs</label>
                <div className="relative w-full text-gray-400 focus-within:text-gray-600">
                  <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 ml-3" />
                  </div>
                  <Input
                    id="search-field"
                    className="block w-full h-full pl-10 pr-3 py-2 border-transparent rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Search blog posts"
                    type="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="ml-4 flex items-center">
              <Button 
                className="bg-primary hover:bg-primary/90 ml-3"
                onClick={handleNewBlog}
              >
                <Plus className="h-5 w-5 mr-2" />
                New Post
              </Button>
            </div>
          </div>
        </div>

        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold text-gray-900">Blog Management</h1>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      {categoryFilter || "All Categories"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setCategoryFilter(null)}>
                      All Categories
                    </DropdownMenuItem>
                    {categories.map((category) => (
                      <DropdownMenuItem 
                        key={category} 
                        onClick={() => setCategoryFilter(category)}
                      >
                        {category}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <div className="py-4">
                {isLoading ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">Loading blog posts...</p>
                  </div>
                ) : (
                  <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[400px]">
                            <Button 
                              variant="ghost" 
                              onClick={() => changeSort("title")}
                              className="flex items-center"
                            >
                              Title
                              <ArrowUpDown className="ml-2 h-4 w-4" />
                            </Button>
                          </TableHead>
                          <TableHead>
                            <Button 
                              variant="ghost" 
                              onClick={() => changeSort("author")}
                              className="flex items-center"
                            >
                              Author
                              <ArrowUpDown className="ml-2 h-4 w-4" />
                            </Button>
                          </TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>
                            <Button 
                              variant="ghost" 
                              onClick={() => changeSort("date")}
                              className="flex items-center"
                            >
                              Date
                              <ArrowUpDown className="ml-2 h-4 w-4" />
                            </Button>
                          </TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredAndSortedBlogs.length > 0 ? (
                          filteredAndSortedBlogs.map((blog) => (
                            <TableRow key={blog.id}>
                              <TableCell className="font-medium">{blog.title}</TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  <User className="h-4 w-4 mr-1 text-gray-400" />
                                  {blog.author}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  <Tag className="h-4 w-4 mr-1 text-gray-400" />
                                  {blog.category}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                                  {new Date(blog.publishedAt || '').toLocaleDateString('en-US', { 
                                    year: 'numeric', 
                                    month: 'short', 
                                    day: 'numeric' 
                                  })}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant={blog.isDraft ? "outline" : "default"} className={blog.isDraft ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200" : ""}>
                                  {blog.isDraft ? "Draft" : "Published"}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => handleEditBlog(blog)}>
                                      <Edit className="mr-2 h-4 w-4" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => {
                                      setBlogToDelete(blog);
                                      setDeleteDialogOpen(true);
                                    }}>
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Delete
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => window.open(`/blogs/${blog.id}`, "_blank")}>
                                      <Eye className="mr-2 h-4 w-4" />
                                      View
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center text-gray-500 py-4">
                              {searchTerm || categoryFilter 
                                ? "No blog posts matching your search criteria." 
                                : "No blog posts found. Create your first post!"}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Blog Post</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{blogToDelete?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              variant="destructive" 
              onClick={handleDeleteBlog}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
