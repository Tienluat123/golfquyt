import axiosClient from '../utils/axiosConfig';

/**
 * Send message to chatbot
 */
export const sendChatMessage = async (message, courseProgress = []) => {
    return axiosClient.post('/chatbot/message', {
        message,
        courseProgress
    });
};

/**
 * Get user context (for debugging)
 */
export const getUserContext = () => {
    return axiosClient.get('/chatbot/context');
};
