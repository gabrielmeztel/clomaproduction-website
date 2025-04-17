import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { GalleryImage } from "@shared/schema";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ChatWidget from "@/components/chat/ChatWidget";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function GalleryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  
  const { data: images, isLoading } = useQuery<GalleryImage[]>({
    queryKey: ["/api/gallery"],
  });
  
  const filteredImages = images?.filter(image => 
    image.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (image.description && image.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-grow bg-gray-50">
        {/* Hero section */}
        <div className="bg-white py-10 border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl font-heading">
                Event Gallery
              </h1>
              <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
                See what happens at our events and get inspired to join the next one.
              </p>
            </div>
          </div>
        </div>
        
        {/* Search */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="relative w-full max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder="Search gallery..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        {/* Gallery */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading gallery images...</p>
            </div>
          ) : filteredImages && filteredImages.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredImages.map(image => (
                <GalleryItem 
                  key={image.id} 
                  image={image} 
                  onClick={() => setSelectedImage(image)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No images found matching your search criteria.</p>
              {searchTerm && (
                <button 
                  className="mt-2 text-primary hover:underline"
                  onClick={() => setSearchTerm("")}
                >
                  Clear search
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Image Detail Modal */}
      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedImage?.title}</DialogTitle>
            <DialogDescription>
              {selectedImage?.description}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <img 
              src={selectedImage?.imageUrl} 
              alt={selectedImage?.title} 
              className="w-full rounded-md object-cover max-h-[70vh]"
            />
          </div>
          <div className="mt-2 text-sm text-gray-500">
            Uploaded on {selectedImage?.uploadedAt && new Date(selectedImage.uploadedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </DialogContent>
      </Dialog>
      
      <Footer />
      <ChatWidget />
    </div>
  );
}

interface GalleryItemProps {
  image: GalleryImage;
  onClick: () => void;
}

const GalleryItem = ({ image, onClick }: GalleryItemProps) => {
  return (
    <div 
      className="overflow-hidden rounded-lg shadow-lg cursor-pointer transition-all duration-300 hover:shadow-xl"
      onClick={onClick}
    >
      <div className="relative aspect-square">
        <img 
          src={image.imageUrl} 
          alt={image.title}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-opacity duration-300 flex items-center justify-center opacity-0 hover:opacity-100">
          <div className="text-white text-center p-4">
            <h3 className="font-bold">{image.title}</h3>
            {image.description && (
              <p className="text-sm mt-1 line-clamp-2">{image.description}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
