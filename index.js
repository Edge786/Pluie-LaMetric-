const express = require("express");
const fetch = require("node-fetch");
const app = express();

// Coordonnées précises pour Les Essarts-le-Roi
const LAT = 48.7165344;
const LON = 1.8917064;
const VILLE = "Essarts-le-Roi"; // Affiché uniquement
const API_KEY = "d419ecba6a1003402286330e201e76b4";

app.get("/", async (req, res) => {
  try {
    const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${LAT}&lon=${LON}&exclude=hourly,daily,current,alerts&appid=${API_KEY}&units=metric`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data.minutely || data.minutely.length === 0) {
      return res.json({
        frames: [
          { text: "🌥️ Données indisponibles", icon: "21903" },
          { text: `📍 ${VILLE}`, icon: "21903" }
        ]
      });
    }

    // Seuil de pluie significative (en mm/h)
    const seuil = 0.2;
    let pluieDans = null;
    let intensite = 0;

    for (let i = 0; i < data.minutely.length; i++) {
      const mm = data.minutely[i].precipitation;
      if (mm >= seuil) {
        pluieDans = i;
        intensite = mm;
        break;
      }
    }

    let message;
    if (pluieDans !== null) {
      const intensitéTexte =
        intensite < 1 ? "fine" :
        intensite < 3 ? "modérée" :
        "forte";
      message = `☔ Pluie ${intensitéTexte} dans ${pluieDans} min`;
    } else {
      message = "🌤 Pas de pluie significative";
    }

    return res.json({
      frames: [
        { text: message, icon: "21903" },
        { text: `📍 ${VILLE}`, icon: "21903" }
      ]
    });

  } catch (error) {
    console.error("❌ Erreur :", error.message);
    return res.json({
      frames: [
        { text: "❌ Erreur météo", icon: "21903" },
        { text: `📍 ${VILLE}`, icon: "21903" }
      ]
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Serveur météo actif sur le port ${PORT}`);
});