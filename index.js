const express = require("express");
const fetch = require("node-fetch");
const app = express();

// Coordonnées : Essarts-le-Roi
const LAT = 48.7165344;
const LON = 1.8917064;

app.get("/", async (req, res) => {
  try {
    const response = await fetch("https://api.rainviewer.com/public/weather-maps.json");
    const data = await response.json();
    const nowcast = data.radar?.nowcast;

    if (!nowcast || nowcast.length === 0) {
      return res.json({
        frames: [{ text: "🌤 Pas de pluie à venir", icon: "21903" }]
      });
    }

    const now = Date.now() / 1000;
    const nextFrame = nowcast.find(f => f.time > now);
    const diffSec = nextFrame ? nextFrame.time - now : Infinity;
    const minutes = Math.ceil(diffSec / 60);

    const text = isFinite(minutes)
      ? `☔ Pluie dans ${minutes} min`
      : "🌤 Pas de pluie détectée";

    return res.json({
      frames: [{ text, icon: "21903" }]
    });

  } catch (error) {
    console.error("Erreur météo :", error);
    return res.json({
      frames: [{ text: "⚠️ Erreur météo", icon: "21903" }]
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Serveur lancé sur le port ${PORT}`);
});