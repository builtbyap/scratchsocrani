# TechFlow Agency - Digital Solutions Platform

A modern, responsive web application for a tech agency built with Next.js, TypeScript, Tailwind CSS, Framer Motion, and Supabase authentication.

## Features

- 🎨 Modern, glassmorphism design
- 📱 Fully responsive layout
- ⚡ Smooth animations with Framer Motion
- 🔐 Supabase authentication (email/password + Google OAuth)
- 🛡️ Protected routes and authentication state management
- 📊 Interactive dashboard with project management
- 📧 Email signup form
- 🔗 Social media links
- 🌟 Beautiful gradient effects
- 🎯 SEO optimized

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **Icons**: Lucide React
- **Fonts**: Inter (Google Fonts)

## Getting Started

### Prerequisites

Make sure you have Node.js installed on your system. You can download it from [nodejs.org](https://nodejs.org/).

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd tech-agency-platform
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up Supabase:
   - Create a new project at [supabase.com](https://supabase.com)
   - Go to your project dashboard
   - Copy your project URL and anon key from Settings > API
   - Create a `.env.local` file in the root directory:
   ```bash
   cp .env.local.example .env.local
   ```
   - Update `.env.local` with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Configure Google OAuth (Optional):
   - Go to Authentication > Providers in your Supabase dashboard
   - Enable Google provider
   - Add your Google OAuth credentials
   - Set the redirect URL to: `https://your-project-id.supabase.co/auth/v1/callback`

5. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## Project Structure

```
├── src/
│   ├── app/
│   │   ├── dashboard/          # Protected dashboard pages
│   │   ├── signin/             # Sign in page
│   │   ├── signup/             # Sign up page
│   │   ├── globals.css         # Global styles and Tailwind imports
│   │   ├── layout.tsx          # Root layout with AuthProvider
│   │   └── page.tsx            # Homepage component
│   ├── components/             # Reusable components
│   ├── contexts/               # React contexts (AuthContext)
│   └── lib/                    # Utility libraries (Supabase client)
├── public/                     # Static assets
├── package.json                # Dependencies and scripts
├── tailwind.config.ts          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
├── next.config.js              # Next.js configuration
└── .env.local.example          # Environment variables template
```

## Authentication Features

### User Management
- **Email/Password Registration**: Secure user registration with validation
- **Email/Password Sign In**: Traditional authentication
- **Google OAuth**: One-click sign in with Google
- **Protected Routes**: Dashboard requires authentication
- **Session Management**: Automatic session handling
- **Sign Out**: Secure logout with session cleanup

### Security Features
- **Password Validation**: Minimum 6 characters required
- **Form Validation**: Client-side and server-side validation
- **Error Handling**: User-friendly error messages
- **Session Persistence**: Automatic session restoration
- **Route Protection**: Unauthorized users redirected to sign in

## Customization

### Colors
The color scheme can be customized in `tailwind.config.ts`. The current theme uses:
- Primary colors: Blue gradient (`primary-400` to `primary-600`)
- Dark theme: Dark grays (`dark-800` to `dark-900`)

### Content
Update the content in `src/app/page.tsx`:
- Company name and branding
- Service descriptions
- Feature descriptions
- Social media links
- Contact information

### Authentication
Modify authentication settings in:
- `src/lib/supabase.ts` for Supabase configuration
- `src/contexts/AuthContext.tsx` for auth state management
- Individual auth pages for custom validation

## Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Environment Variables for Production
Make sure to set these in your deployment platform:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

If you have any questions or need help, please open an issue on GitHub. 