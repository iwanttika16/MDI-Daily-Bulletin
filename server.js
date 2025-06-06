require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.static('public'));

const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT || 3000;

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const entrySchema = new mongoose.Schema({
  date: { type: String, unique: true },
  quote: String,
  word: Object,
  gk: Object,
  event: String,
});
const Entry = mongoose.model('Entry', entrySchema);

app.get('/api/daily', async (req, res) => {
  const today = new Date().toISOString().slice(0, 10);

  let cached = await Entry.findOne({ date: today });
  if (cached) return res.json(cached);

  try {
    const [quoteRes, wordRes, gkRes, eventRes] = await Promise.all([
      fetch('https://api.quotable.io/random?tags=education|inspirational'),
      fetch('https://random-words-api.vercel.app/word'),
      fetch('https://opentdb.com/api.php?amount=1&type=multiple'),
      fetch(`https://byabbe.se/on-this-day/${new Date().getMonth() + 1}/${new Date().getDate()}/events.json`)
    ]);

    const quote = await quoteRes.json();
    const word = await wordRes.json();
    const gk = await gkRes.json();
    const eventData = await eventRes.json();
    const event = eventData.events[Math.floor(Math.random() * eventData.events.length)];

    const dailyData = {
      date: today,
      quote: `${quote.content} — ${quote.author}`,
      word: word[0],
      gk: {
        question: gk.results[0].question,
        correct: gk.results[0].correct_answer,
        options: [...gk.results[0].incorrect_answers, gk.results[0].correct_answer].sort(() => 0.5 - Math.random())
      },
      event: `${event.year} – ${event.description}`
    };

    await Entry.create(dailyData);
    res.json(dailyData);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
