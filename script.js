const apiKey = '99264ea2ba41e46e160feac2a2889f84';
const googleAPI = 'AIzaSyDlbFMcF2m74ok8chkm0YQl2e4cg1ZW5s4';
const cityMenu = document.getElementById('side-menu');

// This function converts city names to latitude and longitude using Google Maps API
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

// This function fetches both Google and OWM API for weather and local time data
function search(){
    var storageType = 'localStorage';
    var cityName = document.getElementById("search-bar").value;
    getLatLng(cityName, storageType);

    // Set timeout to wait for getLatLng() to set data in the storage
    setTimeout(function(){
        var latitude = localStorage.getItem("latitude");
        var longitude = localStorage.getItem("longitude");

        const timestamp = Math.round((new Date()).getTime() / 1000);
        const timeUrl = `https://maps.googleapis.com/maps/api/timezone/json?location=${latitude},${longitude}&timestamp=${timestamp}&key=${googleAPI}`;

        fetch(timeUrl)
        .then(response => response.json())
        .then(data => {
            var timezoneId = data.timeZoneId;
            var date = new Date();
            
            localStorage.setItem('time_zone', timezoneId);

            // Extract the weekday, month, and day
            // Example final format: Fri Jan 14
            var weekdayOptions = {timeZone: timezoneId, weekday: 'short'};
            var weekday = new Intl.DateTimeFormat('en-US', weekdayOptions).format(date);

            var monthOptions = {timeZone: timezoneId, month: 'long'};
            var month = new Intl.DateTimeFormat('en-US', monthOptions).format(date);

            var dayOptions = {timeZone: timezoneId, day: '2-digit'};
            var day = new Intl.DateTimeFormat('en-US', dayOptions).format(date);

            // Add above data to HTML
            $('#timestamp').html('<i class="fa-solid fa-calendar-days"></i>' + weekday + ' ' + month + ' ' + day);
        });

        $.getJSON(`https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&appid=${apiKey}`, function(data){
            var temperature = data.current.temp - 273.15;
            temperature = Math.round(temperature);

            var description = data.current.weather[0].description;
            let capitalized = description.split(" ").map( word => word.slice(0,1).toUpperCase() + word.substr(1) ).join(" ");

            var windspeed = data.current.wind_speed;
            windspeed = Math.round(windspeed);

            var humidity = data.current.humidity;

            const option = {
                timeZone: localStorage.getItem('time_zone'),
                hour12: false,
                year: 'numeric',
                month: 'numeric',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric'
            };

            var sunrise = new Date(data.daily[0].sunrise*1000).toLocaleString('en-US', option).split(',')[1];
            var sunset = new Date(data.daily[0].sunset*1000).toLocaleString('en-US', option).split(',')[1];

            var feeslike = data.current.feels_like - 273.15;
            feeslike = Math.round(feeslike);

            var rain = data.daily[0].pop * 100;
            rain = Math.round(rain);

            var uvindex = data.current.uvi;
            uvindex = Math.round(uvindex);

            var icon = data.current.weather[0].icon;
            var iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`

            document.getElementById('weather-container').style.display = 'flex';
            document.getElementById('second-container').style.display = 'flex';

            // Get search bar input and keep cityname only
            // e.g. Vancouver, BC, Canada would then be -> Vancouver
            cityName = cityName.split(',').shift();

            // Update HTML elements accordingly
            $('#city').text(cityName);
            $('#temperature').text(temperature + '°C');
            $('#weather-description').text(capitalized);
            $('#windspeed').html('<i class="fa-solid fa-wind"></i>' + 'Windspeed: ' + windspeed + ' km/h');
            $('#humidity').html('<i class="fa-solid fa-droplet"></i>' + 'Humidity: ' + humidity + '%');
            $('#uvindex').html('<i class="fa-solid fa-indent"></i>' + 'UV Index: ' + uvindex);
            $('#feelsLike').html('<i class="fa-regular fa-face-smile"></i>' + 'Feels Like: ' + feeslike + '°C');
            $('#rain').html('<i class="fa-solid fa-cloud-rain"></i>' + 'Precipitation: ' + rain + '%');

            // Check current local time -> display either sunrise/sunset time on page
            var currentTime = new Date();
            currentTime = currentTime.toLocaleString('en-US', option).split(',')[1];

            if (currentTime >= sunrise && currentTime < sunset) {
                $('#sunrise').html('<i class="fa-solid fa-moon"></i>' + 'Sunset: ' + sunset);
            } else {
                $('#sunrise').html('<i class="fa-solid fa-sun"></i>' + 'Sunrise: ' + sunrise);
            }

            // Create weather icon and clears the user-container div if there
            // already exists one -> prevents icons from piling up
            let weatherIcon = document.createElement('img');
            weatherIcon.src = iconUrl;
            weatherIcon.id = 'weather-icon';

            let previousIcon = document.getElementById('weather-icon');

            if (previousIcon){
                previousIcon.remove()
            }
    
            document.getElementById('main-container').appendChild(weatherIcon);
        })

    }, 500);
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

// Hide the containers by default and show the containers once data fully loaded
document.getElementById('weather-container').style.display = 'none';
document.getElementById('second-container').style.display = 'none';

// Automatically retrieves user location and display weather information
window.initMap = function() {
    if (navigator.geolocation){
        navigator.geolocation.getCurrentPosition(function(position) {
            // Ask for permission to get coordinates
            lat = position.coords.latitude;
            lon = position.coords.longitude;
    
            fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${googleAPI}`)
            .then(response => response.json())
            .then(data => {
                let addressComponents = data.results[0].address_components;
                let city = '';
                let state = '';
                let country = '';

                addressComponents.forEach(component => {
                    if (component.types.includes("locality")) {
                        city = component.long_name;
                    } else if (component.types.includes("administrative_area_level_1")) {
                        state = component.short_name;
                    } else if (component.types.includes("country")) {
                        country = component.long_name;
                    }
                });

                let initialCity = `${city}, ${state}, ${country}`;
                localStorage.setItem('initial_city', initialCity);
                updateMenu();
            });
    
            // Convert coordinates to city name using Google Maps Geocoding API
            // and store it in local storage
            const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${googleAPI}`;
            fetch(url)
            .then(response => response.json())
            .then(data => {
                const city = data.results[0].address_components.find(component => component.types.includes("locality")).long_name;
                localStorage.setItem('city', city)
            })
    
            // Use lat and lon to make call to OpenWeatherMap API
            var apiUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=${apiKey}`;
            $.getJSON(apiUrl, function(data) {
                // Get desired weather values
                const storedCity = localStorage.getItem('city');
                var temperature = data.current.temp - 273.15;
                temperature = Math.round(temperature);
    
                var description = data.current.weather[0].description;
                let capitalized = description.split(" ").map( word => word.slice(0,1).toUpperCase() + word.substr(1) ).join(" ");
    
                var windspeed = data.current.wind_speed;
                windspeed = Math.round(windspeed);
    
                var humidity = data.current.humidity;
                var sunrise = new Date(data.daily[0].sunrise * 1000);
                var sunset = new Date(data.daily[0].sunset * 1000);
    
                var uvindex = data.current.uvi;
                uvindex = Math.round(uvindex);
    
                var feeslike = data.current.feels_like - 273.15;
                feeslike = Math.round(feeslike);
    
                var rain = data.daily[0].pop * 100;
                rain = Math.round(rain);
    
                var icon = data.current.weather[0].icon;
                var iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;
    
                // Add the 'show' class to trigger fade-in animation
                document.getElementById('weather-container').style.display = 'flex';
                document.getElementById('second-container').style.display = 'flex';
    
                // Update HTML elements accordingly
                $('#city').text(storedCity);
                $('#temperature').text(temperature + '°C');
                $('#weather-description').text(capitalized);
                $('#windspeed').html('<i class="fa-solid fa-wind"></i>' + 'Windspeed: ' + windspeed + ' km/h');
                $('#humidity').html('<i class="fa-solid fa-droplet"></i>' + 'Humidity: ' + humidity + '%');
                $('#uvindex').html('<i class="fa-solid fa-indent"></i>' + 'UV Index: ' + uvindex);
                $('#feelsLike').html('<i class="fa-regular fa-face-smile"></i>' + 'Feels Like: ' + feeslike + '°C');
                $('#rain').html('<i class="fa-solid fa-cloud-rain"></i>' + 'Precipitation: ' + rain + '%');
    
                // Check current local time -> display either sunrise/sunset time.
                var currentTime = new Date();
                if (currentTime.getHours() >= sunrise.getHours() && currentTime.getHours() < sunset.getHours()) {
                    $('#sunrise').html('<i class="fa-solid fa-moon"></i>' + 'Sunset: ' + sunset.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}).replace(/\s(AM|PM)$/, ""));
                } else {
                    $('#sunrise').html('<i class="fa-solid fa-sun"></i>' + 'Sunrise: ' + sunrise.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}).replace(/\s(AM|PM)$/, ""));
                }
                
                // Append weather icon
                let weatherIcon = document.createElement('img');
                weatherIcon.src = iconUrl;
                weatherIcon.id = 'weather-icon';
                document.getElementById('main-container').appendChild(weatherIcon);
            })
    
            // Given Unix, latitude and longitude, retrieve timezone ID
            const timestamp = Math.round((new Date()).getTime() / 1000);
            const timeUrl = `https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${lon}&timestamp=${timestamp}&key=${googleAPI}`;
            
            // Make API request
            fetch(timeUrl)
            .then(response => response.json())
            .then(data => {
                var timezoneId = data.timeZoneId;
                var date = new Date();
    
                // Extract the weekday, month, and day
                // Example final format: Fri Jan 14
                var weekdayOptions = {timeZone: timezoneId, weekday: 'short'};
                var weekday = new Intl.DateTimeFormat('en-US', weekdayOptions).format(date);
    
                var monthOptions = {timeZone: timezoneId, month: 'long'};
                var month = new Intl.DateTimeFormat('en-US', monthOptions).format(date);
    
                var dayOptions = {timeZone: timezoneId, day: '2-digit'};
                var day = new Intl.DateTimeFormat('en-US', dayOptions).format(date);
    
                // Add the above data to HTML
                $('#timestamp').html('<i class="fa-solid fa-calendar-days"></i>' + weekday + ' ' + month + ' ' + day);
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
}

var script = document.createElement('script');
script.src = `https://maps.googleapis.com/maps/api/js?key=${googleAPI}&callback=initMap`;
document.head.appendChild(script);


// Activate the side menu when the icon is clicked
const menuIcon = document.querySelector('#menu-icon');
const sideMenu = document.querySelector('#side-menu');
menuIcon.addEventListener('click', function() {
    sideMenu.classList.toggle('show');
});

function toggleIcon(x) {
    x.classList.toggle("change");
}

// Steps to add searched cities to side menu
let cityArray = JSON.parse(localStorage.getItem('city_array')) || [];
localStorage.setItem('city_array', JSON.stringify(cityArray));

// Attach event listeners to the search bar and button
document.getElementById('search-bar').addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        check();
    }
});

document.getElementById('search-button').addEventListener('click', check);

// The check function adds a city to the cities array and updates the menu
function check() {
    let city = document.getElementById('search-bar').value;
    if (!cityArray.includes(city)) {
        cityArray.push(city);
        localStorage.setItem('city_array', JSON.stringify(cityArray));
    }
}

// The updateMenu function performs addition and deletion of city names
function updateMenu() {
    let menu = document.getElementById('side-menu');
    let initialCity = localStorage.getItem('initial_city');
    let ul = document.createElement('ul');

    // Clear the side menu before adding new city items
    while (menu.firstChild) {
        menu.removeChild(menu.firstChild);
    }

    let initialCityItem = document.createElement('li');
    initialCityItem.textContent = initialCity;
    ul.appendChild(initialCityItem);
    
    let storedCities = JSON.parse(localStorage.getItem('city_array'));

    if (storedCities && storedCities.length > 0) {
        for (let i = 0; i < storedCities.length; i++) {
            if (!storedCities[i]) {
                continue;
            }
            let menuItem = document.createElement('li');
            menuItem.textContent = storedCities[i];

            let deleteButton = document.createElement('button');
            deleteButton.textContent = 'X';
            deleteButton.classList.add('delete-button');
            deleteButton.addEventListener('click', function() {
                cityArray.splice(i, 1);
                localStorage.setItem('city_array', JSON.stringify(cityArray));
                updateMenu();
            })

            menuItem.appendChild(deleteButton);
            ul.appendChild(menuItem);
        }
    }
    
    let menuItems = ul.getElementsByTagName('li');
    for (let i = 0; i < menuItems.length; i++) {
        if (!menuItems[i].textContent) {
            menuItems[i].remove();
        }
    }
    menu.appendChild(ul);
}

let searchButton = document.getElementById('search-button');
searchButton.addEventListener('click', function(){
    updateMenu();
})