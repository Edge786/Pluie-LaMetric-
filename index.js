const express = require("express");
const fetch = require("node-fetch");
const app = express();

// 📍 Coordonnées Essarts-le-Roi
const LAT = 48.7165344;
const LON = 1.8917064;
const API_KEY = "d419ecba6a1003402286330e201e76b4"; // Ta clé OWM

app.get("/", async (req, res) => {
  try {
    const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${LAT}&lon=${LON}&exclude=hourly,daily,current,alerts&appid=${API_KEY}&units=metric`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data.minutely || data.minutely.length === 0) {
      return res.json({
        frames: [
          { text: "Données indisponibles", icon: "21903" }
        ]
      });
    }

    // On cherche la première minute avec pluie significative
    const seuil = 0.3;
    let pluieDans = null;

    for (let i = 0; i < data.minutely.length; i++) {
      const mm = data.minutely[i].precipitation;
      if (mm >= seuil) {
        pluieDans = i;
        break;
      }
    }

    let message;
    if (pluieDans !== null) {
      message = `Pluie dans ${pluieDans} min`;
    } else {
      message = "Ciel calme";
    }

    res.json({
      frames: [
        { text: message, icon: "21904" }
      ]
    });

  } catch (e) {
    console.error("❌ Erreur météo :", e.message);
    res.json({
      frames: [
        { text: "Erreur météo", icon: "21903" }
      ]
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("✅ Serveur météo lancé"));