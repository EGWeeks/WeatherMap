'use strict';

$(document).foundation();

$(document).ready(function() {

	var self = this;

	self.user = {};


	// get User Location
	var getLocation = function() {
		try {
		  navigator.geolocation.getCurrentPosition(function(position) {
		  	self.user.lat = position.coords.latitude;
		    self.user.lng = position.coords.longitude;
		    initMap(self.user.lat, self.user.lng);

		    // GET reverse gecode and weather
		    apiCalls(self.user.lat, self.user.lng);

		  }); 
		} catch(e) {
			alert('Ehhh... Looks like there is a problem getting your current location. Here is the Error: ' + e);
		}
	};



	//inital a new map
	var initMap = function(lat, lng) {

	  	var mapOptions = {
        zoom: 10,
        center: new google.maps.LatLng(lat,lng),
        mapTypeId: google.maps.MapTypeId.TERRAIN,
        zoomControl: true,
        zoomControlOptions: {
			  	position: google.maps.ControlPosition.LEFT_CENTER
			  },
        mapTypeControl: false,
			  scaleControl: false,
			  streetViewControl: false,
			  rotateControl: false
    	};

		self.map = new google.maps.Map($('#map')[0], mapOptions);

		initMarker();
	};



	//initial a new marker
	var initMarker = function() {

		//MUST USE user obj lat and lng and not maps for modularity	
		var coords = new google.maps.LatLng(self.user.lat, self.user.lng);

		self.marker = new google.maps.Marker({
    			position: coords,
    			// icon: icon,
    			animation: google.maps.Animation.DROP,
    			draggable: true

  	});

		self.marker.setMap(self.map); 
	};



	//Calls reverse geocode and weather api
	var apiCalls = function(lat, lng) {

		//Weather api call
		//return $.get('http://api.openweathermap.org/data/2.5/weather?lat='+lat+'&lon='+lng+'&appid=35f88f2946668df8785d29c91312c21c');

		$.when($.get('https://maps.googleapis.com/maps/api/geocode/json?latlng='+lat+','+lng+'&key=AIzaSyAWKl-KPsCIij9Y3Ui9ounu42liHkm_egw'),
				$.get('weather.json'))
			.then(function(location, weather) {

				self.user.formatAdd = location[0].results[3].formatted_address;

				self.weather = {
					main: weather[0].main,
					desc: weather[0].weather[0],
					wind: weather[0].wind
				};

				setWeather(self.user.formatAdd, self.weather);
				
			});

	};



	//Weather data to show
	var setWeather = function(location, weather) {
		var condition = weather.desc.main;
		var conditionImg;

		switch (condition.toLowerCase()) {
			case 'clouds':
				conditionImg = 'img/SVG/25.svg';
				break;
			case 'clear':
				conditionImg = 'img/SVG/2.svg';
				break;
			default:
				conditionImg = 'img/SVG/45.svg';
		}

		$('.location-title').text(location);
		$('#weather-img').attr('src', conditionImg);
		$('.temp').append((weather.main.temp * 9/5) - 459.67);
	};


	//Check if app has access to user location
	var checkLocation = (function(){
		if (navigator.geolocation) {
		  getLocation();
		}
		else {
		  alert('Geolocation is not supported for this Browser/OS version yet or you need to allow access to your current location.');
		}
	})();

});