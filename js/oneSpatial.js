var line, marker;
var TravelMarker;
var map;
var directionsService1;
var isdashboard = false;
var parameters;
var distance;
var duration;
var startAddress;
var endAddress;
var userCurrentLocation;
var geofenceObjects = [];
var OWS_Key = "eaf801c185229f31fd360562a7310a90";
var Marine_Traffic_Key = "ecd35a5c126fc1ec0319a21bb250d4ab122167f3";
var Marine_Traffic_Key1 = "";

function initMap() {   

    TravelMarker = travelMarker.TravelMarker;
    
    var mapOptions = {
        zoom: 16,
        disableDefaultUI: true,
        zoomControl: true,
        fullscreenControl: true,
        center: new google.maps.LatLng(36.365017, -94.216852),
        //styles: [{ "featureType": "all", "elementType": "all", "stylers": [{ "saturation": -100 }, { "gamma": 0.5 }] }, { "featureType": "landscape", "elementType": "all", "stylers": [{ "lightness": "49" }, { "gamma": "1.53" }, { "weight": "1.00" }, { "visibility": "on" }] }, { "featureType": "road.highway", "elementType": "all", "stylers": [{ "visibility": "on" }, { "lightness": "36" }, { "gamma": "0.96" }] }, { "featureType": "road.arterial", "elementType": "all", "stylers": [{ "lightness": "50" }] }, { "featureType": "road.local", "elementType": "all", "stylers": [{ "visibility": "on" }] }, { "featureType": "water", "elementType": "all", "stylers": [{ "hue": "#ff0000" }] }]
        styles: style
    };
    map = new google.maps.Map(document.getElementById('map'), mapOptions);
    directionsService1 = new google.maps.DirectionsService();    

   

    line = new google.maps.Polyline({
        strokeOpacity: 0.5,
        path: [],
        map: map,
        strokeColor: 'yellow',
    });   

    map.globalvechiles = [];
    parameters = getQueryParams();   
    
    new AutocompleteDirectionsHandler(map);
    if (parameters.source === undefined) {           
        if (parameters.geofence === "true") {
            getAllGeofences();
            getUserLocation();
            //hide direction control
            document.getElementById('origin-input').style.display = 'none';
            document.getElementById('destination-input').style.display = 'none';
            document.getElementById('mode-selector').style.display = 'none';
            initDrawingManager(map);

            map.setZoom(4);
        }
        else if (parameters.isMarine === "true") {
            $.notify("Search your Container!");
            map.setCenter(new google.maps.LatLng(36.365017, -94.216852));
            map.setZoom(4);
            // Add interaction listeners to make weather requests
            //google.maps.event.addListener(map, 'idle', checkIfDataRequested);
            var infowindow = new google.maps.InfoWindow();
            // Sets up and populates the info window with details
            map.data.addListener('click', function (event) {
                infowindow.setContent(
                    "<img src=" + event.feature.getProperty("icon") + ">"
                    + "<br /><strong>" + event.feature.getProperty("city") + "</strong>"
                    + "<br />" + event.feature.getProperty("temperature") + "&deg;C"
                    + "<br />" + event.feature.getProperty("weather")
                );
                infowindow.setOptions({
                    position: {
                        lat: event.latLng.lat(),
                        lng: event.latLng.lng()
                    },
                    pixelOffset: {
                        width: 0,
                        height: -15
                    }
                });
                infowindow.open(map);
            });
            document.getElementById('origin-input').style.display = 'none';
            document.getElementById('destination-input').style.display = 'none';
            document.getElementById('mode-selector').style.display = 'none';
        }       
        else {
            $.notify("Total 10 Vehicle Connected!", {
                align: "center",verticalAlign: "top",type: "success" });
            getAllMarkers();
         //   drawingManager.setOptions({
             //   drawingControl: false
          //  });
        }
    }
    else {
        document.getElementById('origin-input').style.display = 'none';
        document.getElementById('destination-input').style.display = 'none';
        getAllGeofences();
        calcRoute(parameters); 
        var trafficLayer = new google.maps.TrafficLayer();
        trafficLayer.setMap(map);
    }
}

function initDrawingManager(map) {
    var drawingManager = new google.maps.drawing.DrawingManager({
        drawingMode: google.maps.drawing.OverlayType.circle,
        drawingControl: true,
        drawingControlOptions: {
            position: google.maps.ControlPosition.TOP_LEFT,
            drawingModes: ['circle']
        },
        circleOptions: {
            fillColor: '#ffff00',
            fillOpacity: 0.5,
            strokeWeight: 2,
            strokeColor:'#ff0000',
            clickable: false,
            editable: true,
            zIndex: 1
        },
        polygonOptions: {
            fillColor: '#ffff00',
            fillOpacity: 0.5,
            strokeWeight: 2,
            strokeColor: '#ff0000',
            clickable: false,
            editable: true,
            zIndex: 1
        },
        rectangleOptions: {
            fillColor: '#ffff00',
            fillOpacity: 0.5,
            strokeWeight: 2,
            strokeColor: '#ff0000',
            clickable: false,
            editable: true,
            zIndex: 1
        }
    });
    google.maps.event.addListener(drawingManager, 'overlaycomplete', function (event) {
        if (event.type == 'circle') {   
            var uniqueGeofenceId = '-' + Math.random().toString(36).substr(2, 9) + '-' + Math.random().toString(36).substr(2, 9);
            document.getElementById('Geofence_ID').value = uniqueGeofenceId;        
            $('#modalGeofenceForm').modal('show');      
             newGeoFence = {
                geofenceId: uniqueGeofenceId,
                latlng: event.overlay.center,
                radius: event.overlay.getRadius(),
                body: document.getElementById('message-text').value
            };
        }
    });
    drawingManager.setMap(map);
}

function saveGeoFence() {
    newGeoFence.body = document.getElementById('message-text').value;
    geofenceObjects.push(newGeoFence);
    $.ajax({
        type: "POST",
        url: "https://cognizant-location360-dev.azurewebsites.net/api/Route/SaveGeoFence?",
        data: JSON.stringify(geofenceObjects),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (data) {
            $('#modalGeofenceForm').modal('hide');
        },
        failure: function (errMsg) {
            alert(errMsg);
        }
    });
}

function getQueryParams() {
    try {
        url = window.location.href;
        query_str = url.substr(url.indexOf('?') + 1, url.length - 1);
        r_params = query_str.split('&');
        params = {}
        for (i in r_params) {
            param = r_params[i].split('=');
            params[param[0]] = param[1];
        }
        return params;
    }
    catch (e) {
        return {};
    }
}
/**
        * @constructor
       */
function AutocompleteDirectionsHandler(map) {
    this.map = map;
    this.originPlaceId = null;
    this.destinationPlaceId = null;
    this.travelMode = 'DRIVING';
    var originInput = document.getElementById('origin-input');
    var destinationInput = document.getElementById('destination-input');
    var modeSelector = document.getElementById('mode-selector');
    this.directionsService = new google.maps.DirectionsService;
    this.directionsDisplay = new google.maps.DirectionsRenderer;
    this.directionsDisplay.setMap(map);

    var originAutocomplete = new google.maps.places.Autocomplete(
        originInput, { placeIdOnly: true });
    var destinationAutocomplete = new google.maps.places.Autocomplete(
        destinationInput, { placeIdOnly: true });

   

    this.setupPlaceChangedListener(originAutocomplete, 'ORIG');
    this.setupPlaceChangedListener(destinationAutocomplete, 'DEST');

    this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(originInput);
    this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(destinationInput);
    this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(modeSelector);}


AutocompleteDirectionsHandler.prototype.setupPlaceChangedListener = function (autocomplete, mode) {
    var me = this;
    autocomplete.bindTo('bounds', this.map);
    autocomplete.addListener('place_changed', function () {
        var place = autocomplete.getPlace();
        if (!place.place_id) {
            window.alert("Please select an option from the dropdown list.");
            return;
        }
        if (mode === 'ORIG') {
            me.originPlaceId = place.place_id;
        } else {
            me.destinationPlaceId = place.place_id;
        }
        me.route();
    });

};

AutocompleteDirectionsHandler.prototype.route = function () {
    if (!this.originPlaceId || !this.destinationPlaceId) {
        return;
    }
    var me = this;
    this.directionsService.route({
        origin: { 'placeId': this.originPlaceId },
        destination: { 'placeId': this.destinationPlaceId },
        travelMode: this.travelMode
    }, function (response, status) {
    //    marker.setMap(null);
     //   line.setMap(null);
        if (status === 'OK') {
           // me.directionsDisplay.setDirections(response);
            var legs = response.routes[0].legs;
            for (i = 0; i < legs.length; i++) {
                var steps = legs[i].steps;
                for (j = 0; j < steps.length; j++) {
                    var nextSegment = steps[j].path;
                    for (k = 0; k < nextSegment.length; k++) {
                        line.getPath().push(nextSegment[k]);
                    }
                }
            }
           initRoute();
        } else {
            window.alert('Directions request failed due to ' + status);
        }
    });
};

function initRoute() {      
    speedMultiplier = 1; // speedMultiplier to 
   
    var route = line.getPath().getArray();
    // options    
    marker = new TravelMarker({
        map: map,
        speed: parameters.speed != undefined ? parseInt(parameters.speed) : 15,
        interval: 10,
        speedMultiplier: speedMultiplier,
        cameraOnMarker: true,
        markerType: 'overlay',
        markerOptions: {
            title: 'Travel Marker',
            animation: google.maps.Animation.DROP,
            icon: {
             //   url: 'http://cdn.mysitemyway.com/etc-mysitemyway/icons/legacy-previews/icons-256/glossy-black-comment-bubbles-icons-transport-travel/038354-glossy-black-comment-bubble-icon-transport-travel-transportation-truck1.png',
                // This marker is 20 pixels wide by 32 pixels high.
                // size: new google.maps.Size(256, 256),
                url: '/image/car-1.png',   
                scaledSize: new google.maps.Size(32, 32),
                // The origin for this image is (0, 0).
                origin: new google.maps.Point(0, 0),
                // The anchor for this image is the base of the flagpole at (0, 32).
                anchor: new google.maps.Point(53, 110)
            },
        }
    });
  
    // add locations from direction service 
    marker.addLocation(route);
    marker.addListener('mouseover', () => console.log('click on marker'));
    document.getElementById("playbtn").click(); 



};

function play() {
    marker.play();
    map.setZoom(18);
    showGauge();
}

// pause animation
function pause() {
    marker.pause();    
}
function reset() {
    marker.reset();
}
function calcRoute(parameters) {    
    var start = new google.maps.LatLng(parseFloat(parameters.source.split(",")[0]), parseFloat(parameters.source.split(",")[1]));
    var end = new google.maps.LatLng(parseFloat(parameters.destination.split(",")[0]), parseFloat(parameters.destination.split(",")[1]) );

    var sourceMarker = new google.maps.Marker({ position: start, map: map }); 
    var destinationMarker =  new google.maps.Marker({ position: end, map: map }); 

    var request = {
        origin: start,
        destination: end,
        travelMode: google.maps.TravelMode.DRIVING
    };
    directionsService1.route(request, (response, status) => {
        if (status == google.maps.DirectionsStatus.OK) {
            center_map(map, [sourceMarker, destinationMarker]);
            var legs = response.routes[0].legs;
             distance = legs[0].distance.text;
             duration = legs[0].duration.text;
            startAddress = legs[0].start_address;
            endAddress = legs[0].end_address;
            for (i = 0; i < legs.length; i++) {
                var steps = legs[i].steps;
                for (j = 0; j < steps.length; j++) {
                    var nextSegment = steps[j].path;
                    for (k = 0; k < nextSegment.length; k++) {
                        line.getPath().push(nextSegment[k]);
                    }
                }
            }
            initRoute();
            showTripDetails(distance, duration, startAddress, endAddress);
        }
    });
   
}

function showTripDetails(distance, duration, startAddress, endAddress) {
    document.getElementById('notification-bottom').style.display = "block";
    document.getElementById('distanceTxt').innerHTML = "Total Distance: " + "<span style='font-weight:700'>"+distance+"</span>";
    document.getElementById('durationTxt').innerHTML = "Trip Duration: " + "<span style='font-weight:700'>" + duration + "</span>";
    document.getElementById('startaddressTxt').innerHTML = "Source: " + "<span style='font-weight:700'>" + startAddress + "</span>";
    document.getElementById('endaddressTxt').innerHTML = "Destination: " + "<span style='font-weight:700'>" + endAddress + "</span>";
}

function getAllGeofences() {

    $.ajax({
        url: 'https://cognizant-location360-dev.azurewebsites.net/api/Route/GetGeoFence',
        success: function (result) {         
            geofenceObjects=result === null ? [] :result;
            for (var x in geofenceObjects) {
                // Add the circle for this city to the map.
                x = parseInt(x);
                var cityCircle = new google.maps.Circle({
                    strokeColor: '#FF0000',
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: '#FF0000',
                    fillOpacity: 0.35,
                    map: map,
                    center: geofenceObjects[x].latlng,                    
                    radius: parseFloat(geofenceObjects[x].radius)
                });
            }
        }

    });
}

function getAllMarkers() {
    $.ajax({
        url: "../oneSpatial.txt",
        success: function (result) {
            var results = JSON.parse(result);
            var globalvechile_m;
            var image = {
                url: '../images/car-2.png',               
                size: new google.maps.Size(32, 32),             
                origin: new google.maps.Point(0, 0),               
                anchor: new google.maps.Point(0, 32)
            };
            for (var i = 0; i < results.data.length; i++) {
                var latln = new google.maps.LatLng(parseFloat(results.data[i].Source.split(",")[0]), parseFloat(results.data[i].Source.split(",")[1]));
                var globalvechile_m = new google.maps.Marker({
                    position: latln,
                    map: map,
                    icon: image,
                    optimized: false,
                    title: results.data[i].VIN
                });               
                map.globalvechiles.push(globalvechile_m);
            }
            center_map(map, map.globalvechiles);
        }
         
    });
    // Overlay view allows you to organize your markers in the DOM    
    var myoverlay = new google.maps.OverlayView();
    myoverlay.draw = function () {
        // add an id to the layer that includes all the markers so you can use it in CSS
        this.getPanes().markerLayer.id = 'markerLayer';
    };
    myoverlay.setMap(map);  
}

function center_map(map,marker_s) {
    var bounds = new google.maps.LatLngBounds();
    $.each(marker_s, function (i, marker) {
        var latlng = new google.maps.LatLng(marker.position.lat(), marker.position.lng());
        bounds.extend(latlng);
    });
    if (marker_s.length == 1) {
        map.setCenter(bounds.getCenter());
        map.setZoom(18);
    } else {   
        map.fitBounds(bounds);
    }
}


function showGauge() {
    $('.js-gauge--1').kumaGauge({
        value: marker.options.speed,
        title: {
            display: true,
            value: 'SpeedoMeter',
            fontFamily: 'Helvetica Neue',
            fontColor: '#00b140',
            fontSize: '20',
            fontWeight: 'normal'
        }
    });
    $('.js-gauge--2').kumaGauge({
        value: Math.floor((Math.random() * 99) + 1),
        fill: '#F34A53',
        gaugeBackground: '#fff',
        gaugeWidth: 10,
        showNeedle: false,
        label: {
            display: true,
            left: 'Min',
            right: 'Max',
            fontFamily: 'Helvetica Neue',
            fontColor: '#00b140',
            fontSize: '11',
            fontWeight: 'bold'
        },
        title: {
            display: true,
            value: 'Fuel Gauge',
            fontFamily: 'Helvetica Neue',
            fontColor: '#00b140',
            fontSize: '20',
            fontWeight: 'normal'
        }
    });
    var update = setInterval(function () {
        checkGeofence(geofenceObjects, marker.getPosition());
        var newVal = marker.options.speed;
        if (newVal <= 70) {
            document.getElementById('speeddownbtn').style.display = "hidden";
            newVal = marker.options.speed === 70 ? 70 : + marker.options.speed+1;
            marker.options.speed = marker.options.speed === 70 ? 70 : + marker.options.speed + 2;
            //marker.setSpeed(newVal);           
        }
        else {
            document.getElementById('speeddownbtn').style.visibility = "visible";
            $.notify("Overspeeding! Please Drive within limit", "error", { globalPosition: 'bottom right' });     
            newVal = 60;
            
        }
        $('.js-gauge--1').kumaGauge('update', {
            value: newVal
            
        });
    }, 2000);
   
}

function reducespeed() {
    marker.options.speed = 60;
}
// Check point inside geofence
function checkGeofence(geofenceObjects, currentlocation) {
    for (var i = 0; i < geofenceObjects.length; i++) {
        var radius =  parseFloat(geofenceObjects[i].radius);
        var result = arePointsNear(currentlocation, geofenceObjects[i].latlng, radius )
        if(result)
            //$('#myModal').modal('show');
            $.notify(geofenceObjects[i].body, "info");       
    }
}

function arePointsNear(checkPoint, centerPoint, m) {
    var km = m / 1000;
    var ky = 40000 / 360;
    var kx = Math.cos(Math.PI * centerPoint.lat / 180.90) * ky;
    var dx = Math.abs(centerPoint.lng- checkPoint.lng()) * kx;
    var dy = Math.abs(centerPoint.lat - checkPoint.lat()) * ky;
    return Math.sqrt(dx * dx + dy * dy) <= km;
}

//---------------- GeoLocation widget-----------------------------//
function getUserLocation() {   
    userCurrentLocation = new google.maps.Marker({ map, position: new google.maps.LatLng(36.365017, -94.216852) });
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
            position => {
                userCurrentLocation.setPosition({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
                map.setZoom(18);
                // Center map to user's position.
                map.panTo({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
            },
            err => alert(`Permission Denied`)
        );
    } else {
        alert('Geolocation is not supported by your browser.');
    }
}
//---------------- GeoLocation widget-----------------------------//



