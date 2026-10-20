# 🌤️ MawinguPrep — AZ-900 AI Exam Prep for African Developers

> **⚠️ UNOFFICIAL STUDY TOOL** — MawinguPrep is an independent educational tool not affiliated with, sponsored by, or endorsed by Microsoft. All questions are original practice items created based on the public AZ-900 skills outline from Microsoft Learn. This tool does not contain actual exam questions.

---

## 🌍 Overview

**MawinguPrep** ("Mawingu" is Swahili for *Clouds*) is a tailored Microsoft Azure AZ-900 certification preparation dashboard designed specifically for software developers across Kenya, Nigeria, Ghana, South Africa, and the wider African continent.

It pairs interactive practice questions with an **AI Azure Exam Coach** powered by Claude 3.5 Sonnet that uses **relatable African real-world analogies** (such as *M-Pesa*, *matatus*, *mama mboga*, *chamas*, and *solar microgrids*) to make complex cloud infrastructure concepts stick instantly.

---

## 🚀 Key Features

1. **Official AZ-900 Domain Coverage**:
   - **Cloud Concepts (25–30%)**: High availability, scalability, elasticity, CapEx vs. OpEx, cloud service models (IaaS/PaaS/SaaS).
   - **Azure Architecture & Services (35–40%)**: Regions, Availability Zones, Azure VMs, App Services, Azure Functions, Blob Storage, VNets.
   - **Azure Management & Governance (30–35%)**: Azure Policy, RBAC, Cost Management, Budgets, ARM Templates, Service Health.

2. **Smart Readiness Score Tracker**:
   - Tracks your mastery percentage across each domain.
   - Dynamic visual radar & progress bars.
   - Calculates your aggregate exam readiness score (target: 70%+ / 700 on real exam).
   - Identifies your weakest areas and surfaces targeted study recommendations.

3. **Contextual AI Azure Coach (Claude 3.5 Sonnet)**:
   - Evaluates both correct and incorrect answers with immediate feedback.
   - Explains concepts using African daily analogies (e.g., comparing Azure Blob Storage to a communal harvest grain silo, or Azure Functions to paying a boda boda on-demand).
   - Interactive Q&A chat to ask follow-up questions at any time.

4. **Modern High-Performance Tech Stack**:
   - Built with **Next.js 16** (App Router & Turbopack), **React 19**, **Tailwind CSS v4**, and **Lucide Icons**.
   - Backed by **Supabase** (PostgreSQL with Row Level Security) for persistent readiness score tracking.

---

## 📁 Project Structure

```text
mawinguprep/
├── app/
│   ├── api/
│   │   ├── scores/route.ts       # Endpoint to fetch and update readiness scores in Supabase
│   │   └── tutor/route.ts        # Claude 3.5 Sonnet exam tutor with African context
│   ├── globals.css              # Custom styling, dark mode accents & animations
│   ├── layout.tsx               # Root layout with fonts & metadata
│   └── page.tsx                 # 3-column split layout (Quiz | Chat Coach | Readiness Tracker)
├── components/
│   ├── ChatPanel.tsx            # Interactive AI coach interface
│   ├── QuizCard.tsx             # Interactive question card with options and explanations
│   └── ReadinessPanel.tsx       # Live readiness metrics and domain radar
├── lib/
│   ├── questions.ts             # 15 high-quality seed questions across the 3 domains
│   └── supabase.ts              # Supabase client initialization
├── supabase/
│   └── schema.sql               # Database migration script (tables, policies, seed data)
├── .env.local                   # API keys and Supabase credentials
└── README.md
```

---

## 🛠️ Getting Started

### 1. Prerequisites
- Node.js 18+ installed
- A free [Supabase](https://supabase.com) account
- An [Anthropic](https://console.anthropic.com) API key

### 2. Set Up Supabase
1. Create a new Supabase project.
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Open `supabase/schema.sql` from this repository, paste its contents into the editor, and click **Run**.
4. Retrieve your **Project URL** and **anon public key** from Project Settings > API.

### 3. Configure Environment Variables
Edit `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
ANTHROPIC_API_KEY=sk-ant-api03-...
```

### 4. Run Locally
```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧠 AI Prompting Strategy

The AI tutor uses a system prompt optimized for rapid cognitive anchoring:
- **Strict Microsoft Learn Alignment**: Accurate technical definitions for AZ-900.
- **Everyday African Analogies**: Relatable mental models (M-Pesa API, matatu stage routing, mama mboga inventory).
- **Concise & Direct**: Explanations under 120 words to prevent cognitive overload during quiz sessions.
- **Empowering Tone**: Peer-to-peer developer camaraderie from Nairobi, Lagos, or Accra.

---

## 📄 License & Disclaimer
This project is an open educational resource built for the African tech developer community. Microsoft and Azure are registered trademarks of Microsoft Corporation.
