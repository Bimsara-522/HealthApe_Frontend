// AI Assistant page (URL: /ai-assistant)
'use client';
import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Menu, MessageSquare, Plus, Send, Trash2 } from 'lucide-react';
import api from '@/lib/api/api';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

interface WelcomeResponse {
  message: string;
  metadata?: {
    vectorCount?: number;
    categories?: string[];
    matches?: number;
  };
}

interface ChatHistoryItem {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ChatSession {
  id: number;
  title: string;
  updatedAt: string;
}

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);

  return parts.map((part, idx) => {
    const boldMatch = part.match(/^\*\*([^*]+)\*\*$/);
    if (boldMatch) {
      return (
        <strong key={`b-${idx}`} className="font-semibold text-gray-900">
          {boldMatch[1]}
        </strong>
      );
    }

    return <React.Fragment key={`t-${idx}`}>{part}</React.Fragment>;
  });
}

function renderAssistantMessage(text: string) {
  const lines = text.split('\n');
  const nodes: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const raw = lines[i] ?? '';
    const line = raw.trim();

    if (!line) {
      i += 1;
      continue;
    }

    const heading = line.match(/^###\s+(.+)/);
    if (heading) {
      nodes.push(
        <h3 key={`h-${i}`} className="mt-2 text-sm font-semibold text-gray-900">
          {renderInline(heading[1])}
        </h3>
      );
      i += 1;
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const start = Number(line.match(/^(\d+)\./)?.[1] ?? '1');
      const items: string[] = [];

      while (i < lines.length && /^\d+\.\s+/.test((lines[i] ?? '').trim())) {
        items.push((lines[i] ?? '').trim().replace(/^\d+\.\s+/, ''));
        i += 1;
      }

      nodes.push(
        <ol key={`ol-${i}`} start={start} className="ml-5 list-decimal space-y-1 text-sm text-gray-800">
          {items.map((item, idx) => (
            <li key={`oli-${idx}`}>{renderInline(item)}</li>
          ))}
        </ol>
      );
      continue;
    }

    if (/^-\s+/.test(line)) {
      const items: string[] = [];

      while (i < lines.length && /^-\s+/.test((lines[i] ?? '').trim())) {
        items.push((lines[i] ?? '').trim().replace(/^-\s+/, ''));
        i += 1;
      }

      nodes.push(
        <ul key={`ul-${i}`} className="ml-5 list-disc space-y-1 text-sm text-gray-800">
          {items.map((item, idx) => (
            <li key={`uli-${idx}`}>{renderInline(item)}</li>
          ))}
        </ul>
      );
      continue;
    }

    nodes.push(
      <p key={`p-${i}`} className="text-sm leading-6 text-gray-800">
        {renderInline(line)}
      </p>
    );
    i += 1;
  }

  return <div className="space-y-2">{nodes}</div>;
}

function AssistantAvatar() {
  return (
    <div className="w-8 h-8 rounded-full overflow-hidden border border-blue-200 bg-white flex-shrink-0 flex items-center justify-center">
      <Image
        src="/HealthApeLogo.png"
        alt="HealthApe assistant avatar"
        width={24}
        height={24}
        className="h-full w-full object-contain p-0.5"
      />
    </div>
  );
}

export default function AiAssistantPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSessionLoading, setIsSessionLoading] = useState(false);
  const [welcomeMeta, setWelcomeMeta] = useState<WelcomeResponse['metadata']>();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const buildWelcomeMessage = (welcomeMessage?: string): Message => ({
    id: `welcome-${Date.now()}`,
    text:
      welcomeMessage ||
      'Hi there! I am your HealthApe Assistant. Ask me anything about your uploaded records.',
    sender: 'assistant',
    timestamp: new Date(),
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [welcomeRes, sessionsRes] = await Promise.all([
          api.get<WelcomeResponse>('/chat/welcome'),
          api.get<ChatSession[]>('/chat/sessions'),
        ]);

        setWelcomeMeta(welcomeRes.data?.metadata);
        const loadedSessions = sessionsRes.data || [];

        if (loadedSessions.length > 0) {
          setSessions(loadedSessions);
          setActiveSessionId(loadedSessions[0].id);
        } else {
          const created = await api.post<ChatSession>('/chat/sessions', {});
          setSessions([created.data]);
          setActiveSessionId(created.data.id);
        }

        setMessages([buildWelcomeMessage(welcomeRes.data?.message)]);
      } catch {
        setMessages([
          buildWelcomeMessage('Hi there! I am your HealthApe Assistant. Ask me about your uploaded health records.'),
        ]);
      }
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    const loadSessionHistory = async () => {
      if (!activeSessionId) {
        return;
      }

      setIsSessionLoading(true);

      try {
        const historyRes = await api.get<ChatHistoryItem[]>('/chat/history', {
          params: { chatSessionId: activeSessionId },
        });

        const historyMessages: Message[] = (historyRes.data || []).map((item, idx) => ({
          id: `history-${activeSessionId}-${idx}`,
          text: item.content,
          sender: item.role,
          timestamp: new Date(item.timestamp),
        }));

        if (historyMessages.length > 0) {
          setMessages(historyMessages);
        } else {
          setMessages([buildWelcomeMessage()]);
        }
      } catch {
        setMessages([buildWelcomeMessage('Could not load this chat right now. Try switching chats again.')]);
      } finally {
        setIsSessionLoading(false);
      }
    };

    loadSessionHistory();
  }, [activeSessionId]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !activeSessionId) return;

    // Add user message
    const userMessage: Message = {
      id: `u-${Date.now()}`,
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await api.post('/chat', {
        message: userMessage.text,
        chatSessionId: activeSessionId,
      });
      const answerText =
        response.data?.answer ||
        'I could not find enough information from your records for that question.';

      const assistantMessage: Message = {
        id: `a-${Date.now()}`,
        text: answerText,
        sender: 'assistant',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setSessions((prev) => {
        const next = prev.map((session) =>
          session.id === activeSessionId
            ? {
                ...session,
                title:
                  session.title === 'New chat'
                    ? userMessage.text.slice(0, 40) + (userMessage.text.length > 40 ? '...' : '')
                    : session.title,
                updatedAt: new Date().toISOString(),
              }
            : session
        );

        return [...next].sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      });
    } catch {
      const assistantMessage: Message = {
        id: `a-${Date.now()}`,
        text: 'I could not process your request right now. Please try again in a moment.',
        sender: 'assistant',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNewChat = async () => {
    try {
      const response = await api.post<ChatSession>('/chat/sessions', {});
      const newSession = response.data;

      setSessions((prev) => [newSession, ...prev]);
      setActiveSessionId(newSession.id);
      setMessages([buildWelcomeMessage()]);
    } catch {
      // Keep UI stable even when new session creation fails.
    }
  };

  const handleDeleteChat = async (sessionId: number) => {
    try {
      await api.delete(`/chat/sessions/${sessionId}`);

      let shouldCreateReplacement = false;

      setSessions((prev) => {
        const remaining = prev.filter((session) => session.id !== sessionId);

        if (activeSessionId === sessionId) {
          if (remaining.length > 0) {
            setActiveSessionId(remaining[0].id);
          } else {
            shouldCreateReplacement = true;
            setActiveSessionId(null);
            setMessages([]);
          }
        }

        return remaining;
      });

      if (shouldCreateReplacement) {
        await handleCreateNewChat();
      }
    } catch {
      // Keep UI stable even when delete fails.
    }
  };

  const handleSelectSession = (sessionId: number) => {
    setActiveSessionId(sessionId);

    if (window.innerWidth < 768) {
      setIsHistoryOpen(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-120px)] bg-white rounded-lg border border-gray-200 overflow-hidden">
      <aside
        aria-hidden={!isHistoryOpen}
        className={`bg-gray-50 flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${
          isHistoryOpen
            ? 'w-full md:w-72 md:min-w-72 max-h-56 md:max-h-none border-b md:border-b-0 md:border-r border-gray-200 p-4 opacity-100'
            : 'w-0 md:w-0 md:min-w-0 max-h-0 md:max-h-none border-b-0 md:border-r-0 p-0 opacity-0 pointer-events-none'
        }`}
      >
          <button
            type="button"
            onClick={handleCreateNewChat}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-500 text-white py-2.5 text-sm font-medium hover:bg-blue-600 transition-colors"
          >
            <Plus size={16} />
            New Chat
          </button>

          <div className="mt-4 space-y-2 overflow-y-auto">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 cursor-pointer transition-colors ${
                  activeSessionId === session.id
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleSelectSession(session.id)}
              >
                <MessageSquare size={14} className="text-gray-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{session.title || 'New chat'}</p>
                  <p className="text-xs text-gray-500">{formatTime(new Date(session.updatedAt))}</p>
                </div>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleDeleteChat(session.id);
                  }}
                  className="shrink-0 rounded-md p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  aria-label="Delete chat"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
      </aside>

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 p-6 border-b border-gray-200">
          <button
            type="button"
            onClick={() => setIsHistoryOpen((prev) => !prev)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label={isHistoryOpen ? 'Collapse chat history' : 'Open chat history'}
            title={isHistoryOpen ? 'Collapse chat history' : 'Open chat history'}
          >
            <Menu size={18} />
          </button>
          <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 bg-white flex items-center justify-center">
            <Image
              src="/HealthApeLogo.png"
              alt="HealthApe chat icon"
              width={36}
              height={36}
              className="h-full w-full object-contain p-1"
              priority
            />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-gray-900">Help Ape</h2>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-green-600 font-medium">Online</span>
              {/* {typeof welcomeMeta?.vectorCount === 'number' && (
                <span className="text-xs text-gray-500">• Indexed chunks: {welcomeMeta.vectorCount}</span>
              )} */}
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {isSessionLoading && (
            <p className="text-sm text-gray-500">Loading chat...</p>
          )}

          {!isSessionLoading && messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.sender === 'assistant' && <AssistantAvatar />}
              <div
                className={`max-w-md ${
                  message.sender === 'user'
                    ? 'bg-blue-500 text-white rounded-2xl rounded-tr-none'
                    : 'bg-gray-100 text-gray-900 rounded-2xl rounded-tl-none'
                } px-4 py-3`}
              >
                {message.sender === 'assistant' ? (
                  renderAssistantMessage(message.text)
                ) : (
                  <p className="text-sm whitespace-pre-line">{message.text}</p>
                )}
                <span
                  className={`text-xs mt-2 block ${
                    message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}
                >
                  {formatTime(message.timestamp)}
                </span>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3">
              <AssistantAvatar />
              <div className="bg-gray-100 rounded-2xl rounded-tl-none px-4 py-3">
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

        {/* Input Area */}
        <form
          onSubmit={handleSendMessage}
          className="border-t border-gray-200 p-4 flex gap-3"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your health records...."
            className="flex-1 bg-gray-50 border border-gray-300 rounded-full px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading || !activeSessionId}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim() || !activeSessionId}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-full p-3 flex items-center justify-center transition-colors"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}