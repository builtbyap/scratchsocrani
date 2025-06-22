# 🚀 Production Setup Guide for socrani.com

## ✅ **Environment Variables for Production**

Set these environment variables on your production server:

### **Stripe Configuration**
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_publishable_key_here
STRIPE_SECRET_KEY=sk_live_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### **Supabase Configuration**
```env
NEXT_PUBLIC_SUPABASE_URL=https://jlkebdnvjjdwedmbfqou.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impsa2ViZG52ampkd2VkbWJmcW91Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0NzU5NjQsImV4cCI6MjA1NzA1MTk2NH0.0dyDFawIks508PffUcovXN-M8kaAOgomOhe5OiEal3o
```

### **App Configuration**
```env
NEXT_PUBLIC_BASE_URL=https://socrani.com
```

## 🔧 **Deployment Platforms**

### **Vercel Deployment**
1. **Push code to GitHub**
2. **Connect to Vercel**
3. **Set environment variables** in Vercel dashboard:
   - Go to Project Settings → Environment Variables
   - Add all variables above
4. **Deploy**

### **Netlify Deployment**
1. **Push code to GitHub**
2. **Connect to Netlify**
3. **Set environment variables** in Netlify dashboard:
   - Go to Site Settings → Environment Variables
   - Add all variables above
4. **Deploy**

### **Custom Server**
1. **Set environment variables** in your server configuration
2. **Restart the server** after adding variables
3. **Verify variables are loaded**

## 🧪 **Testing Production**

### **1. Test Environment Variables**
Visit: `https://socrani.com/api/test-env` (if you create this endpoint)

### **2. Test Stripe Integration**
1. Go to: `https://socrani.com/pricing`
2. Sign in with Google
3. Try to create a checkout session
4. Check server logs for errors

### **3. Test Database Connection**
1. Sign in with Google
2. Check if user profile is created
3. Verify data appears in Supabase

## 🐛 **Common Production Issues**

### **500 Error on Checkout Session**
- **Cause**: Missing `STRIPE_SECRET_KEY`
- **Fix**: Set environment variable on production server

### **"Invalid API key" Error**
- **Cause**: Wrong Stripe keys or environment
- **Fix**: Use live keys for production, test keys for development

### **"No such price" Error**
- **Cause**: Price IDs don't exist in Stripe
- **Fix**: Create products in Stripe dashboard

### **Database Connection Issues**
- **Cause**: Missing Supabase environment variables
- **Fix**: Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 📊 **Monitoring**

### **Check Server Logs**
- Look for console.log messages from API routes
- Check for Stripe API errors
- Monitor database connection issues

### **Stripe Dashboard**
- Check for successful checkout sessions
- Monitor webhook deliveries
- Verify product and price configurations

### **Supabase Dashboard**
- Check Authentication logs
- Monitor database queries
- Verify RLS policies are working

## 🔒 **Security Checklist**

- [ ] Use live Stripe keys (not test keys)
- [ ] Set `NEXT_PUBLIC_BASE_URL` to production domain
- [ ] Configure webhook endpoints for production
- [ ] Enable HTTPS only
- [ ] Set up proper CORS if needed

## 📞 **Support**

If you encounter issues:
1. Check server logs for specific error messages
2. Verify all environment variables are set
3. Test with a fresh browser session
4. Check Stripe and Supabase dashboards for errors

---

**🎉 Once configured, your production site will handle payments and user authentication properly!** 