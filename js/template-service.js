function getActionKitTemplate() {
  return '<div class="popup_box"> ' +
    '<div class="popup_box_header"> ' +
    '<strong><a target="_blank" href="{{ rsvp_url }}">{{ name }}</a></strong> ' +
    '</div> <em>{{ city }}{{#if state }}, {{/if }}{{ state }}{{#if country }},{{/if }} {{ country }}</em> <hr /> ' +
    '{{ start_time }} <br> {{ event_date }} <br><br> ' +
    '{{ venue }} <br> {{ address }} <br> {{ city }}{{#if state }}, {{/if }}{{ state }}{{#if country }},{{/if }} {{ country }} <br><br>' +
    '<strong><a href="{{ rsvp_url }}">RSVP</a></strong> </div>';

}

function getControlShiftTemplate() {
  return '<div class="popup_box">' +
    '<div class="popup_box_header">' +
    '<strong><a target="_blank" href="{{ url }}">{{ title }}</a></strong>' +
    '</div><div><em>{{ location.query }}</em></div><hr />' +
    '{{ who }}<br><br>' +
    '{{ what }} <br><br>' +
    '{{ signature_count }} out of {{ goal }} signatures' +
    '</div>';
}
