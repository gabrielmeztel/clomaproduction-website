import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { GalleryImage } from "@shared/schema";

interface ImageUploadProps {
  onUploaded?: () => void;
  galleryImage?: GalleryImage;
}

const ImageUpload = ({ onUploaded, galleryImage }: ImageUploadProps) => {
  const { toast } = useToast();
  const isEditing = !!galleryImage;
  
  const [title, setTitle] = useState(galleryImage?.title || "");
  const [description, setDescription] = useState(galleryImage?.description || "");
  const [imageUrl, setImageUrl] = useState(galleryImage?.imageUrl || "");
  const [isUploading, setIsUploading] = useState(false);

  // For demonstration, we're using a URL input since we don't have access to upload storage
  // In a real app, this would be a file upload to a storage service
  
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!title.trim()) throw new Error("Title is required");
      if (!imageUrl.trim()) throw new Error("Image URL is required");
      
      const imageData = {
        title,
        description,
        imageUrl,
      };
      
      if (isEditing) {
        const res = await apiRequest("PUT", `/api/gallery/${galleryImage.id}`, imageData);
        return res.json();
      } else {
        const res = await apiRequest("POST", "/api/gallery", imageData);
        return res.json();
      }
    },
    onSuccess: () => {
      toast({
        title: `Image ${isEditing ? 'updated' : 'uploaded'} successfully`,
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
      if (!isEditing) {
        // Reset form if not editing
        setTitle("");
        setDescription("");
        setImageUrl("");
      }
      if (onUploaded) onUploaded();
    },
    onError: (error: Error) => {
      toast({
        title: "Error saving image",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    saveMutation.mutate();
  };

  // This is a placeholder for a real image upload functionality
  // In a real app, this would upload to a cloud storage service
  const handleDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    // Simulate uploading the file
    setIsUploading(true);
    
    // Mock URL upload - in a real app, you'd upload to a storage service
    setTimeout(() => {
      setIsUploading(false);
      // Using a placeholder URL since we can't actually upload files
      setImageUrl(URL.createObjectURL(file));
      toast({
        title: "Image selected",
        description: "Please provide a permanent URL for the image.",
        variant: "default",
      });
    }, 1500);
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    maxFiles: 1,
    disabled: isUploading || saveMutation.isPending
  });

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Image Title</Label>
            <Input
              id="title"
              placeholder="Enter image title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter image description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1"
              rows={3}
            />
          </div>
          
          {/* Image preview if URL exists */}
          {imageUrl && (
            <div className="relative">
              <img 
                src={imageUrl} 
                alt={title || "Preview"} 
                className="mt-2 max-h-64 rounded-md object-cover mx-auto"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 rounded-full"
                onClick={() => setImageUrl("")}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
          
          {/* Drag & drop area */}
          {!imageUrl && (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors ${
                isDragActive ? "border-primary bg-primary/5" : "border-gray-300"
              }`}
            >
              <input {...getInputProps()} />
              <div className="text-center">
                {isUploading ? (
                  <Loader2 className="h-10 w-10 text-gray-400 animate-spin mx-auto" />
                ) : (
                  <Upload className="h-10 w-10 text-gray-400 mx-auto" />
                )}
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  {isDragActive
                    ? "Drop the image here"
                    : "Drag and drop image here"}
                </h3>
                <p className="mt-1 text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
              </div>
              <Button
                variant="outline"
                className="mt-4"
                disabled={isUploading}
              >
                <ImageIcon className="mr-2 h-4 w-4" />
                Select Image
              </Button>
            </div>
          )}
          
          {/* URL input for demo purposes */}
          <div>
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input
              id="imageUrl"
              placeholder="Enter image URL"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              If you don't have an image URL, you can use a placeholder from unsplash.com
            </p>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-end space-x-3 border-t p-4">
        <Button
          onClick={handleSave}
          disabled={saveMutation.isPending || !title || !imageUrl}
          className="bg-primary hover:bg-primary/90"
        >
          {saveMutation.isPending ? "Saving..." : isEditing ? "Update Image" : "Upload Image"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ImageUpload;
