import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || "sk-placeholder-key-for-development-only" 
});

export async function generateAIResponse(userMessage: string): Promise<string> {
  try {
    // Define context for the AI
    const systemPrompt = `
You are an AI chat assistant for an animation studio that specializes in custom animation projects.

Your primary functions:
1. Assist clients with understanding our production process and services
2. Gather initial project details based on client's needs
3. Provide initial rate estimates based on project complexity
4. Generate a Project Request Spreadsheet once production terms are agreed upon
5. Explain payment options and terms

Production Categories:
- Storyboard (E-konte) - Initial visual planning of scenes
- Layout (Reiauto) - Detailed scene composition and camera angles
- 2nd Key Animation (Daini Genga) - Enhanced animation quality
- Compositing (Konpojitto) - Merging elements and adding visual effects
- Voice/Audio (Afureko) - Sound design and voice recording

Tailor your communication style based on client expertise:
- For less technical clients: Explain with clear analogies, avoid jargon, provide samples
- For experienced clients: Focus directly on rates, specifications, and deadlines

Always be professional, friendly, and helpful. If questions fall outside your knowledge scope, offer to connect the client with a human team member.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    const aiResponse = response.choices[0].message.content;
    return aiResponse || "I'm sorry, I couldn't generate a response. Please try again.";
  } catch (error) {
    console.error("Error generating AI response:", error);
    return "I'm having trouble connecting right now. Please try again later.";
  }
}

export async function generateBlogIdeas(topic: string): Promise<string[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: "You are a creative content strategist for an animation studio. Generate 5 blog post ideas related to the given topic that would be relevant for an animation studio's audience. Cover topics like animation techniques, industry trends, project showcases, and creative processes. Make titles catchy and SEO-friendly." 
        },
        { 
          role: "user", 
          content: `Generate 5 blog post ideas about: ${topic}` 
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 500,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      return ["Failed to generate blog ideas"];
    }
    
    try {
      const parsed = JSON.parse(content);
      return Array.isArray(parsed.ideas) ? parsed.ideas : [];
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      return ["Failed to parse blog ideas"];
    }
  } catch (error) {
    console.error("Error generating blog ideas:", error);
    return ["Error generating blog ideas. Please try again."];
  }
}
