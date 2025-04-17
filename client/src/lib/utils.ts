import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { apiRequest } from "./queryClient"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function generateBlogIdeas(topic: string): Promise<string[]> {
  try {
    const response = await apiRequest('POST', '/api/generate-blog-ideas', { topic });
    const data = await response.json();
    return data.ideas || [];
  } catch (error) {
    console.error("Failed to generate blog ideas:", error);
    throw new Error("Failed to generate blog ideas");
  }
}
