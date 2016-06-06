'use strict';

$(document).ready(function() {
	$(document).foundation();

	var self = this;

	self.user = {};
	//current using open weather api
	// wundergroundKey = 'acb24fc760a62b97';

	// get User Location
	var getLocation = function() {
		try {
		  navigator.geolocation.getCurrentPosition(function(position) {
		  	self.user.lat = position.coords.latitude;
		    self.user.lng = position.coords.longitude;
			  // Init map
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
	};



	//initial a new marker
	var initMarker = function(icon) {

		//MUST USE user obj lat and lng and not maps
		var coords = new google.maps.LatLng(self.user.lat, self.user.lng);

		self.marker = new google.maps.Marker({
    			position: coords,
    			icon: {
    				url: icon,
    				anchor: new google.maps.Point(10, 10)
    			},
    			animation: google.maps.Animation.DROP,
    			draggable: true

  	});

		self.marker.setMap(self.map); 

		markerListener(self.marker);
	};



	// Marker update weather data
	var markerListener = function(marker) {

		marker.addListener('mouseup', function() {
			// if marker and weather api is called more than once
			// it will still have fade out class attached to it 
			// check if it exist and remove it 
			if($('.update-button').hasClass('fade-out-animation')){
				$('.update-button').removeClass('fade-out-animation');
			}
			//Show button when marker has been moved
			$('.update-button')
				.removeClass('display-none')
				.addClass('animated fade-in-animation');

		});

		$('.update-button').click(function() {
			$('.update-button')
				.removeClass('fade-in-animation')
				.addClass('fade-out-animation');
				// Add display-none class after fade-out-animation has occurred
				// Has to be a better way to do this
				setTimeout(function(){
					$('.update-button').addClass('display-none');
				}, 1000);

			marker.position[self.marker.getPosition()];
			var coords = JSON.stringify(marker.position);
			var coordsObj = JSON.parse(coords);

			//RESET User location to show a single marker
			self.user.lat = coords.lat;
			self.user.lng = coords.lng;

			apiCalls(coordsObj.lat, coordsObj.lng);

		});
	};



	//Calls reverse geocode and weather api
	var apiCalls = function(lat, lng) {

		//Weather api call
		//return $.get('http://api.openweathermap.org/data/2.5/weather?lat='+lat+'&lon='+lng+'&appid=35f88f2946668df8785d29c91312c21c');

		$.when($.get('https://maps.googleapis.com/maps/api/geocode/json?latlng='+lat+','+lng+'&key=AIzaSyAWKl-KPsCIij9Y3Ui9ounu42liHkm_egw'),
				$.get('wunderground.json'))
			.then(function(location, weather) {
				console.log(weather);
				var locate = location[0].results;
				// From observation - remote locations -
				// Google will return at least two formatted address
				if(locate.length <= 2){
					self.user.formatAdd = locate[0].formatted_address;
				} else if(locate.length === 3) {
					self.user.formatAdd = locate[1].formatted_address;
				} else {
					self.user.formatAdd = locate[3].formatted_address;
				}

				self.weather = {
					country: weather[0].current_observation.display_location.country,
					full: weather[0].current_observation.display_location.full,
					desc: weather[0].current_observation.weather,
					main: weather[0].current_observation.icon,
					tempFah: weather[0].current_observation.temp_f,
					humid: weather[0].current_observation.relative_humidity.slice(0,-1),
					windMPH: Math.round(weather[0].current_observation.wind_mph),
					feelsLikeFah: weather[0].current_observation.feelslike_f,
				};

				checkWeather(self.user.formatAdd, self.weather);
				
			}, function(error) {
				alert('Ehhh. This is embarassing but there seems to be a problem with receiving data right now. Error message: ' + error.statusText);
			});

	};



	var checkWeather = function(location, weather) {

		// weather = self.weather

		if(weather.country.toLowerCase() === 'us') {
			weather.temp = Math.round(weather.tempFah);
			weather.tempImg = 'wi wi-fahrenheit';
		} else {
			weather.temp = Math.round((weather.temp - 32) * 5/9);
			weather.tempImg = 'wi wi-celsius';
		}

		switch (weather.main.toLowerCase()) {
			case 'partlysunny':
			case 'partlycloudy':
				weather.icon = 'wi wi-day-cloudy';
				weather.img = 'img/SVG/8.svg';
				break;
			case 'cloudy':
				weather.icon = 'wi wi-cloudy';
				weather.img = 'img/SVG/25.svg';
				break;
			case 'clear':
				weather.icon = 'wi wi-day-sunny';
				weather.img = 'img/SVG/2.svg';
				break;
			case 'snow':
				weather.icon = 'wi wi-snow';
				weather.img = 'img/SVG/23.svg';
				break;
			case 'rain':
				weather.icon = 'wi wi-rain';
				weather.img = 'img/SVG/18.svg';
				break;
			case 'tstorms':
				weather.icon = 'wi wi-storm-showers';
				weather.img = 'img/SVG/27.svg';
				break;
			default:
				weather.icon = 'wi wi-na';
				weather.img = 'img/SVG/45.svg';
		}
		//Marker icon depends on weather api calls return value
		initMarker(weather.img);
		setWeather(weather);
	};



	//Weather data to show
	var setWeather = function(localWeather) {

		// title
		$('.location-title').text(localWeather.full);
		//weather icon and temp
		$('#weather-img').addClass(localWeather.icon);
		$('.temp').text(localWeather.temp);
		$('#temp-img').addClass(localWeather.tempImg);
		//wind icon and speed
		$('#wind-img').addClass('wi wi-windy');
		$('.speed').text(localWeather.windMPH + ' MPH');
		//humid icon and percent
		$('#humid-img').addClass('wi wi-humidity');
		$('.humid').text(localWeather.humid + ' %');
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