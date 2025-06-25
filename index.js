const express = require("express");
const fetch = require("node-fetch");
const app = express();

// Coordonnées des Essarts-le-Roi
const LAT = 48.7165344;
const LON = 1.8917064;
const API_KEY = "d419ecba6a1003402286330e201e76b4";

app.get("/", async (req, res) => {
  try {
    const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${LAT}&lon=${LON}&exclude=hourly,daily,current,alerts&appid=${API_KEY}&units=metric`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data.minutely || data.minutely.length === 0) {
      return res.json({
        frames: [{ text: "⚠️ Aucune donnée minute", icon: "21903" }]
      });
    }

    // Cherche dans combien de minutes la pluie dépasse 0.1 mm/h
    let pluieDans = null;
    for (let i = 0; i < data.minutely.length; i++) {
      if (data.minutely[i].precipitation > 0.1) {
        pluieDans = i;
        break;
      }
    }

    let text;
    if (pluieDans !== null) {
      text = `☔ Pluie dans ${pluieDans} min`;
    } else {
      text = "🌤 Pas de pluie dans l'heure";
    }

    res.json({
      frames: [{ text, icon: "21903" }]
    });

  } catch (e) {
    console.error("Erreur OpenWeatherMap :", e);
    res.json({
      frames: [{ text: "❌ Erreur météo", icon: "21903" }]
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌍 Serveur actif sur port ${PORT}`);
});