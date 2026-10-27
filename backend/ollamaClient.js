// // ollamaClient.js
// const axios = require('axios');

// async function getOllamaResponse(prompt) {
//   try {
//     const response = await axios.post(
//       'http://localhost:11434/api/generate',
//       {
//         //model: 'gemma3:1b',
//         model: 'phi3:mini',
//         prompt,
//         stream: false
//       },
//       { timeout: 200000 } // 20s timeout
//     );

//     return response.data.response || response.data;
//   } catch (err) {
//     if (err.code === 'ECONNREFUSED') {
//       console.error("Ollama is not running on localhost:11434.");
//     } else if (err.code === 'ECONNABORTED') {
//       console.error("Ollama request timed out.");
//     } else {
//       console.error("Ollama API error:", err.message);
//     }
//     throw new Error("Failed to fetch response from Ollama");
//   }
// }



// async function getCribbyResponse(prompt) {
//   const response = await axios.post('http://localhost:11434/api/generate', {
//     model: 'gemma3-1b',
//     prompt: prompt,
//     max_tokens: 120,  // 🔹 limit response length
//     temperature: 0.7,
//     top_p: 0.95,
//     stop: ["\n\n", "Okay, here's a response"]
//   });

//   return response.data.response;
// }


// module.exports = { getOllamaResponse };


// ollamaClient.js
const axios = require('axios');

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY; // store your key in .env

async function getOllamaResponse(prompt) {
  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/completions',
      {
        model: 'mistralai/mistral-small-3.2-24b-instruct:free',
        prompt: prompt,
        max_tokens: 300,
        temperature: 0.7,
        top_p: 0.95
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 20000 // 20s timeout
      }
    );

    return response.data.choices[0].text;
  } catch (err) {
    if (err.code === 'ECONNABORTED') {
      console.error("OpenRouter request timed out.");
    } else {
      console.error("OpenRouter API error:", err.message);
    }
    throw new Error("Failed to fetch response from OpenRouter");
  }
}


async function getCribbyResponse(prompt) {
  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/completions',
      {
        model: 'mistral-small-3',
        prompt: prompt,
        max_tokens: 120,  // limit response length
        temperature: 0.7,
        top_p: 0.95,
        stop: ["\n\n", "Okay, here's a response"]
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 20000 // 20s timeout
      }
    );

    return response.data.choices[0].text;
  } catch (err) {
    console.error("OpenRouter API error:", err.message);
    throw new Error("Failed to fetch Cribby response");
  }
}

module.exports = { getOllamaResponse, getCribbyResponse };
