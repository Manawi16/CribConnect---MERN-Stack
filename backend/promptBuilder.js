const fs = require('fs');
const path = require('path');

const faqs = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'faqs.json'), 'utf8'));
const blogs = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'blogs.json'), 'utf8'));
const rules = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'rules.json'), 'utf8'));
const langStyle = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'lang_style.json'), 'utf8'));
const responses = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'responses.json'), 'utf8'));
const mainPrompt = fs.readFileSync(path.join(__dirname, 'data', 'main_prompt.txt'), 'utf8');
const instructions = fs.readFileSync(path.join(__dirname, 'data', 'instructions.txt'), 'utf8');

function buildPrompt(userInput, type='general') {
  let ragContent = '';

  if (type === 'help') {
    ragContent = `
      FAQs: ${JSON.stringify(faqs)}
      Rules: ${JSON.stringify(rules)}
      Blogs: ${JSON.stringify(blogs)}
      Responses: ${JSON.stringify(responses)}
    `;
  }
  else if (type === 'joke') {
    ragContent = `
      Joke Style: ${JSON.stringify(langStyle.joke_style)}
      Cribby Jokes: ${JSON.stringify(responses.cribby_jokes)}
    `;
  }
  else { 
    ragContent = `
      Language Style: ${JSON.stringify(langStyle)}
      Responses: ${JSON.stringify(responses.greeting)}
    `;
  }

  return `
    ${mainPrompt}
    Instructions: ${instructions}
    ${ragContent}
    User: ${userInput}
  `;
}

module.exports = { buildPrompt };
