'use client';

import { useState, useCallback, useEffect } from 'react';
import { CloudLightning, BookOpen, Settings, Database, Sparkles } from 'lucide-react';
import ChatPanel from '@/components/ChatPanel';
import ReadinessPanel from '@/components/ReadinessPanel';
import QuizCard from '@/components/QuizCard';
import DatabaseModal from '@/components/DatabaseModal';
import { SEED_QUESTIONS } from '@/lib/questions';
import { Question } from '@/lib/supabase';

type Message = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
};

type Scores = {
  cloud_concepts: number;
  architecture_services: number;
  management_governance: number;
  questions_attempted: number;
};

const DEFAULT_SCORES: Scores = {
  cloud_concepts: 0,
  architecture_services: 0,
  management_governance: 0,
  questions_attempted: 0,
};

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function Dashboard() {
  const [userEmail, setUserEmail] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [isSignedIn, setIsSignedIn] = useState(false);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [scores, setScores] = useState<Scores>(DEFAULT_SCORES);

  const [messages, setMessages] = useState<Message[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<'quiz' | 'tracker'>('quiz');
  const [isMobile, setIsMobile] = useState(false);
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [dbStatus, setDbStatus] = useState<{ mode: string; provider: string; questionsCount?: number } | null>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 900);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const reloadDatabase = useCallback(async () => {
    try {
      const res = await fetch('/api/database');
      const data = await res.json();
      setDbStatus(data);
      if (userEmail) {
        const sRes = await fetch(`/api/scores?email=${encodeURIComponent(userEmail)}`);
        const sData = await sRes.json();
        if (sData.score) {
          setScores({
            cloud_concepts: sData.score.cloud_concepts ?? 0,
            architecture_services: sData.score.architecture_services ?? 0,
            management_governance: sData.score.management_governance ?? 0,
            questions_attempted: sData.score.questions_attempted ?? 0,
          });
        }
      }
    } catch {
      // offline fallback
    }
  }, [userEmail]);

  useEffect(() => {
    reloadDatabase();
  }, [reloadDatabase]);

  // Load questions and scores on sign-in
  const handleSignIn = async () => {
    if (!emailInput.trim()) return;
    const email = emailInput.trim().toLowerCase();
    setUserEmail(email);

    // Fetch questions from the Database API
    try {
      const qRes = await fetch('/api/questions');
      const qData = await qRes.json();
      if (qData.questions && qData.questions.length > 0) {
        setQuestions(shuffleArray(qData.questions));
      } else {
        setQuestions(shuffleArray(SEED_QUESTIONS));
      }
    } catch {
      setQuestions(shuffleArray(SEED_QUESTIONS));
    }

    // Load persistent scores from Database
    try {
      const res = await fetch(`/api/scores?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (data.score) {
        setScores({
          cloud_concepts: data.score.cloud_concepts ?? 0,
          architecture_services: data.score.architecture_services ?? 0,
          management_governance: data.score.management_governance ?? 0,
          questions_attempted: data.score.questions_attempted ?? 0,
        });
      }
    } catch {
      // use local state
    }

    setIsSignedIn(true);
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: `Habari ${email.split('@')[0]}! 👋 I'm your MawinguPrep AI Study Buddy. I'll explain Azure concepts using African analogies you'll actually remember. Answer the question on the left to get started!`,
      timestamp: new Date(),
    }]);
  };

  const fetchExplanation = useCallback(async (
    userAnswer: string,
    correctAnswer: string,
    concept: string,
    domain: string,
    isCorrect: boolean
  ) => {
    const promptMessage = isCorrect
      ? `I just correctly answered a question about "${concept}" in the ${domain} domain. Please give me a deeper insight or tip about this concept with an African analogy.`
      : `I answered "${userAnswer}", but the correct answer is "${correctAnswer}". Can you explain the concept of "${concept}" in the ${domain} domain? Help me understand why my answer was wrong.`;

    setIsAiLoading(true);

    // Add user message to chat
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: isCorrect
        ? `I got "${concept}" right! Give me a deeper tip.`
        : `I answered "${userAnswer}" but it's wrong. Explain "${concept}".`,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);

    try {
      const response = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: promptMessage,
          context: `User is studying the ${domain} domain of AZ-900. They ${isCorrect ? 'correctly answered' : 'got wrong'} a question on ${concept}.`,
        }),
      });

      const data = await response.json();
      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: data.reply ?? 'Pole, I could not generate an explanation right now.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch {
      const errMsg: Message = {
        id: `err-${Date.now()}`,
        role: 'system',
        content: '⚠️ Failed to connect to AI tutor. Make sure ANTHROPIC_API_KEY is configured.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsAiLoading(false);
    }
  }, []);

  const handleAnswer = useCallback(async (selectedOption: string, isCorrect: boolean) => {
    const q = questions[currentIdx];
    if (!q) return;

    // Trigger AI explanation
    fetchExplanation(selectedOption, q.correct_answer, q.concept, q.domain, isCorrect);

    // Update local score optimistically
    const columnMap: Record<string, keyof Scores> = {
      'Cloud Concepts': 'cloud_concepts',
      'Architecture & Services': 'architecture_services',
      'Management & Governance': 'management_governance',
    };
    const col = columnMap[q.domain];

    setScores(prev => {
      const current = prev[col];
      const next = isCorrect ? Math.min(100, current + 7) : Math.max(0, current - 3);
      return {
        ...prev,
        [col]: next,
        questions_attempted: prev.questions_attempted + 1,
      };
    });

    // Save to Database (Local & Supabase sync)
    try {
      await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          domain: q.domain,
          correct: isCorrect,
        }),
      });
    } catch {
      // Offline fallback: state already updated
    }
  }, [questions, currentIdx, userEmail, fetchExplanation]);

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(i => i + 1);
    } else {
      // Loop or re-shuffle
      setQuestions(shuffleArray(questions));
      setCurrentIdx(0);
    }
  };

  const handleSendMessage = async (text: string) => {
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setIsAiLoading(true);

    try {
      const response = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          context: `AZ-900 exam prep context. Current question domain: ${questions[currentIdx]?.domain ?? 'General'}. Current concept: ${questions[currentIdx]?.concept ?? 'General'}.`,
        }),
      });
      const data = await response.json();
      setMessages(prev => [...prev, {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: data.reply ?? 'Pole, I could not respond.',
        timestamp: new Date(),
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: `err-${Date.now()}`,
        role: 'system',
        content: '⚠️ Failed to connect to AI tutor.',
        timestamp: new Date(),
      }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  // ─── Sign In Screen ──────────────────────────────────────────
  if (!isSignedIn) {
    return (
      <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
        <div className="bg-animated" />

        <div style={{
          position: 'relative', zIndex: 1,
          minHeight: '100vh',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px',
        }}>
          <div className="glass-card animate-fade-up" style={{
            maxWidth: 460, width: '100%', padding: '40px 36px',
            textAlign: 'center',
          }}>
            {/* Logo */}
            <div style={{
              width: 72, height: 72, borderRadius: '20px',
              background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
              boxShadow: '0 0 40px rgba(99,102,241,0.5)',
              fontSize: '2rem',
            }}>
              🌤️
            </div>

            <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '6px' }}>
              <span className="gradient-text">MawinguPrep</span>
            </h1>
            <p style={{ color: '#9ca3af', fontSize: '0.9rem', marginBottom: '28px' }}>
              AI-powered AZ-900 exam prep for African developers
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                id="email-input"
                type="email"
                className="input-field"
                placeholder="your@email.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSignIn()}
                autoFocus
              />
              <button
                id="start-btn"
                className="btn-primary pulse-glow"
                onClick={handleSignIn}
                disabled={!emailInput.trim()}
                style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
              >
                <CloudLightning size={18} />
                Start Studying
              </button>
            </div>

            {/* Features */}
            <div style={{
              marginTop: '28px',
              display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
              gap: '12px',
            }}>
              {[
                { icon: '🎯', label: '15 AZ-900 Items' },
                { icon: '🤖', label: 'Claude AI Tutor' },
                { icon: '📊', label: 'Readiness Radar' },
              ].map(f => (
                <div key={f.label} style={{
                  padding: '12px 8px',
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}>
                  <div style={{ fontSize: '1.4rem', marginBottom: '4px' }}>{f.icon}</div>
                  <div style={{ fontSize: '0.7rem', color: '#6b7280', fontWeight: 500 }}>{f.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DatabaseModal
          isOpen={isDbModalOpen}
          onClose={() => setIsDbModalOpen(false)}
          onRefresh={reloadDatabase}
        />
      </div>
    );
  }

  const currentQuestion = questions[currentIdx];

  // ─── Dashboard ─────────────────────────────────────────────────
  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <div className="bg-animated" />

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Top Nav */}
        <header style={{
          height: 60,
          borderBottom: '1px solid rgba(99,102,241,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 24px',
          backdropFilter: 'blur(12px)',
          background: 'rgba(10,15,30,0.8)',
          position: 'sticky', top: 0, zIndex: 50,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.4rem' }}>🌤️</span>
            <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>
              <span className="gradient-text">Mawingu</span>
              <span style={{ color: '#f9fafb' }}>Prep</span>
            </span>
            <span style={{
              padding: '2px 8px', borderRadius: '999px',
              background: 'rgba(245,158,11,0.12)',
              border: '1px solid rgba(245,158,11,0.2)',
              color: '#fcd34d', fontSize: '0.65rem', fontWeight: 700,
            }}>
              UNOFFICIAL
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Database Button */}
            <button
              id="db-settings-btn"
              onClick={() => setIsDbModalOpen(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '6px 12px', borderRadius: '8px',
                background: dbStatus?.mode === 'supabase' ? 'rgba(16,185,129,0.15)' : 'rgba(99,102,241,0.15)',
                border: dbStatus?.mode === 'supabase' ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(99,102,241,0.25)',
                color: dbStatus?.mode === 'supabase' ? '#6ee7b7' : '#c7d2fe',
                fontSize: '0.75rem', fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              title="Database & Supabase Connection"
            >
              <Database size={13} />
              <span style={{ display: isMobile ? 'none' : 'inline' }}>
                {dbStatus?.mode === 'supabase' ? 'Supabase Cloud' : 'Database: Active'}
              </span>
            </button>

            {/* Mobile tabs */}
            {isMobile && (
              <div style={{ display: 'flex', gap: '4px' }}>
                {(['quiz', 'tracker'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '8px',
                      border: 'none',
                      background: activeTab === tab
                        ? 'rgba(99,102,241,0.25)'
                        : 'transparent',
                      color: activeTab === tab ? '#a5b4fc' : '#6b7280',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {tab === 'quiz' ? '📝 Quiz' : '📊 Tracker'}
                  </button>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.75rem', fontWeight: 700, color: 'white',
              }}>
                {userEmail[0]?.toUpperCase()}
              </div>
              <span style={{ fontSize: '0.8rem', color: '#9ca3af', display: isMobile ? 'none' : 'block' }}>
                {userEmail}
              </span>
            </div>
          </div>
        </header>

        {/* Main layout */}
        <main style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 380px',
          gap: '20px',
          padding: '20px 24px',
          maxWidth: '1600px',
          margin: '0 auto',
          width: '100%',
        }}>
          {/* Quiz Panel */}
          {(!isMobile || activeTab === 'quiz') && (
            <div className="glass-card" style={{
              padding: '24px',
              display: 'flex', flexDirection: 'column',
              minHeight: isMobile ? 'calc(100vh - 120px)' : 'calc(100vh - 100px)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <BookOpen size={18} color="#6366f1" />
                <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f9fafb' }}>
                  Practice Questions
                </h2>
                <span style={{ fontSize: '0.72rem', color: '#4b5563', marginLeft: 'auto' }}>
                  AZ-900 Skills Outline
                </span>
              </div>

              {currentQuestion ? (
                <QuizCard
                  question={currentQuestion}
                  onAnswer={handleAnswer}
                  onNext={handleNext}
                  questionNumber={currentIdx + 1}
                  totalQuestions={questions.length}
                />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                  <div style={{ textAlign: 'center', color: '#6b7280' }}>
                    <div className="animate-spin" style={{ fontSize: '2rem', marginBottom: '12px' }}>🔄</div>
                    <p style={{ fontSize: '0.85rem' }}>Loading questions from database...</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* AI Coach Chat Panel */}
          {(!isMobile || activeTab === 'quiz') && (
            <div className="glass-card" style={{
              display: 'flex', flexDirection: 'column',
              minHeight: isMobile ? 'calc(100vh - 120px)' : 'calc(100vh - 100px)',
              overflow: 'hidden',
            }}>
              <ChatPanel
                messages={messages}
                onSendMessage={handleSendMessage}
                isLoading={isAiLoading}
              />
            </div>
          )}

          {/* Readiness Panel */}
          {(!isMobile || activeTab === 'tracker') && (
            <div style={{
              overflowY: 'auto',
              paddingBottom: '20px',
            }}>
              <ReadinessPanel scores={scores} userEmail={userEmail} />
            </div>
          )}
        </main>
      </div>

      <DatabaseModal
        isOpen={isDbModalOpen}
        onClose={() => setIsDbModalOpen(false)}
        onRefresh={reloadDatabase}
      />
    </div>
  );
}
