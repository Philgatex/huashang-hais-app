// src/app/(app)/hr-helpdesk/page.tsx
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { askHrHelpdesk } from '@/ai/flows/hrHelpdeskFlow';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function HrHelpdeskPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const assistantMessageId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: assistantMessageId, role: 'assistant', content: '' }]);

    try {
      const stream = await askHrHelpdesk(input);
      let content = '';
      for await (const chunk of stream) {
        content += chunk;
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMessageId ? { ...msg, content } : msg
        ));
      }
    } catch (error) {
      console.error("AI Helpdesk Error:", error);
      const errorMessage = "Sorry, I encountered an error. Please try again or contact HR directly if the issue persists.";
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessageId ? { ...msg, content: errorMessage } : msg
      ));
      toast({
        variant: "destructive",
        title: "AI Error",
        description: "The AI assistant failed to respond.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)]">
      <Card className="flex-1 flex flex-col">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <Icons.HelpCircle className="h-6 w-6 text-primary" />
            AI-Powered HR Helpdesk
          </CardTitle>
          <CardDescription>
            Ask questions about company policies, benefits, and procedures. For personal or sensitive matters, please contact HR directly.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground pt-10">
                  <Icons.Bot className="mx-auto h-12 w-12 mb-2" />
                  <p>Welcome! How can I help you today?</p>
                </div>
              )}
              {messages.map(message => (
                <div
                  key={message.id}
                  className={cn(
                    "flex items-start gap-3",
                    message.role === 'user' ? "justify-end" : "justify-start"
                  )}
                >
                  {message.role === 'assistant' && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="https://placehold.co/40x40.png" alt="AI Assistant" data-ai-hint="robot avatar" />
                      <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      "max-w-md rounded-lg px-4 py-2 text-sm whitespace-pre-wrap",
                      message.role === 'user' 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted text-foreground"
                    )}
                  >
                    {message.content || <Icons.Settings className="animate-spin h-4 w-4" />}
                  </div>
                   {message.role === 'user' && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatar || `https://placehold.co/40x40.png`} alt={user?.name} data-ai-hint="person avatar"/>
                      <AvatarFallback>{user?.name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="border-t p-4">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about leave policy, payroll dates, etc..."
                disabled={isLoading}
                autoComplete="off"
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <Icons.Settings className="animate-spin h-4 w-4" /> : "Send"}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
