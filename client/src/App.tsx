import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./hooks/use-auth";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import BlogPage from "@/pages/blog-page";
import AboutPage from "@/pages/about-page";
import WorksPage from "@/pages/works-page";
import FundraiserPage from "@/pages/fundraiser-page";
import CareersPage from "@/pages/careers-page";
import ContactPage from "@/pages/contact-page";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminBlogManagement from "@/pages/admin/blog-management";
import AdminGalleryManagement from "@/pages/admin/gallery-management";
import { ProtectedRoute } from "./lib/protected-route";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/works" component={WorksPage} />
      <Route path="/fundraiser" component={FundraiserPage} />
      <Route path="/careers" component={CareersPage} />
      <Route path="/blogs" component={BlogPage} />
      <Route path="/contact" component={ContactPage} />
      
      {/* Admin routes - protected */}
      <ProtectedRoute path="/admin" component={AdminDashboard} />
      <ProtectedRoute path="/admin/blogs" component={AdminBlogManagement} />
      <ProtectedRoute path="/admin/gallery" component={AdminGalleryManagement} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
