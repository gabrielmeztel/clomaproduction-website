import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { BlogPost } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface BlogEditorProps {
  blogPost?: BlogPost;
  onSave?: () => void;
}

const BlogEditor = ({ blogPost, onSave }: BlogEditorProps) => {
  const { toast } = useToast();
  const [title, setTitle] = useState(blogPost?.title || "");
  const [content, setContent] = useState(blogPost?.content || "");
  const [category, setCategory] = useState(blogPost?.category || "");
  const [author, setAuthor] = useState(blogPost?.author || "");
  const [isDraft, setIsDraft] = useState(blogPost?.isDraft ?? true);
  const [readTime, setReadTime] = useState(blogPost?.readTime?.toString() || "");
  const isEditing = !!blogPost;

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image"],
      ["clean"],
    ],
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "link",
    "image",
  ];

  const saveMutation = useMutation({
    mutationFn: async () => {
      // Validate required fields
      if (!title.trim()) throw new Error("Title is required");
      if (!content.trim()) throw new Error("Content is required");
      if (!category.trim()) throw new Error("Category is required");
      if (!author.trim()) throw new Error("Author is required");
      
      const postData = {
        title,
        content,
        category,
        author,
        isDraft,
        readTime: readTime ? parseInt(readTime) : null,
      };
      
      if (isEditing) {
        const res = await apiRequest("PUT", `/api/blogs/${blogPost.id}`, postData);
        return res.json();
      } else {
        const res = await apiRequest("POST", "/api/blogs", postData);
        return res.json();
      }
    },
    onSuccess: () => {
      toast({
        title: `Blog post ${isEditing ? 'updated' : 'created'} successfully`,
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/blogs"] });
      if (onSave) onSave();
    },
    onError: (error: Error) => {
      toast({
        title: "Error saving blog post",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSave = (saveAsDraft: boolean = isDraft) => {
    setIsDraft(saveAsDraft);
    saveMutation.mutate();
  };

  // Update isDraft when the switch changes
  useEffect(() => {
    if (saveMutation.isPending) return;
  }, [isDraft, saveMutation.isPending]);

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Blog Title</Label>
            <Input
              id="title"
              placeholder="Enter blog title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category" className="mt-1">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Networking">Networking</SelectItem>
                  <SelectItem value="Event Planning">Event Planning</SelectItem>
                  <SelectItem value="Success Stories">Success Stories</SelectItem>
                  <SelectItem value="Industry Trends">Industry Trends</SelectItem>
                  <SelectItem value="Tips & Tricks">Tips & Tricks</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="author">Author</Label>
              <Input
                id="author"
                placeholder="Author name"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="readTime">Read Time (minutes)</Label>
            <Input
              id="readTime"
              type="number"
              placeholder="Estimated read time in minutes"
              value={readTime}
              onChange={(e) => setReadTime(e.target.value)}
              className="mt-1 w-full md:w-1/3"
            />
          </div>
          
          <Separator className="my-4" />
          
          <div>
            <Label htmlFor="content">Content</Label>
            <div className="mt-2 prose-sm">
              <ReactQuill
                theme="snow"
                value={content}
                onChange={setContent}
                modules={modules}
                formats={formats}
                placeholder="Write your blog content here..."
                className="h-64 mb-12"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2 mt-8">
            <Switch 
              id="draft-mode" 
              checked={isDraft} 
              onCheckedChange={setIsDraft} 
            />
            <Label htmlFor="draft-mode">Save as draft</Label>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-end space-x-3 border-t p-4">
        <Button
          variant="outline"
          onClick={() => handleSave(true)}
          disabled={saveMutation.isPending}
        >
          Save as Draft
        </Button>
        <Button
          onClick={() => handleSave(false)}
          disabled={saveMutation.isPending}
          className="bg-primary hover:bg-primary/90"
        >
          {saveMutation.isPending ? "Saving..." : isDraft ? "Save" : "Publish"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BlogEditor;
