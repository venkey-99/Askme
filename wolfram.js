const axios = require('axios');
const router = require('express').Router();

router.get('/', async (req, res) => {
    try {
        const response = await axios.get(
            `http://api.wolframalpha.com/v2/query?input=${encodeURIComponent(req.query.q)}&format=plaintext&output=JSON&appid=${process.env.WOLFRAM_API_KEY}`
        );
        res.json(parseWolframResponse(response.data));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

function parseWolframResponse(data) {
    // Process Wolfram's response into your format
    const pods = data.queryresult.pods;
    const result = {};
    
    pods.forEach(pod => {
        if (pod.title === 'Result' || pod.title === 'Definition') {
            result.what = pod.subpods[0].plaintext;
        }
        // Add more cases for who, when, etc.
    });
    
    return result;
}

module.exports = router;