# Authentication Setup Guide

## 🚀 Quick Start

This guide will help you set up Clerk authentication and Supabase database for Tense Playground.

---

## 📋 Prerequisites

- Node.js 18+ installed
- Tense Playground project cloned
- Clerk account (free): https://clerk.com
- Supabase account (free): https://supabase.com

---

## 🔐 Step 1: Set Up Clerk Authentication

### 1.1 Create Clerk Application

1. Go to https://dashboard.clerk.com/
2. Click "Create Application"
3. Name it "Tense Playground"
4. Choose authentication methods:
   - ✅ Email/Password  
   - ✅ Google OAuth
   - ✅ GitHub OAuth (optional)
5. Click "Create Application"

### 1.2 Get Clerk API Keys

From your Clerk dashboard:
1. Go to **API Keys** section
2. Copy these values:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (starts with `pk_test_`)
   - `CLERK_SECRET_KEY` (starts with `sk_test_`)

### 1.3 Configure Clerk Webhooks

1. In Clerk Dashboard, go to **Webhooks**
2. Click "+ Add Endpoint"
3. Set endpoint URL: `https://your-domain.com/api/webhooks/clerk`
   - For local testing: Use ngrok or similar tunnel
4. Subscribe to events:
   - ✅ `user.created`
   - ✅ `user.updated`
   - ✅ `user.deleted`
5. Copy the **Signing Secret** (starts with `whsec_`)

---

## 🗄️ Step 2: Set Up Supabase Database

### 2.1 Create Supabase Project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Fill in details:
   - Name: `Tense Playground`
   - Database Password: (choose a strong password - save it!)
   - Region: (choose closest to your users)
4. Click "Create new project"
5. Wait for project to be provisioned (~2 minutes)

### 2.2 Get Supabase API Keys

From your Supabase project dashboard:
1. Go to **Settings** → **API**
2. Copy these values:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ Keep secret!

### 2.3 Run Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Open the file: `supabase/schema.sql` from this project
3. Copy the entire contents
4. Paste into SQL Editor
5. Click "Run" to execute
6. Verify tables created:
   - Go to **Table Editor**
   - You should see: `users`, `user_progress`, `user_streaks`, `user_challenges`, `user_badges`

---

## 🔧 Step 3: Configure Environment Variables

### 3.1 Create .env.local File

In the root of `tense-playground` project, create `.env.local`:

```bash
# Copy from ENV_SETUP.md or use this template:

# Google Gemini AI (existing)
GEMINI_API_KEY=your_gemini_key_here

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/profile

# Clerk Webhook
CLERK_WEBHOOK_SECRET=whsec_xxxxx

# Supabase Database
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx
```

### 3.2 Important Notes

- ⚠️ **Never commit `.env.local` to Git** (already in `.gitignore`)
- ⚠️ Use different keys for production vs development
- ⚠️ Keep `SUPABASE_SERVICE_ROLE_KEY` secret - only use server-side

---

## 🧪 Step 4: Test the Setup

### 4.1 Start Development Server

```bash
npm run dev
```

### 4.2 Test Authentication Flow

1. Open http://localhost:3000
2. Click "Sign In" button in header
3. Try signing up with email
4. Check Clerk dashboard → Users (should see new user)
5. Check Supabase → Table Editor → `users` (webhook should create entry)

### 4.3 Test Profile Page

1. Sign in to the app
2. Click on your avatar in header
3. Access `/profile` page
4. Verify your info displays

---

## 🔄 Step 5: Create Webhook Endpoint (Optional for Now)

The webhook will auto-create database entries when users sign up. To implement:

1. Create `/app/api/webhooks/clerk/route.ts` (starter code):

```typescript
import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error('Webhook secret not configured')
  }

  // Get headers
  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Missing svix headers', { status: 400 })
  }

  // Get body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Verify webhook
  const wh = new Webhook(WEBHOOK_SECRET)
  let evt: WebhookEvent

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Webhook verification failed:', err)
    return new Response('Verification failed', { status: 400 })
  }

  // Handle the webhook
  const eventType = evt.type

  if (eventType === 'user.created') {
    const { id, email_addresses, username, image_url } = evt.data

    // Create user in Supabase
    const { error } = await supabaseAdmin
      .from('users')
      .insert({
        clerk_id: id,
        email: email_addresses[0]?.email_address,
        username: username,
        avatar_url: image_url,
      })

    if (error) {
      console.error('Failed to create user in Supabase:', error)
      return new Response('Database error', { status: 500 })
    }
  }

  return new Response('Webhook received', { status: 200 })
}
```

2. Install svix: `npm install svix`
3. Test webhook with Clerk dashboard test feature

---

## ✅ Verification Checklist

- [ ] Clerk application created
- [ ] Clerk API keys added to `.env.local`
- [ ] Supabase project created
- [ ] Supabase database schema executed
- [ ] Supabase API keys added to `.env.local`
- [ ] Development server runs without errors
- [ ] Can sign up new user
- [ ] Can sign in
- [ ] User appears in Clerk dashboard
- [ ] Can access `/profile` page when signed in
- [ ] Sign out works

---

## 🐛 Troubleshooting

### "User not authenticated" error
- Check if Clerk keys are correct in `.env.local`
- Restart dev server after adding env variables
- Clear browser cookies and try again

### Can't access /profile page
- Ensure middleware.ts is in project root
- Check that you're signed in
- Verify Clerk is properly configured

### Database connection errors
- Verify Supabase URL and keys are correct
- Check if database schema was executed successfully
- Ensure RLS policies are properly set

### Webhook not working
- Verify webhook secret is correct
- For local dev, use ngrok: `ngrok http 3000`
- Check webhook logs in Clerk dashboard

---

## 📚 Next Steps

Once basic auth is working:

1. Implement data migration from localStorage to database
2. Create API routes for syncing progress, streaks, challenges
3. Add leaderboard page
4. Build advanced profile features
5. Add social features

---

## 🆘 Need Help?

- Clerk Docs: https://clerk.com/docs
- Supabase Docs: https://supabase.com/docs
- Next.js Docs: https://nextjs.org/docs

---

**Remember:** Keep your secret keys safe and never commit them to version control!
