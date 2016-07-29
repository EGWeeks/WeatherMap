'use strict';

$(document).ready(function() {
	$(document).foundation();

	var self = this;

	self.user = {};




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
	var initMarker = function() {
		//MUST USE user obj lat and lng and not maps
		var coords = new google.maps.LatLng(self.user.lat, self.user.lng);

		self.marker = new google.maps.Marker({
    			position: coords,
    			icon: {
    				url: 'img/wundermarker.png',
    				anchor: new google.maps.Point(30, 55)
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
		//$.get('wunderground.json')
		$.when($.get('https://maps.googleapis.com/maps/api/geocode/json?latlng='+lat+','+lng+'&key=AIzaSyAWKl-KPsCIij9Y3Ui9ounu42liHkm_egw'),
				$.get('https://api.wunderground.com/api/acb24fc760a62b97/conditions/forecast/hourly/q/'+lat+','+lng+'.json'))
			.then(function(location, data) {
				checkWeather(location, data[0].current_observation);
				checkForecast(data[0].forecast.simpleforecast.forecastday);
				checkHourlyForecast(data[0].hourly_forecast);
			}, function(error) {
				alert('Ehhh. This is embarassing but there seems to be a problem with receiving data right now. Error message: ' + error.statusText);
			});

	};




	// Parse current weather data that goes in TOPBAR
	var checkWeather = function(location, weather) {

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
		// Parse current weather data
		self.weather = {
			country: weather.display_location.country,
			full: weather.display_location.full,
			desc: weather.weather,
			main: weather.icon,
			tempFah: weather.temp_f,
			humid: weather.relative_humidity.slice(0,-1),
			windMPH: Math.round(weather.wind_mph),
			feelsLikeFah: weather.feelslike_f
		};

		// weather = self.weather
		if(self.weather.country.toLowerCase() === 'us') {
			self.weather.temp = Math.round(self.weather.tempFah);
			self.weather.tempImg = 'wi wi-fahrenheit';
		} else {
			self.weather.temp = Math.round((self.weather.tempFah - 32) * 5/9);
			self.weather.tempImg = 'wi wi-celsius';
		}

		switch (self.weather.main.toLowerCase()) {
			case 'clear':
				self.weather.icon = 'wi wi-day-sunny';
				break;
			case 'chancerain':
			case 'rain':
				self.weather.icon = 'wi wi-rain';
				break;
			case 'mostlycloudy':
			case 'partlycloudy':
			case 'cloudy':
				self.weather.icon = 'wi wi-cloudy';
				break;
			case 'partlysunny':
				self.weather.icon = 'wi wi-day-cloudy';
				break;
			case 'tstorms':
				self.weather.icon = 'wi wi-storm-showers';
				break;
			case 'chancesnow':
			case 'snow':
				self.weather.icon = 'wi wi-snow';
				break;
			default:
				self.weather.icon = 'wi wi-na';
		}
		//Marker icon depends on weather api calls return value
		initMarker();

		setWeather(self.weather);
	};




	// Parse forecasted Data
	var checkForecast = function(forecast) {
		self.forecast = [];
		//Loop & Parse forecastsimple prop to get relevant data
		forecast.forEach(function(day) {
			var daily = {
				weekday : day.date.weekday_short,
				conditions : day.conditions,
				iconDesc : day.icon,
				pop : day.pop,
				qpfAllday : day.qpf_allday.in
			};
			// convert temp if nessecary
			if(self.weather.country.toLowerCase() === 'us') {
				daily.high = Math.round(day.high.fahrenheit);
				daily.low = Math.round(day.low.fahrenheit);
			} else {
				//convert to celsius
				daily.high = Math.round((day.high.fahrenheit - 32) * 5/9);
				daily.low = Math.round((day.low.fahrenheit - 32) * 5/9);

			}
			// Determine icon
			switch (daily.iconDesc.toLowerCase()) {
				case 'clear':
					daily.icon = 'wi wi-day-sunny';
					break;
				case 'chancerain':
				case 'rain':
					daily.icon = 'wi wi-rain';
					break;
				case 'mostlycloudy':
				case 'partlycloudy':
				case 'cloudy':
					daily.icon = 'wi wi-cloudy';
					break;
				case 'partlysunny':
					daily.icon = 'wi wi-day-cloudy';
					break;
				case 'tstorms':
				case 'chancetstorms':
					daily.icon = 'wi wi-storm-showers';
					break;
				case 'snow':
				case 'chancesnow':
					daily.icon = 'wi wi-snow';
					break;
				default:
					daily.icon = 'wi wi-na';
			}
			self.forecast.push(daily);
		});

		setForecast(self.forecast);
	};




	// Parse Hourly forecasted weather
	var checkHourlyForecast = function(hourlyForecast) {
		self.hourly = [];
		var typeOfData;
		var times = [], temp = [], pop = [], qpf = [];
		// Grab english if in us or metric if not
		if(self.weather.country.toLowerCase() === 'us') {
			typeOfData = 'english';
		} else {
			typeOfData = 'metric';
		}

		hourlyForecast.forEach(function(hour) {
			times.push(hour.FCTTIME.civil);
			temp.push(hour.temp[typeOfData]);
			qpf.push(hour.qpf[typeOfData]);
			pop.push(hour.pop);

		});

		self.hourly.push(times, temp, qpf, pop);

		setCanvas();
	};




	//Weather data to show
	var setWeather = function(localWeather) {
		// check if temp img needs to change
		var currentTempImgClass = $('#temp-img').attr('class');
		if(currentTempImgClass !== localWeather.tempImg) {
			$('#temp-img').removeClass(currentTempImgClass);
		}

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




	// Forecast data to show
	var setForecast = function(localForecast) {

		localForecast.forEach(function(day, index) {
			$('.day-title-' + index).text(day.weekday);
			$('#forecast-img-' + index).addClass(day.icon);
			$('.forecast-high-' + index).text(day.high);
			$('.forecast-low-' + index).text(' | ' + day.low);
			$('.pop-' + index).addClass('wi wi-raindrops').text(' ' + day.pop + '%');
			$('.qpf-' + index).addClass('wi wi-raindrop').text(' ' + day.qpfAllday + 'in');

		});

		// remove loading layer
		$('.loading-layer').addClass('fade-out-loader');
		setTimeout(function(){
			$('.loading-layer').remove();
		}, 1000);
	};




	var setCanvas = function() {
		// if marker is moved
		// remove previous graph canvas tags
		$('#hourly-temp-graph').remove();
		$('#hourly-precip-graph').remove();
		// append new canvas elements
		$('.hourly-temp-container').append('<canvas id="hourly-temp-graph" class="display-none" width="800" height="141"></canvas>');
		$('.hourly-temp-container').append('<canvas id="hourly-precip-graph" class="display-none" width="800" height="141"></canvas>');

		setHourlyChart(self.hourly);
	};




	// Hourly forecast data to show
	var setHourlyChart = function(hours) {
		$('').remove()
		// Hourly temp Graph Config
		var htg = $('#hourly-temp-graph');

		var tempData = {
				type: 'line',
				data: {
					labels: hours[0],
					datasets: [
						{
							label: 'Hourly Temperature',
							backgroundColor: 'rgba(255, 255, 255, 0.6)',
							pointBackgroundColor: '#ff0000',
							data: hours[1]
						}
					]
				},
				options: {
					responsive: true,
					tooltips : {
						titleFontSize: 15,
						bodyFontSize: 25
					}
				}
		};
		new Chart(htg, tempData);

		// Hourly precip Graph Config
		var hpg = $('#hourly-precip-graph');

		var precipData = {
			type: 'line',
			data: {
				labels: hours[0],
				datasets: [
					{
						pointBackgroundColor: 'rgba(0,0,0,0.6)',
						borderColor: 'rgba(0, 0, 0, 0.6)',
						label: 'Potential Amount of Precip',
						data: hours[2],
						yAxisID: 'y-axis-1'
					},
					{
						borderColor: '#2199e8',
						backgroundColor: 'rgba(0,73,175,0.6)',
						label: 'Chance of Precip',
						data: hours[3],
						yAxisID: 'y-axis-2'
					}]
			},
			options: {
				responsive: true,
				stacked: false,
				tooltips: {
					titleFontSize: 15,
					bodyFontSize: 25
				},
				scales: {
					xAxes: [{
						display: true,
						gridLines: {
							offsetGridLines: false
						}
					}],
					yAxes: [{
						type: 'linear',
						display: true,
						position: 'left',
						id: 'y-axis-1',
					}, {
						type: "linear", // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
            display: true,
            position: "right",
            id: "y-axis-2",

            gridLines: {
            	drawOnChartArea: false
            }
					}]
				}
			}
		};
		new Chart(hpg, precipData);

		hourlyChartListener();
	};




	// Hourly button listener to show and hide hourly data
	var hourlyChartListener = function() {
		var precipGraph = $('#hourly-precip-graph');
		var tempGraph = $('#hourly-temp-graph');

		// temp button listener
		$('.hourly-temp-button').click(function() {
			tempGraph.removeClass('fade-out-left');

			if(tempGraph.hasClass('fade-in-animation')){
				tempGraph.removeClass('fade-in-animation').addClass('fade-out-left');
				displayNoneTimeOut(tempGraph);
			} else {
				if(precipGraph.hasClass('fade-in-animation')) {
					precipGraph.removeClass('fade-in-animation').addClass('fade-out-left');

					displayNoneTimeOut(precipGraph, tempGraph);
				}else {
					tempGraph.removeClass('display-none').addClass('fade-in-animation');
				}
			}
		});

		// precip button listener
		$('.hourly-precip-button').click(function(){
			precipGraph.removeClass('fade-out-left');

			if(precipGraph.hasClass('fade-in-animation')){
				precipGraph.removeClass('fade-in-animation').addClass('fade-out-left');
				displayNoneTimeOut(precipGraph);
			} else {
				if(tempGraph.hasClass('fade-in-animation')) {
					tempGraph.removeClass('fade-in-animation').addClass('fade-out-left');

					displayNoneTimeOut(tempGraph, precipGraph);
				} else {
					precipGraph.removeClass('display-none').addClass('fade-in-animation');
				}
			}
		});
	};



	// Time out on animations to keep a smooth transition out and in
	// Also used to close out of graph - 
	// if graph is open and clicked on again it will animate off screen
	var displayNoneTimeOut = function(graphToRemove, graphToAdd) {
		setTimeout(function() {
			graphToRemove.addClass('display-none');
			if(graphToAdd !== undefined) {
				graphToAdd.removeClass('display-none').addClass('fade-in-animation');
			}
		}, 500);
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