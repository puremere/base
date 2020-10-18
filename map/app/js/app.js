$(document).ready(function() {
    var app = new Mapp({
        element: '#app',
        presets: {
            latlng: {
                lat: 32,
                lng: 52,
            },
            zoom: 6,
        },
        apiKey: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6IjdjZTBhMDNiYmZiOWI3MWYxZTYwYzFiNjg2MTdkMTljZTA2Y2U4MjEzMzRlNjRkZjllNDZiYTUwMmE5NmI2YjgxMDFmYmE1Zjk1MTNjOGUzIn0.eyJhdWQiOiI4NjY0IiwianRpIjoiN2NlMGEwM2JiZmI5YjcxZjFlNjBjMWI2ODYxN2QxOWNlMDZjZTgyMTMzNGU2NGRmOWU0NmJhNTAyYTk2YjZiODEwMWZiYTVmOTUxM2M4ZTMiLCJpYXQiOjE1ODY1OTQ4MDEsIm5iZiI6MTU4NjU5NDgwMSwiZXhwIjoxNTg5MTg2ODAxLCJzdWIiOiIiLCJzY29wZXMiOlsiYmFzaWMiXX0.dCY2mtjog8J2xVXPS2FhqnGgoqrYq5mYAjqK3XxWrDDIQsv8p9lbF9ZHlSidZi3DN7EkhY6Py3E7yBJiZ_iBWhAyrJ6qpjgjEm8Eu-I0m2h1UVkrJqObtWzkaBRyl_WRxWP7hAcbSve-g5OIrWoCSkyeW_R8NqyfPD-4xMrBl3g78klaQlZbxU19rNU2OcFj8IRCMeepwiQNgKEViOuStQOqnJqBc7ofzPzr8okUBX_alwDFVx4IFXuLUAPksxqCzdwiPyfS0F1FsdoW_2T_oYIBjvzbKdcLYEAygwFZpniUIE5f3eo_pxMtWdpa40NolTx9qlBtm3FDIdDoDvIgTw'
    });

    app.addLayers();

    app.addGeolocation({
        history: true,
        onLoad: true,
        onLoadCallback: function(){
            console.log(app.states.user.latlng);
        },
    });
});
