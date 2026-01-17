import React, { useState, useEffect, useRef } from 'react';
import { FaPaperPlane, FaRobot, FaUser } from 'react-icons/fa';
import { sendChatMessage } from '../services/chatbot.service';
import './AITrainer.css';

const AITrainer = () => {
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: 'Welcome to your AI Golf Coach! 🏌️‍♂️\n\nI have access to all your training data including:\n• Your sessions and swing analyses\n• Course progress and completed steps\n• Performance metrics and scores\n\nAsk me anything about your golf game, and I\'ll provide personalized advice based on your data!',
            timestamp: new Date()
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Auto-scroll to bottom when new messages arrive
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Focus input on mount
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleSendMessage = async () => {
        if (!inputMessage.trim() || isLoading) return;

        const userMessage = {
            role: 'user',
            content: inputMessage,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsLoading(true);

        try {
            // Get course progress from localStorage
            const courseProgress = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key?.startsWith('course_') && key?.endsWith('_progress')) {
                    const data = JSON.parse(localStorage.getItem(key) || '{}');
                    courseProgress.push(data);
                }
            }

            const response = await sendChatMessage(inputMessage, courseProgress);

            const aiMessage = {
                role: 'assistant',
                content: response.data.message,
                timestamp: new Date(response.data.timestamp)
            };

            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error('Chat error:', error);
            const errorMessage = {
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again later.',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
            inputRef.current?.focus();
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // Quick suggestion buttons
    const quickSuggestions = [
        "How is my golf progress?",
        "What should I focus on?",
        "Analyze my recent sessions",
        "Give me tips for my swing"
    ];

    const handleSuggestionClick = (suggestion) => {
        setInputMessage(suggestion);
        inputRef.current?.focus();
    };

    return (
        <div className="ai-trainer-page">
            {/* Header */}
            <div className="ai-trainer-header">
                <div className="header-content">
                    <FaRobot size={32} className="header-icon" />
                    <div>
                        <h1>AI Golf Coach</h1>
                        <p>Your personalized training assistant</p>
                    </div>
                </div>
            </div>

            {/* Chat Container */}
            <div className="ai-trainer-container">
                {/* Messages */}
                <div className="ai-messages-area">
                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`ai-message-wrapper ${msg.role === 'user' ? 'user' : 'assistant'}`}
                        >
                            <div className="message-avatar">
                                {msg.role === 'user' ? (
                                    <FaUser size={20} />
                                ) : (
                                    <FaRobot size={20} />
                                )}
                            </div>
                            <div className="message-bubble">
                                <div className="message-text">
                                    {msg.content.split('\n').map((line, i) => (
                                        <React.Fragment key={i}>
                                            {line}
                                            {i < msg.content.split('\n').length - 1 && <br />}
                                        </React.Fragment>
                                    ))}
                                </div>
                                <div className="message-timestamp">
                                    {new Date(msg.timestamp).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </div>
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="ai-message-wrapper assistant">
                            <div className="message-avatar">
                                <FaRobot size={20} />
                            </div>
                            <div className="message-bubble">
                                <div className="typing-indicator">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Quick Suggestions (only show when no messages from user yet) */}
                {messages.length === 1 && (
                    <div className="quick-suggestions">
                        <p className="suggestions-label">Quick questions:</p>
                        <div className="suggestions-grid">
                            {quickSuggestions.map((suggestion, index) => (
                                <button
                                    key={index}
                                    className="suggestion-btn"
                                    onClick={() => handleSuggestionClick(suggestion)}
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Input Area */}
                <div className="ai-input-area">
                    <div className="input-container">
                        <textarea
                            ref={inputRef}
                            className="ai-input"
                            placeholder="Ask me anything about your golf training..."
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            disabled={isLoading}
                            rows={1}
                        />
                        <button
                            className="ai-send-btn"
                            onClick={handleSendMessage}
                            disabled={isLoading || !inputMessage.trim()}
                        >
                            <FaPaperPlane size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AITrainer;
