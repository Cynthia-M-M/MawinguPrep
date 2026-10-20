import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const isValidUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

export const supabase = (isValidUrl(supabaseUrl) && !supabaseUrl.includes('your_supabase_url_here'))
  ? createClient(supabaseUrl, supabaseAnonKey || 'placeholder-key')
  : null;

export type Question = {
  id: string;
  domain: 'Cloud Concepts' | 'Architecture & Services' | 'Management & Governance';
  concept: string;
  question_text: string;
  options: string[];
  correct_answer: string;
};

export type ReadinessScore = {
  id: string;
  user_email: string;
  cloud_concepts: number;
  architecture_services: number;
  management_governance: number;
  questions_attempted: number;
  updated_at: string;
};
