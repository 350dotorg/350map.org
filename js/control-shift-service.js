var config = require("./config.js");
var iconService = require("./icon-service.js");
var templateService = require("./template-service.js");

var urlSeparator = ':';
var categorySeparator = '|';
var characterLimit = 200;

var compiledTemplate = Handlebars.compile(templateService.getControlShiftTemplate());

var firstPageRequests = [];
var allPageRequests = [];

var layerGroups = {};

module.exports.fetchControlShiftData = function(categoriesString, callback) {
  if (!categoriesString) {
    callback({});
    return;
  }

  var categories = categoriesString.split(categorySeparator);

  var categoryPageNumberMap = getPagesForEachCategory(categories);

  $.when.apply($, firstPageRequests).done(function() {
    categories.forEach(function(categoryInfo) {
      createCampaignMarkersForCategory(categoryInfo, categoryPageNumberMap);
    });

    renderMarkers(callback);
  });
}

function getPagesForEachCategory(categories) {
  var categoryPageNumberMap = {};

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

  return categoryPageNumberMap;
}

function createCampaignMarkersForCategory(categoryInfo, categoryPageNumberMap) {
  var domain = categoryInfo.split(urlSeparator)[0];
  var category = categoryInfo.split(urlSeparator)[1];
  var totalPages = categoryPageNumberMap[categoryInfo];

  for (var i = 1; i <= totalPages; i++) {
    allPageRequests.push($.ajax({
      url: getControlShiftUrl(domain, category, i),
      dataType: 'jsonp',
      success: function(data) {
        createCampaignMarkers(data);
      }
    }))
  }
}

function createCampaignMarkers(data) {
  var categoryName = data.name || category;
  var markers;

  if (layerGroups[categoryName]) {
    markers = layerGroups[categoryName];
  } else {
    markers = L.layerGroup();
  }

  if (data.results) {
    data.results.forEach(function(petition) {
      if (petition.what.length > characterLimit) {
        petition.what = petition.what.substring(0, characterLimit) + '…';
      }

      if (petition.location) {
        var location = petition.location;

        if (location.latitude && location.longitude) {
          var marker = L.marker([location.latitude, location.longitude], {icon: iconService.getPetitionIcon()});
          marker.bindPopup(compiledTemplate(petition));
          markers.addLayer(marker);
        }
      }
    });
    layerGroups[categoryName] = markers;
  }
}

function renderMarkers(callback) {
  $.when.apply($, allPageRequests).done(function() {
    callback(layerGroups);
  });
}

function getControlShiftUrl(domain, category, page) {
  return 'https://' + domain + '/categories/' + category + '.json?page=' + page;
}
