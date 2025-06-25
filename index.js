const express = require("express");
const fetch = require("node-fetch");
const app = express();

// Coordonnées GPS
const LAT = 48.7165344;
const LON = 1.8917064;
const API_KEY = "d419ecba6a1003402286330e201e76b4"; // Clé OpenWeatherMap

app.get("/", async (req, res) => {
  try {
    const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${LAT}&lon=${LON}&exclude=hourly,daily,current,alerts&appid=${API_KEY}&units=metric`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data.minutely || data.minutely.length === 0) {
      return res.json({
        frames: [
          { text: "Données météo indisponibles", icon: "21903" }
        ]
      });
    }

    const seuil = 0.3; // mm – seuil de pluie visible
    let pluieDans = null;

    for (let i = 0; i < data.minutely.length; i++) {
      const mm = data.minutely[i].precipitation;
      if (mm >= seuil) {
        pluieDans = i;
        break;
      }
    }

    let frames = [];

    if (pluieDans !== null) {
      const maintenant = new Date();
      const heurePluie = new Date(maintenant.getTime() + pluieDans * 60000);
      const hh = heurePluie.getHours().toString().padStart(2, "0");
      const mm = heurePluie.getMinutes().toString().padStart(2, "0");

      if (pluieDans < 5) {
        frames.push({ text: "ALERTE : pluie imminente", icon: "21905" });
      }

      frames.push({ text: `Pluie dans ${pluieDans} min`, icon: "21904" });
      frames.push({ text: `À ${hh}h${mm}`, icon: "21904" });
    } else {
      frames.push({ text: "Ciel calme", icon: "21903" });
    }

    res.json({ frames });

  } catch (e) {
    console.error("Erreur météo :", e.message);
    res.json({
      frames: [
        { text: "Erreur météo", icon: "21903" }
      ]
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("✅ Serveur météo actif"));