'use client';
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Minus, Headphones } from 'lucide-react';
import { cn } from '@/utils';

interface ChatMessage {
  id: string;
  sender: 'user' | 'agent' | 'system';
  text: string;
  timestamp: number;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: '1',
    sender: 'system',
    text: 'You are now connected to eSIM Platform Support.',
    timestamp: Date.now() - 60000,
  },
  {
    id: '2',
    sender: 'agent',
    text: "Hi there! 👋 I'm Alex from support. How can I help you today?",
    timestamp: Date.now() - 55000,
  },
];

const QUICK_REPLIES = [
  'My eSIM is not activating',
  'I need a refund',
  'How do I check my data usage?',
  'Talk to a human agent',
];

export function LiveChatWidget() {
  const [open, setOpen] = useState(false);
  const [minimized, setMin] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [unread, setUnread] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && !minimized) {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
      setUnread(0);
    }
  }, [messages, open, minimized]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      sender: 'user',
      text,
      timestamp: Date.now(),
    };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setTyping(true);

    // Simulated agent reply
    setTimeout(() => {
      setTyping(false);
      const reply: ChatMessage = {
        id: crypto.randomUUID(),
        sender: 'agent',
        text: getSimulatedReply(text),
        timestamp: Date.now(),
      };
      setMessages((m) => [...m, reply]);
      if (!open || minimized) setUnread((u) => u + 1);
    }, 1400);
  };

  const getSimulatedReply = (text: string): string => {
    const t = text.toLowerCase();
    if (t.includes('activat'))
      return "I'm sorry to hear that! Could you tell me which device you're using? Most activation issues are resolved by toggling Airplane Mode on and off.";
    if (t.includes('refund'))
      return 'I can help with that. Refunds are available for unused eSIMs within 30 days. Could you share your order number?';
    if (t.includes('usage'))
      return 'You can check your data usage anytime from Dashboard → My eSIMs. Want me to walk you through it?';
    if (t.includes('human'))
      return "I'll connect you with a human agent right away. Average wait time is under 2 minutes.";
    return 'Thanks for your message! Let me look into that for you. In the meantime, you can also check our Knowledge Base for instant answers.';
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Floating button */}
      {!open && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={() => setOpen(true)}
          className="relative flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label="Open live chat"
        >
          <MessageCircle className="h-6 w-6" aria-hidden="true" />
          {unread > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
              {unread}
            </span>
          )}
        </motion.button>
      )}

      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            role="dialog"
            aria-modal="true"
            aria-label="Live chat support"
            className={cn(
              'flex flex-col overflow-hidden rounded-2xl border bg-card shadow-2xl',
              minimized ? 'h-14 w-72' : 'h-[500px] w-80 sm:w-96',
            )}
          >
            {/* Header */}
            <div className="gradient-brand flex flex-shrink-0 items-center gap-3 px-4 py-3 text-white">
              <div className="relative">
                <Headphones className="h-5 w-5" aria-hidden="true" />
                <span
                  className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-white bg-green-400"
                  aria-hidden="true"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">eSIM Support</p>
                {!minimized && (
                  <p className="text-xs text-blue-100">Typically replies in a few minutes</p>
                )}
              </div>
              <button
                onClick={() => setMin((m) => !m)}
                className="rounded p-1 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                aria-label={minimized ? 'Expand chat' : 'Minimize chat'}
              >
                <Minus className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                onClick={() => setOpen(false)}
                className="rounded p-1 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                aria-label="Close chat"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            {!minimized && (
              <>
                {/* Messages */}
                <div
                  ref={scrollRef}
                  className="flex-1 space-y-3 overflow-y-auto p-4"
                  role="log"
                  aria-live="polite"
                  aria-label="Chat messages"
                >
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        'flex',
                        msg.sender === 'user' ? 'justify-end' : 'justify-start',
                        msg.sender === 'system' && 'justify-center',
                      )}
                    >
                      {msg.sender === 'system' ? (
                        <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                          {msg.text}
                        </span>
                      ) : (
                        <div
                          className={cn(
                            'max-w-[80%] rounded-2xl px-3.5 py-2 text-sm',
                            msg.sender === 'user'
                              ? 'rounded-br-sm bg-primary text-primary-foreground'
                              : 'rounded-bl-sm bg-muted',
                          )}
                        >
                          {msg.text}
                        </div>
                      )}
                    </div>
                  ))}
                  {typing && (
                    <div className="flex justify-start" aria-label="Agent is typing">
                      <div className="flex gap-1 rounded-2xl rounded-bl-sm bg-muted px-3.5 py-2.5">
                        {[0, 1, 2].map((i) => (
                          <span
                            key={i}
                            className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/50"
                            style={{ animationDelay: `${i * 0.15}s` }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick replies */}
                {messages.length <= 2 && (
                  <div className="flex flex-wrap gap-1.5 px-4 pb-2">
                    {QUICK_REPLIES.map((q) => (
                      <button
                        key={q}
                        onClick={() => sendMessage(q)}
                        className="rounded-full border px-3 py-1.5 text-xs transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}

                {/* Input */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    sendMessage(input);
                  }}
                  className="flex flex-shrink-0 items-center gap-2 border-t p-3"
                >
                  <label htmlFor="chat-input" className="sr-only">
                    Type a message
                  </label>
                  <input
                    id="chat-input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message…"
                    className="h-9 flex-1 rounded-full border bg-background px-3.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40"
                    aria-label="Send message"
                  >
                    <Send className="h-4 w-4" aria-hidden="true" />
                  </button>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
