var locationSearch = getMegamapArgs();
var lat = parseFloat(locationSearch.lat) || 0,
    lng = parseFloat(locationSearch.lng) || 0,
    zoom = parseInt(locationSearch.zoom) || 2,
    locate = (locationSearch.gl !== "n"),
    searchZoom = parseInt(locationSearch.searchZoom) || 15,
    layerControl = locationSearch.lc !== "n",
    layersToShow = locationSearch.layer;
var map = new L.Map('map', {"maxZoom": 16}).setView([lat, lng], zoom);
if( locate ) { map.locate({setView: true, maxZoom: 10}); }

L.esri.basemapLayer("Streets").addTo(map);

var searchMarker;
new L.Control.GeoSearch({
    provider: new L.GeoSearch.Provider.Esri(),
    zoomLevel: searchZoom,
    markerFn: function(marker) {
        searchMarker = marker;
    }
}).addTo(map);

$(document).ready(function() {
    Tabletop.init({
    	key: "0Agcr__L1I1PDdEpoMnhxR0RHdkFsWlFtNTlEZlltR0E",
    	callback: startUpLeafet,
    	debug: false,
        proxy: "http://350dotorg.github.io/megamap-data"
    });
});

function startUpLeafet(spreadsheetData) {
    var form_templates = {};
    for( var i=0; i < spreadsheetData.Layers.elements.length; ++i ) {
        var row = spreadsheetData.Layers.elements[i];
        console.log(row);
        if( row.publicsubmissionform ) {
            form_templates[row.type] = Handlebars.compile(row.publicsubmissionform);
        }
    }
    map.on("geosearch_showlocation", function(e) {
        var lat = e.Location.Y,
            lng = e.Location.X,
            text = e.Location.Label;

        var form_template = form_templates["GROW Divestment Events"];
        searchMarker.bindPopup(form_template({lat:lat,lng:lng,location:text,query:e.Query})).fire("click");
    });

};
