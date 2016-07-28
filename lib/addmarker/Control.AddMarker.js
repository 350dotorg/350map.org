/*
 * L.Control.AddMarker is a control to allow users to switch between different layers on the map.
 */

L.Control.AddMarker = L.Control.extend({
	options: {
		collapsed: true,
		position: 'topleft',
		autoZIndex: true,
                zoomLevel: 18
	},

	initialize: function (layers, icons, options) {
		L.setOptions(this, options);

		this._layers = {};
                this._icons = icons;

		this._lastZIndex = 0;
		this._handlingClick = false;

		for (var i in layers) {
			this._addLayer(layers[i], i);
		}
	},

	onAdd: function (map) {
		this._initLayout();
		this._update();
                this._map = map;
                this._positionMarker = new L.Marker([0,0]);
                this._defaultIcon = new L.Icon.Default();
                this._onInputClick();

		return this._container;
	},

	_initLayout: function () {
		var className = 'leaflet-control-addmarker',
		    container = this._container = L.DomUtil.create('div', className);

		//Makes this work on IE10 Touch devices by stopping it from firing a mouseout event when the touch is released
		container.setAttribute('aria-haspopup', true);

		if (!L.Browser.touch) {
			L.DomEvent.disableClickPropagation(container);
			L.DomEvent.on(container, 'mousewheel', L.DomEvent.stopPropagation);
		} else {
			L.DomEvent.on(container, 'click', L.DomEvent.stopPropagation);
		}

		var form = this._form = L.DomUtil.create('form', className + '-list');
                $(form).on('submit', function(e) { 
                    L.DomEvent.stopPropagation(e);
                    return false;
                });

		if (this.options.collapsed) {
			if (!L.Browser.android) {
				L.DomEvent
				    .on(container, 'mouseover', this._expand, this)
				    .on(container, 'mouseout', this._collapse, this);
			}
			var link = this._layersLink = L.DomUtil.create('a', className + '-toggle', container);
			link.href = '#';
			link.title = 'Layers';

			if (L.Browser.touch) {
				L.DomEvent
				    .on(link, 'click', L.DomEvent.stop)
				    .on(link, 'click', this._expand, this);
			}
			else {
				L.DomEvent.on(link, 'focus', this._expand, this);
			}

			this._map.on('click', this._collapse, this);
			// TODO keyboard accessibility
		} else {
			this._expand();
		}

                this._heading = L.DomUtil.create('div', className + '-heading', form);
		this._layersList = L.DomUtil.create('div', className + '-base', form);
		this._separator = L.DomUtil.create('div', className + '-separator', form);
		this._searchBar = L.DomUtil.create('div', className + '-searchbar', form);

                var searchbox = document.createElement('input');
                searchbox.id = 'leaflet-control-addmarker-qry';
                searchbox.type = 'text';
                searchbox.placeholder = 'Location';
                this._searchbox = searchbox;
            
                var msgbox = document.createElement('div');
                msgbox.id = 'leaflet-control-addmarker-msg';
                msgbox.className = 'leaflet-control-addmarker-msg';
                this._msgbox = msgbox;

                var resultslist = document.createElement('ul');
                resultslist.id = 'leaflet-control-geosearch-results';
                this._resultslist = resultslist;

                $(this._msgbox).append(this._resultslist);

                $(this._searchBar).append(this._searchbox, this._msgbox);
                L.DomEvent
                    .addListener(this._searchBar, 'keypress', this._onKeyUp, this)
                    .addListener(this._searchBar, 'click', L.DomEvent.stop);
                L.DomEvent.disableClickPropagation(this._searchBar);

		container.appendChild(form);
	},
     
    GetServiceUrl: function (qry) {
        var parameters = L.Util.extend({
            text: qry,
            f: 'pjson'
        }, this.options);

        return 'http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/find'
            + L.Util.getParamString(parameters);
    },

    ParseJSON: function (data) {
        if (data.locations.length == 0)
            return [];
        
        var results = [];
        for (var i = 0; i < data.locations.length; i++)
            results.push(new L.GeoSearch.Result(
                data.locations[i].feature.geometry.x, 
                data.locations[i].feature.geometry.y, 
                data.locations[i].name
            ));
        
        return results;
    },

    _printError: function(message) {
        $(this._resultslist)
            .html('<li>'+message+'</li>')
            .fadeIn('slow').delay(3000).fadeOut('slow',
                    function () { $(this).html(''); });
    },

    _processResults: function(results, qry) {
        if (results.length == 0)
            throw 'Sorry, that address could not be found.';

        this._map.fireEvent('addmarker_geosearch_foundlocations', {Locations: results, Query: qry});
        this._showLocation(results[0], qry);
    },

    _showLocation: function (location, qry) {
        this._map.removeLayer(this._positionMarker);
        this._positionMarker.setLatLng([location.Y, location.X]).addTo(this._map);
        this._map.setView([location.Y, location.X], this.options.zoomLevel, false);
        this._map.fireEvent('addmarker_geosearch_showlocation', {
            Location: location, Query: qry, Layer: this._activeLayer,
            Marker: this._positionMarker});
    },

    geosearch: function (qry) {
        try {
            var url = this.GetServiceUrl(qry);

            $.getJSON(url, function (data) {
                try {
                    var results = this.ParseJSON(data);
                    this._processResults(results, qry);
                }
                catch (error) {
                    this._printError(error);
throw error;
                }
            }.bind(this));
        }
        catch (error) {
            this._printError(error);
throw error;
        }
    },
      
    _onKeyUp: function (e) {
        if( e.keyCode === 27 ) {
            $('#leaflet-control-addmarker-qry').val('');
            $(this._map._container).focus();
        } else if( e.keyCode === 13 ) {
            this.geosearch($('#leaflet-control-addmarker-qry').val());
        }
        
    },
    
    _addLayer: function (layer, name, overlay) {
	this._layers[name] = {
	    layer: layer,
	    name: name,
	    overlay: overlay
	};
        
	if (this.options.autoZIndex && layer.setZIndex) {
	    this._lastZIndex++;
	    layer.setZIndex(this._lastZIndex);
	}
    },

	_update: function () {
		if (!this._container) {
			return;
		}

                this._heading.innerHTML = '<h4>Add a marker</h4>';
		this._layersList.innerHTML = '';

		var i, obj, j=0;

		for (i in this._layers) {
			obj = this._layers[i];
			this._addItem(obj, j);
                        if( j === 0 ) {
                            this._activeLayer = obj;
                        }
                        ++j;
		}

		this._separator.style.display = '';
	},

	// IE7 bugs out if you create a radio dynamically, so you have to do it this hacky way (see http://bit.ly/PqYLBe)
	_createRadioElement: function (name, checked) {

		var radioHtml = '<input type="radio" class="leaflet-control-addmarker-selector" name="' + name + '"';
		if (checked) {
			radioHtml += ' checked="checked"';
		}
		radioHtml += '/>';

		var radioFragment = document.createElement('div');
		radioFragment.innerHTML = radioHtml;

		return radioFragment.firstChild;
	},

	_addItem: function (obj, index) {
		var label = document.createElement('label'),
		    input,
		    checked = index===0;

  	        input = this._createRadioElement('leaflet-base-layers', checked);

		input.layerId = obj.name;

		L.DomEvent.on(input, 'click', this._onInputClick, this);

		var name = document.createElement('span');
		name.innerHTML = ' ' + obj.name;

		label.appendChild(input);
		label.appendChild(name);

		var container = this._layersList;
		container.appendChild(label);

		return label;
	},

	_onInputClick: function () {
		var i, input, obj,
		    inputs = this._form.getElementsByTagName('input'),
		    inputsLen = inputs.length;

		this._handlingClick = true;

		for (i = 0; i < inputsLen; i++) {
		    input = inputs[i];
		    obj = this._icons[input.layerId];
                    if( input.checked ) {
                        this._positionMarker.setIcon(obj || this._defaultIcon);
                        this._activeLayer = this._layers[input.layerId];
                    }
		}

		this._handlingClick = false;
	},

	_expand: function () {
		L.DomUtil.addClass(this._container, 'leaflet-control-addmarker-expanded');
	},

	_collapse: function () {
	this._container.className = this._container.className.replace(' leaflet-control-addmarker-expanded', '');
	}
});

L.control.addmarker = function (layers, icons, options) {
	return new L.Control.AddMarker(layers, icons, options);
};
