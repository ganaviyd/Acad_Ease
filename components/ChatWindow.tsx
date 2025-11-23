
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { User, Message, MessageSender } from '../types';
import { getBotResponse } from '../services/geminiService';
import { getChatHistory, saveChatHistory } from '../services/databaseService';
import { SendIcon, UserIcon, BotIcon } from './Icons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatWindowProps {
  user: User;
}

const LoadingIndicator: React.FC = () => (
    <div className="flex items-center justify-center space-x-1.5">
        <div className="w-2 h-2 bg-cyan-300 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-cyan-300 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-cyan-300 rounded-full animate-pulse"></div>
    </div>
);

const ChatMessage: React.FC<{ message: Message }> = ({ message }) => {
  const isUser = message.sender === MessageSender.USER;
  return (
    <div className={`flex gap-3 my-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
        {!isUser && (
            <div className="w-8 h-8 rounded-full bg-cyan-500 flex-shrink-0 flex items-center justify-center">
                <BotIcon className="h-5 w-5 text-white" />
            </div>
        )}
      <div className={`p-4 rounded-2xl max-w-lg lg:max-w-xl xl:max-w-2xl ${isUser ? 'bg-blue-600 rounded-br-none' : 'bg-gray-700 rounded-bl-none'}`}>
        <div className="prose prose-invert prose-sm max-w-none prose-p:text-white prose-headings:text-white prose-strong:text-white prose-a:text-cyan-400 hover:prose-a:text-cyan-300 prose-code:text-pink-400 prose-pre:bg-gray-800">
           <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.text}</ReactMarkdown>
        </div>
      </div>
       {isUser && (
            <div className="w-8 h-8 rounded-full bg-blue-600 flex-shrink-0 flex items-center justify-center">
                <UserIcon className="h-5 w-5 text-white" />
            </div>
        )}
    </div>
  );
};


const ChatWindow: React.FC<ChatWindowProps> = ({ user }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryLoaded, setIsHistoryLoaded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load history on mount or user change
  useEffect(() => {
    const loadHistory = async () => {
      setIsHistoryLoaded(false);
      try {
        const history = await getChatHistory(user);
        if (history.length > 0) {
          setMessages(history);
        } else {
          setMessages([
            {
              text: `Hello ${user.name}! I'm AcadEase, your personal AI assistant. How can I help you today? You can ask me about study resources, career paths, or any general academic questions.`,
              sender: MessageSender.BOT,
            }
          ]);
        }
      } catch (error) {
        console.error("Failed to load history:", error);
        // Fallback to greeting
        setMessages([
            {
              text: `Hello ${user.name}! I'm AcadEase, your personal AI assistant. How can I help you today? You can ask me about study resources, career paths, or any general academic questions.`,
              sender: MessageSender.BOT,
            }
          ]);
      } finally {
        setIsHistoryLoaded(true);
      }
    };
    loadHistory();
  }, [user.name, user.branch, user.year, user.semester, user.role]); // Depend on specific user fields

  // Save history when messages change
  useEffect(() => {
    if (isHistoryLoaded && messages.length > 0) {
      saveChatHistory(user, messages);
    }
  }, [messages, user, isHistoryLoaded]);

  useEffect(() => {
    if (isHistoryLoaded) {
        scrollToBottom();
    }
  }, [messages, isLoading, isHistoryLoaded]);

  const handleSend = useCallback(async () => {
    if (input.trim() === '' || isLoading) return;

    const userMessage: Message = { text: input, sender: MessageSender.USER };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const botResponseText = await getBotResponse(input, user);
      const botMessage: Message = { text: botResponseText, sender: MessageSender.BOT };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = { text: 'Sorry, something went wrong. Please try again.', sender: MessageSender.BOT };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, user]);

  if (!isHistoryLoaded) {
      return (
          <div className="flex flex-col h-full bg-gray-800 text-white items-center justify-center">
              <LoadingIndicator />
              <p className="mt-4 text-gray-400 text-sm">Loading conversation history...</p>
          </div>
      )
  }

  return (
    <div className="flex flex-col h-full bg-gray-800 text-white">
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, index) => (
          <ChatMessage key={index} message={msg} />
        ))}
        {isLoading && (
            <div className="flex gap-3 my-4 justify-start">
                <div className="w-8 h-8 rounded-full bg-cyan-500 flex-shrink-0 flex items-center justify-center">
                    <BotIcon className="h-5 w-5 text-white" />
                </div>
                <div className="p-4 rounded-2xl rounded-bl-none bg-gray-700">
                    <LoadingIndicator />
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-gray-900/50 border-t border-gray-700">
        <div className="relative max-w-4xl mx-auto">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask me anything about your studies..."
            className="w-full bg-gray-700 border border-gray-600 rounded-xl shadow-sm py-3 pl-4 pr-16 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
            rows={1}
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-cyan-500 text-white disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-cyan-400 transition-colors"
          >
            <SendIcon className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
