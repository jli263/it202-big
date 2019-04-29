var weatherUrl = "http://api.openweathermap.org/data/2.5/weather";
var apiKey = "&appid=8799a33e02a816925aeb7acf6f6df199";

var coords = {
  latitude: 0,
  longitude: 0
};

var db = new Dexie("history_database");
  db.version(1).stores({
    history: 'lat,long'
  });

var selectedOption = "";

function isNumber(n) { return !isNaN(parseFloat(n)) && !isNaN(n - 0) }

function convertUnix (unix_timestamp) {
  var date = new Date(unix_timestamp*1000);
  // Hours part from the timestamp
  var hours = date.getHours();
  // Minutes part from the timestamp
  var minutes = "0" + date.getMinutes();
  // Seconds part from the timestamp
  var seconds = "0" + date.getSeconds();

  var formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);

  return formattedTime;
}



function loadCards (URL) {

  $.get(URL, function (response) {

    coords.latitude = parseFloat(response.coord.lat);
    coords.longitude = parseFloat(response.coord.lon);

    var clone = $(".template1").clone();

    clone.find(".location").text(response.name + ", " + response.sys.country);

    var fahrenheit = ((parseFloat(response.main.temp)-273.15)*1.8)+32;
    var celcius = (parseFloat(response.main.temp))-273.15;

    clone.find(".currTemp").text(Math.round(fahrenheit) + "°F | " + Math.round(celcius) + "°C");
    clone.find(".weatherConditions").text(response.weather[0].description);

    fahrenheit = ((parseFloat(response.main.temp_max)-273.15)*1.8)+32;
    celcius = (parseFloat(response.main.temp_max))-273.15;
    clone.find(".maxTemp").text("High: " + Math.round(fahrenheit) + "°F | " + Math.round(celcius) + "°C")

    fahrenheit = ((parseFloat(response.main.temp_min)-273.15)*1.8)+32;
    celcius = (parseFloat(response.main.temp_min))-273.15;
    clone.find(".minTemp").text("Low: " + Math.round(fahrenheit) + "°F | " + Math.round(celcius) + "°C"); 

    clone.find(".pressure").text("Pressure: " + response.main.pressure + " hpa");

    clone.find(".sunRise").text("Sunrise: " + convertUnix(response.sys.sunrise));

    var wind = parseFloat(response.wind.speed);
    clone.find(".windSpeed").text("Wind: " + Math.round(wind*2.237) + " mph" );

    clone.find(".sunSet").text("Sunset: " + convertUnix(response.sys.sunset));

    clone.removeClass("template1");
    
    $(".homeInfoWeather").append(clone);
  
     
  var centerlocation = {lat: parseFloat(coords.latitude), lng: parseFloat(coords.longitude)};
  var map = new google.maps.Map(document.getElementById('hideMap'), {zoom: 11, center: centerlocation}); 
     
  var placesCoord = new google.maps.LatLng(parseFloat(coords.latitude),parseFloat(coords.longitude));
  selectedOption = $(".mdc-select__native-control").val();

  var request = {
      location: placesCoord,
      radius: '500',
      type: selectedOption
  };

  var service = new google.maps.places.PlacesService(map);
  service.textSearch(request, callback);

    function callback(results, status) {
      if (status == google.maps.places.PlacesServiceStatus.OK) {
        for (var i = 1; i < results.length; i++) {
          
          console.log(results[i]);
          var clone = $(".template3").clone();
          clone.find("#placeName").text(results[i].name);
          clone.find("#address").text("Address: " + results[i].formatted_address);
        
          clone.removeClass("template3");     
          $(".homeInfoPlace").append(clone);
        }
      }
    }
  });  
}


$(document).ready(function() { 

  window.mdc.autoInit();

  $("#content").load("home.html");
  
  const drawer = $("aside")[0].MDCDrawer;

  $(".mdc-top-app-bar__navigation-icon").on("click", function(){
    drawer.open = true;
  });

  // close the drawer and load the selected screen
  $("body").on("click", ".mdc-list-item", function (event) {
    drawer.open = false;
    $("#content").load($(this).attr("data-screen"));
  });

  $(document).on('click','#searchButton',function(){
      input = document.getElementById("inputInfo").value;
      if (isNumber(input) == true) {
        var endpoint = weatherUrl + "?zip=" + input + apiKey;
      }
      else {
        var endpoint = weatherUrl + "?q=" + input + apiKey;
      }
      loadCards(endpoint);
      
      db.history.put({lat: coords.latitude, long: coords.longitude }); 
  });

  if ('geolocation' in navigator) {
     $(document).on('click','#geoButton',function(){
       navigator.geolocation.getCurrentPosition(function (location) {
         var endpoint = weatherUrl + "?lat=" + location.coords.latitude + "&lon=" + location.coords.longitude + apiKey;
         loadCards(endpoint);
         db.history.put({lat: coords.latitude, long: coords.longitude }); 
       });
     });
   } 
   else {
     target.innerText = 'Geolocation API not supported.';
   }

   

});