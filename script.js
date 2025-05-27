document.getElementById("currentDate").innerText = new Date().toDateString();

async function fetchData() {
  const res = await fetch('/api/daily');
  const data = await res.json();

  document.getElementById('quote').innerText = data.quote;
  document.getElementById('word').innerText = `${data.word.word}: ${data.word.definition}`;
  document.getElementById('gk-question').innerHTML = data.gk.question;
  document.getElementById('gk-options').innerHTML = data.gk.options.map(opt => `<li>${opt}</li>`).join('');
  document.getElementById('gk-answer').innerText = data.gk.correct;
  document.getElementById('event').innerText = data.event;
}

fetchData();

// i18n
const resources = {
  en: {
    translation: {
      title: "Daily Learning Hub",
      quote_title: "✨ Educational Quote",
      word_title: "📘 Word of the Day",
      gk_title: "🧠 General Knowledge",
      answer: "Answer:",
      event_title: "📅 This Day in History"
    }
  },
  hi: {
    translation: {
      title: "दैनिक ज्ञान केंद्र",
      quote_title: "✨ शिक्षाप्रद उद्धरण",
      word_title: "📘 आज का शब्द",
      gk_title: "🧠 सामान्य ज्ञान",
      answer: "उत्तर:",
      event_title: "📅 आज का ऐतिहासिक दिन"
    }
  }
};

i18next.init({ lng: "en", resources }, (err, t) => {
  updateContent();
});

function updateContent() {
  document.querySelectorAll("[data-i18n]").forEach(el => {
    el.innerText = i18next.t(el.getAttribute("data-i18n"));
  });
}

document.getElementById("languageSwitcher").addEventListener("change", e => {
  i18next.changeLanguage(e.target.value, updateContent);
});
