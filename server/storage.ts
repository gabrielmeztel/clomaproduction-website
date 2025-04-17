import { 
  User, InsertUser, 
  BlogPost, InsertBlogPost, 
  GalleryImage, InsertGalleryImage,
  ChatMessage, InsertChatMessage,
  ChatSettings, InsertChatSettings
} from "@shared/schema";
import createMemoryStore from "memorystore";
import session from "express-session";

const MemoryStore = createMemoryStore(session);

// Interface for all storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Blog post operations
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  getBlogPost(id: number): Promise<BlogPost | undefined>;
  getBlogPosts(limit?: number, offset?: number): Promise<BlogPost[]>;
  getPublishedBlogPosts(limit?: number, offset?: number): Promise<BlogPost[]>;
  updateBlogPost(id: number, post: Partial<InsertBlogPost>): Promise<BlogPost | undefined>;
  deleteBlogPost(id: number): Promise<boolean>;
  
  // Gallery image operations
  createGalleryImage(image: InsertGalleryImage): Promise<GalleryImage>;
  getGalleryImage(id: number): Promise<GalleryImage | undefined>;
  getGalleryImages(limit?: number, offset?: number): Promise<GalleryImage[]>;
  updateGalleryImage(id: number, image: Partial<InsertGalleryImage>): Promise<GalleryImage | undefined>;
  deleteGalleryImage(id: number): Promise<boolean>;
  
  // Chat operations
  saveChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getChatHistory(userId: string, limit?: number): Promise<ChatMessage[]>;
  
  // Chat settings operations
  getChatSettings(): Promise<ChatSettings | undefined>;
  updateChatSettings(settings: InsertChatSettings): Promise<ChatSettings>;
  
  // Session store for authentication
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private blogPosts: Map<number, BlogPost>;
  private galleryImages: Map<number, GalleryImage>;
  private chatMessages: Map<number, ChatMessage>;
  private chatSettings: ChatSettings | undefined;
  
  sessionStore: session.SessionStore;
  
  private userIdCounter: number = 1;
  private blogPostIdCounter: number = 1;
  private galleryImageIdCounter: number = 1;
  private chatMessageIdCounter: number = 1;

  constructor() {
    this.users = new Map();
    this.blogPosts = new Map();
    this.galleryImages = new Map();
    this.chatMessages = new Map();
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24 hours
    });
    
    // Initialize with default chat settings
    this.chatSettings = {
      id: 1,
      systemPrompt: "You are a helpful assistant for event attendees. Answer questions about the events, help with networking, and provide guidance.",
      maxHistoryLength: 10,
      updatedAt: new Date()
    };
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Blog post methods
  async createBlogPost(post: InsertBlogPost): Promise<BlogPost> {
    const id = this.blogPostIdCounter++;
    const now = new Date();
    const blogPost: BlogPost = { 
      ...post, 
      id, 
      createdAt: now,
      updatedAt: now
    };
    this.blogPosts.set(id, blogPost);
    return blogPost;
  }

  async getBlogPost(id: number): Promise<BlogPost | undefined> {
    return this.blogPosts.get(id);
  }

  async getBlogPosts(limit = 100, offset = 0): Promise<BlogPost[]> {
    return Array.from(this.blogPosts.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(offset, offset + limit);
  }

  async getPublishedBlogPosts(limit = 100, offset = 0): Promise<BlogPost[]> {
    return Array.from(this.blogPosts.values())
      .filter(post => post.status === 'published')
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(offset, offset + limit);
  }

  async updateBlogPost(id: number, postUpdate: Partial<InsertBlogPost>): Promise<BlogPost | undefined> {
    const post = this.blogPosts.get(id);
    if (!post) return undefined;
    
    const updatedPost: BlogPost = {
      ...post,
      ...postUpdate,
      updatedAt: new Date()
    };
    
    this.blogPosts.set(id, updatedPost);
    return updatedPost;
  }

  async deleteBlogPost(id: number): Promise<boolean> {
    return this.blogPosts.delete(id);
  }

  // Gallery image methods
  async createGalleryImage(image: InsertGalleryImage): Promise<GalleryImage> {
    const id = this.galleryImageIdCounter++;
    const now = new Date();
    const galleryImage: GalleryImage = {
      ...image,
      id,
      createdAt: now
    };
    this.galleryImages.set(id, galleryImage);
    return galleryImage;
  }

  async getGalleryImage(id: number): Promise<GalleryImage | undefined> {
    return this.galleryImages.get(id);
  }

  async getGalleryImages(limit = 100, offset = 0): Promise<GalleryImage[]> {
    return Array.from(this.galleryImages.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(offset, offset + limit);
  }

  async updateGalleryImage(id: number, imageUpdate: Partial<InsertGalleryImage>): Promise<GalleryImage | undefined> {
    const image = this.galleryImages.get(id);
    if (!image) return undefined;
    
    const updatedImage: GalleryImage = {
      ...image,
      ...imageUpdate
    };
    
    this.galleryImages.set(id, updatedImage);
    return updatedImage;
  }

  async deleteGalleryImage(id: number): Promise<boolean> {
    return this.galleryImages.delete(id);
  }

  // Chat methods
  async saveChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const id = this.chatMessageIdCounter++;
    const now = new Date();
    
    const chatMessage: ChatMessage = {
      ...message,
      id,
      timestamp: now
    };
    
    this.chatMessages.set(id, chatMessage);
    return chatMessage;
  }

  async getChatHistory(userId: string, limit = 10): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter(msg => msg.userId === userId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
      .slice(-limit);
  }

  // Chat settings methods
  async getChatSettings(): Promise<ChatSettings | undefined> {
    return this.chatSettings;
  }

  async updateChatSettings(settings: InsertChatSettings): Promise<ChatSettings> {
    if (!this.chatSettings) {
      this.chatSettings = {
        ...settings,
        id: 1,
        updatedAt: new Date()
      };
    } else {
      this.chatSettings = {
        ...this.chatSettings,
        ...settings,
        updatedAt: new Date()
      };
    }
    
    return this.chatSettings;
  }
}

export const storage = new MemStorage();
