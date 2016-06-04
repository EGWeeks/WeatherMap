$(document).foundation();

$(document).ready(function() {

	var self = this;

	self.user = {}


	// get User Location
	var getUserLocation = function() {
		try {
		  navigator.geolocation.getCurrentPosition(function(position) {
		  	self.user.lat = position.coords.latitude;
		    self.user.lng = position.coords.longitude;
		    initMap(self.user.lat, self.user.lng);
		    reverseGeocode(self.user.lat, self.user.lng);
		    getWeather(self.user.lat, self.user.lng);
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
	}



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
	}



	//Human readable address
	var reverseGeocode = function(lat, lng) {
		var googleKey = 'AIzaSyAWKl-KPsCIij9Y3Ui9ounu42liHkm_egw';
		$.get('https://maps.googleapis.com/maps/api/geocode/json?latlng='+lat+','+lng+'&key='+googleKey, function(location) {

			self.user.formatAdd = location.results[2].formatted_address;
			console.log(location.results);
			setWeather();
		});

		//temporary calling to not excessed api calls on weather
	};



	//Weather data
	var getWeather = function(lat, lng) {	
		// var weatherKey = '35f88f2946668df8785d29c91312c21c';
		// $.get('http://api.openweathermap.org/data/2.5/weather?lat='+lat+'&lon='+lng+'&appid='+weatherKey , function(weather){
		// 	self.weatherData = {
		// 		main: weather.main,
		// 		desc: weather.weather[0],
		// 		wind: weather.wind
		// 	};
		// 	setWeather(self.weatherData);
		// });
	};

	var setWeather = function(weather) {
		$('.location-title').text(self.user.formatAdd);
		$()

	}


	//Check if app has access to user location
	var checkLocation = (function(){
		if (navigator.geolocation) {
		  getUserLocation();
		}
		else {
		  alert('Geolocation is not supported for this Browser/OS version yet or you need to allow access to your current location.');
		}
	})();

});