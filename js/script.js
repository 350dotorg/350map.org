// Set view of Leaflet map based on screen size
if ($(window).width() < 626) {
	var map = new L.Map('map').setView([42,-93],6);
} else {
	var map = new L.Map('map').setView([42,-91.5],7);
}

// Information for the base tile via Cloudmade
var cloudmadeUrl = 'http://{s}.tile.cloudmade.com/f14689c8008d43da9028a70e6a8e710a/2402/256/{z}/{x}/{y}.png'
var cloudmade = new L.TileLayer(cloudmadeUrl, {maxZoom: 18});
// Add to map
map.addLayer(cloudmade);


// Here's the Tabletop feed
// First we'll initialize Tabletop with our spreadsheet
var jqueryNoConflict = jQuery;
jqueryNoConflict(document).ready(function(){
	initializeTabletopObject('0Agcr__L1I1PDdEpoMnhxR0RHdkFsWlFtNTlEZlltR0E');
});

// Pull data from Google spreadsheet
// And push to our startUpLeaflet function
function initializeTabletopObject(dataSpreadsheet){
	Tabletop.init({
    	key: dataSpreadsheet,
    	callback: startUpLeafet,
    	debug: false
    });
}

// This function gets our data from our spreadsheet
// Then gets it ready for Leaflet.
// It creates the marker, sets location
// And plots on it on our map
function startUpLeafet(spreadsheetData) {
    var icons = {};
    for( var i=0; i < spreadsheetData.Markers.elements.length; ++i ) {
        var row = spreadsheetData.Markers.elements[i];
        icons[row.type] = L.icon({ 
            iconUrl: row.iconurl,
            iconSize: [parseInt(row.iconwidth), parseInt(row.iconheight)],
            iconAnchor: [parseInt(row.iconanchorx), parseInt(row.iconanchory)],
            popupAnchor: [parseInt(row.popupanchorx), parseInt(row.popupanchory)],
            shadowUrl: row.shadowurl,
            shadowSize: [parseInt(row.shadowwidth), parseInt(row.shadowheight)],
            shadowAnchor: [parseInt(row.shadowanchorx), parseInt(row.shadowanchory)],
        });
    }
    window.layers = {};
    var clusters = L.markerClusterGroup();
    var tabletopData = foo = spreadsheetData.Objects.elements;
	// Tabletop creates arrays out of our data
	// We'll loop through them and create markers for each
	for (var num = 0; num < tabletopData.length; num ++) {
		var dataOne = tabletopData[num].name;
		var dataTwo = tabletopData[num].geom;
		var dataThree = tabletopData[num].website;
		var dataFour= tabletopData[num].description;

		// Pull in our lat, long information
		var dataLat = tabletopData[num].latitude;
		var dataLong = tabletopData[num].longitude;
		// Add to our marker
		marker_location = new L.LatLng(dataLat, dataLong);
		// Create the marker
            if( icons[tabletopData[num].type] ) {
    	        var layer = new L.Marker(marker_location, {"icon": icons[tabletopData[num].type]});
            } else {
                var layer = new L.Marker(marker_location);
            }
    
    	// Create the popup
    	// Change 'Address', 'City', etc.
		// To match table column names in your table
    	var popup = "<div class=popup_box" + "id=" + num + ">";

    	popup += "<div class='popup_box_header'><strong><a href='" + dataThree + "'>" + dataOne + "</a></strong></div>";
    	popup += "<em>" + dataTwo + "</em>";
    	popup += "<hr />";
    	popup += dataFour;
    	popup += "</div>";
    	// Add to our marker
		layer.bindPopup(popup);
	
            var layerGroup = layers[tabletopData[num].type];
            if( typeof(layerGroup) === "undefined" ) {
                layers[tabletopData[num].type] = layerGroup = L.layerGroup();
            }
                                    
	    // Add marker to our to map
	    layerGroup.addLayer(layer);
	}

    var uiLayers = {};
    $.each(layers, function(i, n) {
//        n.addTo(map);
        clusters.addLayers(n.getLayers());
        uiLayers[i] = L.layerGroup().addTo(map);
    });
    clusters.addTo(map);
    L.control.layers(null, uiLayers).addTo(map);
    // https://github.com/Leaflet/Leaflet.markercluster/issues/145#issuecomment-19439160
    map.on("overlayadd", function(e) {
        clusters.addLayers(layers[e.name].getLayers());
    }).on("overlayremove", function(e) {
        clusters.removeLayers(layers[e.name].getLayers());
    });

};



// Toggle for 'About this map' and X buttons
// Only visible on mobile
isVisibleDescription = false;
// Grab header, then content of sidebar
sidebarHeader = $('.sidebar_header').html();
sidebarContent = $('.sidebar_content').html();
// Then grab credit information
creditsContent = $('.leaflet-control-attribution').html();
$('.toggle_description').click(function() {
	if (isVisibleDescription === false) {
		$('.description_box_cover').show();
		// Add Sidebar header into our description box
		// And 'Scroll to read more...' text on wide mobile screen
		$('.description_box_header').html(sidebarHeader + '<div id="scroll_more"><strong>Scroll to read more...</strong></div>');
		// Add the rest of our sidebar content, credit information
		$('.description_box_text').html(sidebarContent + '<br />');
		$('#caption_box').html('Credits: ' + creditsContent);
		$('.description_box').show();
		isVisibleDescription = true;
	} else {
		$('.description_box').hide();
		$('.description_box_cover').hide();
		isVisibleDescription = false;
	}
});
