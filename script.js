const apiKey = "18fc8f58911b4abcabb173357250504";
const cityInput = document.getElementById("cityInput");
 const languageSelect = document.getElementById("languageSelect");
const searchBtn = document.getElementById("searchBtn");

let translations = {};

const weatherEmojis = {
  clear: "☀️",
  sunny: "☀️",
  "partly cloudy": "⛅️",
  cloudy: "☁️",
  overcast: "☁️",
  mist: "🌫️",
  fog: "🌫️",
  rain: "☔️",
  drizzle: "☔️",
  thunder: "⛈️",
  thunderstorm: "⛈️",
  snow: "⛄️",
  sleet: "⛄️"
};

function getEmoji(condition) {
  const key = condition.toLowerCase();
  for (const name in weatherEmojis) {
    if (key.includes(name)) return weatherEmojis[name];
  }
  return "🌈";
}

function translate(key, lang) {
  return translations[lang]?.[key] || key;
}

function toggleTab(tabName) {
  document.querySelectorAll(".tab").forEach(tab => tab.classList.remove("active"));
  document.getElementById(`tab-${tabName}`).classList.add("active");
}

function getWeather(city, lang = "en") {
  fetch(`https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}&lang=${lang}`)
        .then(res => res.json())
        .then(data => {
          const emoji = getEmoji(data.current.condition.text);
          document.getElementById("tab-current").innerHTML = `
            <h2>${emoji} ${data.location.name}, ${data.location.country}</h2>
            <p>${translate("temperature", lang)}: ${data.current.temp_c}°C</p>
            <p>${translate("weather", lang)}: ${data.current.condition.text}</p>
            <p>${translate("humidity", lang)}: ${data.current.humidity}%</p>
          `;
          document.body.setAttribute("data-weather", data.current.condition.text.toLowerCase());
        });
    }

    function getForecast(city, lang = "en") {
      fetch(`https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&days=3&lang=${lang}`)
        .then(res => res.json())
        .then(data => {
          const html = data.forecast.forecastday.map(day => {
            const emoji = getEmoji(day.day.condition.text);
            return `
              <div>
                <p><strong>${day.date}</strong></p>
                <p>${emoji} ${day.day.avgtemp_c}°C - ${day.day.condition.text}</p>
              </div>
            `;
          }).join("");
          document.getElementById("tab-forecast").innerHTML = html;
        });
    }

    function getHistory(city, lang = "en") {
      const today = new Date();
      const promises = [];
      for (let i = 1; i <= 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dt = date.toISOString().split("T")[0];
        promises.push(
          fetch(`https://api.weatherapi.com/v1/history.json?key=${apiKey}&q=${city}&dt=${dt}&lang=${lang}`)
            .then(res => res.json())
            .then(data => {
              const emoji = getEmoji(data.forecast.forecastday[0].day.condition.text);
              return `
                <div>
                  <p><strong>${dt}</strong></p>
                  <p>${emoji} ${data.forecast.forecastday[0].day.avgtemp_c}°C - ${data.forecast.forecastday[0].day.condition.text}</p>
                </div>
              `;
            })
        );
      }

      Promise.all(promises).then(results => {
        document.getElementById("tab-history").innerHTML = results.join("");
      });
    }

    searchBtn.addEventListener("click", () => {
      const city = cityInput.value.trim();
      const lang = languageSelect.value;
      if (!city) return;

      localStorage.setItem("lastCity", city);
      getWeather(city, lang);
      getForecast(city, lang);
      getHistory(city, lang);
    });

    window.onload = () => {
      fetch("data.json")
        .then(response => response.json())
        .then(data => {
          translations = data.languages;
          const lang = languageSelect.value;
    
          const savedCity = localStorage.getItem("lastCity");
          const cities = ["Seoul", "Toronto", "New York", "Tokyo"]; //instead of using if/else statement this let me saved the previous city or use the cities so in the main page the information can be provided.
          const defaultCity = savedCity || cities[Math.floor(Math.random() * cities.length)];
    
          cityInput.value = defaultCity;
          toggleTab("current"); 
          getWeather(defaultCity, lang);
          getForecast(defaultCity, lang);
          getHistory(defaultCity, lang);
        })
        .catch(error => console.error("Translation load error:", error));
    };
    