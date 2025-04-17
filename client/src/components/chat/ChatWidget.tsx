import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, MessageSquare, X, Send, Bot, User } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { v4 as uuidv4 } from "uuid";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
}

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      text: "Hi there! I'm your EventConnect assistant. How can I help you today?",
      isUser: false,
    },
  ]);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [userId] = useState(() => {
    const storedId = localStorage.getItem("chat_user_id");
    if (storedId) return storedId;
    
    const newId = uuidv4();
    localStorage.setItem("chat_user_id", newId);
    return newId;
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const res = await apiRequest("POST", "/api/chat", { 
        userId, 
        message 
      });
      return res.json();
    },
    onSuccess: (data) => {
      setMessages(prev => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          text: data.aiResponse,
          isUser: false,
        },
      ]);
    },
    onError: (error) => {
      setMessages(prev => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          text: "Sorry, I'm having trouble connecting. Please try again later.",
          isUser: false,
        },
      ]);
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    
    const newUserMessage = {
      id: `user-${Date.now()}`,
      text: inputText,
      isUser: true,
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    chatMutation.mutate(inputText);
    setInputText("");
  };

  return (
    <>
      {/* Chat button */}
      {!isOpen && (
        <Button
          className="fixed bottom-4 right-4 z-50 rounded-full w-14 h-14 shadow-lg bg-primary hover:bg-primary/90"
          onClick={() => setIsOpen(true)}
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      )}

      {/* Chat panel */}
      {isOpen && (
        <Card className="fixed bottom-4 right-4 z-50 w-80 sm:w-96 max-h-96 shadow-lg flex flex-col overflow-hidden">
          <CardHeader className="py-3 px-4 bg-primary text-white flex flex-row items-center">
            <CardTitle className="text-sm font-medium flex-1">Chat Assistant</CardTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 text-white hover:text-gray-200 hover:bg-transparent"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-3" style={{ maxHeight: "300px" }}>
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex items-start ${msg.isUser ? 'justify-end' : ''}`}
              >
                {!msg.isUser && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
                    <Bot className="h-4 w-4" />
                  </div>
                )}
                
                <div 
                  className={`mx-2 py-2 px-3 rounded-lg ${
                    msg.isUser 
                      ? 'bg-primary/10 text-gray-800' 
                      : 'bg-gray-100 text-gray-800'
                  } max-w-[75%]`}
                >
                  <p className="text-sm">{msg.text}</p>
                </div>
                
                {msg.isUser && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-white">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}
            
            {chatMutation.isPending && (
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="ml-2 bg-gray-100 rounded-lg py-2 px-3">
                  <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </CardContent>
          
          <CardFooter className="border-t p-3">
            <form onSubmit={handleSendMessage} className="flex space-x-2 w-full">
              <Input
                type="text"
                placeholder="Type your message..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1"
              />
              <Button 
                type="submit" 
                size="icon" 
                className="bg-primary text-white hover:bg-primary/90"
                disabled={chatMutation.isPending || !inputText.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      )}
    </>
  );
};

export default ChatWidget;
