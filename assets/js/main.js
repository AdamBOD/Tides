$(document).ready(function () {
    $('.owl-carousel').owlCarousel({
        dots: true, 
        items: 1,
        loop: false,
        nav: false,
        touchDrag: true
    });

    getData();
});

function getData() {
    var tideMarkerHeight = 180 - 25;
    setupTideMarker(180);

    populateLocationData();
    populateTideData();

    return null;
}

function setupTideMarker(tideMarkerHeight) {
    var waveMarkerHeight = 25;
    var tideMarkerContainerHeight = $('.tide-marker-container').height();
    var tideMarkerTop = (tideMarkerContainerHeight - tideMarkerHeight) + waveMarkerHeight;
    var waveMarkerTop = tideMarkerTop - waveMarkerHeight;
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

function populateLocationData() {
    $('.location').text('Kinsale, County Cork, Ireland');
}

function populateTideData() {
    $('.low-tide').text('12:00');
    $('.low-tide-height').text('1.65m');
    $('.high-tide').text('6:00');
    $('.high-tide-height').text('1.05m');
}