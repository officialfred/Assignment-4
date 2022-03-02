mapboxgl.accessToken = 'pk.eyJ1IjoiY3dob25nIiwiYSI6IjAyYzIwYTJjYTVhMzUxZTVkMzdmYTQ2YzBmMTM0ZDAyIn0.owNd_Qa7Sw2neNJbK6zc1A'

// lngLat for the Downtown Oakland
var wspCenter = [-122.2712, 37.8044]


$.getJSON('./data/PoliceBeatsClean.geojson', function(rawData) {
  // convert pop2010 property from a string to a number so we cna use it
  // for a choropleth map
  var cleanData = rawData
  cleanData.features = cleanData.features.map(function(feature) {
    var cleanFeature = feature
    cleanFeature.properties.pop2010 = parseInt(cleanFeature.properties.pop2010)
    return cleanFeature
  })


  var map = new mapboxgl.Map({
    container: 'mapContainer', // HTML container id
    style: 'mapbox://styles/mapbox/dark-v9', // style URL
    center: wspCenter, // starting position as [lng, lat]
    zoom: 10,
    // minZoom: 9,
    // maxZoom: 14
  });

  map.on('load', function() {
    map.addSource('PoliceBeatsClean', {
      type: 'geojson',
      data: cleanData
    })

    map.addLayer({
      id: 'community-districts-fill',
      type: 'fill',
      source: 'community-districts',
      paint: {
        'fill-color': [
          'interpolate',
          ['linear'],
          ['get', 'pop2010'],
          0,
          '#f1eef6',
          50000,
          '#bdc9e1',
          100000,
          '#74a9cf',
          150000,
          '#2b8cbe',
          200000,
          '#045a8d',
        ]
      }
    })

    // initialize a source with dummy data
    map.addSource('selected-feature', {
      type: 'geojson',
      data: {
        "type": "Feature",
        "properties": {},
        "geometry": {
          "type": "Point",
          "coordinates": [
            -13.7109375,
            34.88593094075317
          ]
        }
      }
    })

    map.addLayer({
      id: 'selected-feature-line',
      type: 'line',
      source: 'selected-feature',
      paint: {
        'line-color': 'pink',
        'line-width': 4,
        'line-dasharray': [1, 1]
      }
    })

    map.on('click', function(e) {
      var features = map.queryRenderedFeatures(e.point)
      var featureOfInterestProperties = features[0].properties



      var boroCd = featureOfInterestProperties['boro_cd']
      // look up the feature in cleanData that matches this boro_cd code
      featureOfInterestGeometry = cleanData.features.find(function(feature) {
        return feature.properties['boro_cd'] === boroCd
      })

      console.log('the geometry', featureOfInterestGeometry)
      // use this geometry to update the source for the selected layer
      map.getSource('selected-feature').setData(featureOfInterestGeometry)


      var borough = featureOfInterestProperties['New_York_City_Population_By_Community_Districts_Borough']
      var cdNumber = featureOfInterestProperties['New_York_City_Population_By_Community_Districts_CD Number']
      var cdName = featureOfInterestProperties['cd_name']
      var pop2010 = featureOfInterestProperties['pop2010']
      var pop2000 = featureOfInterestProperties['New_York_City_Population_By_Community_Districts_2000 Population']
      var pop1990 = featureOfInterestProperties['New_York_City_Population_By_Community_Districts_1990 Population']
      var pop1980 = featureOfInterestProperties['New_York_City_Population_By_Community_Districts_1980 Population']

      $('#sidebar-content-area').html(`
        <h4>${borough} Community District ${cdNumber}</h4>
        <p>${cdName}</p>
        <p>2010 Population: ${numeral(pop2010).format('0.0a')}</p>
        <p>2000 Population: ${numeral(pop2000).format('0.0a')}</p>
        <p>1990 Population: ${numeral(pop1990).format('0.0a')}</p>
        <p>1980 Population: ${numeral(pop1980).format('0.0a')}</p>
      `)

    })
  })

  $('#fly-to-midtown').on('click', function() {
    // when this is clicked, let's fly the map to Midtown Manhattan
    map.flyTo({
      center: [-73.983102, 40.757933],
      zoom: 12
    })
  })

  $('#fly-to-jfk').on('click', function() {
    // when this is clicked, let's fly the map to Midtown Manhattan
    map.flyTo({
      center: [-73.784021,40.645230],
      zoom: 13
    })
  })

  $('#toggle-population').on('click', function() {
    var visibility = map.getLayoutProperty('community-districts-fill', 'visibility')
    if (visibility === 'none') {
      map.setLayoutProperty('community-districts-fill', 'visibility', 'visible');
    } else {
      map.setLayoutProperty('community-districts-fill', 'visibility', 'none');
    }
  })
})
