const chatbotService = require('../services/chatbot.service');

/**
 * @route   POST /api/chatbot/message
 * @desc    Send message to AI chatbot and get response
 * @access  Private
 */
exports.sendMessage = async (req, res) => {
    try {
        const { message, courseProgress } = req.body;
        const userId = req.user._id;

        if (!message || !message.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Message is required'
            });
        }

        // Get AI response
        const aiResponse = await chatbotService.getChatResponse(
            userId,
            message,
            { courses: courseProgress || [] }
        );

        res.json({
            success: true,
            data: {
                message: aiResponse,
                timestamp: new Date()
            }
        });
    } catch (error) {
        console.error('Chatbot controller error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get chatbot response',
            error: error.message
        });
    }
};

/**
 * @route   GET /api/chatbot/context
 * @desc    Get user context for debugging
 * @access  Private
 */
exports.getUserContext = async (req, res) => {
    try {
        const userId = req.user._id;
        const context = await chatbotService.getUserContext(userId);

        res.json({
            success: true,
            data: context
        });
    } catch (error) {
        console.error('Get context error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get user context',
            error: error.message
        });
    }
};
