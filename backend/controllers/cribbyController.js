// const { saveChat, getChatHistory } = require('../services/cribbyServices');
// const { getOllamaResponse } = require('../ollamaClient');
// const { buildPrompt } = require('../promptBuilder');
// const { v4: uuidv4 } = require('uuid');

// function detectQueryType(message) {
//   const lower = message.toLowerCase();
//   if (lower.includes('joke') || lower.includes('funny')) return 'joke';
//   if (lower.includes('how') || lower.includes('what') || lower.includes('why') || lower.includes('help')) return 'help';
//   return 'general';
// }

// async function handleChat(req, res) {
//   try {
//     let sessionId = req.cookies.sessionId;
//     if (!sessionId) {
//       sessionId = uuidv4();
//       res.cookie('sessionId', sessionId, { httpOnly: true, sameSite: 'lax' });
//     }

//     const { message } = req.body;
//     if (!message) return res.status(400).json({ error: "Message is required" });

//     const queryType = detectQueryType(message);
//     const prompt = buildPrompt(message, queryType);

//     const ollamaResponse = await getOllamaResponse(prompt);

//     await saveChat({ sessionId, user_query: message, response: ollamaResponse });
//     res.json({ response: ollamaResponse, sessionId });

//   } catch (err) {
//     console.error("Chat error:", err.message);
//     res.status(500).json({ error: "AI backend error." });
//   }
// }

// async function handleHistory(req, res) {
//   try {
//     const sessionId = req.cookies.sessionId;
//     if (!sessionId) return res.json([]);

//     console.log(`Fetching history for session ${sessionId}`);

//     const history = await getChatHistory(sessionId);
//     res.json(history);
//   } catch (err) {
//     console.error("History fetch error:", err.message);
//     res.status(500).json({ error: "Could not fetch chat history" });
//   }
// }


// module.exports = { handleChat, handleHistory };

const { getOllamaResponse } = require('../ollamaClient');
const { buildPrompt } = require('../promptBuilder');
const { v4: uuidv4 } = require('uuid');

function detectQueryType(message) {
  const lower = message.toLowerCase();
  if (lower.includes('joke') || lower.includes('funny')) return 'joke';
  if (lower.includes('how') || lower.includes('what') || lower.includes('why') || lower.includes('help')) return 'help';
  return 'general';
}

async function handleChat(req, res) {
  try {
    let sessionId = req.cookies.sessionId;
    if (!sessionId) {
      sessionId = uuidv4();
      res.cookie('sessionId', sessionId, { httpOnly: true, sameSite: 'lax' });
    }

    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required" });

    const queryType = detectQueryType(message);
    const prompt = buildPrompt(message, queryType);

    const ollamaResponse = await getOllamaResponse(prompt);
    
    // The database save operation has been removed.
    // await saveChat({ sessionId, user_query: message, response: ollamaResponse });

    res.json({ response: ollamaResponse, sessionId });

  } catch (err) {
    console.error("Chat error:", err.message);
    res.status(500).json({ error: "AI backend error." });
  }
}

async function handleHistory(req, res) {
  try {
    // Instead of fetching from the DB, return an empty array.
    // This prevents errors if the frontend expects a history endpoint.
    return res.json([]);
  } catch (err) {
    console.error("History fetch error:", err.message);
    res.status(500).json({ error: "Could not fetch chat history" });
  }
}

module.exports = { handleChat, handleHistory };