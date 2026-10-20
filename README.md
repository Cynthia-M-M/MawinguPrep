# MawinguPrep

### AZ-900 practice for African developers

**Author:** Cynthia Mogaka

**Live demo:** [mawinguprep.netlify.app](https://mawinguprep.netlify.app)

**Pitch deck:** [View the MawinguPrep pitch deck](https://canva.link/hmgzevitnljerjw)

**Video demo:** [Watch MawinguPrep_HackathonDemo.mp4](https://1drv.ms/v/c/2bb2f9afc8ae1149/IQA5ufm67VqiRpu5dT7wP59SAVverJ9PxxhpLpd3Duoa9NA?e=b6jOcR)

Mawingu means "clouds" in Swahili. MawinguPrep is an interactive study tool for people preparing for the Microsoft Azure Fundamentals (AZ-900) certification, with examples grounded in everyday African contexts.

> **Disclaimer:** MawinguPrep is an independent, unofficial study tool. It is not affiliated with, sponsored by, or endorsed by Microsoft. Practice questions are original and based on the public AZ-900 skills outline; this project does not provide real exam questions.

## Features

- Practice questions across Cloud Concepts, Azure Architecture and Services, and Azure Management and Governance.
- Readiness dashboard that tracks performance across the exam domains and highlights areas to review.
- AI tutor for explanations and follow-up questions, with examples such as M-Pesa, matatus, local markets, and solar microgrids.
- Supabase integration for cloud-backed questions and score storage. Without Supabase credentials, the app falls back to its local JSON data store; local file storage is not persistent on serverless hosting.

## Tech Stack

- Next.js 16 App Router and React 19
- TypeScript and Tailwind CSS 4
- Supabase (optional) for hosted PostgreSQL data
- Anthropic API (optional) for AI tutoring
- Netlify for hosting

## Run Locally

### Requirements

- Node.js and npm
- A Supabase project and Anthropic API key if you want cloud-backed scores and AI tutoring

### Install and start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

Create a `.env.local` file in the project root. Supabase and Anthropic are optional for local development; configure them to enable hosted score storage and AI tutoring.

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
ANTHROPIC_API_KEY=your-anthropic-api-key
```

To configure Supabase, run [`supabase/schema.sql`](supabase/schema.sql) in the Supabase SQL Editor, then copy the project URL and anon key from the Supabase project settings. Never commit `.env.local` or expose the Anthropic API key in client-side code.

## Deploy

The production site is hosted on Netlify. For another deployment, set the environment variables in the host's environment settings and use:

```bash
npm run build
```

For persistent scores in production, configure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Set `ANTHROPIC_API_KEY` to enable the AI tutor.

## Project Structure

```text
app/                 Next.js pages and API routes
components/          Quiz, chat, readiness, and database UI
data/database.json   Local fallback data
lib/                 Database, question, and Supabase utilities
supabase/schema.sql  Supabase schema and policies
```

## License and Trademarks

This project is an educational resource for the African developer community. Microsoft and Azure are trademarks of Microsoft Corporation. No affiliation or endorsement is implied.
