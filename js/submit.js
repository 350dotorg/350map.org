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

map.on("geosearch_showlocation", function(e) {
    var lat = e.Location.Y,
        lng = e.Location.X,
        text = e.Location.Label;
    searchMarker.bindPopup("<h3>Submit an event</h3><div><a href='https://docs.google.com/forms/d/1-nGFSRd46ujzwNA9Cn-45eG46hbwKGKjwahewgBMJsA/viewform?entry.681603033=" + text + "&entry.396961874=" + lat + "&entry.1981691483=" + lng + "'>Click here</a> to add an event at this location, or choose a different location using the search bar above.").fire("click");
});
