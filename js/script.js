var map = new L.Map('map', {"maxZoom": 16}).setView([0, 0], 2).locate({setView: true, maxZoom: 10});

L.esri.basemapLayer("Streets").addTo(map);

new L.Control.GeoSearch({
    provider: new L.GeoSearch.Provider.Google(),
    "zoomLevel": 8,
    "disableMarker": true
}).addTo(map);

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
    	debug: false,
        proxy: "http://350dotorg.github.io/megamap-data"
    });
}

// This function gets our data from our spreadsheet
// Then gets it ready for Leaflet.
// It creates the marker, sets location
// And plots on it on our map
function startUpLeafet(spreadsheetData) {

    var default_template = Handlebars.compile($("#handlebars_template").html());
    var templates = {};
    for( var i=0; i < spreadsheetData.Layers.elements.length; ++i ) {
        var row = spreadsheetData.Layers.elements[i];
        templates[row.type] = Handlebars.compile(row.template);
    }

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
    $.each(spreadsheetData, function(data_type, elements) {
        if( data_type == "Markers" || data_type == "Layers" ) { return; }
        var tabletopData = elements.elements;
	for (var num = 0; num < tabletopData.length; num ++) {
	    var dataLat = tabletopData[num].latitude;
	    var dataLong = tabletopData[num].longitude;
	    var marker_location = new L.LatLng(dataLat, dataLong);
            if( icons[data_type] ) {
    	        var layer = new L.Marker(marker_location, {"icon": icons[data_type]});
            } else {
                var layer = new L.Marker(marker_location);
            }
    	    // Create the popup by rendering handlebars template
    	    var popup = (templates[data_type] || default_template)(tabletopData[num]);
    	    // Add to our marker
	    layer.bindPopup(popup);
	
            var layerGroup = layers[data_type];
            if( typeof(layerGroup) === "undefined" ) {
                layers[data_type] = layerGroup = L.layerGroup();
            }
            
	    // Add marker to our to map
	    layerGroup.addLayer(layer);
	}
    });
    

    var uiLayers = {};
    $.each(layers, function(i, n) {
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
