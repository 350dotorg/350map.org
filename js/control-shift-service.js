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
  var pagesPromises = [];
  var categoriesPages = {};

  categories.forEach(function(categoryInfo) {
    var totalPages = 1;
    var domain = categoryInfo.split(urlSeparator)[0];
    var category = categoryInfo.split(urlSeparator)[1];
    
    pagesPromises.push($.ajax({
      url: 'https://' + domain + '/categories/' + category + '.json',
      dataType: 'jsonp',
      success: function (data) {
        totalPages = data.total_pages;
        categoriesPages[categoryInfo] = totalPages;
      }
    }));
  });

  $.when.apply($, pagesPromises).done(function() {
    categories.forEach(function(categoryInfo) {

      var domain = categoryInfo.split(urlSeparator)[0];
      var category = categoryInfo.split(urlSeparator)[1];

      var totalPages = categoriesPages[categoryInfo];
      
      for (var i = 1 ; i <= totalPages ; i++) {
        if (i == 3 && category == "fossil-fuel-divestment-cities-states") continue; // This request causes a JSON parse error: 
        // https://campaigns.gofossilfree.org/categories/fossil-fuel-divestment-cities-states.json?page=3
        // For more information on the error: http://stackoverflow.com/questions/2965293/javascript-parse-error-on-u2028-unicode-character

        var requestUrl = 'https://' + domain + '/categories/' + category + '.json?page=' + i;

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
                    marker.bindPopup(compiledTemplate(petition));
                    markers.addLayer(marker);
                  }
                }
              })
              layerGroups[categoryName] = markers;
            }
          }
        }))
      }
    })

    $.when.apply($, controlShiftRequests).done(function() {
      callback(layerGroups);
    });
  });
        
}
