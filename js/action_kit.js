function fetchActionKitData(campaignsString) {
  var separator = '|';
  var campaignNames = campaignsString.split(separator);
  
  campaignNames.forEach(function (campaign) {
    $.ajax({
      url: 'https://act.350.org/event/' + campaign + '?template_set=json_nearby_events&jsonp=?',
      dataType: 'jsonp',
      success: function (data) {
        if (data.events) {
          console.log(data.events[0]);
        }
      }
    });
  });
}