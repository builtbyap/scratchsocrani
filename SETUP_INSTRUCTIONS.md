# Setup Instructions

## 🚨 Important: Fix Database Schema First

Before using the dashboard, you need to fix the database schema. The current `users` table is missing the `id` column and subscription fields.

## Step 1: Run Database Setup

### Option A: Using the Setup Script (Recommended)

1. Make sure you have the required environment variables in your `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

2. Run the setup script:
   ```bash
   node setup-database.js
   ```

### Option B: Manual SQL Execution

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `fix-database.sql`
4. Execute the SQL

## Step 2: Verify Environment Variables

Run the debug endpoint to check if all environment variables are properly configured:

```bash
curl http://localhost:3000/api/debug-env
```

Or visit: `http://localhost:3000/api/debug-env` in your browser.

## Step 3: Test the Setup

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Try signing in with Google
3. Check if you can access the dashboard

## Step 4: Subscription System

The dashboard now includes subscription protection:

- **SubscriptionGuard**: Wraps the dashboard and checks subscription status
- **NoSubscriptionFallback**: Shows when users don't have an active subscription
- **Webhook Handler**: Processes Stripe events and updates user subscription status

### Testing Subscription Status

1. Create a test subscription in Stripe
2. The webhook will automatically update the user's subscription status
3. Users without subscriptions will see the upgrade prompt

## Troubleshooting

### Still stuck on loading screen?

1. Check the browser console for errors
2. Verify all environment variables are set correctly
3. Ensure the database schema was updated successfully
4. Check the Supabase logs for any errors

### Database errors?

1. Make sure you're using the service role key (not the anon key)
2. Verify your Supabase URL is correct
3. Check that the `users` table has the correct structure

### Webhook issues?

1. Ensure your Stripe webhook endpoint is configured correctly
2. Check that the webhook secret is set in your environment variables
3. Verify the webhook is receiving events from Stripe

## File Structure

```
├── src/
│   ├── components/
│   │   ├── SubscriptionGuard.tsx      # Protects dashboard access
│   │   └── NoSubscriptionFallback.tsx # Shows when no subscription
│   ├── lib/
│   │   └── subscription-sync.ts       # Subscription sync utilities
│   └── app/
│       ├── api/
│       │   ├── webhooks/stripe/route.ts # Stripe webhook handler
│       │   └── debug-env/route.ts      # Environment debug endpoint
│       └── dashboard/
│           └── page.tsx               # Dashboard with subscription guard
├── fix-database.sql                   # Database schema fix
├── setup-database.js                  # Automated setup script
└── SETUP_INSTRUCTIONS.md              # This file
```

## Environment Variables Checklist

Make sure these are set in your `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_publishable_key
STRIPE_SECRET_KEY=your_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

## Next Steps

After completing the setup:

1. Test the subscription flow
2. Configure Stripe webhooks in production
3. Set up proper error monitoring
4. Test the complete user journey

## Support

If you encounter issues:

1. Check the browser console for errors
2. Review the Supabase logs
3. Verify all environment variables
4. Ensure the database schema is correct 