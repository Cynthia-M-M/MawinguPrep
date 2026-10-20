import fs from 'fs';
import path from 'path';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SEED_QUESTIONS } from './questions';
import { Question, ReadinessScore } from './supabase';

interface DatabaseSchema {
  questions: Question[];
  readiness_scores: ReadinessScore[];
  config?: {
    supabase_url?: string;
    supabase_key?: string;
  };
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

// Ensure data directory and database file exist
function initLocalDb(): DatabaseSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    const initialData: DatabaseSchema = {
      questions: SEED_QUESTIONS,
      readiness_scores: [],
      config: {},
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }

  try {
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(content) as DatabaseSchema;
    if (!parsed.questions || parsed.questions.length === 0) {
      parsed.questions = SEED_QUESTIONS;
      fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), 'utf-8');
    }
    return parsed;
  } catch (e) {
    console.error('Error reading local database, resetting to seed:', e);
    const initialData: DatabaseSchema = {
      questions: SEED_QUESTIONS,
      readiness_scores: [],
      config: {},
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }
}

function saveLocalDb(data: DatabaseSchema) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save local database:', err);
  }
}

export function getActiveSupabaseClient(): SupabaseClient | null {
  const localDb = initLocalDb();
  const url = localDb.config?.supabase_url || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = localDb.config?.supabase_key || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (
    !url ||
    !key ||
    !url.startsWith('http') ||
    url.includes('your_supabase_url_here') ||
    key.includes('your_supabase_anon_key_here')
  ) {
    return null;
  }

  try {
    return createClient(url, key);
  } catch (err) {
    console.warn('Failed to create Supabase client:', err);
    return null;
  }
}

export async function getDbStatus() {
  const localDb = initLocalDb();
  const supabase = getActiveSupabaseClient();
  const currentUrl = localDb.config?.supabase_url || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const isPlaceholder = !currentUrl || currentUrl.includes('your_supabase_url_here');

  if (supabase && !isPlaceholder) {
    try {
      const { data, error } = await supabase.from('readiness_scores').select('id').limit(1);
      if (!error) {
        return {
          connected: true,
          mode: 'supabase',
          provider: 'Supabase Cloud PostgreSQL',
          url: currentUrl,
          questionsCount: localDb.questions.length,
          scoresCount: localDb.readiness_scores.length,
          message: 'Connected directly to live Supabase backend',
        };
      }
    } catch {
      // fallback
    }
  }

  return {
    connected: true,
    mode: 'local',
    provider: 'Persistent Local Database (Embedded)',
    url: isPlaceholder ? 'Not configured (using local DB)' : currentUrl,
    questionsCount: localDb.questions.length,
    scoresCount: localDb.readiness_scores.length,
    message: 'Local embedded database active with 15 questions and user scores persisted to disk.',
  };
}

export async function fetchQuestions(): Promise<Question[]> {
  const supabase = getActiveSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('questions').select('*');
      if (!error && data && data.length > 0) {
        return data as Question[];
      }
    } catch (err) {
      console.warn('Supabase questions fetch failed, using local DB:', err);
    }
  }

  const localDb = initLocalDb();
  return localDb.questions;
}

export async function fetchUserScore(email: string): Promise<ReadinessScore | null> {
  const normalizedEmail = email.trim().toLowerCase();
  const supabase = getActiveSupabaseClient();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('readiness_scores')
        .select('*')
        .eq('user_email', normalizedEmail)
        .single();

      if (!error && data) {
        return data as ReadinessScore;
      }
    } catch (err) {
      console.warn('Supabase score fetch failed, using local DB:', err);
    }
  }

  const localDb = initLocalDb();
  const existing = localDb.readiness_scores.find(
    (s) => s.user_email.toLowerCase() === normalizedEmail
  );
  return existing || null;
}

export async function updateUserScore(
  email: string,
  domain: string,
  correct: boolean
): Promise<{ success: boolean; score: ReadinessScore }> {
  const normalizedEmail = email.trim().toLowerCase();
  const columnMap: Record<string, keyof ReadinessScore> = {
    'Cloud Concepts': 'cloud_concepts',
    'Architecture & Services': 'architecture_services',
    'Management & Governance': 'management_governance',
  };

  const col = columnMap[domain];
  if (!col) {
    throw new Error(`Unknown domain: ${domain}`);
  }

  const localDb = initLocalDb();
  let existing = localDb.readiness_scores.find(
    (s) => s.user_email.toLowerCase() === normalizedEmail
  );

  const currentScore = (existing?.[col] as number) ?? 0;
  const attempted = existing?.questions_attempted ?? 0;
  const newDomainScore = correct ? Math.min(100, currentScore + 7) : Math.max(0, currentScore - 3);

  const updatedScore: ReadinessScore = {
    id: existing?.id || `score-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    user_email: normalizedEmail,
    cloud_concepts: existing?.cloud_concepts ?? 0,
    architecture_services: existing?.architecture_services ?? 0,
    management_governance: existing?.management_governance ?? 0,
    [col]: newDomainScore,
    questions_attempted: attempted + 1,
    updated_at: new Date().toISOString(),
  };

  if (existing) {
    const idx = localDb.readiness_scores.findIndex(
      (s) => s.user_email.toLowerCase() === normalizedEmail
    );
    localDb.readiness_scores[idx] = updatedScore;
  } else {
    localDb.readiness_scores.push(updatedScore);
  }
  saveLocalDb(localDb);

  // Sync to Supabase if available
  const supabase = getActiveSupabaseClient();
  if (supabase) {
    try {
      const { data: remoteExisting } = await supabase
        .from('readiness_scores')
        .select('*')
        .eq('user_email', normalizedEmail)
        .single();

      if (remoteExisting) {
        await supabase
          .from('readiness_scores')
          .update({
            [col]: newDomainScore,
            questions_attempted: attempted + 1,
            updated_at: updatedScore.updated_at,
          })
          .eq('user_email', normalizedEmail);
      } else {
        await supabase.from('readiness_scores').insert(updatedScore);
      }
    } catch (err) {
      console.warn('Could not sync score to Supabase, saved locally:', err);
    }
  }

  return { success: true, score: updatedScore };
}

export async function saveSupabaseDirectConfig(url: string, key: string) {
  const localDb = initLocalDb();
  localDb.config = {
    supabase_url: url.trim(),
    supabase_key: key.trim(),
  };
  saveLocalDb(localDb);

  // Update .env.local file as well
  try {
    const envPath = path.join(process.cwd(), '.env.local');
    let envContent = '';
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf-8');
    }

    const lines = envContent.split('\n');
    let hasUrl = false;
    let hasKey = false;

    const newLines = lines.map((line) => {
      if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
        hasUrl = true;
        return `NEXT_PUBLIC_SUPABASE_URL=${url.trim()}`;
      }
      if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
        hasKey = true;
        return `NEXT_PUBLIC_SUPABASE_ANON_KEY=${key.trim()}`;
      }
      return line;
    });

    if (!hasUrl) newLines.push(`NEXT_PUBLIC_SUPABASE_URL=${url.trim()}`);
    if (!hasKey) newLines.push(`NEXT_PUBLIC_SUPABASE_ANON_KEY=${key.trim()}`);

    fs.writeFileSync(envPath, newLines.join('\n'), 'utf-8');
  } catch (err) {
    console.warn('Failed to update .env.local:', err);
  }

  // Test client
  const client = createClient(url.trim(), key.trim());
  const { error } = await client.from('readiness_scores').select('id').limit(1);
  return { success: !error, error: error?.message };
}
