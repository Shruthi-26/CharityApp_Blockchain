const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());

const messages = {
  en: { donate: "How to donate?", past: "Show my past donations" },
  hi: { donate: "दान कैसे करें?", past: "मेरे पिछले दान दिखाएँ" },
  es: { donate: "¿Cómo donar?", past: "Mostrar mis donaciones pasadas" },
  fr: { donate: "Comment donner?", past: "Afficher mes dons passés" },
  ta: { donate: "எப்படி தானம் செய்யலாம்?", past: "என் முந்தைய நன்கொடை காட்டவும்" }
};

app.post("/chat", (req, res) => {
  const { message, lang } = req.body;
  let reply = "Sorry, I didn't understand.";
  const l = messages[lang] ? lang : "en";

  if(message.toLowerCase().includes("donate")) reply = messages[l].donate;
  if(message.toLowerCase().includes("past")) reply = messages[l].past;

  res.json({ reply });
});

app.listen(5000, () => console.log("Chatbot backend running on 5000"));