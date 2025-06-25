const express = require("express");
const fetch = require("node-fetch");
const app = express();

const LAT = 48.7165344, LON = 1.8917064;

app.get("/", async (req, res) => {
  try {
    const resp = await fetch("https://api.rainviewer.com/public/weather-maps.json");
    const data = await resp.json();
    const nowcast = data.radar.nowcast;
    if (!nowcast?.length) {
      return res.json({ frames: [{ text: "🌤 Pas de pluie", icon: "21903" }] });
    }
    const now = Date.now()/1000;
    const min = Math.ceil(Math.min(...nowcast.map(f => f.time - now))/60);
    const text = `☔ Pluie dans ${isFinite(min) ? min : 0} min`;
    res.json({ frames: [{ text, icon: "21903" }] });
  } catch (e) {
    res.json({ frames: [{ text: "⚠️ Erreur météo", icon: "21903" }] });
  }
});

app.listen(process.env.PORT || 3000, () => console.log("✔️ Ready"));