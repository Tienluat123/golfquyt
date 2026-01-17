const Groq = require('groq-sdk');
const User = require('../models/User');
const Session = require('../models/Session');
const Analysis = require('../models/Analysis');
const Course = require('../models/Course');

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

/**
 * Aggregate user context for AI chatbot
 */
const getUserContext = async (userId) => {
    try {
        // Fetch user profile
        const user = await User.findById(userId).select('name email experiencePoints rankTitle');

        // Fetch recent sessions (last 5)
        const sessions = await Session.find({ user: userId })
            .sort({ date: -1 })
            .limit(5)
            .select('title date videoCount overallScore overallBand');

        // Fetch recent analyses (last 10)
        const analyses = await Analysis.find({ user: userId })
            .sort({ createdAt: -1 })
            .limit(10)
            .select('band metrics aiAdvice createdAt');

        // Fetch all courses to check progress
        const allCourses = await Course.find({}).select('title trainingSteps');

        // Get user's course progress from localStorage (would need to be sent from frontend)
        // For now, we'll just include course titles
        const courses = allCourses.map(c => ({
            title: c.title,
            totalSteps: c.trainingSteps?.length || 0
        }));

        return {
            user: user || {},
            sessions: sessions || [],
            analyses: analyses || [],
            courses: courses || []
        };
    } catch (error) {
        console.error('Error fetching user context:', error);
        throw error;
    }
};

/**
 * Build AI prompt with user context
 */
const buildPrompt = (context, userMessage) => {
    const { user, sessions, analyses, courses } = context;

    const systemPrompt = `You are an expert golf coach AI assistant. You have access to the user's golf training data.

User Profile:
- Name: ${user.name || 'User'}
- Experience Points: ${user.experiencePoints || 0}
- Rank: ${user.rankTitle || 'Beginner'}

Recent Sessions (${sessions.length}):
${sessions.map(s => `- ${s.title} on ${new Date(s.date).toLocaleDateString()}: ${s.videoCount} videos, Score: ${s.overallScore}, Band: ${s.overallBand}`).join('\n') || 'No sessions yet'}

Recent Swing Analyses (${analyses.length}):
${analyses.map(a => `- Band ${a.band} on ${new Date(a.createdAt).toLocaleDateString()}: ${a.aiAdvice || 'No advice'}`).join('\n') || 'No analyses yet'}

Available Courses (${courses.length}):
${courses.map(c => `- ${c.title} (${c.totalSteps} steps)`).join('\n')}

Your role:
1. Provide personalized golf training advice based on the user's data
2. Be encouraging and supportive
3. Give specific, actionable tips
4. Reference their recent performance when relevant
5. Keep responses concise (2-3 paragraphs max)
6. Use a friendly, professional tone

User's question: ${userMessage}`;

    return systemPrompt;
};

/**
 * Call Groq AI API
 */
const callGroqAI = async (prompt) => {
    try {
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.7,
            max_tokens: 1024,
        });

        return completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
    } catch (error) {
        console.error('Groq API error:', error);
        throw new Error('Failed to get AI response');
    }
};

/**
 * Main service function
 */
const getChatResponse = async (userId, userMessage, userProgress = {}) => {
    try {
        // Get user context
        const context = await getUserContext(userId);

        // Merge frontend progress data if provided
        if (userProgress.courses) {
            context.courses = context.courses.map(c => {
                const progress = userProgress.courses.find(p => p.title === c.title);
                return {
                    ...c,
                    completedSteps: progress?.completedSteps || 0,
                    progress: progress?.progress || 0
                };
            });
        }

        // Build prompt
        const prompt = buildPrompt(context, userMessage);

        // Get AI response
        const aiResponse = await callGroqAI(prompt);

        return aiResponse;
    } catch (error) {
        console.error('Chat service error:', error);
        throw error;
    }
};

module.exports = {
    getChatResponse,
    getUserContext
};
