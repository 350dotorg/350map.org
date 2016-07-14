function fetchControlShiftData(categoriesString, callback) {
  if (!categoriesString) {
    callback({});
    return;
  }

  var urlSeparator = ':';
  var categorySeparator = '|';
  var categories = categoriesString.split(categorySeparator);
  
  var template =
    '<div class="popup_box"> ' +
    '<div class="popup_box_header"> ' +
    '<strong><a target="_blank" href="{{ url }}">{{ title }}</a></strong> ' +
    '</div> <em>{{ who }}<br>' +
    '<br> {{ what }} <br><br> ' +
    '{{ signature_count }} out of {{ goal }} signatures' +
    '</div>';
  var compiledTemplate = Handlebars.compile(template);
  
  var layerGroups = {};
  var controlShiftRequests = [];

  categories.forEach(function(categoryInfo) {
    console.log(categoryInfo);
    var domain = categoryInfo.split(urlSeparator)[0];
    var category = categoryInfo.split(urlSeparator)[1];
    var requestUrl = 'https://' + domain + '/categories/' + category + '.json';
    controlShiftRequests.push($.ajax({
      url: requestUrl,
      dataType: 'jsonp',
      success: function (data) {
        var markers = L.layerGroup();
        var categoryName = data.name || category;
        if (data.results) {
          data.results.forEach(function(petition) {
            if (petition.location) {
              var location = petition.location;
              if (location.latitude && location.longitude) {
                var marker = L.marker([location.latitude, location.longitude], {icon: getPetitionIcon()});
                console.log("Marker Created! " + category + " LAT=" + location.latitude + " LON=" + location.longitude);
                marker.bindPopup(compiledTemplate(petition));
                markers.addLayer(marker);
              }
            }
          });
          layerGroups[categoryName] = markers;
        }
      }
    }));
  });

  $.when.apply($, controlShiftRequests).done(function() {
    callback(layerGroups);
  });

}
