$(document).ready(function () {
    var app = new Mapp({
        element: '#app',
        presets: {
            latlng: {
                lat: 32,
                lng: 52,
            },
            zoom: 6,
        },
        apiKey: 'Your API Key'
    });
    app.addLayers();
});