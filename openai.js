const { Configuration, OpenAIApi } = require('openai');
const router = require('express').Router();

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

router.post('/', async (req, res) => {
    try {
        const completion = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [
                { 
                    role: "system", 
                    content: "You are a knowledgeable assistant that provides concise answers to questions." 
                },
                { 
                    role: "user", 
                    content: `Answer this question: ${req.body.question} in a concise paragraph.` 
                }
            ],
            max_tokens: 150
        });
        
        res.json({ answer: completion.data.choices[0].message.content });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;