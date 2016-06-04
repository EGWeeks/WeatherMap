$(document).foundation();

$(document).ready(function() {

	var self = this;
	self.user = {}

	// get User Location
	var getUserLocation = function() {
	  navigator.geolocation.getCurrentPosition(function(position) {
	  	self.user.lat = position.coords.latitude;
	    self.user.lng = position.coords.longitude;

	    reverseGeocode(self.user.lat, self.user.lng);
	    getWeather(self.user.lat, self.user.lng);
	  });
	};

	//Human readable address
	var reverseGeocode = function(lat, lng) {
		var googleKey = 'AIzaSyAWKl-KPsCIij9Y3Ui9ounu42liHkm_egw';
		$.get('https://maps.googleapis.com/maps/api/geocode/json?latlng='+lat+','+lng+'&key='+googleKey, function(location) {
			console.log(location);
		});
	};

	//Weather data
	var getWeather = function(lat, lng) {	
		console.log(lat+ ' '+ lng);
		var weatherKey = '35f88f2946668df8785d29c91312c21c';
		$.get('http://api.openweathermap.org/data/2.5/weather?lat='+lat+'&lon='+lng+'&appid='+weatherKey , function(weather){
			// console.log(weather);
		});
	};

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