const express = require("express");
const fetch = require("node-fetch");
const app = express();

// Coordonnées Essarts-le-Roi
const LAT = 48.7165344;
const LON = 1.8917064;
const VILLE = "Essarts-le-Roi";
const API_KEY = "d419ecba6a1003402286330e201e76b4";

app.get("/", async (req, res) => {
  try {
    const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${LAT}&lon=${LON}&exclude=hourly,daily,current,alerts&appid=${API_KEY}&units=metric`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data.minutely || data.minutely.length === 0) {
      return res.json({
        frames: [
          { text: "⚠️ Données indisponibles", icon: "21903" },
          { text: `📍 ${VILLE}`, icon: "21903" }
        ]
      });
    }

    // Seuils personnalisés
    const SEUIL_MIN_VISIBLE = 0.3; // mm/h – on ignore les micro-gouttes
    const SEUIL_PLUIE_FORTE = 3.0;

    let pluieDans = null;
    let intensite = 0;

    for (let i = 0; i < data.minutely.length; i++) {
      const mm = data.minutely[i].precipitation;
      if (mm >= SEUIL_MIN_VISIBLE) {
        pluieDans = i;
        intensite = mm;
        break;
      }
    }

    let frames = [];

    if (pluieDans !== null) {
      let niveau =
        intensite < 1 ? "fine" :
        intensite < SEUIL_PLUIE_FORTE ? "modérée" : "forte";

      let icone =
        intensite < 1 ? "21903" :
        intensite < SEUIL_PLUIE_FORTE ? "21904" : "21905"; // codes d’icône LaMetric météo

      frames.push({
        text: `🌧 Pluie ${niveau} dans ${pluieDans} min`,
        icon: icone
      });

    } else {
      // Si faible pluie détectée (< 0.3), on envoie un message différent
      const goutte = data.minutely.find(m => m.precipitation > 0);
      if (goutte) {
        frames.push({
          text: `💦 Micro-gouttes sans impact`,
          icon: "21903"
        });
      } else {
        frames.push({
          text: "🌤 Ciel calme",
          icon: "21903"
        });
      }
    }

    frames.push({ text: `📍 ${VILLE}`, icon: "21903" });

    return res.json({ frames });

  } catch (e) {
    console.error("❌ Erreur météo :", e.message);
    return res.json({
      frames: [
        { text: "❌ Erreur météo", icon: "21903" },
        { text: `📍 ${VILLE}`, icon: "21903" }
      ]
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Serveur météo prêt`));