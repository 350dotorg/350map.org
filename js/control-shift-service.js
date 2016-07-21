function fetchControlShiftData(categoriesString, callback) {
  if (!categoriesString) {
    callback({});
    return;
  }

  var urlSeparator = ':';
  var categorySeparator = '|';
  var categories = categoriesString.split(categorySeparator);

  var template =
    '<div class="popup_box">' +
    '<div class="popup_box_header">' +
    '<strong><a target="_blank" href="{{ url }}">{{ title }}</a></strong>' +
    '</div><div><em>{{ location.query }}</em></div><hr />' +
    '{{ who }}<br><br>' +
    '{{ what }} <br><br>' +
    '{{ signature_count }} out of {{ goal }} signatures' +
    '</div>';
  var compiledTemplate = Handlebars.compile(template);

  var firstPageRequests = [];
  var allPageRequests = [];
  var categoryPageNumberMap = {};
  var layerGroups = {};

  categories.forEach(function(categoryInfo) {
    var domain = categoryInfo.split(urlSeparator)[0];
    var category = categoryInfo.split(urlSeparator)[1];

    firstPageRequests.push($.ajax({
      url: getControlShiftUrl(domain, category, 1),
      dataType: 'jsonp',
      success: function(data) {
        categoryPageNumberMap[categoryInfo] = data.total_pages;
      }
    }));
  });

  $.when.apply($, firstPageRequests).done(function() {
    categories.forEach(function(categoryInfo) {
      var domain = categoryInfo.split(urlSeparator)[0];
      var category = categoryInfo.split(urlSeparator)[1];
      var totalPages = categoryPageNumberMap[categoryInfo];

      for (var i = 1; i <= totalPages; i++) {
        var requestUrl = getControlShiftUrl(domain, category, i);

        allPageRequests.push($.ajax({
          url: requestUrl,
          dataType: 'jsonp',
          success: function(data) {
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
              });
              layerGroups[categoryName] = markers;
            }
          }
        }))
      }
    });

    $.when.apply($, allPageRequests).done(function() {
      callback(layerGroups);
    });
  });

  function getControlShiftUrl(domain, category, page) {
    return 'https://' + domain + '/categories/' + category + '.json?page=' + page;
  }
}
