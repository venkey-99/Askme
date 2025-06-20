require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const { Configuration, OpenAIApi } = require('openai');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.get('/api/search', async (req, res) => {
    try {
        const { q } = req.query;
        
        // Parallel API calls with error handling
        const [wikiData, wolframData, aiData] = await Promise.allSettled([
            getWikipediaSummary(q),
            getWolframResults(q),
            getAIAnswers(q)
        ]);
        
        res.json({
            who: combineField([wikiData, wolframData, aiData], 'who', q),
            what: combineField([wikiData, wolframData, aiData], 'what', q),
            when: combineField([wikiData, wolframData, aiData], 'when', q),
            where: combineField([wikiData, wolframData, aiData], 'where', q),
            why: combineField([wikiData, wolframData, aiData], 'why', q),
            how: combineField([wikiData, wolframData, aiData], 'how', q)
        });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Helper functions
async function getWikipediaSummary(topic) {
    try {
        const response = await axios.get(
            `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topic)}`
        );
        return {
            what: response.data.extract,
            who: extractPeople(response.data.extract),
            when: extractDates(response.data.extract)
        };
    } catch (error) {
        return null;
    }
}

async function getWolframResults(topic) {
    if (!process.env.WOLFRAM_API_KEY) return null;
    
    try {
        const response = await axios.get(
            `http://api.wolframalpha.com/v2/query?input=${encodeURIComponent(topic)}&format=plaintext&output=JSON&appid=${process.env.WOLFRAM_API_KEY}`
        );
        return parseWolframResponse(response.data);
    } catch (error) {
        return null;
    }
}

async function getAIAnswers(topic) {
    if (!process.env.OPENAI_API_KEY) return null;
    
    try {
        const configuration = new Configuration({
            apiKey: process.env.OPENAI_API_KEY,
        });
        const openai = new OpenAIApi(configuration);
        
        const completion = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [
                { 
                    role: "system", 
                    content: "Provide concise answers to questions in 1-2 sentences." 
                },
                { 
                    role: "user", 
                    content: `Explain ${topic} in simple terms` 
                }
            ],
            max_tokens: 100
        });
        
        return { what: completion.data.choices[0].message.content };
    } catch (error) {
        return null;
    }
}

function combineField(sources, field, topic) {
    for (const source of sources) {
        if (source.status === 'fulfilled' && source.value?.[field]) {
            return {
                answer: source.value[field],
                source: source.value.source || 'AI Knowledge Base',
                timestamp: new Date().toISOString()
            };
        }
    }
    return {
        answer: `No ${field} information found about ${topic}`,
        source: 'System',
        timestamp: new Date().toISOString()
    };
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));