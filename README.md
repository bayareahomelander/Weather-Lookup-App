# Weather-Lookup-App

This weather lookup project is built using JavaScript, HTML + CSS and JS libraries (jQuery, React). The webpage displays weather information using the OpenWeatherMap API and Google Maps API: 

- City name
- Current temperature
- Weather description
- Icon
- Wind speed
- Humidity
- Sunrise/Sunset time 
- Current date
- UV Index
- Feels-like temperature
- Precipitation
- (...)

****Update 2023-02-12:**** Added side menu; cities are automatically added to the menu when submit search request; added feature that supports removal of cities; one can switch between cities and view the weather by clicking on the name.

****Update 2023-02-10:**** Redesigned the logic that determines whether to display sunrise/sunset time; fixed the bug where date may be mistakenly displayed - the website may occasionally show date that is ahead/behind by a random number of hours; added UV index, feels-like temperature, and precipitation module.

****Update 2023-01-28:**** Reconsturcted HTML and JS, current city displayed on the page will now be replaced instead of adding a new section underneath when search for a new city.

****Update 2023-01-16:**** Reconstructed code, now the Sunrise section automatically switches between sunrise/sunset based on selected city's current local time; fixed the bug where it only shows time in PST regardless of geolocation.

![screenshot 1](https://user-images.githubusercontent.com/110600178/218397355-22389ddd-e10f-40a5-9b68-a2ac08b713f9.jpeg)
1. Initial page of website. Website asks for user permission to retrieve location information and displays weather data in separate modules.

![screeshot 2](https://user-images.githubusercontent.com/110600178/218397632-d37a75e2-f7d3-4cec-965f-02e4ac9eb932.jpeg)

2. Search bar when input detected.

![screeshot 3](https://user-images.githubusercontent.com/110600178/218397753-616b8753-2f80-4c5a-ae61-778c5ac45ebf.jpeg)
3. Side menu with history stored. City name on top is current city (e.g. Vancouver), which cannot be removed from the menu.
