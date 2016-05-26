window.getMegamapArgs = function() {
  var argsStr = window.location.search;
  var pairs = argsStr.replace(/^\?/, '').split('&');
  var args = {};
  unesc = unescape;
  if ( typeof(decodeURIComponent) != 'undefined' )
      unesc = decodeURIComponent;
  for ( var i = 0; i < pairs.length; ++i ) {
      pair = pairs[i].split('=');
      if (pair[0]) {
          if (pair[1])
             pair[1] = unesc(pair[1].replace(/\+/g, ' '));
          var key = unesc(pair[0].replace(/\+/g, ' '));
          if( key == "layer" ) {
              if( !args[key] ) {
                  args[key] = [];
              }
              args[key].push(pair[1]);
          } else {
              args[key] = pair[1];
          }
      }
  }
  return args;
}

var args = getMegamapArgs();
var lat = parseFloat(args.lat) || 0,
    lng = parseFloat(args.lng) || 0,
    zoom = parseInt(args.zoom) || 2,
    locate = (args.gl !== "n"),
    searchZoom = parseInt(args.searchZoom) || 15,
    layerControl = args.lc !== "n",
    layersToShow = args.layer;
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
