$(document).foundation();

$(document).ready(function() {

	var self = this;
	self.user = {}

	// get User Location
	var getUserLocation = function() {
	  navigator.geolocation.getCurrentPosition(function(position) {
	  	self.user.lat = position.coords.latitude;
	    self.user.lng = position.coords.longitude;
	    getWeather(self.user.lat, self.user.lng);
	  });
	};

	var getWeather = function(lat, lng) {
		console.log(lat+ ' '+ lng);
		$.ajax({
			url: 'api.openweathermap.org/data/2.5/weather?lat='+lat+'&lon='+lng,
			type: 'GET'
		}).done(function(data) {
			console.log(data);
		})
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