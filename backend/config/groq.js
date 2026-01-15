require('dotenv').config();
const Groq = require('groq-sdk');

module.exports = {  
    groqApiKey: process.env.GROQ_API_KEY || '',
};

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

module.exports = groq;
