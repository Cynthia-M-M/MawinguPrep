'use client';

import { useState, useEffect } from 'react';
import { Database, CheckCircle2, AlertCircle, X, Copy, ExternalLink, RefreshCw, KeyRound, Globe } from 'lucide-react';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
};

type DbStatus = {
  connected: boolean;
  mode: 'supabase' | 'local';
  provider: string;
  url: string;
  questionsCount: number;
  scoresCount: number;
  message: string;
};

export default function DatabaseModal({ isOpen, onClose, onRefresh }: Props) {
  const [status, setStatus] = useState<DbStatus | null>(null);
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadStatus();
    }
  }, [isOpen]);

  const loadStatus = async () => {
    try {
      const res = await fetch('/api/database');
      const data = await res.json();
      setStatus(data);
      if (data.url && !data.url.includes('Not configured') && !data.url.includes('your_supabase_url_here')) {
        setSupabaseUrl(data.url);
      }
    } catch {
      // offline fallback
    }
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabaseUrl.trim() || !supabaseKey.trim()) {
      setErrorMsg('Please provide both your Supabase URL and Anon Key.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: supabaseUrl, key: supabaseKey }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setErrorMsg(data.error || 'Connection failed. Please check your URL and anon key.');
      } else {
        setSuccessMsg('Successfully connected to Supabase! Database is live and synced.');
        loadStatus();
        onRefresh();
      }
    } catch {
      setErrorMsg('Failed to reach backend server.');
    } finally {
      setIsLoading(false);
    }
  };

  const copySqlSchema = () => {
    const sql = `-- MawinguPrep Supabase Schema
CREATE TABLE IF NOT EXISTS public.readiness_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL UNIQUE,
  cloud_concepts INT DEFAULT 0,
  architecture_services INT DEFAULT 0,
  management_governance INT DEFAULT 0,
  questions_attempted INT DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  domain TEXT NOT NULL,
  concept TEXT NOT NULL,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.readiness_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on readiness_scores" ON public.readiness_scores FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow select on questions" ON public.questions FOR SELECT USING (true);`;

    navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Database & Supabase Connection</h3>
              <p className="text-xs text-slate-400">Live persistence for questions and readiness scores</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
          {/* Status Banner */}
          <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-950/20">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <span className="font-medium text-emerald-300 text-sm">
                  {status?.mode === 'supabase' ? 'Supabase Cloud Database Active' : 'Persistent Local Database Active'}
                </span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-900/60 border border-emerald-500/30 text-emerald-200">
                Connected
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-300 leading-relaxed">
              {status?.message || 'Database is active and ready to store your progress.'}
            </p>
            <div className="mt-3 pt-3 border-t border-emerald-500/10 grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-900/70 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-400 block">Questions Seeded:</span>
                <span className="text-white font-semibold text-sm">{status?.questionsCount ?? 15} questions</span>
              </div>
              <div className="bg-slate-900/70 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-400 block">User Scores Recorded:</span>
                <span className="text-white font-semibold text-sm">{status?.scoresCount ?? 0} learners</span>
              </div>
            </div>
          </div>

          {/* Connect Direct Supabase */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Globe className="w-4 h-4 text-sky-400" />
                Connect Supabase Project Directly
              </h4>
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 transition"
              >
                Open Supabase <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <p className="text-xs text-slate-400">
              Want to connect your own free Supabase cloud instance? Enter your credentials below. We&apos;ll automatically sync your local scores to Supabase!
            </p>

            <form onSubmit={handleConnect} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Project URL
                </label>
                <input
                  type="text"
                  placeholder="https://xyzabcdefg.supabase.co"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center justify-between">
                  <span>Anon Public Key</span>
                  <span className="text-[10px] text-slate-500">From Settings &gt; API</span>
                </label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={supabaseKey}
                    onChange={(e) => setSupabaseKey(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition font-mono text-xs"
                  />
                  <KeyRound className="w-4 h-4 text-slate-500 absolute right-3 top-2.5" />
                </div>
              </div>

              {errorMsg && (
                <div className="flex items-center gap-2 p-3 bg-red-950/40 border border-red-500/30 text-red-300 text-xs rounded-lg">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="flex items-center gap-2 p-3 bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs rounded-lg">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-medium text-sm rounded-lg shadow-lg shadow-sky-500/20 disabled:opacity-50 transition flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Testing & Connecting...
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4" />
                    Save & Connect Supabase
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Quick SQL schema copy */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Supabase SQL Schema</span>
              <button
                onClick={copySqlSchema}
                className="text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center gap-1.5 transition"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy SQL</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              Run this in your Supabase SQL Editor to initialize `readiness_scores` and `questions` tables with RLS enabled.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-sm font-medium text-slate-200 rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
