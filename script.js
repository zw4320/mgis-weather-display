const API_KEY = 'c29d3e884271491d995140912250110';
const API_URL = 'https://api.weatherapi.com/v1/forecast.json';

const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const weatherInfo = document.getElementById('weatherInfo');
const loading = document.getElementById('loading');
const error = document.getElementById('error');
const celsiusBtn = document.getElementById('celsiusBtn');
const fahrenheitBtn = document.getElementById('fahrenheitBtn');

let currentUnit = 'C';
let weatherData = null;

async function getWeather(city) {
    if (!city.trim()) {
        showError('Please enter a city name');
        return;
    }

    showLoading();
    hideError();
    hideWeather();

    try {
        const url = `${API_URL}?key=${API_KEY}&q=${encodeURIComponent(city)}&days=2&aqi=no&alerts=no`;
        
        console.log('Fetching weather for:', city);
        console.log('Request URL:', url);
        
        const response = await fetch(url);
        console.log('Response status:', response.status);

        if (!response.ok) {
            if (response.status === 400) {
                throw new Error('City not found. Please check the spelling and try again.');
            } else if (response.status === 401 || response.status === 403) {
                throw new Error('Invalid API key. Please check your API key at weatherapi.com');
            } else {
                throw new Error(`API Error: ${response.status}`);
            }
        }

        const data = await response.json();
        console.log('Weather data received:', data);
        
        if (!data.forecast || !data.forecast.forecastday) {
            throw new Error('Unable to retrieve forecast data. Please try again.');
        }
        
        weatherData = data;
        displayWeather(data);
    } catch (err) {
        console.error('Error details:', err);
        showError(err.message || 'Unable to fetch weather data. Please try again.');
    } finally {
        hideLoading();
    }
}

function displayWeather(data) {
    try {
        const location = data.location;
        const current = data.current;
        const forecast = data.forecast.forecastday[0];

        document.getElementById('cityName').textContent = location.name;
        document.getElementById('region').textContent = `${location.region}, ${location.country}`;
        
        const temp = currentUnit === 'C' ? current.temp_c : current.temp_f;
        const feelsLike = currentUnit === 'C' ? current.feelslike_c : current.feelslike_f;
        
        document.getElementById('temperature').textContent = `${Math.round(temp)}°${currentUnit}`;
        document.getElementById('description').textContent = current.condition.text;
        document.getElementById('feelsLike').textContent = `Feels like ${Math.round(feelsLike)}°${currentUnit}`;
        document.getElementById('humidity').textContent = `${current.humidity}%`;
        document.getElementById('windSpeed').textContent = `${current.wind_kph} km/h`;
        document.getElementById('pressure').textContent = `${current.pressure_mb} mb`;
        document.getElementById('uv').textContent = current.uv;
        
        const iconUrl = `https:${current.condition.icon}`;
        document.getElementById('weatherIcon').src = iconUrl;
        document.getElementById('weatherIcon').alt = current.condition.text;

        if (forecast && forecast.hour) {
            displayHourlyForecast(forecast.hour);
        }

        showWeather();
    } catch (error) {
        console.error('Error displaying weather:', error);
        showError('Error displaying weather data. Please try again.');
    }
}

function displayHourlyForecast(hours) {
    const hourlyContainer = document.getElementById('hourlyForecast');
    hourlyContainer.innerHTML = '';

    if (!hours || hours.length === 0) {
        hourlyContainer.innerHTML = '<p style="text-align: center; color: #666;">Hourly forecast not available</p>';
        return;
    }

    const now = new Date();
    const currentHour = now.getHours();

    const upcomingHours = hours.filter(hour => {
        const hourTime = new Date(hour.time);
        return hourTime >= now;
    });

    const hoursToDisplay = upcomingHours.length > 0 ? upcomingHours : hours;

    hoursToDisplay.forEach((hour) => {
        const hourTime = new Date(hour.time);
        const hourNum = hourTime.getHours();

        let displayHour = hourNum % 12;
        if (displayHour === 0) displayHour = 12;
        const ampm = hourNum >= 12 ? 'PM' : 'AM';
        const timeString = `${displayHour} ${ampm}`;

        const temp = currentUnit === 'C' ? hour.temp_c : hour.temp_f;

        const card = document.createElement('div');
        card.className = 'hourly-card';
        card.innerHTML = `
            <div class="hourly-time">${timeString}</div>
            <div class="hourly-icon">
                <img src="https:${hour.condition.icon}" alt="${hour.condition.text}">
            </div>
            <div class="hourly-temp">${Math.round(temp)}°${currentUnit}</div>
            <div class="hourly-condition">${hour.condition.text}</div>
        `;

        hourlyContainer.appendChild(card);
    });
}

function showLoading() {
    loading.style.display = 'block';
}

function hideLoading() {
    loading.style.display = 'none';
}

function showError(message) {
    error.textContent = message;
    error.style.display = 'block';
}

function hideError() {
    error.style.display = 'none';
}

function showWeather() {
    setTimeout(() => {
        weatherInfo.style.display = 'block';
    }, 100);
}

function hideWeather() {
    weatherInfo.style.display = 'none';
}

searchBtn.addEventListener('click', () => {
    getWeather(cityInput.value);
});

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        getWeather(cityInput.value);
    }
});

window.addEventListener('load', () => {
    setTimeout(() => {
        getWeather('Rochester');
    }, 500);
});

celsiusBtn.addEventListener('click', () => {
    if (currentUnit !== 'C') {
        currentUnit = 'C';
        celsiusBtn.classList.add('active');
        fahrenheitBtn.classList.remove('active');
        if (weatherData) {
            displayWeather(weatherData);
        }
    }
});

fahrenheitBtn.addEventListener('click', () => {
    if (currentUnit !== 'F') {
        currentUnit = 'F';
        fahrenheitBtn.classList.add('active');
        celsiusBtn.classList.remove('active');
        if (weatherData) {
            displayWeather(weatherData);
        }
    }
});