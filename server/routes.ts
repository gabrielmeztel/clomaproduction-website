import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertBlogPostSchema, insertGalleryImageSchema, insertChatSettingsSchema } from "@shared/schema";
import { getChatResponse } from "./openai";
import { randomUUID } from "crypto";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes (/api/register, /api/login, /api/logout, /api/user)
  setupAuth(app);

  // Blog routes
  app.get("/api/blog", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      
      const posts = await storage.getPublishedBlogPosts(limit, offset);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch blog posts" });
    }
  });

  app.get("/api/blog/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const post = await storage.getBlogPost(id);
      
      if (!post) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      
      res.json(post);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch blog post" });
    }
  });

  // Admin blog routes
  app.get("/api/admin/blog", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      
      const posts = await storage.getBlogPosts(limit, offset);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch blog posts" });
    }
  });

  app.post("/api/admin/blog", async (req, res) => {
    try {
      const validatedData = insertBlogPostSchema.parse(req.body);
      const newPost = await storage.createBlogPost(validatedData);
      res.status(201).json(newPost);
    } catch (error) {
      res.status(400).json({ message: "Invalid blog post data", error });
    }
  });

  app.patch("/api/admin/blog/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertBlogPostSchema.partial().parse(req.body);
      
      const updatedPost = await storage.updateBlogPost(id, validatedData);
      
      if (!updatedPost) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      
      res.json(updatedPost);
    } catch (error) {
      res.status(400).json({ message: "Invalid blog post data", error });
    }
  });

  app.delete("/api/admin/blog/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteBlogPost(id);
      
      if (!success) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete blog post" });
    }
  });

  // Gallery routes
  app.get("/api/gallery", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      
      const images = await storage.getGalleryImages(limit, offset);
      res.json(images);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch gallery images" });
    }
  });

  // Admin gallery routes
  app.post("/api/admin/gallery", async (req, res) => {
    try {
      const validatedData = insertGalleryImageSchema.parse(req.body);
      const newImage = await storage.createGalleryImage(validatedData);
      res.status(201).json(newImage);
    } catch (error) {
      res.status(400).json({ message: "Invalid gallery image data", error });
    }
  });

  app.patch("/api/admin/gallery/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertGalleryImageSchema.partial().parse(req.body);
      
      const updatedImage = await storage.updateGalleryImage(id, validatedData);
      
      if (!updatedImage) {
        return res.status(404).json({ message: "Gallery image not found" });
      }
      
      res.json(updatedImage);
    } catch (error) {
      res.status(400).json({ message: "Invalid gallery image data", error });
    }
  });

  app.delete("/api/admin/gallery/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteGalleryImage(id);
      
      if (!success) {
        return res.status(404).json({ message: "Gallery image not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete gallery image" });
    }
  });

  // Chat endpoints
  app.post("/api/chat", async (req, res) => {
    try {
      const { message } = req.body;
      
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ message: "Message is required" });
      }
      
      // Generate or use existing session ID for the user
      let userId = req.session.chatUserId;
      if (!userId) {
        userId = randomUUID();
        req.session.chatUserId = userId;
      }
      
      const response = await getChatResponse(userId, message);
      res.json({ message: response });
    } catch (error) {
      res.status(500).json({ message: "Failed to process chat request" });
    }
  });

  // Admin chat settings
  app.get("/api/admin/chat-settings", async (req, res) => {
    try {
      const settings = await storage.getChatSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch chat settings" });
    }
  });

  app.patch("/api/admin/chat-settings", async (req, res) => {
    try {
      const validatedData = insertChatSettingsSchema.parse(req.body);
      const updatedSettings = await storage.updateChatSettings(validatedData);
      res.json(updatedSettings);
    } catch (error) {
      res.status(400).json({ message: "Invalid chat settings data", error });
    }
  });

  // Dashboard stats route for admin
  app.get("/api/admin/stats", async (req, res) => {
    try {
      const blogPosts = await storage.getBlogPosts();
      const galleryImages = await storage.getGalleryImages();
      
      // This is a simple implementation for the MVP
      // In a real application, we'd track more metrics
      const stats = {
        totalBlogPosts: blogPosts.length,
        publishedBlogPosts: blogPosts.filter(post => post.status === 'published').length,
        draftBlogPosts: blogPosts.filter(post => post.status === 'draft').length,
        totalGalleryImages: galleryImages.length,
        recentActivity: blogPosts
          .concat(galleryImages as any)
          .sort((a, b) => 
            (b.updatedAt || b.createdAt).getTime() - 
            (a.updatedAt || a.createdAt).getTime()
          )
          .slice(0, 5)
          .map(item => ({
            type: 'imageUrl' in item ? 'gallery' : 'blog',
            id: item.id,
            title: item.title,
            date: item.updatedAt || item.createdAt
          }))
      };
      
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
