const express = require('express');
const fetch = require('node-fetch');
const mongoose = require('mongoose');
const cors = require('cors');
const { MONGO_URI } = require('./config');

const app = express();
app.use(cors());
app.use(express.static('public'));
const PORT = process.env.PORT || 3000;

// MongoDB
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
  const today = new Date().toISOString().slice(0, 10); // e.g., 2025-05-27

  let cached = await Entry.findOne({ date: today });
  if (cached) return res.json(cached);

  try {
    const [quoteRes, wordRes, gkRes, eventRes] = await Promise.all([
      fetch('https://api.quotable.io/random?tags=education|inspirational'),
      fetch('https://random-words-api.vercel.app/word'),
      fetch('https://opentdb.com/api.php?amount=1&type=multiple'),
      fetch(`https://byabbe.se/on-this-day/${new Date().getMonth() + 1}/${new Date().getDate()}/events.json`)
    ]);

    const quoteData = await quoteRes.json();
    const wordData = await wordRes.json();
    const gkData = await gkRes.json();
    const eventData = await eventRes.json();

    const gk = gkData.results[0];
    const event = eventData.events[Math.floor(Math.random() * eventData.events.length)];

    const dailyData = {
      date: today,
      quote: `${quoteData.content} — ${quoteData.author}`,
      word: wordData[0],
      gk: {
        question: gk.question,
        correct: gk.correct_answer,
        options: [...gk.incorrect_answers, gk.correct_answer].sort(() => 0.5 - Math.random()),
      },
      event: `${event.year} – ${event.description}`
    };

    await Entry.create(dailyData);
    res.json(dailyData);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
