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
			  	position: google.maps.ControlPosition.LEFT_BOTTOM
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
				$.get('weather.json'))
			.then(function(location, weather) {

				var locate = location[0].results;
				console.log(locate);
				// From observation - remote locations -
				// Google will return at least two formatted address
				if(locate.length <= 2){
					self.user.formatAdd = locate[0].formatted_address;
				} else if(locate.length === 3) {
					self.user.formatAdd = locate[1].formatted_address;
				} else {
					self.user.formatAdd = locate[3].formatted_address;
				}
				console.log(weather);
				self.weather = {
					main: weather[0].main,
					desc: weather[0].weather[0],
					wind: weather[0].wind,
					sys: weather[0].sys
				};

				checkWeather(self.user.formatAdd, self.weather);
				
			}, function(error) {
				alert('Ehhh. This is embarassing but there seems to be a problem with receiving data right now. Error message: ' + error.statusText);
			});

	};

	var checkWeather = function(location, weather) {

		//All data going to be displayed needs to be in this obj
		var localWeather = { 
			country : weather.sys.country.toLowerCase(),
			state : location.slice(0, -5),
			main : weather.desc.main.toLowerCase(),
			desc : weather.desc.description,
			humid : weather.main.humidity,
			wind : Math.round(2.237 * weather.wind.speed)
		};

		if(localWeather.country === 'us') {
			localWeather.temp = Math.round((weather.main.temp * 9/5) - 459.67);
			localWeather.tempImg = 'wi wi-fahrenheit';
		} else {
			localWeather.temp = Math.round(weather.main.temp - 273.15);
			localWeather.tempImg = 'wi wi-celsius';
		}

		switch (localWeather.main) {
			case 'clouds':
				localWeather.icon = 'wi wi-cloudy';
				localWeather.img = 'img/SVG/25.svg';
				break;
			case 'clear':
				localWeather.icon = 'wi wi-day-sunny';
				localWeather.img = 'img/SVG/2.svg';
				break;
			case 'rain':
				localWeather.icon = 'wi wi-rain';
				localWeather.img = 'img/SVG/18.svg';
				break;
			case 'snow':
				localWeather.icon = 'wi wi-snow';
				localWeather.img = 'img/SVG/23.svg';
				break;
			default:
				localWeather.icon = 'wi wi-na';
				localWeather.img = 'img/SVG/45.svg';
		}
		//Marker icon depends on weather api calls return value
		initMarker(localWeather.img);
		setWeather(localWeather);
	};


	//Weather data to show
	var setWeather = function(localWeather) {

		// title
		$('.location-title').text(localWeather.state);
		//weather icon and temp
		$('#weather-img').addClass(localWeather.icon);
		$('.temp').text(localWeather.temp);
		$('#temp-img').addClass(localWeather.tempImg);
		//Weather description
		$('.desc').text(localWeather.desc);
		//wind icon and speed
		$('#wind-img').addClass('wi wi-windy');
		$('.speed').text(localWeather.wind + ' MPH');
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