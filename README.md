# 🌐 AIverse

**AIverse** is a modern platform for developers to track their coding progress, compete on leaderboards, and participate in challenges. Built with React, Vite, and Supabase.

## ✨ Features

### 🎯 Core Features
- **User Authentication** - Secure email-based registration and login with email verification
- **GitHub Integration** - Connect your GitHub account to track repositories and earn points
- **Real-time Leaderboard** - Compete with other developers and track your ranking
- **Weekly Challenges** - Participate in coding challenges and earn rewards
- **Points System** - Earn points for repositories, submissions, and achievements

### 📊 Dashboard & Profile
- **Profile Management** - Manage your personal information and integrations
- **GitHub Stats** - View your repositories and points earned
- **Progress Tracking** - Track your coding journey and achievements
- **User Roles** - Student and mentor role management

### 📰 Content & Community
- **Articles & News Feed** - Stay updated with technical articles and AI news
- **Events Calendar** - Browse and register for upcoming events and workshops
- **Notifications** - Real-time notifications for achievements and updates

### 🎨 User Experience
- **Modern UI** - Clean, responsive design with dark theme
- **Smooth Animations** - Framer Motion powered transitions
- **Search Functionality** - Quick search across articles and challenges
- **Mobile Responsive** - Optimized for all device sizes

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Framer Motion** - Animation library
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Icon system

### Backend
- **Supabase** - Backend as a Service
  - PostgreSQL Database
  - Authentication
  - Real-time subscriptions
  - Edge Functions
  - Row Level Security (RLS)

### Database Schema
- User profiles with points tracking
- GitHub repositories tracking
- LeetCode submissions (via challenges)
- Sustainability actions
- Challenges and participations
- Automatic point calculation triggers

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/TanmayCJ/tcjpr.git
   cd tcjpr/AIverse
   ```

2. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Set up environment variables**
   - Create a `.env` file in the `frontend` directory
   - Add your Supabase credentials (contact admin for keys)

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   - Navigate to `http://localhost:5173`

## 📦 Build & Deploy

### Build for production
```bash
npm run build
```

### Preview production build
```bash
npm run preview
```

## 🎮 Usage

1. **Sign Up** - Create an account with your email
2. **Verify Email** - Check your inbox and verify your email address
3. **Login** - Access your dashboard
4. **Connect GitHub** - Link your GitHub account to start earning points
5. **Explore** - Browse challenges, articles, and events
6. **Compete** - Check the leaderboard and track your progress

## 🏆 Points System

- **GitHub Integration**: +10 points per repository
- **Challenge Completion**: Variable points based on difficulty
- **Achievements**: Unlock badges and earn bonus points

## 📝 License

This project is private and proprietary.

## 👥 Contributors

- **TanmayCJ** - Project Owner & Lead Developer

## 📧 Support

For questions or support, please contact the development team.

---

**Made with ❤️ by the AIverse Team**
