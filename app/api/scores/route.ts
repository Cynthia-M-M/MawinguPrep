import { NextResponse } from 'next/server';
import { fetchUserScore, updateUserScore } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    const score = await fetchUserScore(email);
    return NextResponse.json({ score });
  } catch (error) {
    console.error('Scores GET error:', error);
    return NextResponse.json({ error: 'Failed to retrieve score' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, domain, correct } = body;

    if (!email || !domain) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const result = await updateUserScore(email, domain, correct);
    return NextResponse.json({ success: true, score: result.score });
  } catch (error: unknown) {
    console.error('Scores POST error:', error);
    const msg = error instanceof Error ? error.message : 'Failed to update score';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
