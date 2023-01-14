const apiKey = 'bd9c4de0f528c929b27558a64f256edb';
const googleAPI = 'AIzaSyDlbFMcF2m74ok8chkm0YQl2e4cg1ZW5s4';

// Create a function that converts city names to latitude and longitude using Google Maps API
// and stores coordinates in local storage
function getLatLng(cityName, storageType = 'localStorage'){
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({'address':cityName}, function(results, status){
        if (status === 'OK'){
            var latitude = results[0].geometry.location.lat().toFixed(2);
            var longitude = results[0].geometry.location.lng().toFixed(2);

            if (storageType === "localStorage") {
                localStorage.setItem("latitude", latitude);
                localStorage.setItem("longitude", longitude);
            }
        } else {
            alert("Invalid city name.")
        }
    });
}

// This function retrieves coordinates from local storage and uses them to call the OWM API
function getWeather(storageType){
    var latitude = localStorage.getItem("latitude");
    var longitude = localStorage.getItem("longitude");
    var url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}`
}

// This function fetches both Google and OWM API for weather and local time data
function search(){
    var storageType = 'localStorage';
    var cityName = document.getElementById("search-bar").value;
    getLatLng(cityName, storageType);

    // Set timeout to wait for getLatLng() to set data in the storage
    setTimeout(function(){
        var latitude = localStorage.getItem("latitude");
        var longitude = localStorage.getItem("longitude");
        getWeather(storageType);

        const timestamp = Math.round((new Date()).getTime() / 1000);
        const timeUrl = `https://maps.googleapis.com/maps/api/timezone/json?location=${latitude},${longitude}&timestamp=${timestamp}&key=${googleAPI}`;

        // Make Goole Maps Timezone API request
        fetch(timeUrl)
        .then(response => response.json())
        .then(data => {
            // Get the time offset from the API response
            const offset = data.rawOffset + data.dstOffset;

            // Calculate local time
            const localTime = new Date(timestamp * 1000 + offset * 1000);
            const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
            let monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];


            // Extract the weekday, month, day, current time and timezone information
            // Example final format: Fri Jan 14 12:11 PST
            const weekday = weekdays[localTime.getDay()];
            const date = monthNames[localTime.getMonth()] + ' ' + localTime.getDate();
            const currentTime = localTime.getHours() + ':' + localTime.getMinutes();
            const timezone = localTime.toString().match(/\(([^)]+)\)/)[1].split(' ').map(word => word[0]).join('');

            // Add the above data to HTML
            $('#user-timestamp').html('<i class="fa-solid fa-calendar-days"></i>' + weekday + ' ' + date)
        });

        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}`)
        .then(response => response.json())
        .then(data => {
            var temperature = data.main.temp - 273.15;
            temperature = Math.round(temperature);

            var description = data.weather[0].description;
            let capitalized = description.split(" ").map( word => word.slice(0,1).toUpperCase() + word.substr(1) ).join(" ");

            var windspeed = data.wind.speed;
            windspeed = Math.round(windspeed);

            var humidity = data.main.humidity;
            var sunrise = new Date(data.sys.sunrise*1000);

            var icon = data.weather[0].icon;
            var iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`

            // Get search bar input and keep cityname only
            // e.g. Vancouver, BC, Canada would then be -> Vancouver
            cityName = cityName.split(',').shift();

            // Update HTML elements accordingly
            $('#user-city').text(cityName);
            $('#user-temperature').text(temperature + '°C');
            $('#user-weather-description').text(capitalized);
            $('#user-windspeed').html('<i class="fa-solid fa-wind"></i>' + 'Windspeed: ' + windspeed + ' km/h');
            $('#user-humidity').html('<i class="fa-solid fa-droplet"></i>' + 'Humidity: ' + humidity + '%');
            $('#user-sunrise').html('<i class="fa-solid fa-sun"></i>' + 'Sunrise: ' + sunrise.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}));


            // Create weather icon and clears the user-container div if there
            // already exists one -> prevents icons from piling up
            let weatherIcon = document.createElement('img');
            weatherIcon.src = iconUrl;
            weatherIcon.id = 'weather-icon';

            let previousIcon = document.getElementById('weather-icon');

            if (previousIcon){
                previousIcon.remove()
            }
    
            document.getElementById('user-container').appendChild(weatherIcon);
        })

    }, 500);

    // Display values are set to 'none' by default
    // and only show up when a search request has been made
    document.getElementById("user-container").style.display = "flex";
    document.getElementById("user-weather").style.display = "flex";
}

// Add an event-listener for the search button
// Performs searching when the Enter key is pressed
let searchBar = document.getElementById('search-bar');
searchBar.addEventListener('keydown', function(event) {
    if (event.key === 'Enter'){
        // Add .preventDefault() method since the search bar is inside a form element
        // Prevents page from refreshing
        event.preventDefault();
        search();
    }
});

// City name autocomplete at search bar using Google Maps API
const input = document.getElementById('search-bar');
const infowindow = new google.maps.InfoWindow();
const infowindowContent = document.getElementById("infowindow-content");
const options = {
    fields: ["formatted_address", "geometry", "name"],
    strictBounds: false,
    types: ["(cities)"],
};

const autocomplete = new google.maps.places.Autocomplete(input, options);

infowindow.setContent(infowindowContent);

autocomplete.addListener("place_changed", () => {
    infowindow.close();

    const place = autocomplete.getPlace();

    if (!place.geometry || !place.geometry.location) {
      // User entered the name of a Place that was not suggested and
      // pressed the Enter key, or the Place Details request failed.
      window.alert("No details available for input: '" + place.name + "'");
      return;
    }
});

// Automatically retrieves user location and display weather information
if (navigator.geolocation){
    navigator.geolocation.getCurrentPosition(function(position) {
        // Ask for permission to get coordinates
        lat = position.coords.latitude;
        lon = position.coords.longitude;

        // Get city name using Google Maps Geocoding API
        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${googleAPI}`;

        // Send request to API
        fetch(url)
        .then(response => response.json())
        .then(data => {
            const city = data.results[0].address_components.find(component => component.types.includes("locality")).long_name;
            localStorage.setItem('city', city)
        })

        // Use lat and lon to make call to OpenWeatherMap API
        var apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`;
        $.getJSON(apiUrl, function(data){
            // Get desired weather values
            const storedCity = localStorage.getItem('city');
            var temperature = data.main.temp - 273.15;
            temperature = Math.round(temperature);

            var description = data.weather[0].description;
            let capitalized = description.split(" ").map( word => word.slice(0,1).toUpperCase() + word.substr(1) ).join(" ");

            var windspeed = data.wind.speed;
            windspeed = Math.round(windspeed);

            var humidity = data.main.humidity;
            var sunrise = new Date(data.sys.sunrise*1000);
            var icon = data.weather[0].icon;
            var iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`

            // Update HTML elements accordingly
            $('#city').text(storedCity);
            $('#temperature').text(temperature + '°C');
            $('#weather-description').text(capitalized);
            $('#windspeed').html('<i class="fa-solid fa-wind"></i>' + 'Windspeed: ' + windspeed + ' km/h');
            $('#humidity').html('<i class="fa-solid fa-droplet"></i>' + 'Humidity: ' + humidity + '%');
            $('#sunrise').html('<i class="fa-solid fa-sun"></i>' + 'Sunrise: ' + sunrise.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}));
            
            // Append weather icon
            let weatherIcon = document.createElement('img');
            weatherIcon.src = iconUrl;
            document.getElementById('main-container').appendChild(weatherIcon);
        })

        // Get city's current local time using Google Maps Timezone API
        // Unix timestamp for the current time
        const timestamp = Math.round((new Date()).getTime() / 1000);
        const timeUrl = `https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${lon}&timestamp=${timestamp}&key=${googleAPI}`;

        // Make API request
        fetch(timeUrl)
        .then(response => response.json())
        .then(data => {
            // Get the time offset from the API response
            const offset = data.rawOffset + data.dstOffset;

            // Calculate local time
            const localTime = new Date(timestamp * 1000 + offset * 1000);
            const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
            let monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];


            // Extract the weekday, month, day, current time and timezone information
            // Example final format: Fri Jan 14 12:11 Pacific Standard Time
            const weekday = weekdays[localTime.getDay()];
            const date = monthNames[localTime.getMonth()] + ' ' + localTime.getDate();
            const currentTime = localTime.getHours() + ':' + localTime.getMinutes();
            const timezone = localTime.toString().match(/\(([^)]+)\)/)[1].split(' ').map(word => word[0]).join('');

            // Add the above data to HTML
            $('#timestamp').html('<i class="fa-solid fa-calendar-days"></i>' + weekday + ' ' + date)
        })
    })
} else {
    // Handle errors -> Permission not granted, geolocation not supported by browser, etc.
    switch(error.code) {
        case error.PERMISSION_DENIED:
          alert("User denied the request for Geolocation.");
          break;
        case error.POSITION_UNAVAILABLE:
          alert("Location information is unavailable.");
          break;
        case error.TIMEOUT:
          alert("The request to get user location timed out.");
          break;
        case error.UNKNOWN_ERROR:
          alert("An unknown error occurred.");
          break;
    }
}