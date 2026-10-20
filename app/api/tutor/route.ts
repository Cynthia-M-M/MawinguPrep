import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message, context } = await req.json();

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey || apiKey === 'your_claude_api_key_here' || apiKey.trim() === '') {
      return NextResponse.json({
        reply: `⚠️ Claude API key not configured yet. Add your \`ANTHROPIC_API_KEY\` in \`.env.local\` to enable dynamic AI explanations.\n\nQuick Insight: ${context ? `For **${context}**, think of cloud computing like a communal solar grid or M-Pesa network: you tap into power and utility only when you need it and only pay for what you consume!` : 'Practice makes progress! Kazi iendelee!'}`
      });
    }

    const systemPrompt = `You are MawinguPrep, an unofficial Microsoft AZ-900 exam tutor designed for African software developers. 
Your goal is to explain Azure concepts using highly relatable, everyday African analogies (e.g., matatus, M-Pesa, mama mboga, local markets, jua kali artisans, MPESA lipa na mpesa, boda bodas, chamas, harvest seasons, power grids).
${context ? `Current Context: ${context}` : ''}

Rules:
1. Explain the Azure concept clearly, strictly aligning with the AZ-900 skills outline from Microsoft Learn.
2. Provide a 1-2 sentence local African analogy to anchor the concept in everyday life.
3. Keep responses under 120 words.
4. End with one short encouragement line using African proverbs or dev slang.
5. Maintain an encouraging, peer-to-peer developer tone — like a fellow dev from Nairobi, Lagos, or Accra helping you out.
6. Never copy or reveal real exam questions. Always note this is an UNOFFICIAL prep tool.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 300,
        system: systemPrompt,
        messages: [{ role: 'user', content: message }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Anthropic API Error:', err);
      return NextResponse.json({ error: 'AI service unavailable' }, { status: 502 });
    }

    const data = await response.json();
    const reply = data.content?.[0]?.text ?? 'Pole sana, I could not generate an explanation right now.';

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Tutor route error:', error);
    return NextResponse.json({ error: 'Failed to generate explanation' }, { status: 500 });
  }
}
