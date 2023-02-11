# Weather-Lookup-App

This weather lookup project is built using JavaScript, HTML + CSS and JS libraries (jQuery, React). The web page is designed to display a series of information using the OpenWeatherMap API and Google Maps API: 

- City name
- Current temperature
- Weather description
- Icon
- Wind speed
- Humidity
- Sunrise/Sunset time 
- Current date

The webpage has separate sections, in which the first section asks for location permission and automatically displays the above information. User is also able to perform searching using the search bar at the top right hand corner, which autocompletes user input for city names using Google Maps Places API.

Features to add:

- UV Index
- Feels-like temperature
- Side menu to store cities currently present on the page
- (...)

****Update 2023-02-10:**** Redesigned the logic that determines whether to display sunrise/sunset time; fixed the bug where date may be mistakenly displayed - the website may occasionally show date that is a few hours ahead/behind; added UV index, feels-like temperature, and precipitation module.

****Update 2023-01-28:**** Reconsturcted HTML and JS, current city displayed on the page will now be replaced instead of adding a new section underneath when search for a new city.

****Update 2023-01-16:**** Reconstructed code, now the Sunrise section automatically switches between sunrise/sunset based on selected city's current local time; fixed the bug where it only shows city time in PST, even not in the west coast.
