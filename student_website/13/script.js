document.addEventListener('DOMContentLoaded', () => {
    const cityInput = document.getElementById('city-input');
    const citySubmit = document.getElementById('city-submit');
    const weatherContainer = document.getElementById('weather-container');
    const weatherInfo = document.getElementById('weather-info');
    const currentPrecipitationInfo = document.getElementById('current-precipitation-info');
    const tomorrowWeatherInfo = document.getElementById('tomorrow-weather-info');
    const tomorrowPrecipitationInfo = document.getElementById('tomorrow-precipitation-info');
    const newsContainer = document.getElementById('news-container');
    const scheduleContainer = document.getElementById('schedule-container');

    citySubmit.addEventListener('click', () => {
        const city = cityInput.value;
        if (city) {
            getWeather(city);
        }
    });

    function getWeather(city) {
        // wttr.in provides weather data in JSON format
        fetch(`https://wttr.in/${city}?format=j1`)
            .then(response => response.json())
            .then(data => {
                // Display current weather
                const currentWeather = data.current_condition[0];
                const weatherDesc = currentWeather.weatherDesc[0].value;
                weatherInfo.textContent = `현재 날씨: ${weatherDesc}, 온도: ${currentWeather.temp_C}°C`;
                currentPrecipitationInfo.textContent = `강수량: ${currentWeather.precipMM}mm`;

                // Update background based on weather
                updateBackground(weatherDesc);

                // Display tomorrow's weather
                const tomorrowWeather = data.weather[1];
                tomorrowWeatherInfo.textContent = `내일 날씨: ${tomorrowWeather.hourly[4].weatherDesc[0].value}, 최고기온: ${tomorrowWeather.maxtempC}°C, 최저기온: ${tomorrowWeather.mintempC}°C`;
                const tomorrowPrecipitation = tomorrowWeather.hourly.reduce((acc, hour) => acc + parseFloat(hour.precipMM), 0);
                tomorrowPrecipitationInfo.textContent = `예상 강수량: ${tomorrowPrecipitation.toFixed(1)}mm`;

                weatherContainer.classList.remove('hidden');
                newsContainer.classList.remove('hidden');
                scheduleContainer.classList.remove('hidden');
            })
            .catch(error => {
                console.error('Error fetching weather data:', error);
                weatherInfo.textContent = '날씨 정보를 가져오는 데 실패했습니다. 도시 이름을 확인해주세요.';
                weatherContainer.classList.remove('hidden');
            });
    }

    function updateBackground(weatherDesc) {
        let backgroundColor = '#DDDDDD'; // Default gray
        const lowerCaseDesc = weatherDesc.toLowerCase();

        if (lowerCaseDesc.includes('sunny') || lowerCaseDesc.includes('clear')) {
            backgroundColor = '#87CEEB'; // Sky Blue
        } else if (lowerCaseDesc.includes('rain') || lowerCaseDesc.includes('shower')) {
            backgroundColor = '#4682B4'; // Steel Blue
        } else if (lowerCaseDesc.includes('cloudy') || lowerCaseDesc.includes('overcast')) {
            backgroundColor = '#77AADD'; // A pleasant, deeper blue
        } else if (lowerCaseDesc.includes('snow') || lowerCaseDesc.includes('blizzard')) {
            backgroundColor = '#F0F8FF'; // Alice Blue
        } else if (lowerCaseDesc.includes('mist') || lowerCaseDesc.includes('fog')) {
            backgroundColor = '#BDBDBD'; // A lighter gray
        }
        
        document.body.style.backgroundImage = 'none'; // Remove any image
        document.body.style.backgroundColor = backgroundColor;
    }
});