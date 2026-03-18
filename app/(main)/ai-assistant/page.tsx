'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

export default function AiAssistantPage() {
  const API_URL = 'http://localhost:3001';
  const SESSION_STORAGE_KEY = 'healthape_ai_chat_session';

  const getWelcomeMessage = (): Message => ({
    id: 'welcome',
    text:
      "Hello! I'm your HealthApe AI Assistant. I can help you understand your medical records, lab reports, prescriptions, and health history. How can I help you today?",
    sender: 'assistant',
    timestamp: new Date(),
  });

  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window === 'undefined') {
      return [getWelcomeMessage()];
    }

    const savedMessages = sessionStorage.getItem(SESSION_STORAGE_KEY);

    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);

        return parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
      } catch {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
      }
    }

    return [getWelcomeMessage()];
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(
        SESSION_STORAGE_KEY,
        JSON.stringify(messages),
      );
    }
  }, [messages]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const streamText = async (text: string) => {
    let currentText = '';

    for (let i = 0; i < text.length; i++) {
      currentText += text[i];

      setMessages(prev => {
        const updated = [...prev];
        const last = updated[updated.length - 1];

        if (last && last.sender === 'assistant') {
          updated[updated.length - 1] = {
            ...last,
            text: currentText,
          };
        }

        return updated;
      });

      await new Promise(resolve => setTimeout(resolve, 15));
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          message: userMessage.text,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          Array.isArray(data?.message)
            ? data.message.join(', ')
            : data?.message || 'AI assistant failed to process the request',
        );
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: '',
        sender: 'assistant',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      await streamText(
        data?.answer || 'No response from AI assistant.',
      );
    } catch (error: any) {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: error?.message || 'AI assistant service unavailable.',
        sender: 'assistant',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    const welcomeMessage = getWelcomeMessage();
    setMessages([welcomeMessage]);

    if (typeof window !== 'undefined') {
      sessionStorage.setItem(
        SESSION_STORAGE_KEY,
        JSON.stringify([welcomeMessage]),
      );
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] bg-white rounded-lg border border-gray-200">
      {/* HEADER */}
      <div className="flex items-center gap-3 p-6 border-b border-gray-200">
        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
          ♥
        </div>

        <div className="flex-1">
          <h2 className="font-semibold text-gray-900">
            HealthApe Assistant
          </h2>

          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs text-green-600 font-medium">
              Online
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleNewChat}
          className="text-sm px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          New Chat
        </button>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map(message => (
          <div
            key={message.id}
            className={`flex gap-3 ${
              message.sender === 'user'
                ? 'justify-end'
                : 'justify-start'
            }`}
          >
            {message.sender === 'assistant' && (
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                ♥
              </div>
            )}

            <div
              className={`max-w-md px-4 py-3 ${
                message.sender === 'user'
                  ? 'bg-blue-500 text-white rounded-2xl rounded-tr-none'
                  : 'bg-gray-100 text-gray-900 rounded-2xl rounded-tl-none'
              }`}
            >
              <p className="text-sm whitespace-pre-line">
                {message.text}
              </p>

              <span
                className={`text-xs mt-2 block ${
                  message.sender === 'user'
                    ? 'text-blue-100'
                    : 'text-gray-500'
                }`}
              >
                {formatTime(message.timestamp)}
              </span>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
              ♥
            </div>

            <div className="bg-gray-100 rounded-2xl px-4 py-3">
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}
      <form
        onSubmit={handleSendMessage}
        className="border-t border-gray-200 p-4 flex gap-3"
      >
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask about your health records..."
          className="flex-1 bg-gray-50 border border-gray-300 rounded-full px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />

        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-full p-3 flex items-center justify-center"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
}