# 🚀 Stripe Payment System Setup Guide

## ✅ **What's Already Done:**

1. **✅ Stripe Dependencies** - `stripe` and `@stripe/stripe-js` installed
2. **✅ API Routes** - Checkout session and webhook handlers created
3. **✅ Pricing Page** - Beautiful pricing page with subscription plans
4. **✅ Environment Variables** - Your live Stripe keys configured
5. **✅ Product IDs** - Your actual Stripe price IDs integrated

## 🔧 **Next Steps to Complete Setup:**

### **1. Set Up Supabase Database**

1. **Go to your Supabase Dashboard**: https://supabase.com/dashboard/project/jlkebdnvjjdwedmbfqou
2. **Navigate to SQL Editor**
3. **Copy and paste the entire contents of `supabase-schema.sql`**
4. **Click "Run" to execute the SQL**

This creates:
- ✅ `users` table with subscription fields
- ✅ Row Level Security (RLS) policies
- ✅ Automatic user profile creation on signup
- ✅ Database indexes for performance

**🔍 Verify Database Setup:**
1. **Run the verification script**: Copy and paste `check-database.sql` in SQL Editor
2. **Check results**: You should see:
   - `table_exists: true`
   - All required columns listed
   - Triggers and functions present
   - RLS policies configured

**🐛 If User Profiles Aren't Created:**
The app now includes fallback mechanisms to create user profiles manually. If the database trigger doesn't work:
1. **Check browser console** for any errors
2. **Verify the database schema** was applied correctly
3. **Try signing up again** - the app will create profiles manually
4. **Check Supabase logs** for any database errors

### **2. Set Up Stripe Webhooks**

1. **Go to Stripe Dashboard** → Developers → Webhooks
2. **Click "Add endpoint"**
3. **Endpoint URL**: `https://your-domain.com/api/webhooks/stripe`
   - For local testing: Use ngrok or similar
   - For production: Your actual domain
4. **Select events**:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
5. **Copy the webhook secret** and update `.env.local`

### **3. Test the Payment System**

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Visit**: `http://localhost:3000`

3. **Test the flow**:
   - Sign up for a new account
   - Go to `/pricing`
   - Select a plan
   - Complete checkout with test card: `4242 4242 4242 4242`

## 🧪 **Testing Checklist:**

### **✅ Authentication Flow**
- [ ] User can sign up
- [ ] User can sign in
- [ ] User is redirected to dashboard after signup/signin

### **✅ Pricing Page**
- [ ] Both plans display correctly
- [ ] "Most Popular" badge shows on Annual plan
- [ ] Plan features are listed
- [ ] Prices and intervals display correctly

### **✅ Payment Flow**
- [ ] Clicking "Get [Plan Name]" redirects to Stripe
- [ ] Stripe checkout page loads
- [ ] Payment with test card succeeds
- [ ] User is redirected back to dashboard
- [ ] Success message shows on dashboard

### **✅ Database Integration**
- [ ] User profile created in Supabase
- [ ] Subscription status updated after payment
- [ ] Stripe customer ID stored
- [ ] Subscription type and dates recorded

## 🔒 **Security Features:**

- ✅ **Environment variables** for sensitive data
- ✅ **Webhook signature verification**
- ✅ **Row Level Security** in Supabase
- ✅ **Authentication required** for payments
- ✅ **Error handling** throughout the flow

## 🚀 **Production Deployment:**

### **Vercel Deployment**
1. **Push code to GitHub**
2. **Connect to Vercel**
3. **Set environment variables** in Vercel dashboard
4. **Deploy**

### **Environment Variables for Production**
```env
NEXT_PUBLIC_SUPABASE_URL=https://jlkebdnvjjdwedmbfqou.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_key
STRIPE_SECRET_KEY=sk_live_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

## 🐛 **Troubleshooting:**

### **Common Issues:**

1. **"Failed to create checkout session"**
   - Check Stripe keys in `.env.local`
   - Verify price IDs exist in Stripe dashboard

2. **"Webhook signature verification failed"**
   - Check webhook secret in `.env.local`
   - Verify webhook endpoint URL

3. **"User subscription not updated"**
   - Check Supabase database schema
   - Verify webhook events are firing

4. **"Authentication errors"**
   - Check Supabase configuration
   - Verify user table exists

## 📞 **Support:**

If you encounter issues:
1. Check browser console for errors
2. Check Stripe dashboard for webhook events
3. Check Supabase logs for database errors
4. Verify all environment variables are set correctly

---

**🎉 Your payment system is ready to go! Just follow the setup steps above and you'll have a fully functional subscription system with 2 plans: Monthly ($15) and Annual ($50).** 