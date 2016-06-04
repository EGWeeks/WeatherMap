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

		    // GET reverse gecode and weather
		    apiCalls(self.user.lat, self.user.lng);

		  }); 
		} catch(e) {
			alert('Ehhh... Looks like there is a problem getting your current location. Here is the Error: ' + e);
		}
	};



	//inital a new map
	var initMap = function(lat, lng, icon) {

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

		initMarker(icon);
	};



	//initial a new marker
	var initMarker = function(icon) {

		//MUST USE user obj lat and lng and not maps for modularity	
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
			wind : Math.round(weather.wind.speed * 0.44704)
		};
		console.log(localWeather.wind);
		if(localWeather.country === 'us') {
			localWeather.temp = Math.round((weather.main.temp * 9/5) - 459.67);
			localWeather.tempImg = 'img/SVG/47.svg';
		} else {
			localWeather.temp = Math.round(weather.main.temp - 273.15);
			localWeather.tempImg = 'img/SVG/46.svg';
		}

		switch (localWeather.main) {
			case 'clouds':
				localWeather.img = 'img/SVG/25.svg';
				break;
			case 'clear':
				localWeather.img = 'img/SVG/2.svg';
				break;
			case 'rain':
				localWeather.img = 'img/SVG/18.svg';
				break;
			case 'snow':
				localWeather.img = 'img/SVG/23.svg';
				break;
			default:
				localWeather.img = 'img/SVG/45.svg';
		}
		initMap(self.user.lat, self.user.lng, localWeather.img);
		setWeather(localWeather);
	};


	//Weather data to show
	var setWeather = function(localWeather) {

		// title
		$('.location-title').text(localWeather.state);
		//weather icon and temp
		$('#weather-img').attr('src', localWeather.img);
		$('.temp').append(localWeather.temp);
		$('#temp-img').attr('src', localWeather.tempImg);
		//Weather description
		$('.desc').append(localWeather.desc);
		//wind icon and speed
		$('#wind-img').attr('src', 'img/SVG/6.svg');
		$('.speed').append(localWeather.wind + ' mph');
		//humid icon and percent
		$('#humid-img').attr('src', 'img/SVG/humid.svg');
		$('.humid').append(localWeather.humid + ' &#37;');
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