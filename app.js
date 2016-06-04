$(document).foundation();
$(document).ready(function() {

	var self = this;
	var user = {}

		// get User Location
	var getUserLocation = function() {
	  navigator.geolocation.getCurrentPosition(function(position) {
	  	user.lat = position.coords.latitude;
	    user.lng = position.coords.longitude;
	    console.log(user.lat);
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