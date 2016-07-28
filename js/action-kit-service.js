function fetchActionKitData(campaignsString, callback) {
  if (!campaignsString) {
    callback({});
    return;
  }

  var separator = '|';
  var campaigns = campaignsString.split(separator);
  var compiledTemplate = Handlebars.compile(getActionKitTemplate());
  var layerGroups = {};
  var actionKitRequests = [];

  campaigns.forEach(function(campaign) {
    actionKitRequests.push($.ajax({
      url: config.actionKitUrl + campaign + '?template_set=json_nearby_events&jsonp=?',
      dataType: 'jsonp',
      success: function (data) {
        var markers = L.layerGroup();
        var campaignName = data.campaign || campaign;
        if (data.events) {
          data.events.forEach(function(event) {
            if (event.latitude && event.longitude) {
              var marker = L.marker([event.latitude, event.longitude], {icon: getEventIcon()});
              event.start_time = moment(event.start_time, 'H:mm:ss').format("h:mma");
              event.event_date = moment(event.event_date).format("MMMM D, YYYY");
              marker.bindPopup(compiledTemplate(event));
              markers.addLayer(marker);
            }
          });
          layerGroups[campaignName] = markers;
        }
      }
    }));
  });

  $.when.apply($, actionKitRequests).done(function() {
    callback(layerGroups);
  });

  return $.Deferred().promise();
}
