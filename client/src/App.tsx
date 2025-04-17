import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import BlogPage from "@/pages/blog/index";
import BlogPostPage from "@/pages/blog/post";
import GalleryPage from "@/pages/gallery";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminBlogPosts from "@/pages/admin/blog-posts";
import AdminGallery from "@/pages/admin/gallery";
import AdminChatSettings from "@/pages/admin/chat-settings";
import { ProtectedRoute } from "./lib/protected-route";
import { ChatWidget } from "@/components/ui/chat-widget";

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/blog" component={BlogPage} />
      <Route path="/blog/:id" component={BlogPostPage} />
      <Route path="/gallery" component={GalleryPage} />
      
      {/* Admin Routes (Protected) */}
      <ProtectedRoute path="/admin" component={AdminDashboard} />
      <ProtectedRoute path="/admin/blog" component={AdminBlogPosts} />
      <ProtectedRoute path="/admin/gallery" component={AdminGallery} />
      <ProtectedRoute path="/admin/chat-settings" component={AdminChatSettings} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <ChatWidget />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
