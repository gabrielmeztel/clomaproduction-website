import OpenAI from "openai";
import { storage } from "./storage";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || "your-api-key"
});

export async function getChatResponse(userId: string, userMessage: string): Promise<string> {
  try {
    // Get chat history for the user
    const chatHistory = await storage.getChatHistory(userId);
    
    // Get system settings
    const settings = await storage.getChatSettings();
    const systemPrompt = settings?.systemPrompt || 
      "You are a helpful assistant for event attendees. Answer questions about events, help with networking tips, and provide guidance.";
    
    // Save the user message
    await storage.saveChatMessage({
      role: 'user',
      content: userMessage,
      userId: userId
    });
    
    // Prepare messages for the API
    const messages = [
      { role: "system", content: systemPrompt },
      ...chatHistory.map(msg => ({
        role: msg.role as "user" | "assistant",
        content: msg.content
      })),
      { role: "user", content: userMessage }
    ];
    
    // Get response from OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages,
      max_tokens: 500,
    });
    
    const aiResponse = response.choices[0].message.content || "I'm sorry, I couldn't process your request.";
    
    // Save the AI response
    await storage.saveChatMessage({
      role: 'assistant',
      content: aiResponse,
      userId: userId
    });
    
    return aiResponse;
  } catch (error) {
    console.error("Error getting chat response:", error);
    return "I'm sorry, I encountered an error while processing your request. Please try again later.";
  }
}
