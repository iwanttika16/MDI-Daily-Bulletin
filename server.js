const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.static('public')); // For index.html, CSS, JS
const PORT = 3000;

app.get('/api/daily', async (req, res) => {
  const today = new Date();
  const month = today.getMonth() + 1;
  const day = today.getDate();

  try {
    const [quoteRes, wordRes, gkRes, eventRes] = await Promise.all([
      fetch('https://api.quotable.io/random?tags=education|inspirational'),
      fetch('https://random-words-api.vercel.app/word'),
      fetch('https://opentdb.com/api.php?amount=1&type=multiple'),
      fetch(`https://byabbe.se/on-this-day/${month}/${day}/events.json`)
    ]);

    const quoteData = await quoteRes.json();
    const wordData = await wordRes.json();
    const gkData = await gkRes.json();
    const eventData = await eventRes.json();

    const gk = gkData.results[0];
    const event = eventData.events[Math.floor(Math.random() * eventData.events.length)];

    res.json({
      quote: `${quoteData.content} — ${quoteData.author}`,
      word: wordData[0],
      gk: {
        question: gk.question,
        correct: gk.correct_answer,
        options: [...gk.incorrect_answers, gk.correct_answer].sort(() => 0.5 - Math.random())
      },
      event: `${event.year} – ${event.description}`
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Data fetch failed" });
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
