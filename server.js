const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const app = express();

require("dotenv").config();

// OpenWeatherMap API key
const apiKey = `${process.env.API_KEY}`;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine" , "ejs");

app.get("/", function(req, res) {
    res.render("index", { weather: null, error: null });
});

app.post('/', function(req, res) {

    let { city } = req.body;

    let url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;

    request(url, function(err, response, body) {
        if (err) {
            console.error('API Error:', err)
            if (err !== 429) {
                res.render('index', { weather: null, error: 'Error, please try again' });
            } else {
                res.render('index', { weather: null, error: 'OpenWeatherMap Free API limit reached' })
            }
        } else {
            let weather = JSON.parse(body);

            console.log('body', body)

            console.log('test', weather);

            if (weather.main == undefined) {
                res.render('index', { weather: null, error: 'Error, please try again' });
            } else {
                // use data to set up output
                let place = `${weather.name}, ${weather.sys.country}`,
                    // discover timezone
                    weatherTimezone = `${new Date(
                        weather.dt * 1000 - weather.timezone * 1000
                    )}`;
                let weatherTemp = `${weather.main.temp}`,
                    weatherPressure = `${weather.main.pressure}`,
                    weatherIcon = `http://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`,
                    weatherDescription = `${weather.weather[0].description}`,
                    humidity = `${weather.main.humidity}`,
                    clouds = `${weather.clouds.all}`,
                    visibility = `${weather.visibility}`,
                    main = `${weather.weather[0].main}`,
                    weatherFahrenheit;

                weatherFahrenheit = (weatherTemp * 9) / 5 + 32;
                weatherFahrenheit = Math.round(weatherFahrenheit * 100) / 100;

                res.render("index", {
                    weather: weather,
                    place: place,
                    temp: weatherTemp,
                    pressure: weatherPressure,
                    icon: weatherIcon,
                    description: weatherDescription,
                    timezone: weatherTimezone,
                    humidity: humidity,
                    fahrenheit: weatherFahrenheit,
                    clouds: clouds,
                    visibility: visibility,
                    main: main,
                    error: null,
                });
            }
        }
    });
});

// http://localhost:5000/
app.listen(5000, function () {
    console.log("Weather app listening on port 5000");
})