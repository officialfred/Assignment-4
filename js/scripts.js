mapboxgl.accessToken = 'pk.eyJ1IjoiY3dob25nIiwiYSI6IjAyYzIwYTJjYTVhMzUxZTVkMzdmYTQ2YzBmMTM0ZDAyIn0.owNd_Qa7Sw2neNJbK6zc1A'

// lngLat for the Downtown Oakland
var oakCenter = [-122.2712, 37.76]

// Set bounds to Oakland.
const bounds = [
    [-122.5, 37.6], // Southwest coordinates
    [-122.0, 37.9] // Northeast coordinates
];

// Load data
$.getJSON('./data/oak.geojson', function(rawData) {

  var map = new mapboxgl.Map({
    container: 'mapContainer', // HTML container id
    style: 'mapbox://styles/mapbox/dark-v9', // style URL
    center: oakCenter, // starting position as [lng, lat]
    zoom: 10,
    minZoom: 9,
    maxZoom: 14,
    maxBounds: bounds // limit map bounds
  });

  map.on('load', function() {
    map.addSource('oak', {
      type: 'geojson',
      data: rawData,
    })

    map.addLayer({
      id: 'homeless_encampments',
      type: 'fill',
      source: 'oak',
      'layout': {
        visibility: 'none', //Layers load invisible, to show only when toggled
      },
      paint: {
        'fill-color': [
          'interpolate',
          ['linear'],
          ['get', 'encampment_count'],
          0,
          '#f6e2ff',
          300,
          '#edc4ff',
          600,
          '#e19dff',
          900,
          '#d26dff',
          1200,
          '#c543ff',
          1500,
          '#9b00e1',
        ],
        'fill-opacity': 0.7
      }
    })

    map.addLayer({
      id: 'violent_crime',
      type: 'fill',
      source: 'oak',
      'layout': {
        visibility: 'none',
      },
      paint: {
        'fill-color': [
          'interpolate',
          ['linear'],
          ['get', 'viol_crime_count'],
          0,
          '#ffd0b5',
          500,
          '#e7a37d',
          1000,
          '#d98454',
          1500,
          '#e97331',
          2000,
          '#e83e27',
          2500,
          '#b30505',
        ],
        'fill-opacity': 0.7
      }
    })

    map.addLayer({
      id: 'illegal_dumping',
      type: 'fill',
      source: 'oak',
      'layout': {
        visibility: 'none',
      },
      paint: {
        'fill-color': [
          'interpolate',
          ['linear'],
          ['get', 'dumping_count'],
          0,
          '#f1eef6',
          50,
          '#bdc9e1',
          500,
          '#74a9cf',
          2500,
          '#2b8cbe',
          5000,
          '#045a8d',
        ],
        'fill-opacity': 0.7
      }
    })
  })


// Buttons to toggle the visibility of the layers
    $('#illegal-dumping').on('click', function() {
      // when this is clicked, let's fly the map to Midtown Manhattan
      map.setLayoutProperty('illegal_dumping', 'visibility', 'visible');
      map.setLayoutProperty('violent_crime', 'visibility', 'none');
      map.setLayoutProperty('homeless_encampments', 'visibility', 'none');
      })

    $('#violent-crime').on('click', function() {
      // when this is clicked, let's fly the map to Midtown Manhattan
      map.setLayoutProperty('illegal_dumping', 'visibility', 'none');
      map.setLayoutProperty('violent_crime', 'visibility', 'visible');
      map.setLayoutProperty('homeless_encampments', 'visibility', 'none');
      })

    $('#homeless-encampments').on('click', function() {
      // when this is clicked, let's fly the map to Midtown Manhattan
      map.setLayoutProperty('illegal_dumping', 'visibility', 'none');
      map.setLayoutProperty('violent_crime', 'visibility', 'none');
      map.setLayoutProperty('homeless_encampments', 'visibility', 'visible');
      })



})
