'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react';

type Message = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
};

type Props = {
  messages: Message[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
};

export default function ChatPanel({ messages, onSendMessage, isLoading }: Props) {
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || isLoading) return;
    onSendMessage(text);
    setInput('');
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickPrompts = [
    'Explain CapEx vs OpEx using a Nairobi analogy',
    'What is Azure Blob Storage?',
    'How does RBAC work?',
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 0 }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid rgba(99,102,241,0.15)',
        display: 'flex', alignItems: 'center', gap: '12px',
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: '12px',
          background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 20px rgba(99,102,241,0.4)',
        }}>
          <Bot size={20} color="white" />
        </div>
        <div>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#f9fafb' }}>
            MawinguPrep AI <span className="gradient-text">Study Buddy</span>
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: 7, height: 7, borderRadius: '50%',
              background: '#10b981',
              animation: 'pulseGlow 2s ease-in-out infinite',
            }} />
            <span style={{ fontSize: '0.72rem', color: '#6b7280' }}>
              Powered by Claude · Unofficial AZ-900 Tool
            </span>
          </div>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <Sparkles size={16} color="#f59e0b" />
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        minHeight: 0,
      }}>
        {messages.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: '#4b5563',
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🌤️</div>
            <p style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '8px' }}>
              Karibu! Answer a question to get started, or ask anything about AZ-900.
            </p>
            <p style={{ fontSize: '0.75rem', color: '#4b5563' }}>
              I explain Azure concepts using everyday African examples.
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
              alignItems: 'flex-start',
              gap: '8px',
            }}
          >
            {/* Avatar */}
            <div style={{
              width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
              background: msg.role === 'user'
                ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                : msg.role === 'assistant'
                ? 'linear-gradient(135deg, #06b6d4, #0284c7)'
                : 'rgba(245,158,11,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.75rem',
            }}>
              {msg.role === 'user'
                ? <User size={14} color="white" />
                : msg.role === 'assistant'
                ? <Bot size={14} color="white" />
                : '💡'}
            </div>

            {/* Bubble */}
            <div
              className="chat-bubble"
              style={{
                background: msg.role === 'user'
                  ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                  : msg.role === 'system'
                  ? 'rgba(245,158,11,0.1)'
                  : 'rgba(26,34,53,0.9)',
                border: msg.role === 'user'
                  ? 'none'
                  : msg.role === 'system'
                  ? '1px solid rgba(245,158,11,0.2)'
                  : '1px solid rgba(99,102,241,0.2)',
                color: msg.role === 'system' ? '#fcd34d' : '#f9fafb',
              }}
            >
              {msg.content}
              <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', marginTop: '4px' }}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isLoading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'linear-gradient(135deg, #06b6d4, #0284c7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Bot size={14} color="white" />
            </div>
            <div style={{
              background: 'rgba(26,34,53,0.9)',
              border: '1px solid rgba(99,102,241,0.2)',
              borderRadius: '16px',
              borderBottomLeftRadius: '4px',
              padding: '12px 16px',
              display: 'flex', alignItems: 'center', gap: '4px',
            }}>
              <div className="typing-dot" />
              <div className="typing-dot" />
              <div className="typing-dot" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Quick prompts */}
      {messages.length === 0 && (
        <div style={{ padding: '0 20px 12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {quickPrompts.map((p) => (
            <button
              key={p}
              onClick={() => onSendMessage(p)}
              disabled={isLoading}
              style={{
                padding: '6px 12px',
                borderRadius: '999px',
                background: 'rgba(99,102,241,0.1)',
                border: '1px solid rgba(99,102,241,0.25)',
                color: '#a5b4fc',
                fontSize: '0.72rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.background = 'rgba(99,102,241,0.2)';
                (e.target as HTMLButtonElement).style.borderColor = 'rgba(99,102,241,0.5)';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.background = 'rgba(99,102,241,0.1)';
                (e.target as HTMLButtonElement).style.borderColor = 'rgba(99,102,241,0.25)';
              }}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Input bar */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid rgba(99,102,241,0.15)',
        display: 'flex', gap: '10px', alignItems: 'center',
      }}>
        <input
          ref={inputRef}
          id="chat-input"
          className="input-field"
          style={{ flex: 1, margin: 0 }}
          placeholder="Ask about any Azure concept..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          disabled={isLoading}
        />
        <button
          id="send-btn"
          className="btn-primary"
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          style={{ padding: '12px 16px', borderRadius: '12px', flexShrink: 0 }}
        >
          {isLoading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={16} />}
        </button>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
