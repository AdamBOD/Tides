var tideMarker = 0;

var locationLoaded = false;
var tidesLoaded = false;
var weatherLoaded = false;

var lowTideTime;
var highTideTime;

var windViewed = false;
var windDirection;
var windDirectionDeg;

var weatherIcons = {
    '01d': 'sunnyIcon',
    '02d': 'partlyCloudyIcon',
    '03d': 'mostlyCloudyIcon',
    '04d': 'cloudyIcon',
    '09d': 'sunnyShowersIcon',
    '10d': 'rainyIcon',
    '11d': 'lightningIcon',
    '13d': 'snowShowersIcon',
    '50d': 'mistySunnyIcon',
    '01n': 'clearNightIcon',
    '02n': 'partlyCloudyNightIcon',
    '03n': 'cloudyIcon',
    '04n': 'cloudyIcon',
    '09n': 'rainyIcon',
    '10n': 'rainyIcon',
    '11n': 'lightningIcon',
    '13n': 'snowShowersIcon',
    '50n': 'mistyNightIcon'
}

$(document).ready(function () {
    $('.owl-carousel').owlCarousel({
        dots: true, 
        items: 1,
        loop: false,
        nav: false,
        touchDrag: true
    });

    setupEventListeners();
    getData();
});

function setupEventListeners() {
    $(window).resize(() => {
        handleResolutionChange();
    });

    $('.owl-carousel').owlCarousel().on('changed.owl.carousel', (event) => {
        if (event.item.index === 1 && windDirectionDeg != null && !windViewed) {
            animateWindIconPosition();
        }
    });
}

function handleResolutionChange() {
    setupTideMarker();
}

function animateWindIconPosition() {
    window.setTimeout(() => {
        windViewed = true;
        var windDirectionIcon = $('.wind-direction-icon');

        windDirectionIcon.css('-webkit-transform',`rotate(-15deg)`);
        windDirectionIcon.css('-moz-transform',`rotate(-15deg)`);
        windDirectionIcon.css('transform',`rotate(-15deg)`);

        window.setTimeout(() => {
            windDirectionIcon.css('transition-duration',`0.5s`);
            windDirectionIcon.css('-webkit-transform',`rotate(${windDirectionDeg}deg)`);
            windDirectionIcon.css('-moz-transform',`rotate(${windDirectionDeg}deg)`);
            windDirectionIcon.css('transform',`rotate(${windDirectionDeg}deg)`);
        }, 400);
    }, 150);
}

function checkLoaded() {
    if (locationLoaded && tidesLoaded && weatherLoaded) {
        $('.loading-icon').addClass('loaded');
        $('.data-container').addClass('loaded');
    }
}

function getData() {
    if (navigator.geolocation != null) {
        navigator.geolocation.getCurrentPosition((data) => {
            if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                fetchData(data.coords.longitude, data.coords.latitude);
            }
            else {
                if (data.coords.accuracy >= 30) {
                    getLocationAlternative();
                }
                else {
                    fetchData(data.coords.longitude, data.coords.latitude);
                }
            }
        },
        (error) => {
            console.error(error);
            getLocationAlternative();
        },
        {
            enableHighAccuracy: true,
            maximumAge: 0
        });
    }
}

function getLocationAlternative() {
    console.log('Fetching Location using API');
    $.ajax ({
        url: `https://tidesapi.herokuapp.com/ip-location`,
        success: (data) => {
            fetchData(data.lon, data.lat);

            locationLoaded = true;
            checkLoaded();
        },
        error: (error) => {
            console.error (`Error getting API data: ${error.message}`);
            $('.location').html('Location unavailable');
            $('.highTide').html('--:--');
            $('.lowTide').html('--:--');
        }
    });
}

function fetchData (longitude, latitude) {
    $.ajax ({
        url: `https://tidesapi.herokuapp.com/location/?lat=${latitude}&long=${longitude}`,
        success: (data) => {
            var locationData = data;
            populateLocation(locationData);

            locationLoaded = true;
            checkLoaded();
        },
        error: (error) => {
            console.error(error);
            $('.location').html ('API unavailable');
        }
    });

    $.ajax ({
        url: `https://tidesapi.herokuapp.com/tides/?lat=${latitude}&long=${longitude}`,
        success: (data) => {
            var tideData = data;
            renderTides(tideData);

            tidesLoaded = true;
            checkLoaded();
        },
        error: (error) => {
            console.error(error);
            $('.highTide').html ('--:--');
            $('.lowTide').html ('--:--');
        }
    });

    $.ajax ({
        url: `https://tidesapi.herokuapp.com/weather/?lat=${latitude}&long=${longitude}`,
        success: (data) => {
            var windData = data.wind;
            windDirectionDeg = windData.deg;

            var weatherData = data.weather;
            var weatherTemp = data.main.temp;
            var atmosphericData = data.main;

            renderWind (windData);
            renderWeather (weatherData, weatherTemp, atmosphericData);

            weatherLoaded = true;
            checkLoaded();
        },
        error: (error) => {
            console.error(error);
        }
    });
}

function populateLocation(locationData) {
    locationData = locationData.results[0]?.components;
    if (locationData != null) {
        $('.location').text(`${locationData.city_district != null ? locationData.city_district : locationData.city}, ${locationData.county}, ${locationData.country}`);
    }
}

function renderTides(tideData) {
    if (tideData.tideLocationData.results != null && tideData.tideLocationData.results.length > 0) {
        var tideLocation = tideData.tideLocationData.results[0].components.city || 
            tideData.tideLocationData.results[0].components.city_district || 
            tideData.tideLocationData.results[0].components.town || 
            tideData.tideLocationData.results[0].components.village ||
            tideData.tideLocationData.results[0].components.county;

        $('.tide-location').text(`(${tideLocation})`);
    }

    if (tideData.extremes[0].date !== NaN) {
        if (tideData.extremes[0].type === 'High') {
            var highTideTimeUtc = moment.utc(tideData.extremes[0].date);
            highTideTime = moment(highTideTimeUtc).local().toDate();

            $('.high-tide-time').html(`${highTideTime.getHours() < 10 ? '0' : ''}${highTideTime.getHours()}:${highTideTime.getMinutes() < 10 ? '0' : ''}${highTideTime.getMinutes()}`);
            $('.high-tide-height').html(`${tideData.extremes[0].height}m`);
        }
        else {
            var lowTideTimeUtc = moment.utc(tideData.extremes[0].date);
            lowTideTime = moment(lowTideTimeUtc).local().toDate();

            $('.low-tide-time').html(`${lowTideTime.getHours() < 10 ? '0' : ''}${lowTideTime.getHours()}:${lowTideTime.getMinutes() < 10 ? '0' : ''}${lowTideTime.getMinutes()}`);
            $('.low-tide-height').html(`${tideData.extremes[0].height}m`);
        }

        if (tideData.extremes[1].type == 'Low') {
            var lowTideTimeUtc = moment.utc(tideData.extremes[1].date);
            lowTideTime = moment(lowTideTimeUtc).local().toDate();

            $('.low-tide-time').html(`${lowTideTime.getHours() < 10 ? '0' : ''}${lowTideTime.getHours()}:${lowTideTime.getMinutes() < 10 ? '0' : ''}${lowTideTime.getMinutes()}`);
            $('.low-tide-height').html(`${tideData.extremes[1].height}m`);
        }
        else {
            var highTideTimeUtc = moment.utc(tideData.extremes[1].date);
            highTideTime = moment(highTideTimeUtc).local().toDate();

            $('.high-tide-time').html(`${highTideTime.getHours() < 10 ? '0' : ''}${highTideTime.getHours()}:${highTideTime.getMinutes() < 10 ? '0' : ''}${highTideTime.getMinutes()}`);
            $('.high-tide-height').html(`${tideData.extremes[1].height}m`);
        }

        calculateTideHeight(lowTideTime, highTideTime);
    }
    else {
        $('.highTide').html ('Error getting tide data.');
    }
}

function calculateTideHeight(nextLowTide, nextHighTide) {
    let currentTime = new Date();

    if (nextLowTide < currentTime) {
        let currentTideTime = Math.abs(currentTime - lowTideTime);
        let timeDifference = nextHighTide - nextLowTide;

        tideMarker = currentTideTime / timeDifference;
        setupTideMarker();
    }
    else if (nextLowTide > currentTime) {
        let currentTideTime = Math.abs(currentTime - highTideTime);
        let timeDifference = nextLowTide - nextHighTide;
        
        tideMarker = 1 - (currentTideTime / timeDifference);
        setupTideMarker();
    }
}

function setupTideMarker() {
    if (tideMarker > 0.95) {
        tideMarker = 0.95;
    }
    else if (tideMarker < 0.05) {
        tideMarker = 0.05;
    }

    var tideMarkerHeight = $('.data-container').height() * tideMarker;
    var waveMarkerHeight = 25;
    var tideMarkerContainerHeight = $('.tide-marker-container').height();
    var tideMarkerTop = (tideMarkerContainerHeight - tideMarkerHeight) + waveMarkerHeight;
    var waveMarkerBottom = tideMarkerContainerHeight - tideMarkerTop;

    $('.tide-marker').animate({
        top: `${tideMarkerTop}px`
    }, 750, 'easeOutBounce');

    window.setTimeout(() => {
        $('.wave-marker').css('bottom', `${waveMarkerBottom - waveMarkerHeight}px`);
        $('.wave-marker').animate({
            height: `25px`,
            bottom: `${waveMarkerBottom}px`,
            opacity: '1'
        }, 150, 'linear');
    }, 600);
}

function renderWind (windData) {
    if (windData.deg >= 11.25 && windData.deg < 33.75) {
        windDirection = 'NNE';
    }
    else if (windData.deg >= 33.75 && windData.deg < 56.25) {
        windDirection = 'NE';
    }
    else if (windData.deg >= 56.25 && windData.deg < 78.75) {
        windDirection = 'ENE';
    }
    else if (windData.deg >= 78.75 && windData.deg < 101.25) {
        windDirection = 'E';
    }
    else if (windData.deg >= 101.25 && windData.deg < 123.75) {
        windDirection = 'ESE';
    }
    else if (windData.deg >= 123.75 && windData.deg < 146.25) {
        windDirection = 'SE';
    }
    else if (windData.deg >= 146.25 && windData.deg < 168.75) {
        windDirection = 'SSE';
    }
    else if (windData.deg >= 168.75 && windData.deg < 191.25) {
        windDirection = 'S';
    }
    else if (windData.deg >= 191.25 && windData.deg < 213.75) {
        windDirection = 'SSW';
    }
    else if (windData.deg >= 213.75 && windData.deg < 236.25) {
        windDirection = 'SW';
    }
    else if (windData.deg >= 236.25 && windData.deg < 258.75) {
        windDirection = 'WSW';
    }
    else if (windData.deg >= 258.75 && windData.deg < 281.25) {
        windDirection = 'W';
    }
    else if (windData.deg >= 281.25 && windData.deg < 303.75) {
        windDirection = 'WNW';
    }
    else if (windData.deg >= 303.75 && windData.deg < 326.25) {
        windDirection = 'NW';
    }
    else if (windData.deg >= 326.25 && windData.deg < 348.75) {
        windDirection = 'NNE';
    }
    else { // Wind Direction is North
        windDirection = 'N';
    }

    $('.wind-direction').html(windDirection);
    var windSpeedKnots = Math.round (windData.speed * 1.9438444924574);
    var windSpeedMPH = Math.round (windData.speed * 2.237);
    $('.wind-speed').html(`${windSpeedMPH} mph  -  ${windSpeedKnots} knots`);
}

function renderWeather(weatherData, weatherTemp, atmosphericData) {
    $(`#${weatherIcons[weatherData[0].icon]}`).css ('display', 'block');

    $('.weather-type').html (`${weatherData[0].main}`);
    $('.temperature').html (`${Math.round (weatherTemp)}\u00B0C`);
    $('.humidity').html (`${atmosphericData.humidity}%`);
    $('.pressure').html (`${atmosphericData.pressure}hPa`);
}