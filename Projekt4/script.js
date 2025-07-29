// Moderne ES6+ JavaScript basierend auf Ihrem ursprünglichen Code
// Event Listener für den Start-Button
document.getElementById('start').addEventListener('click', function() {
    const city = document.getElementById('city').value.trim();
    if (city) {
        fetchWeatherData(city);
    } else {
        // Kein Alert mehr - direkter Hinweis im Interface
        const input = document.getElementById('city');
        input.style.borderColor = '#e74c3c';
        input.placeholder = 'Bitte Stadt eingeben!';
        setTimeout(() => {
            input.style.borderColor = '#4f28e9';
            input.placeholder = 'Stadt eingeben';
        }, 2000);
    }
});
// Event Listener für Enter-Taste
document.getElementById('city').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        document.getElementById('start').click();
    }
});
// Back-Button Event Listener
document.getElementById('backButton').addEventListener('click', function() {
    document.getElementById('home').style.display = 'flex';
    document.getElementById('weather').style.display = 'none';
    document.getElementById('city').value = '';
});
// Geocoding-Funktion für echte Städte
async function getCoordinates(city) {
    try {
        const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=de&format=json`);
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
            return {
                lat: data.results[0].latitude,
                lon: data.results[0].longitude,
                name: data.results[0].name,
                country: data.results[0].country
            };
        } else {
            throw new Error('Stadt nicht gefunden');
        }
    } catch (error) {
        console.error('Geocoding-Fehler:', error);
        // Kein Alert mehr - direkter Hinweis im Interface
        const input = document.getElementById('city');
        input.style.borderColor = '#e74c3c';
        input.value = '';
        input.placeholder = 'Stadt nicht gefunden!';
        setTimeout(() => {
            input.style.borderColor = '#4f28e9';
            input.placeholder = 'Stadt eingeben';
        }, 3000);
        return null;
    }
}
// Erweiterte fetchWeatherData Funktion für 15 Tage
async function fetchWeatherData(city) {
    const coords = await getCoordinates(city);
    if (!coords) return;
    
    // API-URL für 15 Tage angepasst
    const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&hourly=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,sunrise,sunset&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&forecast_days=15&timezone=auto`;
    
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Netzwerkantwort war nicht ok: ' + response.statusText);
        }
        
        const data = await response.json();
        console.log('API Daten erhalten:', data); // Debug
        
        updateWeatherData(data, coords.name);
        updateHourlyForecast(data);
        updateWeeklyForecast(data);
        
        // Warte kurz, damit DOM bereit ist
        setTimeout(() => {
            updateTemperatureChart(data);
            updateSunTimes(data);
            // Nach dem Laden der Daten: Sonnenanimation vorbereiten
            setupSunAnimation();
        }, 100);
        
    } catch (error) {
        console.error('Fehler:', error);
        // Kein Alert mehr - direkter Hinweis im Interface
        const input = document.getElementById('city');
        input.style.borderColor = '#e74c3c';
        input.value = '';
        input.placeholder = 'Wetterdaten nicht verfügbar!';
        setTimeout(() => {
            input.style.borderColor = '#4f28e9';
            input.placeholder = 'Stadt eingeben';
        }, 3000);
    }
}
// Erweiterte updateWeatherData Funktion
function updateWeatherData(data, city) {
    if (!data.current) {
        console.error('Keine aktuellen Wetterdaten gefunden.');
        return;
    }
    const current = data.current;
    const date = new Date();
    
    // Stadtname und Datum mit HTML5 datetime
    document.getElementById('cityName').textContent = city;
    
    const dateTimeString = date.toLocaleDateString('de-DE', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    }) + " " + date.toLocaleTimeString('de-DE', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    const dateTimeElement = document.getElementById('dateTime');
    dateTimeElement.textContent = dateTimeString;
    dateTimeElement.setAttribute('datetime', date.toISOString());
    
    // Temperatur mit HTML5 data element
    const roundedTemperature = Math.round(current.temperature_2m);
    const tempElement = document.getElementById('temperature');
    tempElement.innerHTML = `${roundedTemperature}<sup>°</sup>`;
    tempElement.setAttribute('value', roundedTemperature);
    
    // Wetterbeschreibung und Icon
    const weatherDescription = getWeatherDescription(current.weather_code);
    document.getElementById('weatherDescription').textContent = weatherDescription;
    document.getElementById('weatherIcon').src = getWeatherIcon(current.weather_code);
    
    // Wetterdaten mit data elements
    const precipitationElement = document.getElementById('precipitation');
    const humidityElement = document.getElementById('humidity');
    const windElement = document.getElementById('wind');
    
    const precipitation = current.precipitation || 0;
    const humidity = current.relative_humidity_2m || 0;
    const windSpeed = Math.round(current.wind_speed_10m || 0);
    
    precipitationElement.textContent = `${precipitation} mm`;
    precipitationElement.setAttribute('value', precipitation);
    
    humidityElement.textContent = `${humidity} %`;
    humidityElement.setAttribute('value', humidity);
    
    windElement.textContent = `${windSpeed} km/h`;
    windElement.setAttribute('value', windSpeed);
    
    // Wetteransicht anzeigen
    document.getElementById('home').style.display = 'none';
    document.getElementById('weather').style.display = 'block';
}
// Neue stündliche Vorhersage (24 Stunden, horizontal)
function updateHourlyForecast(data) {
    const container = document.getElementById('hourlyForecast');
    const fragment = document.createDocumentFragment();
    
    // Nächste 24 Stunden
    for (let i = 0; i < 24 && i < data.hourly.time.length; i++) {
        const time = new Date(data.hourly.time[i]);
        const temp = Math.round(data.hourly.temperature_2m[i]);
        const weatherCode = data.hourly.weather_code[i];
        
        const hourItem = document.createElement('div');
        hourItem.className = 'hourly-item';
        hourItem.setAttribute('role', 'listitem');
        
        const timeString = time.getHours().toString().padStart(2, '0') + ':00';
        const description = getWeatherDescription(weatherCode);
        const iconSrc = getWeatherIcon(weatherCode);
        
        hourItem.innerHTML = `
            <div class="hourly-time">${timeString}</div>
            <img src="${iconSrc}" alt="${description}" class="hourly-icon" loading="lazy">
            <div class="hourly-desc">${description}</div>
            <div class="hourly-temp">${temp}°C</div>
        `;
        
        fragment.appendChild(hourItem);
    }
    
    container.innerHTML = '';
    container.appendChild(fragment);
}
// UPDATED 15-Tage-Vorhersage
function updateWeeklyForecast(data) {
    const container = document.getElementById('weeklyForecast');
    const fragment = document.createDocumentFragment();
    
    const days = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
    
    // Nächste 15 Tage
    for (let i = 0; i < 15 && i < data.daily.time.length; i++) {
        const date = new Date(data.daily.time[i]);
        const dayName = i === 0 ? 'Heute' : i === 1 ? 'Morgen' : days[date.getDay()];
        const dateString = date.getDate().toString().padStart(2, '0') + '.' + 
                          (date.getMonth() + 1).toString().padStart(2, '0');
        const maxTemp = Math.round(data.daily.temperature_2m_max[i]);
        const minTemp = Math.round(data.daily.temperature_2m_min[i]);
        const weatherCode = data.daily.weather_code[i];
        const description = getWeatherDescription(weatherCode);
        const iconSrc = getWeatherIcon(weatherCode);
        
        const dayItem = document.createElement('div');
        dayItem.className = 'daily-item';
        dayItem.setAttribute('role', 'listitem');
        
        dayItem.innerHTML = `
            <div class="daily-day">${dayName}</div>
            <div class="daily-date">${dateString}</div>
            <img src="${iconSrc}" alt="${description}" class="daily-icon" loading="lazy">
            <div class="daily-desc">${description}</div>
            <div class="daily-temps">
                <span class="temp-high">${maxTemp}°</span> / 
                <span class="temp-low">${minTemp}°</span>
            </div>
        `;
        
        fragment.appendChild(dayItem);
    }
    
    container.innerHTML = '';
    container.appendChild(fragment);
}
// UPDATED Temperatur-Liniendiagramm für 15 Tage
function updateTemperatureChart(data) {
    const canvas = document.getElementById('temperatureChart');
    if (!canvas) {
        console.error('Canvas element nicht gefunden');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    
    // Vorheriges Diagramm löschen
    if (window.temperatureChart && window.temperatureChart instanceof Chart) {
        window.temperatureChart.destroy();
    }
    
    // Überprüfen ob Daten vorhanden sind
    if (!data.daily || !data.daily.time || !data.daily.temperature_2m_max || !data.daily.temperature_2m_min) {
        console.error('Keine Temperaturdaten vorhanden');
        return;
    }
    
    // Daten für 15 Tage vorbereiten
    const days = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
    const labels = [];
    const maxTemps = [];
    const minTemps = [];
    
    for (let i = 0; i < 15 && i < data.daily.time.length; i++) {
        const date = new Date(data.daily.time[i]);
        let dayName;
        if (i === 0) {
            dayName = 'Heute';
        } else if (i === 1) {
            dayName = 'Morgen';
        } else if (i < 7) {
            dayName = days[date.getDay()];
        } else {
            // Für Tage nach einer Woche: Tag + Datum
            dayName = days[date.getDay()] + ' ' + date.getDate() + '.';
        }
        labels.push(dayName);
        maxTemps.push(Math.round(data.daily.temperature_2m_max[i]));
        minTemps.push(Math.round(data.daily.temperature_2m_min[i]));
    }
    
    console.log('Chart Daten:', { labels, maxTemps, minTemps }); // Debug
    
    // Chart.js Liniendiagramm
    try {
        window.temperatureChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Höchsttemperatur',
                        data: maxTemps,
                        borderColor: '#e74c3c',
                        backgroundColor: 'rgba(231, 76, 60, 0.1)',
                        borderWidth: 3,
                        fill: false,
                        tension: 0.4,
                        pointRadius: 4,
                        pointBackgroundColor: '#e74c3c',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointHoverRadius: 6
                    },
                    {
                        label: 'Tiefsttemperatur',
                        data: minTemps,
                        borderColor: '#3498db',
                        backgroundColor: 'rgba(52, 152, 219, 0.1)',
                        borderWidth: 3,
                        fill: false,
                        tension: 0.4,
                        pointRadius: 4,
                        pointBackgroundColor: '#3498db',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointHoverRadius: 6
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            color: '#4f28e9',
                            font: {
                                size: 10
                            },
                            padding: 10
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(79, 40, 233, 0.9)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: '#4f28e9',
                        borderWidth: 1,
                        padding: 10,
                        displayColors: true,
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': ' + context.parsed.y + '°C';
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#4f28e9',
                            font: {
                                size: 9
                            },
                            maxRotation: 45,
                            minRotation: 45
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(79, 40, 233, 0.1)',
                            drawBorder: false
                        },
                        ticks: {
                            color: '#4f28e9',
                            font: {
                                size: 10
                            },
                            stepSize: 5,
                            callback: function(value) {
                                return value + '°';
                            }
                        }
                    }
                }
            }
        });
        console.log('Chart erfolgreich erstellt');
    } catch (error) {
        console.error('Fehler beim Erstellen des Charts:', error);
    }
}
// Sonnenauf- und -untergangszeiten aktualisieren mit Sonnenposition
function updateSunTimes(data) {
    console.log('updateSunTimes aufgerufen', data); // Debug
    
    if (data.daily && data.daily.sunrise && data.daily.sunset && data.daily.sunrise[0] && data.daily.sunset[0]) {
        const sunrise = new Date(data.daily.sunrise[0]);
        const sunset = new Date(data.daily.sunset[0]);
        const now = new Date();
        
        console.log('Sonnenzeiten:', { sunrise, sunset }); // Debug
        
        const sunriseTime = sunrise.toLocaleTimeString('de-DE', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        const sunsetTime = sunset.toLocaleTimeString('de-DE', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        const sunriseElement = document.getElementById('sunrise');
        const sunsetElement = document.getElementById('sunset');
        
        if (sunriseElement && sunsetElement) {
            sunriseElement.textContent = sunriseTime;
            sunriseElement.setAttribute('datetime', sunrise.toISOString());
            
            sunsetElement.textContent = sunsetTime;
            sunsetElement.setAttribute('datetime', sunset.toISOString());
            
            console.log('Zeiten gesetzt:', { sunriseTime, sunsetTime }); // Debug
            
            // Sonnenposition basierend auf aktueller Zeit berechnen
            updateSunPosition(sunrise, sunset, now);
        } else {
            console.error('Sunrise oder Sunset Element nicht gefunden');
        }
    } else {
        console.error('Keine Sonnenauf-/untergangszeiten in den Daten gefunden', data.daily);
    }
}
// Funktion zur Berechnung der Sonnenposition
function updateSunPosition(sunrise, sunset, currentTime) {
    const sunElement = document.querySelector('.sun');
    if (!sunElement) return;
    
    const sunriseTime = sunrise.getTime();
    const sunsetTime = sunset.getTime();
    const currentTimeStamp = currentTime.getTime();
    
    let angle = 0; // Startposition (links)
    
    if (currentTimeStamp < sunriseTime) {
        // Vor Sonnenaufgang - Sonne bleibt links unten
        angle = 0;
    } else if (currentTimeStamp > sunsetTime) {
        // Nach Sonnenuntergang - Sonne bleibt rechts unten
        angle = 180;
    } else {
        // Zwischen Sonnenauf- und -untergang
        const totalDaylight = sunsetTime - sunriseTime;
        const elapsed = currentTimeStamp - sunriseTime;
        const progress = elapsed / totalDaylight;
        angle = progress * 180; // Von 0° bis 180°
    }
    
    // Speichere den berechneten Winkel für die Animation
    sunElement.setAttribute('data-target-angle', angle);
}
// Funktion für die Sonnenanimation beim Scrollen
function setupSunAnimation() {
    const sunSection = document.getElementById('sunSection');
    const sunElement = document.querySelector('.sun');
    
    if (!sunSection || !sunElement) {
        console.error('Sun section oder sun element nicht gefunden');
        return;
    }
    
    let hasAnimated = false;
    
    // Intersection Observer für die Sonnenanimation
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !hasAnimated) {
                hasAnimated = true;
                console.log('Sonnenanimation gestartet'); // Debug
                
                // Hole den Zielwinkel
                const targetAngle = sunElement.getAttribute('data-target-angle') || 90;
                console.log('Zielwinkel:', targetAngle); // Debug
                
                // Entferne die Animation-Klasse falls vorhanden
                sunElement.classList.remove('animate');
                
                // Force reflow
                void sunElement.offsetWidth;
                
                // Starte die Animation
                requestAnimationFrame(() => {
                    sunElement.classList.add('animate');
                    sunElement.style.transform = `rotate(${targetAngle}deg)`;
                });
            }
        });
    }, {
        threshold: 0.3, // Animation startet, wenn 30% der Section sichtbar ist
        rootMargin: '0px'
    });
    
    observer.observe(sunSection);
}
// Wetterbeschreibung basierend auf WMO Weather Code (ES6 Map)
const weatherDescriptions = new Map([
    [0, "Klar"],
    [1, "Überwiegend klar"],
    [2, "Teilweise bewölkt"],
    [3, "Bewölkt"],
    [45, "Nebel"],
    [48, "Ablagerungsraunebel"],
    [51, "Leichter Nieselregen"],
    [53, "Mäßiger Nieselregen"],
    [55, "Dichter Nieselregen"],
    [56, "Leichter gefrierender Nieselregen"],
    [57, "Dichter gefrierender Nieselregen"],
    [61, "Leichter Regen"],
    [63, "Mäßiger Regen"],
    [65, "Starker Regen"],
    [66, "Leichter gefrierender Regen"],
    [67, "Starker gefrierender Regen"],
    [71, "Leichter Schneefall"],
    [73, "Mäßiger Schneefall"],
    [75, "Starker Schneefall"],
    [77, "Schneekörner"],
    [80, "Leichte Regenschauer"],
    [81, "Mäßige Regenschauer"],
    [82, "Heftige Regenschauer"],
    [85, "Leichte Schneeschauer"],
    [86, "Starke Schneeschauer"],
    [95, "Gewitter"],
    [96, "Gewitter mit leichtem Hagel"],
    [99, "Gewitter mit starkem Hagel"]
]);
function getWeatherDescription(code) {
    return weatherDescriptions.get(code) || "Unbekannt";
}
// Wetter-Icon basierend auf WMO Weather Code (ES6 Map)
const weatherIcons = new Map([
    [0, "Wetter Icons/sonnig.png"],
    [1, "Wetter Icons/wenige_wolken.png"],
    [2, "Wetter Icons/bewölkt.png"],
    [3, "Wetter Icons/stark_bewölkt.png"],
    [45, "Wetter Icons/nebel.png"],
    [48, "Wetter Icons/nebel.png"],
    [51, "Wetter Icons/regen.png"],
    [53, "Wetter Icons/regen.png"],
    [55, "Wetter Icons/regen.png"],
    [56, "Wetter Icons/schneeregen.png"],
    [57, "Wetter Icons/schneeregen.png"],
    [61, "Wetter Icons/regen.png"],
    [63, "Wetter Icons/regen.png"],
    [65, "Wetter Icons/regen.png"],
    [66, "Wetter Icons/schneeregen.png"],
    [67, "Wetter Icons/schneeregen.png"],
    [71, "Wetter Icons/schnee.png"],
    [73, "Wetter Icons/schnee.png"],
    [75, "Wetter Icons/schnee.png"],
    [77, "Wetter Icons/schnee.png"],
    [80, "Wetter Icons/regenschauer.png"],
    [81, "Wetter Icons/regenschauer.png"],
    [82, "Wetter Icons/regenschauer.png"],
    [85, "Wetter Icons/schnee.png"],
    [86, "Wetter Icons/schnee.png"],
    [95, "Wetter Icons/gewitter.png"],
    [96, "Wetter Icons/gewitter.png"],
    [99, "Wetter Icons/gewitter.png"]
]);
function getWeatherIcon(code) {
    return weatherIcons.get(code) || "Wetter Icons/default-icon.png";
}
// App-Initialisierung
document.addEventListener('DOMContentLoaded', function() {
    console.log('Moderne Wetter-App mit HTML5/CSS3 geladen');
    
    // Automatische Aktualisierung der Sonnenposition alle 5 Minuten
    setInterval(() => {
        const sunriseElement = document.getElementById('sunrise');
        const sunsetElement = document.getElementById('sunset');
        
        if (sunriseElement.hasAttribute('datetime') && sunsetElement.hasAttribute('datetime')) {
            const sunrise = new Date(sunriseElement.getAttribute('datetime'));
            const sunset = new Date(sunsetElement.getAttribute('datetime'));
            const now = new Date();
            updateSunPosition(sunrise, sunset, now);
        }
    }, 300000); // 5 Minuten
});