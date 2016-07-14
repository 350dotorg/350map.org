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
    '<strong><a target="_blank" href="{{ rsvp_url }}">{{ name }}</a></strong> ' +
    '</div> <em>{{ city }}{{#if state }}, {{/if }}{{ state }}{{#if country }},{{/if }} {{ country }}</em> <hr /> ' +
    '{{ start_time }} <br> {{ event_date }} <br><br> ' +
    '{{ venue }} <br> {{ address }} <br> {{ city }}{{#if state }}, {{/if }}{{ state }}{{#if country }},{{/if }} {{ country }} <br><br>' +
    '<strong><a href="{{ rsvp_url }}">RSVP</a></strong> </div>';
  var compiledTemplate = Handlebars.compile(template);
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
