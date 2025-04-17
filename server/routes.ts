import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { generateAIResponse, generateBlogIdeas } from "./openai";
import { z } from "zod";
import { insertBlogPostSchema, insertGalleryImageSchema, insertChatMessageSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Blog routes
  app.get("/api/blogs", async (req, res) => {
    try {
      const blogs = await storage.getBlogPosts();
      // Filter out drafts for non-admin users
      if (!req.isAuthenticated() || !req.user.isAdmin) {
        return res.json(blogs.filter(blog => !blog.isDraft));
      }
      return res.json(blogs);
    } catch (error) {
      console.error("Error fetching blogs:", error);
      res.status(500).json({ message: "Failed to fetch blog posts" });
    }
  });

  app.get("/api/blogs/:id", async (req, res) => {
    try {
      const blog = await storage.getBlogPost(Number(req.params.id));
      if (!blog) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      // Prevent non-admin users from viewing drafts
      if (blog.isDraft && (!req.isAuthenticated() || !req.user.isAdmin)) {
        return res.status(403).json({ message: "You don't have permission to view this draft" });
      }
      res.json(blog);
    } catch (error) {
      console.error("Error fetching blog:", error);
      res.status(500).json({ message: "Failed to fetch blog post" });
    }
  });

  app.post("/api/blogs", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    try {
      const validatedData = insertBlogPostSchema.parse(req.body);
      const blog = await storage.createBlogPost(validatedData);
      res.status(201).json(blog);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid blog post data", errors: error.errors });
      }
      console.error("Error creating blog:", error);
      res.status(500).json({ message: "Failed to create blog post" });
    }
  });

  app.put("/api/blogs/:id", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    try {
      const blogId = Number(req.params.id);
      const validatedData = insertBlogPostSchema.partial().parse(req.body);
      const updatedBlog = await storage.updateBlogPost(blogId, validatedData);
      
      if (!updatedBlog) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      
      res.json(updatedBlog);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid blog post data", errors: error.errors });
      }
      console.error("Error updating blog:", error);
      res.status(500).json({ message: "Failed to update blog post" });
    }
  });

  app.delete("/api/blogs/:id", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    try {
      const blogId = Number(req.params.id);
      const success = await storage.deleteBlogPost(blogId);
      
      if (!success) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting blog:", error);
      res.status(500).json({ message: "Failed to delete blog post" });
    }
  });

  // Gallery routes
  app.get("/api/gallery", async (req, res) => {
    try {
      const images = await storage.getGalleryImages();
      res.json(images);
    } catch (error) {
      console.error("Error fetching gallery images:", error);
      res.status(500).json({ message: "Failed to fetch gallery images" });
    }
  });

  app.get("/api/gallery/:id", async (req, res) => {
    try {
      const image = await storage.getGalleryImage(Number(req.params.id));
      if (!image) {
        return res.status(404).json({ message: "Image not found" });
      }
      res.json(image);
    } catch (error) {
      console.error("Error fetching image:", error);
      res.status(500).json({ message: "Failed to fetch image" });
    }
  });

  app.post("/api/gallery", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    try {
      const validatedData = insertGalleryImageSchema.parse(req.body);
      const image = await storage.createGalleryImage(validatedData);
      res.status(201).json(image);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid image data", errors: error.errors });
      }
      console.error("Error creating image:", error);
      res.status(500).json({ message: "Failed to create image" });
    }
  });

  app.put("/api/gallery/:id", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    try {
      const imageId = Number(req.params.id);
      const validatedData = insertGalleryImageSchema.partial().parse(req.body);
      const updatedImage = await storage.updateGalleryImage(imageId, validatedData);
      
      if (!updatedImage) {
        return res.status(404).json({ message: "Image not found" });
      }
      
      res.json(updatedImage);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid image data", errors: error.errors });
      }
      console.error("Error updating image:", error);
      res.status(500).json({ message: "Failed to update image" });
    }
  });

  app.delete("/api/gallery/:id", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    try {
      const imageId = Number(req.params.id);
      const success = await storage.deleteGalleryImage(imageId);
      
      if (!success) {
        return res.status(404).json({ message: "Image not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting image:", error);
      res.status(500).json({ message: "Failed to delete image" });
    }
  });

  // Chat routes
  app.post("/api/chat", async (req, res) => {
    try {
      const { userId, message } = req.body;
      
      if (!userId || !message) {
        return res.status(400).json({ message: "userId and message are required" });
      }
      
      // Generate AI response
      const aiResponse = await generateAIResponse(message);
      
      // Store the message and response
      const chatMessage = await storage.createChatMessage({
        userId,
        message,
        aiResponse,
      });
      
      res.status(201).json({
        id: chatMessage.id,
        aiResponse: chatMessage.aiResponse,
      });
    } catch (error) {
      console.error("Error handling chat message:", error);
      res.status(500).json({ message: "Failed to process chat message" });
    }
  });

  app.get("/api/chat/:userId", async (req, res) => {
    try {
      const userId = req.params.userId;
      const messages = await storage.getChatMessages(userId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      res.status(500).json({ message: "Failed to fetch chat messages" });
    }
  });

  // Blog ideas generation endpoint
  app.post("/api/generate-blog-ideas", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    try {
      const { topic } = req.body;
      
      if (!topic) {
        return res.status(400).json({ message: "Topic is required" });
      }
      
      const ideas = await generateBlogIdeas(topic);
      res.json({ ideas });
    } catch (error) {
      console.error("Error generating blog ideas:", error);
      res.status(500).json({ message: "Failed to generate blog ideas" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
