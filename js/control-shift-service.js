function fetchControlShiftData(categoriesString, callback) {
  if (!categoriesString) {
    callback({});
    return;
  }

  var urlSeparator = ':';
  var categorySeparator = '|';
  var categories = categoriesString.split(categorySeparator);
  
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
        console.log(data);
        var markers = L.layerGroup();
        var categoryName = data.name || category;
        if (data.results) {
          data.results.forEach(function(petition) {
            if (petition.location) {
              var location = petition.location;
              if (location.latitude && location.longitude) {
                var marker = L.marker([location.latitude, location.longitude], {icon: getEventIcon()});
                console.log("Marker Created! " + category + " LAT=" + location.latitude + " LON=" + location.longitude);
                // marker.bindPopup(compiledTemplate(event));
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
