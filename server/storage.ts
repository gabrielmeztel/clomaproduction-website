import { users, type User, type InsertUser } from "@shared/schema";
import { blogPosts, type BlogPost, type InsertBlogPost } from "@shared/schema";
import { galleryImages, type GalleryImage, type InsertGalleryImage } from "@shared/schema";
import { chatMessages, type ChatMessage, type InsertChatMessage } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Blog methods
  getBlogPosts(): Promise<BlogPost[]>;
  getBlogPost(id: number): Promise<BlogPost | undefined>;
  getBlogPostsByCategory(category: string): Promise<BlogPost[]>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(id: number, post: Partial<InsertBlogPost>): Promise<BlogPost | undefined>;
  deleteBlogPost(id: number): Promise<boolean>;
  
  // Gallery methods
  getGalleryImages(): Promise<GalleryImage[]>;
  getGalleryImage(id: number): Promise<GalleryImage | undefined>;
  createGalleryImage(image: InsertGalleryImage): Promise<GalleryImage>;
  updateGalleryImage(id: number, image: Partial<InsertGalleryImage>): Promise<GalleryImage | undefined>;
  deleteGalleryImage(id: number): Promise<boolean>;
  
  // Chat methods
  getChatMessages(userId: string): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private blogPosts: Map<number, BlogPost>;
  private galleryImages: Map<number, GalleryImage>;
  private chatMessages: Map<number, ChatMessage>;
  
  sessionStore: session.SessionStore;
  currentUserId: number;
  currentBlogPostId: number;
  currentGalleryImageId: number;
  currentChatMessageId: number;

  constructor() {
    this.users = new Map();
    this.blogPosts = new Map();
    this.galleryImages = new Map();
    this.chatMessages = new Map();
    
    this.currentUserId = 1;
    this.currentBlogPostId = 1;
    this.currentGalleryImageId = 1;
    this.currentChatMessageId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
    
    // Create a default admin user
    this.createUser({
      username: "admin",
      password: "password", // This will be hashed in the auth.ts
      isAdmin: true,
    });
    
    // Add some sample blog posts
    this.createBlogPost({
      title: "10 Icebreakers to Use at Your Next Event",
      content: "<p>Learn how to break the ice and start meaningful conversations at events with these proven techniques.</p>",
      category: "Networking",
      author: "Emma Rodriguez",
      isDraft: false,
      readTime: 6,
    });
    
    this.createBlogPost({
      title: "How I Met My Business Partner at a Tech Conference",
      content: "<p>Sarah shares her journey of meeting her business partner at a tech event and how they built a successful startup together.</p>",
      category: "Success Stories",
      author: "Sarah Johnson",
      isDraft: false,
      readTime: 8,
    });
    
    this.createBlogPost({
      title: "5 Ways to Encourage Networking at Your Next Event",
      content: "<p>Learn how to create an environment that encourages meaningful connections between attendees.</p>",
      category: "Event Planning",
      author: "Michael Chen",
      isDraft: false,
      readTime: 5,
    });
    
    // Add some sample gallery images
    this.createGalleryImage({
      title: "Group networking session",
      description: "Attendees networking at our last conference",
      imageUrl: "https://images.unsplash.com/photo-1515169067868-5387ec356754?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    });
    
    this.createGalleryImage({
      title: "Panel discussion",
      description: "Expert panel sharing insights on industry trends",
      imageUrl: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    });
    
    this.createGalleryImage({
      title: "Workshop participants",
      description: "Interactive workshop on building connections",
      imageUrl: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    });
    
    this.createGalleryImage({
      title: "Networking coffee break",
      description: "Informal conversations during the coffee break",
      imageUrl: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    });
    
    this.createGalleryImage({
      title: "Collaborative session",
      description: "Teams working together on shared goals",
      imageUrl: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
    });
    
    this.createGalleryImage({
      title: "Event after party",
      description: "Celebrating connections made at the event",
      imageUrl: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const now = new Date();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Blog methods
  async getBlogPosts(): Promise<BlogPost[]> {
    return Array.from(this.blogPosts.values());
  }
  
  async getBlogPost(id: number): Promise<BlogPost | undefined> {
    return this.blogPosts.get(id);
  }
  
  async getBlogPostsByCategory(category: string): Promise<BlogPost[]> {
    return Array.from(this.blogPosts.values()).filter(
      (post) => post.category === category
    );
  }
  
  async createBlogPost(post: InsertBlogPost): Promise<BlogPost> {
    const id = this.currentBlogPostId++;
    const now = new Date();
    const blogPost: BlogPost = { 
      ...post, 
      id, 
      publishedAt: now 
    };
    this.blogPosts.set(id, blogPost);
    return blogPost;
  }
  
  async updateBlogPost(id: number, post: Partial<InsertBlogPost>): Promise<BlogPost | undefined> {
    const existingPost = this.blogPosts.get(id);
    if (!existingPost) return undefined;
    
    const updatedPost: BlogPost = { 
      ...existingPost, 
      ...post,
    };
    this.blogPosts.set(id, updatedPost);
    return updatedPost;
  }
  
  async deleteBlogPost(id: number): Promise<boolean> {
    return this.blogPosts.delete(id);
  }
  
  // Gallery methods
  async getGalleryImages(): Promise<GalleryImage[]> {
    return Array.from(this.galleryImages.values());
  }
  
  async getGalleryImage(id: number): Promise<GalleryImage | undefined> {
    return this.galleryImages.get(id);
  }
  
  async createGalleryImage(image: InsertGalleryImage): Promise<GalleryImage> {
    const id = this.currentGalleryImageId++;
    const now = new Date();
    const galleryImage: GalleryImage = { 
      ...image, 
      id, 
      uploadedAt: now 
    };
    this.galleryImages.set(id, galleryImage);
    return galleryImage;
  }
  
  async updateGalleryImage(id: number, image: Partial<InsertGalleryImage>): Promise<GalleryImage | undefined> {
    const existingImage = this.galleryImages.get(id);
    if (!existingImage) return undefined;
    
    const updatedImage: GalleryImage = { 
      ...existingImage, 
      ...image,
    };
    this.galleryImages.set(id, updatedImage);
    return updatedImage;
  }
  
  async deleteGalleryImage(id: number): Promise<boolean> {
    return this.galleryImages.delete(id);
  }
  
  // Chat methods
  async getChatMessages(userId: string): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values()).filter(
      (message) => message.userId === userId
    );
  }
  
  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const id = this.currentChatMessageId++;
    const now = new Date();
    const chatMessage: ChatMessage = { 
      ...message, 
      id, 
      timestamp: now 
    };
    this.chatMessages.set(id, chatMessage);
    return chatMessage;
  }
}

export const storage = new MemStorage();
