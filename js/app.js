'use strict';

$(document).ready(function() {
	$(document).foundation();

	var self = this;
	self.map = {};
	self.user = {};
	self.styles = {};
	self.styles.night = [{"featureType":"all","elementType":"labels.text.fill","stylers":[{"color":"#ffffff"}]},{"featureType":"all","elementType":"labels.text.stroke","stylers":[{"color":"#000000"},{"lightness":13}]},{"featureType":"administrative","elementType":"geometry.fill","stylers":[{"color":"#000000"}]},{"featureType":"administrative","elementType":"geometry.stroke","stylers":[{"color":"#144b53"},{"lightness":14},{"weight":1.4}]},{"featureType":"landscape","elementType":"all","stylers":[{"color":"#08304b"}]},{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#0c4152"},{"lightness":5}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#000000"}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#0b434f"},{"lightness":25}]},{"featureType":"road.arterial","elementType":"geometry.fill","stylers":[{"color":"#000000"}]},{"featureType":"road.arterial","elementType":"geometry.stroke","stylers":[{"color":"#0b3d51"},{"lightness":16}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#000000"}]},{"featureType":"transit","elementType":"all","stylers":[{"color":"#146474"}]},{"featureType":"water","elementType":"all","stylers":[{"color":"#021019"}]}];
	self.styles.day = [{"featureType":"administrative","stylers":[{"visibility":"off"}]},{"featureType":"poi","stylers":[{"visibility":"simplified"}]},{"featureType":"road","elementType":"labels","stylers":[{"visibility":"simplified"}]},{"featureType":"water","stylers":[{"visibility":"simplified"}]},{"featureType":"transit","stylers":[{"visibility":"simplified"}]},{"featureType":"landscape","stylers":[{"visibility":"simplified"}]},{"featureType":"road.highway","stylers":[{"visibility":"off"}]},{"featureType":"road.local","stylers":[{"visibility":"on"}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"visibility":"on"}]},{"featureType":"water","stylers":[{"color":"#84afa3"},{"lightness":52}]},{"stylers":[{"saturation":-17},{"gamma":0.36}]},{"featureType":"transit.line","elementType":"geometry","stylers":[{"color":"#3f518c"}]}];

	var getLocation = function() {
		try {
		  navigator.geolocation.getCurrentPosition(function(position) {
		  	self.user.lat = position.coords.latitude;
		    self.user.lng = position.coords.longitude;

		    apiCalls(self.user.lat, self.user.lng);
		  }); 
		} catch(e) {
			alert('Ehhh... Looks like there is a problem getting your current location. Here is the Error: ' + e);
		}
	};



	var initMap = function(lat, lng) {
		var mStyle = self.map.style;

	  	var mapOptions = {
        zoom: 10,
        center: new google.maps.LatLng(lat,lng),
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        zoomControl: true,
        zoomControlOptions: {
			  	position: google.maps.ControlPosition.LEFT_CENTER
			  },
        mapTypeControl: false,
			  scaleControl: false,
			  streetViewControl: false,
			  rotateControl: false,
			  styles: mStyle
    	};
		self.map = new google.maps.Map($('#map')[0], mapOptions);
	};



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



	var apiCalls = function(lat, lng) {

		//Weather api call
		//$.get('wunderground.json')
		$.when($.get('https://maps.googleapis.com/maps/api/geocode/json?latlng='+lat+','+lng+'&key=AIzaSyAWKl-KPsCIij9Y3Ui9ounu42liHkm_egw'),
				$.get('https://api.wunderground.com/api/acb24fc760a62b97/conditions/forecast/hourly/astronomy/q/'+lat+','+lng+'.json'))
			.then(function(location, data) {
				checkTime(data[0].moon_phase);
				checkWeather(location, data[0].current_observation);
				checkForecast(data[0].forecast.simpleforecast.forecastday);
				checkHourlyForecast(data[0].hourly_forecast);
				initMap(self.user.lat, self.user.lng);
				initMarker();
			}, function(error) {
				alert('Ehhh. This is embarassing but there seems to be a problem with receiving data right now. Error message: ' + error.statusText);
			});

	};



	var checkTime = function(cycle) {
		self.time = {};
		self.time.current = cycle.current_time.hour + cycle.current_time.minute;
		self.time.sunrise = cycle.sunrise.hour + cycle.sunrise.minute;
		self.time.sunset = cycle.sunset.hour + cycle.sunset.minute;
	};



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

		if(self.weather.country.toLowerCase() === 'us') {
			self.weather.temp = Math.round(self.weather.tempFah);
			self.weather.tempImg = 'wi wi-fahrenheit';
		} else {
			self.weather.temp = Math.round((self.weather.tempFah - 32) * 5/9);
			self.weather.tempImg = 'wi wi-celsius';
		}
			
		weatherIcons(self.weather.main, self.weather);
		

		setWeather(self.weather);
	};



	var weatherIcons = function(check, obj) {
		if(parseInt(self.time.current) < parseInt(self.time.sunset) &&
		 parseInt(self.time.current) > parseInt(self.time.sunrise)) {
		 	self.map.topInfo = "day-topbar";
		 	self.map.style = self.styles.day;
			dayWeatherIcon(check, obj);
		} else {
		 	self.map.topInfo = "night-topbar";
			self.map.style = self.styles.night;
			nightWeatherIcon(check, obj);
		}
	};



	var dayWeatherIcon = function(check, obj) {
		switch (check.toLowerCase()) {
			case 'clear':
				obj.icon = 'wi wi-day-sunny';
				break;
			case 'chancerain':
			case 'rain':
				obj.icon = 'wi wi-rain';
				break;
			case 'mostlycloudy':
			case 'partlycloudy':
			case 'cloudy':
				obj.icon = 'wi wi-cloudy';
				break;
			case 'partlysunny':
				obj.icon = 'wi wi-day-cloudy';
				break;
			case 'tstorms':
			case 'chancetstorms':
				obj.icon = 'wi wi-storm-showers';
				break;
			case 'chancesnow':
			case 'snow':
				obj.icon = 'wi wi-snow';
				break;
			default:
				obj.icon = 'wi wi-na';
		}
	};



	var nightWeatherIcon = function(check, obj) {
		switch (check.toLowerCase()) {
			case 'clear':
				obj.icon = 'wi wi-night-clear';
				break;
			case 'chancerain':
			case 'rain':
				obj.icon = 'wi wi-night-alt-showers';
				break;
			case 'mostlycloudy':
			case 'partlycloudy':
			case 'cloudy':
				obj.icon = 'wi wi-night-alt-cloudy';
				break;
			case 'partlysunny':
				obj.icon = 'wi wi-night-partly-cloudy';
				break;
			case 'tstorms':
			case 'chancetstorms':
				obj.icon = 'wi wi-night-storm-showers';
				break;
			case 'chancesnow':
			case 'snow':
				obj.icon = 'wi wi-night-snow';
				break;
			default:
				obj.icon = 'wi wi-na';
		}
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
			dayWeatherIcon(daily.iconDesc, daily);

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
		$('.top-bar').addClass(self.map.topInfo);
		$('.menu').addClass(self.map.topInfo);
		$('.forecast-color').addClass(self.map.topInfo);
		$('.hourly-data').addClass(self.map.topInfo);
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

		// Hourly temp Graph Config
		var htg = $('#hourly-temp-graph');

		var tempData = {
				type: 'line',
				data: {
					labels: hours[0],
					datasets: [
						{
							label: 'Hourly Temperature',
							backgroundColor: 'rgba(255, 255, 255, 0.2)',
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
						borderColor: '#a3ccff',
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