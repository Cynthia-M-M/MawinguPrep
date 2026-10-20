'use client';

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { Trophy, TrendingUp, Target, Zap } from 'lucide-react';

type Scores = {
  cloud_concepts: number;
  architecture_services: number;
  management_governance: number;
  questions_attempted: number;
};

type Props = {
  scores: Scores;
  userEmail: string;
};

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { value: number; payload: { domain: string } }[] }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(17, 24, 39, 0.95)',
        border: '1px solid rgba(99,102,241,0.3)',
        borderRadius: '10px',
        padding: '10px 14px',
        fontSize: '0.8rem',
      }}>
        <p style={{ color: '#a5b4fc', fontWeight: 600 }}>{payload[0].payload.domain}</p>
        <p style={{ color: '#f9fafb' }}><strong>{payload[0].value}%</strong> readiness</p>
      </div>
    );
  }
  return null;
};

export default function ReadinessPanel({ scores, userEmail }: Props) {
  const chartData = [
    { domain: 'Cloud Concepts', value: scores.cloud_concepts, fullMark: 100 },
    { domain: 'Architecture & Services', value: scores.architecture_services, fullMark: 100 },
    { domain: 'Management & Governance', value: scores.management_governance, fullMark: 100 },
  ];

  const overall = Math.round(
    (scores.cloud_concepts + scores.architecture_services + scores.management_governance) / 3
  );

  const getReadinessLabel = (score: number) => {
    if (score >= 80) return { label: 'Exam Ready! 🎉', color: '#10b981' };
    if (score >= 60) return { label: 'Getting There ⚡', color: '#f59e0b' };
    if (score >= 40) return { label: 'Keep Grinding 💪', color: '#6366f1' };
    return { label: 'Just Starting 🌱', color: '#06b6d4' };
  };

  const readiness = getReadinessLabel(overall);

  const domainStats = [
    {
      name: 'Cloud Concepts',
      score: scores.cloud_concepts,
      icon: '☁️',
      color: '#6366f1',
      gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    },
    {
      name: 'Architecture & Services',
      score: scores.architecture_services,
      icon: '⚡',
      color: '#06b6d4',
      gradient: 'linear-gradient(135deg, #06b6d4, #0284c7)',
    },
    {
      name: 'Management & Governance',
      score: scores.management_governance,
      icon: '🛡️',
      color: '#10b981',
      gradient: 'linear-gradient(135deg, #10b981, #059669)',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: 40, height: 40, borderRadius: '12px',
            background: 'linear-gradient(135deg, #f59e0b, #f97316)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.2rem',
          }}>
            📊
          </div>
          <div>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#f9fafb' }}>Readiness Tracker</h2>
            <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>{userEmail}</p>
          </div>
        </div>
        <div style={{
          padding: '6px 14px',
          borderRadius: '999px',
          background: `${readiness.color}22`,
          border: `1px solid ${readiness.color}44`,
          color: readiness.color,
          fontSize: '0.75rem',
          fontWeight: 700,
        }}>
          {readiness.label}
        </div>
      </div>

      {/* Overall Score */}
      <div className="glass-card" style={{ padding: '20px', textAlign: 'center', background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(6,182,212,0.05))' }}>
        <div style={{ fontSize: '3rem', fontWeight: 800 }} className="gradient-text">
          {overall}%
        </div>
        <p style={{ color: '#9ca3af', fontSize: '0.8rem', marginTop: '4px' }}>Overall AZ-900 Readiness</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '8px' }}>
          <Trophy size={14} color="#f59e0b" />
          <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
            {scores.questions_attempted} question{scores.questions_attempted !== 1 ? 's' : ''} attempted
          </span>
        </div>
      </div>

      {/* Radar Chart */}
      <div className="glass-card" style={{ padding: '16px', flex: 1, minHeight: 260 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Target size={16} color="#6366f1" />
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#9ca3af' }}>Domain Radar</span>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <RadarChart data={chartData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
            <PolarGrid stroke="rgba(255,255,255,0.06)" />
            <PolarAngleAxis
              dataKey="domain"
              tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 500 }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fontSize: 9, fill: '#4b5563' }}
              tickCount={5}
            />
            <Tooltip content={<CustomTooltip />} />
            <Radar
              name="Readiness"
              dataKey="value"
              stroke="url(#radarGradient)"
              fill="url(#radarFill)"
              strokeWidth={2}
              dot={{ fill: '#6366f1', r: 4, strokeWidth: 2, stroke: '#fff' }}
            />
            <defs>
              <linearGradient id="radarGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
              <radialGradient id="radarFill" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.1} />
              </radialGradient>
            </defs>
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Domain Bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {domainStats.map((d) => (
          <div key={d.name} className="glass-card" style={{ padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1rem' }}>{d.icon}</span>
                <span style={{ fontSize: '0.8rem', color: '#d1d5db', fontWeight: 500 }}>
                  {d.name}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <TrendingUp size={12} color={d.color} />
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: d.color }}>
                  {d.score}%
                </span>
              </div>
            </div>
            <div className="progress-bar-track">
              <div
                className="progress-bar-fill"
                style={{
                  width: `${d.score}%`,
                  background: d.gradient,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Tip */}
      {overall < 70 && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '12px',
          background: 'rgba(245, 158, 11, 0.08)',
          border: '1px solid rgba(245, 158, 11, 0.2)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px',
        }}>
          <Zap size={16} color="#f59e0b" style={{ marginTop: 2, flexShrink: 0 }} />
          <p style={{ fontSize: '0.78rem', color: '#fcd34d', lineHeight: 1.5 }}>
            <strong>Tip:</strong> Focus on your weakest domain first. Like a mama mboga restocking her lowest-selling item — target what needs attention!
          </p>
        </div>
      )}
    </div>
  );
}
