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
var selectedMMSI;
var containerSpeed = 12;
// Define a symbol using SVG path notation, with an opacity of 1.
var lineSymbol = {
    path: 'M 0,-1 0,1',
    strokeOpacity: 1,
    scale: 4
};
var editIcon = function (data, type, row) {
    if (type === 'display') {
        var MMSI = row.MMSI;
        var Source = row.Source;
        var Speed = row.Speed;
        return '<button type="button" class="btn btn-success" onclick="getLatestShipDetail('+MMSI+','+Source+','+Speed+')">Locate Container</button>';
       
    }
    return '<button type="button" class="btn btn-success" onclick="getLatestShipDetail(' + MMSI + ',' + Source +','+Speed+')">Locate Container</button>';
};
$(document).ready(function () {
    $('#Container_table').DataTable({
        "ajax": "Container.txt",
        responsive: true,
        "columns": [
            { "data": "PO" },
            { "data": "IMO" },
            { "data": "Type" },
            { "data": "Speed" },
            { "data": "ATD" },
            { "data": "MMSI", render: editIcon }
        ]

    });
});
function initMap() {
   
    TravelMarker = travelMarker.TravelMarker;  
    
    getAllGeofences();
    var mapOptions = {
        zoom: 16,
        disableDefaultUI: true,
        zoomControl: true,
        fullscreenControl: true,
        gestureHandling: 'greedy',
        center: new google.maps.LatLng(36.365017, -94.216852),
        //styles: [{ "featureType": "all", "elementType": "all", "stylers": [{ "saturation": -100 }, { "gamma": 0.5 }] }, { "featureType": "landscape", "elementType": "all", "stylers": [{ "lightness": "49" }, { "gamma": "1.53" }, { "weight": "1.00" }, { "visibility": "on" }] }, { "featureType": "road.highway", "elementType": "all", "stylers": [{ "visibility": "on" }, { "lightness": "36" }, { "gamma": "0.96" }] }, { "featureType": "road.arterial", "elementType": "all", "stylers": [{ "lightness": "50" }] }, { "featureType": "road.local", "elementType": "all", "stylers": [{ "visibility": "on" }] }, { "featureType": "water", "elementType": "all", "stylers": [{ "hue": "#ff0000" }] }]
        styles: style
    };
    map = new google.maps.Map(document.getElementById('map'), mapOptions);

   
    $.notify("Search your Container!");

    // Add interaction listeners to make weather requests
    google.maps.event.addListener(map, 'idle', checkIfDataRequested);
    var infowindow = new google.maps.InfoWindow();

    line = new google.maps.Polyline({
        strokeOpacity: 0.5,
        path: [],
        icons: [{
            icon: lineSymbol,
            offset: '0',
            repeat: '20px'
        }],
        map: map,
        strokeColor: 'white',
    });      

   
    var wind_34 = new google.maps.KmlLayer({
        url: 'https://www.nhc.noaa.gov/gis/forecast/archive/latest_wsp34knt120hr_5km.kmz',
        map: map,
        preserveViewport: true
    });
  

    var hurricane = new google.maps.KmlLayer({
        url: 'https://www.nhc.noaa.gov/storm_graphics/api/EP242018_TRACK_latest.kmz',
        map: map,
        preserveViewport: true
    });
    var hurricane1 = new google.maps.KmlLayer({
        url: 'https://www.nhc.noaa.gov/storm_graphics/api/EP232018_TRACK_latest.kmz',
        map: map,
        preserveViewport: true
    });
    getAllMarkers();  
    
    // Sets up and populates the info window with details
    map.data.addListener('click', function (event) {
        infowindow.setContent(
            "<img src=" + event.feature.getProperty("icon") + ">"
            + "<br /><strong>City: " + event.feature.getProperty("city") + "</strong>"
            + "<br />Temperature: " + event.feature.getProperty("temperature") + "&deg;C"
            + "<br />Weather: " + event.feature.getProperty("weather")
            + "<br /> Wind Speed: " + event.feature.getProperty("windSpeed")
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


    map.globalvechiles = [];
   
    map.setCenter(new google.maps.LatLng(0, 0));


}

function initRoute() {
    if (marker != null)
        marker.setMap(null);
    if (line != null)
        line.setMap(null);

    speedMultiplier = 20; // speedMultiplier to
    var route;
    if (selectedMMSI === 305461002)
        route = paths[0];
    else if (selectedMMSI === 310627000)
        route = paths[1];
    var routes = [];
    for (i = 0; i < route.length; i++) {
        var latlng = new google.maps.LatLng(route[i].lat, route[i].lng);
        routes.push(latlng);
        line.getPath().push(latlng);
    }
    line.setMap(map);
    // options    
    marker = new TravelMarker({
        map: map,
        speed: 85,
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
                url: '/image/car-2.png',
                scaledSize: new google.maps.Size(32, 32),
                // The origin for this image is (0, 0).
                origin: new google.maps.Point(0, 0),
                // The anchor for this image is the base of the flagpole at (0, 32).
                anchor: new google.maps.Point(53, 110)
            },

        },
        overlayOptions: {
            offsetX: 0,
            offsetY: 0,
            offsetAngle: 0,
            imageUrl: '../images/Container.png',
            imageWidth: 36,
            imageHeight: 58,
        },
    });
    marker.addLocation(routes);     
    getTravelDuration();
    
};
function getTravelDuration() {
    var lengthInMeters = google.maps.geometry.spherical.computeLength(line.getPath());
    console.log(lengthInMeters, 'KM: ', lengthInMeters / 1000);
    var nauticalMiles = 0.00054 * lengthInMeters;
    if (nauticalMiles !== 0) {
        var min = 15;
        var max = 40;
        var time = nauticalMiles / parseInt(containerSpeed);
        var showTime = time;
        var showTimeString = '';
        var days = Math.floor(time / 24);
        var hours = Math.floor(time - days * 24);
        var minutes = Math.floor((time - days * 24 - hours) * 60);
        console.log(days, hours, minutes);
        if (days != 0) {
            showTimeString = days + 'd ';
        }
        if (hours != 0) {
            showTimeString += hours + 'h ';
        }
        if (minutes != 0) {
            showTimeString += minutes + 'm';
        }
        if (time >= 24) {
            console.log(time / 24 + ' days');
            showTime = time / 24;
        }
        if (time < 1) {
            console.log(time * 60 + ' minutes');
            showTime = time * 60;
        }

    }
    document.getElementById('containerSpeedPanel').style.display = 'none';
    document.getElementById('containerInfoPanel').style.display = 'block';
    document.getElementById('distancttxt').innerHTML = nauticalMiles;
    document.getElementById('speedtxt').innerHTML = containerSpeed;
    document.getElementById('timetxt').innerHTML = showTimeString;
}


function getAllGeofences() {

    $.ajax({
        url: 'https://uri/api/Route/GetGeoFence',
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
                    radius: parseFloat(geofenceObjects[x].radius),
                    title: geofenceObjects[x].body
                });
                //circle is the google.maps.Circle-instance
                cityCircle.addListener('mouseover', function () {
                    this.getMap().getDiv().setAttribute('title', this.get('title'));
                });

                cityCircle.addListener('mouseout', function () {
                    this.getMap().getDiv().removeAttribute('title');
                });
            }
        }

    });
}
function getAllMarkers() {
    var info_window = new google.maps.InfoWindow({ content: '' });
    $.ajax({
        url: "Container.txt",
        success: function (result) {
            var results = JSON.parse(result);
            var container_m;
            var image = {
                url: '../images/ship-2.png',               
                size: new google.maps.Size(32, 32),             
                origin: new google.maps.Point(0, 0),               
                anchor: new google.maps.Point(0, 32)
            };
            for (var i = 0; i < results.data.length; i++) {
                var latln = new google.maps.LatLng(parseFloat(results.data[i].Source.split(",")[0]), parseFloat(results.data[i].Source.split(",")[1]));
                var container_m = new google.maps.Marker({
                    position: latln,
                    map: map,
                    icon: image,
                    optimized: false,
                    title: results.data[i].MMSI
                });
                google.maps.event.addListener(container_m, 'click', (function (container_m, i) {
                    return function () {
                        var text = "<br /><strong> PO: " + results.data[i].PO + "</strong>"
                            + "<br /> <b>Speed: </b>" + results.data[i].Speed + "Knots"
                            + "<br /><b>ETA: </b>" + results.data[i].ETA +
                            '<button type="button" class="btn btn-success" onclick="getLatestShipDetail(' + results.data[i].MMSI + ',' + results.data[i].Source + ',' + results.data[i].Speed + ')">Locate</button>'
                        info_window.setContent(text);
                        info_window.setOptions({ maxWidth: 200 });
                        info_window.open(map, container_m);
                    }
                })(container_m, i));
                
                map.globalvechiles.push(container_m);
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


function getLatestShipDetail(MMSI , lat,long,speed) {
    selectedMMSI = MMSI;
    containerSpeed = speed;
    map.setCenter(new google.maps.LatLng(lat, long));
    map.setZoom(8);    
    initRoute();
        /*$.ajax({
            url: 'https://services1.marinetraffic.com/api/exportvessel/v:5/' + Marine_Traffic_Key + '/timespan:20/msgtype:extended/mmsi:' + ship + '/protocol:jsono',
            success: function (result) {

            }

        });*/  
   
}

function play() {
    marker.play();   
}

// pause animation
function pause() {
    marker.pause();
}

function speedup() {
    marker.setSpeedMultiplier(50);
}

var update = setInterval(function () {
    checkGeofence(geofenceObjects, marker.getPosition());  
  
}, 2000);
   

$(document).ready(function () {
    $("#button").on('click', function () {
        $('html, body').animate({
            scrollTop: $("#dynamictabstrp").offset().top
        }, 1000);
    });
});
$(document).ready(function () {
    $("#container_Details").on('click', function () {
        $('html, body').animate({
            scrollTop: $("#Container_table").offset().top
        }, 1000);
    });
    $("#container_Details1").on('click', function () {
        $('html, body').animate({
            scrollTop: $("#Container_table").offset().top
        }, 1000);
    });
});