const express = require('express');
const path = require('path');
require('dotenv').config();
const OpenAI = require('openai');

const app = express();
app.use(express.json({limit:'1mb'}));
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/chat', async (req, res) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(503).json({error:'API key is missing'});
  const message = String(req.body.message || '').trim();
  if (!message) return res.status(400).json({error:'Message is required'});
  try {
    const client = new OpenAI({apiKey});
    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        {role:'system', content:'তুমি Tamim X AI, একজন সহায়ক বাংলা-ইংরেজি ভয়েস অ্যাসিস্ট্যান্ট। ব্যবহারকারীর ভাষায় সংক্ষিপ্ত, স্বাভাবিক ও পরিষ্কারভাবে উত্তর দাও।'},
        {role:'user', content:message}
      ]
    });
    res.json({reply: completion.choices[0]?.message?.content || 'দুঃখিত, উত্তর তৈরি করতে পারিনি।'});
  } catch (error) {
    console.error(error);
    res.status(500).json({error:'AI request failed'});
  }
});
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Tamim X AI running at http://localhost:${port}`));
