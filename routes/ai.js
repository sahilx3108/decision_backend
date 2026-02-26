const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');
const { protect } = require('../middleware/auth');
const User = require('../models/User');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// @route   POST /api/ai/analyze
// @desc    Analyze entities and provide advice using Groq AI
// @access  Private
router.post('/analyze', protect, async (req, res) => {
    try {
        const { entities } = req.body;

        const user = await User.findById(req.user);

        if (!entities || !Array.isArray(entities)) {
            return res.status(400).json({ message: 'Entities array is required' });
        }

        let systemPrompt = `You are a Decision Intelligence Expert. Analyze the user's list of options/tasks. 
Your analysis MUST factor in the detailed 'Description' of each decision to understand the context, constraints, and specific goals.
Identify patterns, point out which items are stuck in 'Pending' for too long, and recommend the single best option they should focus on right now based on the nuanced details in the descriptions.
Keep the advice highly actionable, contextualized with the descriptions, concise, and professional.`;

        if (user && (user.education || user.skills || user.careerGoals)) {
            const edu = user.education ? user.education : 'Not specified';
            const skills = user.skills ? user.skills : 'Not specified';
            const goals = user.careerGoals ? user.careerGoals : 'Not specified';
            systemPrompt += `\n\nUser Context: ${edu}, Skills: ${skills}, Goal: ${goals}. Tailor your decision advice specifically to help them achieve this goal.`;
        }

        const formattedEntities = entities.map(e =>
            `Title: ${e.Title}\nCategory: ${e.Category}\nStatus: ${e.Status}\nDescription: ${e.Description}\n---`
        ).join('\n');

        const userPrompt = `Here is the user's list of decisions/tasks:\n\n${formattedEntities}\n\nPlease generate a strategic insight based on these details.`;

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: systemPrompt
                },
                {
                    role: 'user',
                    content: userPrompt
                }
            ],
            model: 'llama-3.1-8b-instant'
        });

        const advice = chatCompletion.choices[0]?.message?.content || 'No advice generated.';

        res.json({ advice });
    } catch (error) {
        console.error('Groq AI Error:', error);
        res.status(500).json({ message: 'Server Error analyzing data' });
    }
});

// @route   POST /api/ai/chat
// @desc    Chat with Groq AI using conversation history
// @access  Private
router.post('/chat', protect, async (req, res) => {
    try {
        const { messages, context } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ message: 'Messages array is required' });
        }

        let systemPrompt = "You are a Decision Intelligence Expert assistant. You are highly analytical, professional, and concise. You are chatting with the user to help drill down into their strategic insight.";

        if (context) {
            systemPrompt += `\n\nContext - The user is looking at this initial strategic insight you provided:\n"${context.initialAdvice}"\n\nHere are the actual details of their decisions for reference:\n${context.decisionsContext}`;
        }

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: systemPrompt
                },
                ...messages.map(m => ({
                    role: m.role,
                    content: m.content
                }))
            ],
            model: 'llama-3.1-8b-instant'
        });

        const reply = chatCompletion.choices[0]?.message?.content || 'No response generated.';

        res.json({ reply });
    } catch (error) {
        console.error('Groq AI Chat Error Details:', error.response?.data || error.message || error);
        res.status(500).json({ message: 'Server Error during chat', details: error.message });
    }
});

module.exports = router;
