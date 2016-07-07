var getMegamapArgs = function() {
  var argsStr = window.location.search.replace(/^\?/, '');
  var embedArgsStr = $("script[src='js/script.js']").data("map-args") || '';

  if (argsStr) {
    argsStr += '&' + embedArgsStr;
  } else {
    argsStr = embedArgsStr;
  }

  var pairs = argsStr.replace(/^\?/, '').split('&');
  var args = {};
  unesc = unescape;
  if (typeof(decodeURIComponent) != 'undefined')
    unesc = decodeURIComponent;
  for (var i = 0; i < pairs.length; ++i) {
    pair = pairs[i].split('=');
    if (pair[0]) {
      if (pair[1])
        pair[1] = unesc(pair[1].replace(/\+/g, ' '));
      var key = unesc(pair[0].replace(/\+/g, ' '));
      if (key == "layer") {
        if (!args[key]) {
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

if (args.css) {
  var _x = document.createElement("link");
  _x.rel = "stylesheet";
  _x.type = "text/css";
  _x.href = args.css;
  document.body.appendChild(_x)
}

var lat = parseFloat(args.lat) || 0,
  lng = parseFloat(args.lng) || 0,
  zoom = parseInt(args.zoom) || 2,
  locate = (args.gl !== "n"),
  searchZoom = parseInt(args.searchZoom) || 8,
  layerControl = args.lc !== "n",
  layerControlAlwaysShown = args.lc !== "h",
  addMarkerControl = args.amc !== "n",
  hidePastEvents = args.hpe !== "n",
  dateAttribute = args.dateAttr || "date",
  layersToShow = args.layer,
  markerClusterRadius = parseInt(args.clusterRadius) || 80,
  public_data_layer_queue = [],
  public_data_layers = {},
  form_templates = {},
  MAP_waiting = 0,
  layers = {},
  clusters,
  icons = {};

var map = new L.Map('map', {
  "zoomControl": false,
  "maxZoom": 16
}).setView([lat, lng], zoom);
if(locate) {
  map.locate({
    setView: true,
    maxZoom: 10
  });
}
map.scrollWheelZoom.disable();

L.esri.basemapLayer("Streets").addTo(map);

new L.Control.GeoSearch({
  provider: new L.GeoSearch.Provider.Google(),
  "zoomLevel": searchZoom,
  "disableMarker": true
}).addTo(map);

// Here's the Tabletop feed
// First we'll initialize Tabletop with our spreadsheet
var jqueryNoConflict = jQuery;
jqueryNoConflict(document).ready(function() {
  var root_spreadsheet = $("script[src='js/script.js']").data("spreadsheet");
  initializeTabletopObject(root_spreadsheet);
});

// Pull data from Google spreadsheet
// And push to our startUpLeaflet function
function initializeTabletopObject(dataSpreadsheet) {
  Tabletop.init({
    key: dataSpreadsheet,
    callback: startUpLeafet,
    debug: false
      //proxy: "//ejucovy.github.io/megamap-data"
  });
}
// This function gets our data from our spreadsheet
// Then gets it ready for Leaflet.
// It creates the marker, sets location
// And plots on it on our map
function startUpLeafet(spreadsheetData) {
  var fallbackTemplate = '<div class="popup_box"> <div class="popup_box_header"> <strong><a href="{{ website }}">{{ name }}</a></strong> </div> <em>{{ geom }}</em> <hr /> {{ description }} </div>';
  var default_template = Handlebars.compile($("#handlebars_template").html() || fallbackTemplate);

  var templates = {};
  for (var i = 0; i < spreadsheetData.Layers.elements.length; ++i) {
    var row = spreadsheetData.Layers.elements[i];
    if (row.Template) {
      templates[row.Type] = Handlebars.compile(row.Template);
    }
    if (row.PublicSubmissionForm) {
      form_templates[row.Type] = Handlebars.compile(row.PublicSubmissionForm);
    }
    if (row.PublicSubmissionSpreadsheet) {
      public_data_layer_queue.push(row.Type);
      public_data_layers[row.Type] = row.PublicSubmissionSpreadsheet;
    }
  }

  for (var i = 0; i < spreadsheetData.Markers.elements.length; ++i) {
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

  // Initialize some layers by hand to force a certain display order

  if (!args.notmainpage) {
    layers['Local Groups'] = L.layerGroup();
  }

  clusters = L.markerClusterGroup({
    maxClusterRadius: markerClusterRadius
  });

  var testDate = new Date();
  testDate.setHours(testDate.getHours() - 12);
  $.each(spreadsheetData, function(data_type, elements) {
    if (data_type == "Markers" || data_type == "Layers") {
      return;
    }
    var tabletopData = elements.elements;
    for (var num = 0; num < tabletopData.length; num++) {
      var dataLat = tabletopData[num].latitude;
      var dataLong = tabletopData[num].longitude;
      if (!dataLat || !dataLong || !parseFloat(dataLat) || !parseFloat(dataLong)) {
        continue;
      }
      var date = tabletopData[num][dateAttribute];
      if (hidePastEvents && date) {
        date = new Date(date);
        if (!isNaN(date.getTime())) {
          if (date <= testDate) {
            continue;
          }
        }
      }
      var marker_location = new L.LatLng(dataLat, dataLong);
      if (icons[data_type]) {
        var layer = new L.Marker(marker_location, {
          "icon": icons[data_type]
        });
      } else {
        var layer = new L.Marker(marker_location);
      }
      // Create the popup by rendering handlebars template
      var popup = templates[data_type] && templates[data_type](tabletopData[num]);
      // Add to our marker
      if (popup) {
        layer.bindPopup(popup);
      }

      var layerGroup = layers[data_type];
      if (typeof(layerGroup) === "undefined") {
        layers[data_type] = layerGroup = L.layerGroup();
      }

      // Add marker to our to map
      layerGroup.addLayer(layer);
    }
  });

  nextStepInMapSetup();
};

function fetchPublicDataSpreadsheets() {

  var data_type = public_data_layer_queue.pop();

  if (public_data_layers[data_type] && (!layersToShow || $.inArray(data_type, layersToShow) !== -1)) {
    MAP_waiting += 1;
    Tabletop.init({
      key: public_data_layers[data_type],
      callback: function(public_data) {

        var testDate = new Date();
        testDate.setHours(testDate.getHours() - 12);

        for (var i = 0; i < public_data.length; ++i) {
          var public_row = public_data[i];

          var date = public_row[dateAttribute];
          if (hidePastEvents && date) {
            date = new Date(date);
            if (!isNaN(date.getTime())) {
              if (date <= testDate) {
                continue;
              }
            }
          }

          var marker_location = new L.LatLng(public_row.latitude, public_row.longitude);

          if (icons[data_type]) {
            var layer = new L.Marker(marker_location, {
              "icon": icons[data_type]
            });
          } else {
            var layer = new L.Marker(marker_location);
          }
          // Create the popup by rendering handlebars template
          var popup = (templates[data_type] || default_template)(public_row);
          // Add to our marker
          layer.bindPopup(popup);

          var layerGroup = layers[data_type];

          if (typeof(layerGroup) === "undefined") {
            layers[data_type] = layerGroup = L.layerGroup();
          }

          // Add marker to our to map
          layerGroup.addLayer(layer);
          clusters.removeLayers(layerGroup.getLayers());
          clusters.addLayers(layerGroup.getLayers());
        }
        --MAP_waiting;
        nextStepInMapSetup();
      },
      simpleSheet: true,
      debug: false
        //proxy: "//350dotorg.github.io/megamap-data"
    });
  }

};

function populateMap() {
  var uiLayers = {};
  $.each(layers, function(i, n) {
    if (!layersToShow || ($.inArray(i, layersToShow) !== -1)) {
      clusters.addLayers(n.getLayers());
      uiLayers[i] = L.layerGroup().addTo(map);
    }
  });
  clusters.addTo(map);
  if (layerControl) {
    var _control = L.control.legendlayers(null, uiLayers, icons).addTo(map);
    if (layerControlAlwaysShown) {
      $(_control._container).addClass("leaflet-control-layers-always-expanded");
    }
  }

  if (addMarkerControl) {
    var allowed = {},
      numAllowed = 0;
    $.each(uiLayers, function(i, n) {
      if (form_templates[i] && public_data_layers[i]) {
        allowed[i] = n;
        ++numAllowed;
      }
    });
    if (numAllowed) {
      L.control.addmarker(allowed, icons).addTo(map);
    }
  }
  new L.Control.Zoom({
    position: 'topleft'
  }).addTo(map);

  // https://github.com/Leaflet/Leaflet.markercluster/issues/145#issuecomment-19439160
  map.on("overlayadd", function(e) {
    clusters.addLayers(layers[e.name].getLayers());
  }).on("overlayremove", function(e) {
    clusters.removeLayers(layers[e.name].getLayers());
  }).on("addmarker_geosearch_showlocation", function(e) {
    var lat = e.Location.Y,
      lng = e.Location.X,
      text = e.Location.Label,
      layer = e.Layer;

    var form_template = form_templates[layer.name];
    e.Marker.bindPopup(form_template({
      lat: lat,
      lng: lng,
      location: text,
      query: e.Query
    })).fire("click");
  });

};

function nextStepInMapSetup() {
  if (public_data_layer_queue && public_data_layer_queue.length) {
    if (MAP_waiting) {
      window.setTimeout(nextStepInMapSetup, 200);
      return false;
    } else {
      fetchPublicDataSpreadsheets();
    }
  } else {
    populateMap();
  }
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
