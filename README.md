# 🎓 Guru - Modern AI Tutor

Guru is a premium, AI-powered personal tutoring application built with **React Native** and **Expo**. It leverages cutting-edge Large Language Models via **OpenRouter** to provide personalized curriculum generation, interactive lessons, and real-time educational support.


## 🚀 Key Features

- **🤖 Intelligent Chat (Guru)**: A world-class AI tutor that provides clear explanations, code snippets, and analogies to help you master any topic.
- **📚 Dynamic Curriculum Generation**: Enter any subject, and Guru will craft a 5-7 module course structure just for you.
- **📖 Personalized Lessons**: Deep-dive into specific modules with AI-generated markdown lessons featuring code blocks and structured formatting.
- **📈 Progress Tracking**: Sync your learning journey with **Supabase**. Mark modules as complete and track your overall progress.
- **🏆 Learning Milestones**: Earn badges and track your "Learning Streaks" as you achieve educational goals.
- **✨ Premium UI/UX**: Modern aesthetics featuring glassmorphism, smooth animations, skeleton loaders, and a high-performance `FlatList` architecture.

## 🛠️ Tech Stack

- **Frontend**: React Native (Expo SDK 52)
- **Styling**: NativeWind (Tailwind CSS) & Vanilla CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time Database)
- **AI Engine**: OpenRouter API (Fallback logic across Llama 3.3, Gemma 3, and Qwen)
- **Navigation**: Expo Router (File-based routing)

## 📦 Getting Started

### 1. Prerequisites
- Node.js (v18 or later)
- Expo Go app on your physical device (Android/iOS)

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/WeirdSecurity/Android.git
cd Android/ModernAITutorApp

# Install dependencies
npm install
```

### 3. Environment Setup
Create a `.env` file in the `ModernAITutorApp` directory with the following variables:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_OPENROUTER_API_KEY=your_openrouter_api_key
```

### 4. Running the App
```bash
npx expo start -c
```
Scan the QR code with your phone to start learning!

## 📂 Project Structure

- `app/`: Main navigation routes (Tabs, Topics, Modules).
- `components/`: Reusable UI components (Topic Cards, Typing Indicators, Auth).
- `hooks/`: Custom React hooks for Auth and State management.
- `lib/`: API services and library configurations (Supabase, AI Logic).
- `supabase/`: Database schema and migration files.

---
Built with ❤️ by Guru Team
