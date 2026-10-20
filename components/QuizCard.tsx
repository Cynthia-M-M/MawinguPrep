'use client';

import { useState } from 'react';
import { CheckCircle2, XCircle, ChevronRight, RotateCcw } from 'lucide-react';
import { Question } from '@/lib/supabase';
import { DOMAIN_COLORS } from '@/lib/questions';

type Props = {
  question: Question;
  onAnswer: (answer: string, correct: boolean) => void;
  onNext: () => void;
  questionNumber: number;
  totalQuestions: number;
};

export default function QuizCard({ question, onAnswer, onNext, questionNumber, totalQuestions }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);

  const domainColorKey = question.domain as keyof typeof DOMAIN_COLORS;
  const domainColor = DOMAIN_COLORS[domainColorKey] ?? '#6366f1';

  const getDomainClass = () => {
    if (question.domain === 'Cloud Concepts') return 'cloud';
    if (question.domain === 'Architecture & Services') return 'arch';
    return 'mgmt';
  };

  const handleSelect = (option: string) => {
    if (answered) return;
    setSelected(option);
    setAnswered(true);
    const isCorrect = option === question.correct_answer;
    onAnswer(option, isCorrect);
  };

  const getOptionClass = (option: string) => {
    if (!answered) return '';
    if (option === question.correct_answer) return 'correct';
    if (option === selected && option !== question.correct_answer) return 'wrong';
    return 'neutral';
  };

  const getOptionIcon = (option: string) => {
    if (!answered) return null;
    if (option === question.correct_answer)
      return <CheckCircle2 size={16} color="#10b981" style={{ flexShrink: 0 }} />;
    if (option === selected && option !== question.correct_answer)
      return <XCircle size={16} color="#f43f5e" style={{ flexShrink: 0 }} />;
    return null;
  };

  const isCorrect = selected === question.correct_answer;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}>
      {/* Progress */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '0.75rem', color: '#6b7280', whiteSpace: 'nowrap' }}>
          {questionNumber} / {totalQuestions}
        </span>
        <div className="progress-bar-track" style={{ flex: 1 }}>
          <div
            className="progress-bar-fill"
            style={{
              width: `${(questionNumber / totalQuestions) * 100}%`,
              background: 'linear-gradient(90deg, #6366f1, #06b6d4)',
            }}
          />
        </div>
        <span style={{ fontSize: '0.75rem', color: '#6b7280', whiteSpace: 'nowrap' }}>
          {Math.round((questionNumber / totalQuestions) * 100)}%
        </span>
      </div>

      {/* Domain Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span className={`domain-badge ${getDomainClass()}`}>
          {question.domain}
        </span>
        <span style={{ fontSize: '0.75rem', color: '#4b5563' }}>
          {question.concept}
        </span>
      </div>

      {/* Question */}
      <div
        className="glass-card"
        style={{
          padding: '20px',
          background: `linear-gradient(135deg, ${domainColor}11, transparent)`,
          borderColor: `${domainColor}22`,
        }}
      >
        <p style={{ fontSize: '0.95rem', lineHeight: 1.7, color: '#f3f4f6', fontWeight: 500 }}>
          {question.question_text}
        </p>
      </div>

      {/* Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
        {question.options.map((option, i) => (
          <button
            key={i}
            id={`option-${i}`}
            className={`option-btn ${getOptionClass(option)}`}
            onClick={() => handleSelect(option)}
            disabled={answered}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative', zIndex: 1 }}>
              <span style={{
                width: 24, height: 24, borderRadius: '50%',
                background: answered && option === question.correct_answer
                  ? 'rgba(16,185,129,0.2)'
                  : answered && option === selected && !isCorrect
                  ? 'rgba(244,63,94,0.2)'
                  : 'rgba(255,255,255,0.06)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.7rem', fontWeight: 700, color: '#9ca3af',
                flexShrink: 0,
              }}>
                {String.fromCharCode(65 + i)}
              </span>
              <span style={{ flex: 1 }}>{option}</span>
              {getOptionIcon(option)}
            </div>
          </button>
        ))}
      </div>

      {/* Result + Next */}
      {answered && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div className={`result-toast ${isCorrect ? 'correct' : 'wrong'}`}>
            {isCorrect ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
            <span>
              {isCorrect
                ? `Correct! Poa sana! ✨ The AI buddy is explaining this below.`
                : `Pole! The correct answer is "${question.correct_answer}". See the explanation below.`}
            </span>
          </div>

          <button
            id="next-question-btn"
            className="btn-primary"
            onClick={() => {
              setSelected(null);
              setAnswered(false);
              onNext();
            }}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {questionNumber >= totalQuestions ? (
              <>
                <RotateCcw size={16} />
                Restart Quiz
              </>
            ) : (
              <>
                Next Question
                <ChevronRight size={16} />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
