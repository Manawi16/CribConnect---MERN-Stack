const CribbyChatbot = require('../models/cribby');

//db
async function saveChat({ sessionId, user_query, response, faq_based = false, blog_suggested = false, status = false }) {
  try {
    const chat = new CribbyChatbot({
      sessionId,
      user_query,
      response,
      faq_based,
      blog_suggested,
      status
    });
    return await chat.save();
  } catch (err) {
    console.error("Error saving chat:", err);
    throw err;
  }
}

//session ke liye
async function getChatHistory(sessionId) {
  try {
    return await CribbyChatbot.find({ sessionId }).sort({ timeStamp: 1 });
  } catch (err) {
    console.error("Error fetching history:", err);
    throw err;
  }
}

module.exports = {
  saveChat,
  getChatHistory
};
