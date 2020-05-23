function getActionKitTemplate() {
  return '<div class="popup_box">' +
    '<div class="bg-blue">' +
    '<div class="popup_box_header">' +
    '<div class="popup_box_type">Event</div>' +
    '<a target="_blank" href="{{ rsvp_url }}">{{ name }}</a>' +
    '</div>' +
    '</div>' +
    '<div class="popup_box_info">' +
    '<div>{{ event_date }}</div>' +
    '<div>{{ start_time }}</div>' +
    '<div class="space">{{ venue }}</div>' +
    '<div>{{ address }} </div>' +
    '<div class="space-bottom">{{ city }}{{#if state }}, {{/if }}{{ state }}{{#if country }},{{/if }} {{ country }}</div>' +
    '<div class="button arrow-right popup_button"><a class="popup_button_text" href="{{ rsvp_url }}">RSVP</a></div>' +
    '</div>' +
    '</div>';

}

function getControlShiftTemplate() {
  return '<div class="popup_box">' +
    '<div class="bg-blue">' +
    '<div class="popup_box_header">' +
    '<div class="popup_box_type">Petition</div>' +
    '<a target="_blank" href="{{ url }}">{{ title }}</a>' +
    '</div>' +
    '</div>' +
    '<div class="popup_box_info">' +
    '<div class="bold">TO: {{ who }}</div>' +
    '<div class="space">{{ what }}</div>' +
    '<div class="bold space-bottom">{{ signature_count }} signatures out of {{ goal }} needed.</div>' +
    '<div class="button arrow-right popup_button"><a class="popup_button_text" target="_blank" href="{{ url }}">Sign the Petition</a></div>' +
    '</div>' +
    '</div>';
}
