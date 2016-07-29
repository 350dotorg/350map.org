function getActionKitTemplate() {
  return '<div class="popup_box">' +
    '<div class="popup_box_header">' +
    '<a target="_blank" href="{{ rsvp_url }}">{{ name }}</a>' +
    '</div>' +
    '<div>{{ city }}{{#if state }}, {{/if }}{{ state }}{{#if country }},{{/if }} {{ country }}</div>' +
    '<div>{{ start_time }}</div>' +
    '<div>{{ event_date }}</div>' +
    '<div>{{ venue }}</div>' +
    '<div>{{ address }} </div>' +
    '<div>{{ city }}{{#if state }}, {{/if }}{{ state }}{{#if country }},{{/if }} {{ country }}</div>' +
    '<a href="{{ rsvp_url }}">RSVP</a>' +
    '</div>';

}

function getControlShiftTemplate() {
  return '<div class="popup_box">' +
      '<div class="bg-blue" class="popup-header-text">' +
        '<div class="popup_box_header">' +
          '<div>PETITION</div>' +
          '<strong><a target="_blank" href="{{ url }}">{{ title }}</a></strong>' +
        '</div>' +
      '</div>' +
      '<div class="bold_margin">TO: {{ who }}</div>' +
      '<div>{{ what }}</div>' +
      '<div class="bold_margin">{{ signature_count }} signatures out of {{ goal }} needed.</div>' +
      '<div class="button arrow-right"><a class="popup-button-text" target="_blank" href="{{ url }}">Sign the Petition</a></div>' +
    '</div>';
}
