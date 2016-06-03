function fetchActionKitData(map, campaignsString) {
  var separator = '|';
  var campaignNames = campaignsString.split(separator);
  var template = '<div class="popup_box"> <div class="popup_box_header"> <strong><a href="{{ website }}">{{ name }}</a></strong> </div> <em>{{ geom }}</em> <hr /> {{ description }} </div>';
  var compiledTemplate = Handlebars.compile(template);

  campaignNames.forEach(function (campaign) {
    $.ajax({
      url: 'https://act.350.org/event/' + campaign + '?template_set=json_nearby_events&jsonp=?',
      dataType: 'jsonp',
      success: function (data) {
        if (data.events) {
          data.events.forEach(function (event) {
            if (event.latitude && event.longitude) {
              console.log(event);
              var marker = L.marker([event.latitude, event.longitude]).addTo(map);
              marker.bindPopup(compiledTemplate(event)).openPopup();
            }
          });
        }
      }
    });
  });
}