function fetchActionKitData(campaignsString, callback) {
  if (!campaignsString) {
    callback({});
    return;
  }

  var separator = '|';
  var campaigns = campaignsString.split(separator);
  var template =
    '<div class="popup_box"> ' +
    '<div class="popup_box_header"> ' +
    '<strong><a href="{{ website }}">{{ name }}</a></strong> ' +
    '</div> <em>{{ city }} {{ state }} {{country}}</em> <hr /> ' +
    '{{ start_time }} <br> {{event_date}} <br><br> ' +
    '{{ venue }} <br> {{ address }} <br> {{ city }} {{ state }} {{country}} <br><br>' +
    '<strong><a href="{{ rsvp_url }}">RSVP</a></strong> </div>';
  var compiledTemplate = Handlebars.compile(template);
  var layerGroups = {};
  var actionKitRequests = [];

  campaigns.forEach(function(campaign) {
    actionKitRequests.push($.ajax({
      url: 'https://act.350.org/event/' + campaign + '?template_set=json_nearby_events&jsonp=?',
      dataType: 'jsonp',
      success: function (data) {
        var markers = L.layerGroup();
        var campaignName = data.campaign || campaign;
        if (data.events) {
          data.events.forEach(function(event) {
            if (event.latitude && event.longitude) {
              var marker = L.marker([event.latitude, event.longitude]);
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
}
