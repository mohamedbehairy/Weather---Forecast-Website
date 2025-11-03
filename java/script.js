var citySearchInput = document.getElementById("citySearchInput");
var searchBtn = document.getElementById("searchBtn");
var weatherCardsContainer = document.getElementById("weatherCardsContainer");
var lastValidCity = "";
var currentLocation = "";
window.addEventListener("load", function () {
  navigator.geolocation.getCurrentPosition(
    function (position) {
      currentLocation = `${position.coords.latitude},${position.coords.longitude}`;
      console.log("Current Location:", currentLocation);
      getWeatherApi();
    },
    function () {
      Swal.fire({
        icon: "warning",
        title: "Oops...",
        text: `We cannot detrmine your location Search manually please`,
      });
    }
  );
});

async function getWeatherApi() {
  try {
    if (!currentLocation) return;
    var response = await fetch(
      `https://api.weatherapi.com/v1/forecast.json?key=91ab0bd6cfd6499f8b802443242211&q=${currentLocation}&days=3&aqi=yes&alerts=no`
    );
    var data = await response.json();
    if (!response.ok || data.error) {
      throw new Error(
        data?.error?.message || "Failed to load default city weather."
      );
    }
    displayCards(data.forecast.forecastday, data.location.name);
    lastValidCity = data.location.name;
  } catch (err) {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: ` Failed to load default city weather.`,
    });
  }
}

function displayCards(arr, cityName) {
  var htmlMarkUP = ``;

  for (let i = 0; i < arr.length; i++) {
    var date = new Date(arr[i].date);

    var dayName = date.toLocaleDateString("en-US", { weekday: "long" });
    var monthName = date.toLocaleDateString("en-US", { month: "short" });
    var dayNumber = date.getDate();

    htmlMarkUP += `
     <div class="col-lg-4 col-md-6">
        <div class="weather-card">
          <div class="card-header-top">
            <span class="day-name">${dayName}</span>
            <span class="date-text">${dayNumber} ${monthName}</span>
          </div>
          <h3 class="city-name">${cityName}</h3>
          <div class="temperature">${arr[i].day.avgtemp_c}°C</div>
          <div class="weather-icon-container">
            <img src="https:${arr[i].day.condition.icon}" alt="icon" />
          </div>
          <p class="condition-text">${arr[i].day.condition.text}</p>
          <div class="weather-details">
            <div class="detail-item">
              <i class="fas fa-tint detail-icon"></i>
              <div class="detail-value">${arr[i].day.avghumidity}%</div>
              <div class="detail-label">Humidity</div>
            </div>
            <div class="detail-item">
              <i class="fas fa-wind detail-icon"></i>
              <div class="detail-value">${arr[i].day.maxwind_kph} km/h</div>
              <div class="detail-label">Wind Speed</div>
            </div>
            <div class="detail-item">
              <i class="fas fa-compass detail-icon"></i>
              <div class="detail-value">${arr[i].hour[0].wind_dir}</div>
              <div class="detail-label">Direction</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
  weatherCardsContainer.innerHTML = htmlMarkUP;
}

async function searchCity(city) {
  try {
    var trimmed = (city || "").trim();
    if (!trimmed) {
      if (lastValidCity && trimmed !== lastValidCity) {
        await searchCity(lastValidCity);
      }
      return;
    }
    var response = await fetch(
      `https://api.weatherapi.com/v1/forecast.json?key=91ab0bd6cfd6499f8b802443242211&q=${trimmed}&days=3&aqi=yes&alerts=no`
    );
    var data = await response.json();
    if (!response.ok || data.error) {
      throw new Error(
        data?.error?.message || "City not found. Please try another name."
      );
    }
    displayCards(data.forecast.forecastday, data.location.name);
    lastValidCity = data.location.name;
    console.log(data, `data.forecast`);
  } catch (err) {
    if (lastValidCity && city !== lastValidCity) {
      await searchCity(lastValidCity);
    }
  }
}
// # Handle inputs Events

citySearchInput.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    searchCity(e.target.value);
  }
});
citySearchInput.addEventListener("input", function (e) {
  searchCity(e.target.value);
});
searchBtn.addEventListener("click", function () {
  searchCity(citySearchInput.value);
});
