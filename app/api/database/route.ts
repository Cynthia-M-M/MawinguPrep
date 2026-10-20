import { NextResponse } from 'next/server';
import { getDbStatus, saveSupabaseDirectConfig } from '@/lib/db';

export async function GET() {
  try {
    const status = await getDbStatus();
    return NextResponse.json(status);
  } catch (error) {
    console.error('Database GET status error:', error);
    return NextResponse.json({ error: 'Failed to inspect database status' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { url, key } = await req.json();

    if (!url || !key) {
      return NextResponse.json({ error: 'Both Supabase URL and Anon Key are required.' }, { status: 400 });
    }

    const result = await saveSupabaseDirectConfig(url, key);
    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error('Database POST error:', error);
    const msg = error instanceof Error ? error.message : 'Failed to connect database';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
