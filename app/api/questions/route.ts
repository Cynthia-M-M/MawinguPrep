import { NextResponse } from 'next/server';
import { fetchQuestions } from '@/lib/db';

export async function GET() {
  try {
    const questions = await fetchQuestions();
    return NextResponse.json({ questions });
  } catch (error) {
    console.error('Questions GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
  }
}
