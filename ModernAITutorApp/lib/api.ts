import { Platform } from 'react-native';
import { supabase } from './supabase';
// Strip quotes if they were accidentally added in the .env file
const OPENROUTER_KEY = (process.env.EXPO_PUBLIC_OPENROUTER_API_KEY || '').replace(/['"]/g, '');

// ---------------------------------------------------------------------------
// Mock Data (fallbacks when Supabase isn't fully configured)
// ---------------------------------------------------------------------------
const MOCK_CATEGORIES = [
  { id: '1', name: 'Computer Science', icon: 'terminal' },
  { id: '2', name: 'Mathematics', icon: 'calculate' },
  { id: '3', name: 'Physics', icon: 'science' },
  { id: '4', name: 'History', icon: 'history-edu' },
];

const MOCK_TOPICS = [
  {
    id: '101',
    category_id: '1',
    title: 'Neural Networks',
    description: 'Understand the fundamental architecture of modern artificial intelligence.',
    duration_hrs: 4.5,
    enrolled_count: 12400,
    is_featured: true,
  },
  {
    id: '102',
    category_id: '1',
    title: 'Python Basics',
    description: 'Start your programming journey with Python — the language of AI.',
    duration_hrs: 3.0,
    enrolled_count: 28700,
    is_featured: true,
  },
  {
    id: '103',
    category_id: '2',
    title: 'Advanced Calculus',
    description: 'Multivariable functions, partial derivatives, and vector fields.',
    duration_hrs: 8.0,
    enrolled_count: 5300,
    is_featured: false,
  },
  {
    id: '104',
    category_id: '3',
    title: 'Quantum Mechanics',
    description: 'Wave functions, superposition, and the mysteries of the quantum world.',
    duration_hrs: 6.0,
    enrolled_count: 7800,
    is_featured: false,
  },
  {
    id: '105',
    category_id: '4',
    title: 'Modern Geopolitics',
    description: 'Analyzing global power shifts and international relations in the 21st century.',
    duration_hrs: 3.2,
    enrolled_count: 9100,
    is_featured: false,
  },
  {
    id: '106',
    category_id: '1',
    title: 'Machine Learning',
    description: 'Supervised learning, decision trees, and neural network fundamentals.',
    duration_hrs: 5.5,
    enrolled_count: 19200,
    is_featured: true,
  },
];

const MOCK_LIBRARY = [
  { id: '1001', title: 'Organic Chemistry Fundamentals', icon: 'science', type: 'lesson', accessed: 'Today' },
  { id: '1002', title: 'React Hooks Deep Dive', icon: 'data-object', type: 'lesson', accessed: 'Yesterday' },
  {
    id: '1003',
    title: 'World History: 20th Century',
    icon: 'menu-book',
    type: 'resource',
    accessed: 'Oct 12',
    description: 'Comprehensive notes and timelines covering major global events.',
  },
  { id: '1004', title: 'Calculus Cheat Sheet', icon: 'functions', type: 'resource', accessed: 'Oct 10' },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const isSupabaseConfigured = () =>
  !!supabase && !!process.env.EXPO_PUBLIC_SUPABASE_URL && !!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const isOpenRouterConfigured = () =>
  !!OPENROUTER_KEY && OPENROUTER_KEY !== 'YOUR_OPENROUTER_API_KEY_HERE';

// Helper for exponential backoff with jitter
async function waitWithBackoffAndJitter(baseMs: number, attempt: number) {
  const backoff = baseMs * Math.pow(2, attempt);
  const jitter = Math.random() * (backoff * 0.2);
  const totalWait = Math.round(backoff + jitter);
  console.log(`[Backoff] Waiting ${totalWait}ms before next attempt...`);
  return new Promise((resolve) => setTimeout(resolve, totalWait));
}

/**
 * Call AI with a prompt via OpenRouter. Returns the text response or a friendly error string.
 */
async function callAI(prompt: string): Promise<string> {
  if (!isOpenRouterConfigured()) {
    await new Promise((r) => setTimeout(r, 1200));
    return '[Simulated AI response — add EXPO_PUBLIC_OPENROUTER_API_KEY to .env to enable real AI]';
  }
  
  const MODELS = [
    'google/gemma-3-27b-it:free',
    'nousresearch/hermes-3-llama-3.1-405b:free',
    'meta-llama/llama-3.3-70b-instruct:free',
    'qwen/qwen3-coder:free'
  ];

  console.log('[OpenRouter] Starting request with fallback logic...');

  for (let attempt = 0; attempt < MODELS.length; attempt++) {
    const modelName = MODELS[attempt];
    try {
      console.log(`[OpenRouter] Trying ${modelName}...`);
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_KEY}`,
          'HTTP-Referer': 'https://modernaitutor.com',
          'X-Title': 'Guru AI Tutor',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: modelName,
          messages: [{ role: 'user', content: prompt }]
        })
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.choices?.[0]?.message?.content;
        if (text) {
          console.log(`[OpenRouter Success] ${modelName} worked!`);
          return text;
        }
      }

      if (response.status === 401 || response.status === 403) {
        console.error(`[OpenRouter] Unauthorized (401/403). Check API key.`);
        return '⚠️ Invalid OpenRouter API key. Please check your .env file.';
      }

      if (response.status === 429) {
        console.warn(`[OpenRouter] 429 hit on ${modelName}. Applying backoff...`);
        await waitWithBackoffAndJitter(1500, attempt);
        continue;
      }

      console.warn(`[OpenRouter] ${modelName} failed with status ${response.status}`);
    } catch (err: any) {
      console.warn(`[OpenRouter] Request failed: ${err.message}`);
    }
  }

  return '⚠️ AI rate limit hit across all available models. Please try again later or check your API key.';
}

// ---------------------------------------------------------------------------
// Main API Service
// ---------------------------------------------------------------------------
export const TutorAPI = {
  // ---- Data ----------------------------------------------------------------

  async getCategories() {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('categories').select('*');
      if (!error && data) return data;
    }
    return MOCK_CATEGORIES;
  },

  async getTrendingTopics(categoryId?: string) {
    if (isSupabaseConfigured() && supabase) {
      let query = supabase.from('topics').select('*').order('created_at', { ascending: false });
      if (categoryId) query = query.eq('category_id', categoryId);
      const { data, error } = await query.limit(10);
      if (!error && data) return data;
    }
    return categoryId ? MOCK_TOPICS.filter((t) => t.category_id === categoryId) : MOCK_TOPICS;
  },

  async getFeaturedTopics() {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('topics').select('*').eq('is_featured', true).limit(5);
      if (!error && data) return data;
    }
    return MOCK_TOPICS.filter((t) => t.is_featured);
  },

  async getTopicById(id: string) {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('topics').select('*').eq('id', id).single();
      if (!error && data) return data;
    }
    return MOCK_TOPICS.find((t) => t.id === id);
  },

  async getLibraryItems(typeFilter?: string) {
    // In a full implementation, fetch from Supabase library_items joined with topics
    return typeFilter ? MOCK_LIBRARY.filter((i) => i.type === typeFilter) : MOCK_LIBRARY;
  },

  // ---- Chat ----------------------------------------------------------------

  async getChatHistory(sessionId: string) {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });
      if (!error && data) return data;
    }
    return [{ id: 'msg-1', role: 'ai', content: "Hello! I'm Guru, your AI Tutor. What would you like to learn today?" }];
  },

  async sendMessage(sessionId: string, content: string) {
    const prompt = `You are a world-class AI Tutor named Guru, specializing in personalized, engaging, and clear education.
    
The student says: "${content}"

Please provide a response that follows these "Premium Experience" guidelines:
1. **Structure**: Use clear # Headings and ## Subheadings to organize your thoughts.
2. **Formatting**: Use **bold** for essential concepts and \`inline code\` for technical terms.
3. **Clarity**: Explain complex ideas using simple analogies where possible.
4. **Tone**: Be encouraging, expert, and professional.
5. **Visuals**: Use tables or bulleted lists to break down information when appropriate.

Focus on helping the student deeply understand the "why" behind the "what".`;

    const aiResponseText = await callAI(prompt);

    if (isSupabaseConfigured() && supabase) {
      await supabase.from('messages').insert([{ session_id: sessionId, role: 'user', content }]);
      await supabase.from('messages').insert([{ session_id: sessionId, role: 'ai', content: aiResponseText }]);
    }

    return { id: 'msg-' + Date.now(), role: 'ai', content: aiResponseText };
  },

  // ---- Curriculum (AI-generated) ------------------------------------------

  /**
   * Generates a structured course curriculum for a given topic.
   * Returns an array of module objects parsed from the AI response.
   */
  async generateCurriculum(topicTitle: string): Promise<Array<{ index: number; title: string; duration: string; description: string }>> {
    const prompt = `You are Guru, an expert curriculum designer. Create a structured course curriculum for the topic: "${topicTitle}".

Output EXACTLY a JSON array (no markdown code fences, no extra text) with 5-7 modules. Each module must have:
- "title": string (concise module name)
- "duration": string (e.g., "45 min", "1.5 hrs")
- "description": string (1 sentence describing what students will learn)

Example format:
[{"title":"Introduction to ...","duration":"30 min","description":"Learn the basics..."},...]

Output only the JSON array. Nothing else.`;

    const raw = await callAI(prompt);

    try {
      // Find JSON array in the response
      const jsonMatch = raw.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error('No JSON array found');
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed.map((m: any, i: number) => ({
        index: i,
        title: m.title || `Module ${i + 1}`,
        duration: m.duration || '30 min',
        description: m.description || '',
      }));
    } catch {
      // Graceful fallback: return default modules
      return [
        { index: 0, title: `Introduction to ${topicTitle}`, duration: '30 min', description: 'Overview and foundational concepts.' },
        { index: 1, title: 'Core Concepts', duration: '45 min', description: 'Deep dive into the fundamental principles.' },
        { index: 2, title: 'Practical Applications', duration: '1 hr', description: 'Apply your knowledge to real-world problems.' },
        { index: 3, title: 'Advanced Topics', duration: '1 hr', description: 'Explore advanced techniques and edge cases.' },
        { index: 4, title: 'Review & Assessment', duration: '30 min', description: 'Consolidate learning and test your understanding.' },
      ];
    }
  },

  /**
   * Generates a full markdown lesson for a specific module within a topic.
   */
  async generateModuleLesson(topicTitle: string, moduleTitle: string): Promise<string> {
    const prompt = `You are Guru, an expert AI Tutor teaching a lesson on "${moduleTitle}" within the course "${topicTitle}".

Write a comprehensive, engaging lesson in Markdown format. Include:
- A brief # Introduction
- ## Key Concepts with **bold** for important terms
- \`\`\`code\`\`\` blocks where relevant (use appropriate language)
- ## Summary at the end with bullet points
- Keep it educational but conversational. Aim for 400-600 words.`;

    return callAI(prompt);
  },

  // ---- Progress Tracking --------------------------------------------------

  async getProgress(userId: string, topicId: string): Promise<number[]> {
    if (!isSupabaseConfigured() || !supabase || !userId) return [];
    try {
      const { data, error } = await supabase
        .from('progress')
        .select('module_index')
        .eq('user_id', userId)
        .eq('topic_id', topicId);
      if (error) return [];
      return (data || []).map((r: any) => r.module_index);
    } catch {
      return [];
    }
  },

  async markModuleComplete(userId: string, topicId: string, moduleIndex: number): Promise<boolean> {
    if (!isSupabaseConfigured() || !supabase || !userId) return false;
    try {
      const { error } = await supabase
        .from('progress')
        .upsert({ user_id: userId, topic_id: topicId, module_index: moduleIndex }, { onConflict: 'user_id,topic_id,module_index' });
      return !error;
    } catch {
      return false;
    }
  },

  async getTotalCompletedModules(userId: string): Promise<number> {
    if (!isSupabaseConfigured() || !supabase || !userId) return 0;
    try {
      const { count, error } = await supabase
        .from('progress')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
      return error ? 0 : (count ?? 0);
    } catch {
      return 0;
    }
  },
};

/**
 * Simple test function to verify AI connectivity.
 */
export async function testAI() {
  console.log('[Guru Test] Initiating connection test...');
  try {
    const response = await callAI('Hello! Please respond with "Guru is online and ready to teach!"');
    return response;
  } catch (err: any) {
    console.error('[Guru Test Failed]', err);
    throw err;
  }
}

