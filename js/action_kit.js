function fetchActionKitData(campaignsString, callback) {
  var separator = '|';
  var campaignNames = campaignsString.split(separator);
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
  var ajaxRequests = [];

  campaignNames.forEach(function(campaign) {
    ajaxRequests.push($.ajax({
      url: 'https://act.350.org/event/' + campaign + '?template_set=json_nearby_events&jsonp=?',
      dataType: 'jsonp',
      success: function (data) {
        var markers = L.layerGroup();
        if (data.events) {
          data.events.forEach(function (event) {
            if (event.latitude && event.longitude) {
              var marker = L.marker([event.latitude, event.longitude]);
              marker.bindPopup(compiledTemplate(event));
              markers.addLayer(marker);
            }
          });
          layerGroups[campaign] = markers;
        }
      }
    }));
  });

  $.when.apply($, ajaxRequests).done(function() {
    callback(layerGroups);
  });
}
