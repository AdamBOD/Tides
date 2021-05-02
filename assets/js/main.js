var tideMarker = 0;
var lowTideTime;
var highTideTime;

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
}

function handleResolutionChange() {
    setupTideMarker();
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
            var weatherData = data.weather;
            var weatherTemp = data.main.temp;
            var atmosphericData = data.main;

            renderWind (windData);
            renderWeather (weatherData, weatherTemp, atmosphericData);
        },
        error: (error) => {
            console.error(error);
        }
    });
}

function renderTides(tideData) {
    if (tideData.tideLocationData.results != null && tideData.tideLocationData.results.length > 0) {
        var tideLocation = tideData.tideLocationData.results[0].components.city || 
            tideData.tideLocationData.results[0].components.city_district || 
            tideData.tideLocationData.results[0].components.town || 
            tideData.tideLocationData.results[0].components.village;

        $('.tide-location').text(`(${tideLocation})`);
    }

    console.log(tideData.extremes)

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
        $('.highTide').html ("Error getting tide data.");
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
    else if (nextLowTide > currentTime && currentTime > nextHighTide) {
        let currentTideTime = Math.abs(currentTime - highTideTime);
        let timeDifference = nextLowTide - nextHighTide;
        
        tideMarker = currentTideTime / timeDifference;
        setupTideMarker();
    }
}

function setupTideMarker() {
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

function populateLocation(locationData) {
    locationData = locationData.results[0]?.components;
    if (locationData != null) {
        console.log (locationData)
        $('.location').text(`${locationData.city_district != null ? locationData.city_district : locationData.city}, ${locationData.county}, ${locationData.country}`);
    }
}

function populateTideData() {
    $('.low-tide').text('12:00');
    $('.low-tide-height').text('1.65m');
    $('.high-tide').text('6:00');
    $('.high-tide-height').text('1.05m');
}