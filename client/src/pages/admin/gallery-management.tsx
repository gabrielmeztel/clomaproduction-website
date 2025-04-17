import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { GalleryImage } from "@shared/schema";
import AdminSidebar from "@/components/layout/AdminSidebar";
import ImageUpload from "@/components/upload/ImageUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Image as ImageIcon,
  Eye,
  Download,
} from "lucide-react";

export default function GalleryManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [showUploader, setShowUploader] = useState(false);
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
  const [imageToDelete, setImageToDelete] = useState<GalleryImage | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingImage, setViewingImage] = useState<GalleryImage | null>(null);

  const { data: images, isLoading } = useQuery<GalleryImage[]>({
    queryKey: ["/api/gallery"],
  });

  useEffect(() => {
    if (!user || !user.isAdmin) {
      setLocation("/auth");
      return;
    }

    // Check for URL params
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has("upload") && urlParams.get("upload") === "true") {
      setShowUploader(true);
      setEditingImage(null);
    } else if (urlParams.has("edit")) {
      const imageId = parseInt(urlParams.get("edit") || "0");
      if (imageId > 0 && images) {
        const image = images.find(img => img.id === imageId);
        if (image) {
          setShowUploader(true);
          setEditingImage(image);
        }
      }
    }
  }, [user, setLocation, images]);

  const deleteMutation = useMutation({
    mutationFn: async (imageId: number) => {
      await apiRequest("DELETE", `/api/gallery/${imageId}`);
    },
    onSuccess: () => {
      toast({
        title: "Image deleted",
        description: "The image was successfully deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
      setImageToDelete(null);
      setDeleteDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error deleting image",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDeleteImage = () => {
    if (!imageToDelete) return;
    deleteMutation.mutate(imageToDelete.id);
  };

  const handleEditImage = (image: GalleryImage) => {
    setEditingImage(image);
    setShowUploader(true);
    // Update URL for a better user experience
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set("edit", image.id.toString());
    window.history.pushState({}, "", `${window.location.pathname}?${urlParams.toString()}`);
  };

  const handleViewImage = (image: GalleryImage) => {
    setViewingImage(image);
    setViewDialogOpen(true);
  };

  const handleNewImage = () => {
    setEditingImage(null);
    setShowUploader(true);
    // Update URL for a better user experience
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set("upload", "true");
    window.history.pushState({}, "", `${window.location.pathname}?${urlParams.toString()}`);
  };

  const handleCloseUploader = () => {
    setShowUploader(false);
    setEditingImage(null);
    // Clean up URL
    window.history.pushState({}, "", window.location.pathname);
  };

  const filteredImages = images
    ? images.filter(image => 
        image.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (image.description && image.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : [];

  if (showUploader) {
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
                  {editingImage ? "Edit Image" : "Upload New Image"}
                </h1>
              </div>
              <div className="ml-4 flex items-center">
                <Button 
                  variant="outline" 
                  onClick={handleCloseUploader}
                >
                  Back to Gallery
                </Button>
              </div>
            </div>
          </div>

          <main className="flex-1 relative overflow-y-auto focus:outline-none p-4 sm:p-6">
            <ImageUpload 
              galleryImage={editingImage || undefined} 
              onUploaded={handleCloseUploader} 
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
                <label htmlFor="search-field" className="sr-only">Search images</label>
                <div className="relative w-full text-gray-400 focus-within:text-gray-600">
                  <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 ml-3" />
                  </div>
                  <Input
                    id="search-field"
                    className="block w-full h-full pl-10 pr-3 py-2 border-transparent rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Search gallery images"
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
                onClick={handleNewImage}
              >
                <Plus className="h-5 w-5 mr-2" />
                Upload Image
              </Button>
            </div>
          </div>
        </div>

        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <h1 className="text-2xl font-semibold text-gray-900">Gallery Management</h1>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <div className="py-4">
                {isLoading ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">Loading gallery images...</p>
                  </div>
                ) : filteredImages.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredImages.map(image => (
                      <GalleryCard 
                        key={image.id} 
                        image={image} 
                        onEdit={() => handleEditImage(image)}
                        onDelete={() => {
                          setImageToDelete(image);
                          setDeleteDialogOpen(true);
                        }}
                        onView={() => handleViewImage(image)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No images</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {searchTerm 
                        ? "No images matching your search criteria." 
                        : "Get started by uploading a new image."}
                    </p>
                    <div className="mt-6">
                      <Button 
                        onClick={handleNewImage}
                        className="bg-primary hover:bg-primary/90"
                      >
                        <Plus className="h-5 w-5 mr-2" />
                        Upload Image
                      </Button>
                    </div>
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
            <DialogTitle>Delete Image</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{imageToDelete?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              variant="destructive" 
              onClick={handleDeleteImage}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View image dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{viewingImage?.title}</DialogTitle>
            <DialogDescription>
              {viewingImage?.description}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <img 
              src={viewingImage?.imageUrl} 
              alt={viewingImage?.title} 
              className="w-full rounded-md object-contain max-h-[70vh]"
            />
          </div>
          <div className="mt-2 text-sm text-gray-500">
            Uploaded on {viewingImage?.uploadedAt && new Date(viewingImage.uploadedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => window.open(viewingImage?.imageUrl, "_blank")}
            >
              <Download className="h-4 w-4 mr-2" />
              Open Original
            </Button>
            <Button 
              className="bg-primary hover:bg-primary/90"
              onClick={() => handleEditImage(viewingImage!)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Details
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface GalleryCardProps {
  image: GalleryImage;
  onEdit: () => void;
  onDelete: () => void;
  onView: () => void;
}

const GalleryCard = ({ image, onEdit, onDelete, onView }: GalleryCardProps) => {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-square relative overflow-hidden">
        <img 
          src={image.imageUrl} 
          alt={image.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-50 transition-opacity duration-300 flex items-center justify-center opacity-0 hover:opacity-100">
          <div className="flex space-x-2">
            <Button 
              variant="secondary" 
              size="icon" 
              onClick={(e) => {
                e.stopPropagation();
                onView();
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button 
              variant="secondary" 
              size="icon" 
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="destructive" 
              size="icon" 
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      <CardContent className="p-3">
        <h3 className="font-medium text-sm truncate">{image.title}</h3>
        {image.description && (
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{image.description}</p>
        )}
        <p className="text-xs text-gray-400 mt-1">
          {new Date(image.uploadedAt || '').toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          })}
        </p>
      </CardContent>
    </Card>
  );
};
