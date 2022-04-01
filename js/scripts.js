mapboxgl.accessToken = 'pk.eyJ1IjoiY3dob25nIiwiYSI6IjAyYzIwYTJjYTVhMzUxZTVkMzdmYTQ2YzBmMTM0ZDAyIn0.owNd_Qa7Sw2neNJbK6zc1A'

// lngLat for the Downtown Oakland
var oakCenter = [-122.2712, 37.76];

// Set bounds to Oakland.
const bounds = [
    [-122.5, 37.6], // Southwest coordinates
    [-122.0, 37.9] // Northeast coordinates
];

// Fetch today's date
var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
var yyyy = today.getFullYear();

// Get six months ago for another API call
const getDaysInMonth = (year, month) => new Date(year, month, 0).getDate()

const addMonths = (input, months) => {
  const date = new Date(input)
  date.setDate(1)
  date.setMonth(date.getMonth() + months)
  date.setDate(Math.min(input.getDate(), getDaysInMonth(date.getFullYear(), date.getMonth()+1)))
  return date
}

var minusSixMonths = addMonths(new Date(today), -6);
var dd2 = String(minusSixMonths.getDate()).padStart(2, '0');
var mm2 = String(minusSixMonths.getMonth() + 1).padStart(2, '0'); //January is 0!
var yyyy2 = minusSixMonths.getFullYear();
var six_months_back = "'" + yyyy2 + '-' + mm2 + '-' + dd2 + "'"
console.log(six_months_back);

// set today's date from 5 years ago
var yyyy = yyyy-5;
var five_years_back = "'" + yyyy + '-' + mm + '-' + dd + "'";

// for TS api call
var today = "'" + today.getFullYear()  + "-" + String(today.getMonth() + 1).padStart(2, '0') + "-" + String(today.getDate()).padStart(2, '0') + "'";

// Load data
// rows to select; part of starturl; DO NOT incorporate into request urls
var selection = "%20datetimeinit,%20description,%20reqcategory,%20beat";

// for the time series api calls
var selection2 = "%20datetimeinit,%20beat";


// start + end urls
var starturl = "https://data.oaklandca.gov/resource/quth-gb8e.json?$query=SELECT" + selection + "%20WHERE%20";
var endurl = "AND%20datetimeinit>" + five_years_back + "%20LIMIT%2050000";

// illegal dumping + hopmeless encampment urls
var dumpurl = starturl + "reqcategory='ILLDUMP'%20" + endurl;
var encampment_url = starturl + "description='Homeless%20Encampment'%20" + endurl;

// crime data comes from a different source
var violent_crime_selection = "('ASSAULT',%20'FORCIBLE%20RAPE',%20'ROBBERY',%20'FELONY%20ASSAULT',%20'MISDEMEANOR%20ASSAULT',%20'OTHER%20SEX%20OFFENSES',%20'HOMICIDE')";
var crimeurl = "https://data.oaklandca.gov/resource/ppgh-7dqv.json?$query=SELECT%20datetime,%20policebeat%20WHERE%20crimetype%20in%20" + violent_crime_selection + "AND%20datetime>" + five_years_back + "%20LIMIT%2050000";

// make the api calls
$.getJSON(dumpurl, function(dumpData) {
$.getJSON(encampment_url, function(encampmentData) {
$.getJSON(crimeurl, function(violent_crime) {



// load the data
var encampments =  encampmentData;
var dumpings = dumpData;
var crimes = violent_crime;

//create dictionaries with # of occurences per police beat
let dumping_dict = _.countBy(dumpings, (rec) => {
        return rec.beat ;
    });

let encampments_dict = _.countBy(encampments, (rec) => {
        return rec.beat
         ;
    });
let crime_dict = _.countBy(crimes, (rec) => {
        return rec.policebeat ;
    });

// fetch our cleaned up geojson and add # of occurences
$.getJSON("data/PoliceBeatsClean.json", function(beats) {

beats.features.forEach(dothis);

 function dothis(item){
   item.properties["dumping"] = dumping_dict[item.properties.name]
   item.properties["encampments"] = encampments_dict[item.properties.name]
   item.properties["crimes"] = crime_dict[item.properties.name]
   // console.log(item)
 }


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
  map.addSource('beats', {
    type: 'geojson',
    data: beats,
  })


// add homeless encampments layer
  map.addLayer({
    id: 'homeless_encampments',
    type: 'fill',
    source: 'beats',
    'layout': {
      visibility: 'none', //Layers load invisible, to show only when toggled
    },
    paint: {
      'fill-color': [
        'interpolate',
        ['linear'],
        ['get', 'encampments'],
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
        15000,
        '#9b00e1',
      ],
      'fill-opacity': 0.7
    }
  })

// add violent crime layer
    map.addLayer({
      id: 'violent_crime',
      type: 'fill',
      source: 'beats',
      'layout': {
        visibility: 'none',
      },
      paint: {
        'fill-color': [
          'interpolate',
          ['linear'],
          ['get', 'crimes'],
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

// add illegal dumping layer
    map.addLayer({
      id: 'illegal_dumping',
      type: 'fill',
      source: 'beats',
      'layout': {
        visibility: 'visible',
      },
      paint: {
        'fill-color': [
          'interpolate',
          ['linear'],
          ['get', 'dumping'],
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

  // When a click event occurs on a feature in the places layer, open a popup at the
  // location of the feature, with description HTML from its properties.
  map.on('click', 'illegal_dumping', (e) => {

  // Copy coordinates array.
    const coordinates = [e.features[0].properties.lng, e.features[0].properties.lat];
    if (e.features[0].properties.cp_beat.length < 3){
      var beat = "0" + e.features[0].properties.cp_beat;
    } else {
      var beat = e.features[0].properties.cp_beat;
    };

    //make api call for dumping time series
    const description = "Police beat: " + beat;
    const dumpurl2 = "https://data.oaklandca.gov/resource/quth-gb8e.json?$query=SELECT" + selection2 + "%20WHERE%20beat='" + beat+ "'AND%20reqcategory='ILLDUMP'%20AND%20datetimeinit%20between%20" + six_months_back + "%20and%20" + today + "%20ORDER%20BY%20datetimeinit%20ASC%20LIMIT%2050000"
    $.getJSON(dumpurl2, function(dumpTS) {
    var  dumpTS = dumpTS;

    let ts_dict = _.countBy(dumpTS, (rec) => {
            var date = new Date(rec.datetimeinit);
            var mm = String(date.getMonth() + 1).padStart(2, '0'); //January is 0!
            var yyyy = date.getFullYear();
            return  "'" + yyyy + "-" + mm + "'";
        });
    // console.log(ts_dict)

    var trace1 = {
        type: "scatter",
        mode: "lines",
        name: 'AAPL High',
        x: Object.keys(ts_dict),
        y: Object.values(ts_dict),
        line: {color: '#17BECF'}
      }

    var data = [trace1];

    var layout = {
      title: {
        text: 'Beat: '+ beat +' - 311 Calls',
        font: {
          family: 'Proxima nova',
          size: 12
        },
        xref: 'paper',
        x: -0.1,
      },
      xaxis: {
        tickangle: 90,
        },
      showgrid: false,
      width : 250,
      height : 300,
      margin: {
        l: 20,
        r: 10,
        b: 70,
        t: 50,
        pad: 0
      }
    }

    const popup = new mapboxgl.Popup({ closeOnClick: true })
    .setLngLat(coordinates)
    .setHTML("<div id='myDiv'  padding-top: 0px; padding-right: 10px; padding-bottom: 0px; padding-left: 0px;></div>")
    .on('open', () => {
      Plotly.newPlot('myDiv', data, layout, {staticPlot: true});
    })
    .setMaxWidth("300px")
    .addTo(map);
    })
    });


  // Same for homeless encampments
  map.on('click', 'homeless_encampments', (e) => {

  // Copy coordinates array.
    const coordinates = [e.features[0].properties.lng, e.features[0].properties.lat];
    if (e.features[0].properties.cp_beat.length < 3){
      var beat = "0" + e.features[0].properties.cp_beat;
    } else {
      var beat = e.features[0].properties.cp_beat;
    };

    //make api call for time series
    const description = "Police beat: " + beat;
    const encampmentsurl2 = "https://data.oaklandca.gov/resource/quth-gb8e.json?$query=SELECT" + selection2 + "%20WHERE%20beat='" + beat+ "'AND%20description='Homeless%20Encampment'%20AND%20datetimeinit%20between%20" + six_months_back + "%20and%20" + today + "%20ORDER%20BY%20datetimeinit%20ASC%20LIMIT%2050000"
    $.getJSON(encampmentsurl2, function(campTS) {
    var  campTS = campTS;

    let ts_dict = _.countBy(campTS, (rec) => {
            var date = new Date(rec.datetimeinit);
            var mm = String(date.getMonth() + 1).padStart(2, '0'); //January is 0!
            var yyyy = date.getFullYear();
            return  "'" + yyyy + "-" + mm + "'";
        });
    // console.log(ts_dict)

    var trace1 = {
        type: "scatter",
        mode: "lines",
        name: 'AAPL High',
        x: Object.keys(ts_dict),
        y: Object.values(ts_dict),
        line: {color: '#17BECF'}
      }

    var data = [trace1];
    var layout = {
      title: {
        text: 'Beat: '+ beat +' - 311 Calls',
        font: {
          family: 'Proxima nova',
          size: 12
        },
        xref: 'paper',
        x: -0.1,
      },
      xaxis: {
        tickangle: 90,
        },
      showgrid: false,
      width : 250,
      height : 300,
      margin: {
        l: 20,
        r: 10,
        b: 70,
        t: 50,
        pad: 0
      }
    }

    const popup = new mapboxgl.Popup({ closeOnClick: true })
    .setLngLat(coordinates)
    .setHTML("<div id='myDiv' padding-top: 0px; padding-right: 10px; padding-bottom: 0px; padding-left: 0px;></div>")
    .on('open', () => {
      Plotly.newPlot('myDiv', data, layout, {staticPlot: true});
    })
    .setMaxWidth("300px")
    .addTo(map);
    })
    });


  // When a click event occurs on a feature in the places layer, open a popup at the
  // location of the feature, with description HTML from its properties.
  map.on('click', 'violent_crime', (e) => {

    // Copy coordinates array.
      const coordinates = [e.features[0].properties.lng, e.features[0].properties.lat];

      if (e.features[0].properties.cp_beat.length < 3){
        var beat = "0" + e.features[0].properties.cp_beat;
      } else {
        var beat = e.features[0].properties.cp_beat;
      };

      console.log(beat)

      //make api call for dumping time series
      const description = "Police beat: " + beat;

      const crimeurl2 = "https://data.oaklandca.gov/resource/ppgh-7dqv.json?$query=SELECT%20datetime,%20policebeat%20WHERE%20policebeat='" + beat+ "'AND%20crimetype%20in%20" + violent_crime_selection + "%20AND%20datetime%20between%20" + six_months_back + "%20and%20" + today + "%20ORDER%20BY%20datetime%20ASC%20LIMIT%2050000"
      $.getJSON(crimeurl2, function(crimeTS) {
      var  crimeTS = crimeTS;

      let ts_dict = _.countBy(crimeTS, (rec) => {
              var date = new Date(rec.datetime);
              var mm = String(date.getMonth() + 1).padStart(2, '0'); //January is 0!
              var yyyy = date.getFullYear();
              console.log(yyyy + "-" + mm);
              return  "'" + yyyy + "-" + mm + "'";
          });
      // console.log(ts_dict)

      var trace1 = {
          type: "scatter",
          mode: "lines",
          name: 'AAPL High',
          x: Object.keys(ts_dict),
          y: Object.values(ts_dict),
          line: {color: '#17BECF'}
        }

      var data = [trace1];
      var layout = {
        title: {
          text: 'Beat: '+ beat +' - Reported incidents',
          font: {
            family: 'Proxima nova',
            size: 12
          },
          xref: 'paper',
          x: -0.1,
        },
        xaxis: {
          tickangle: 90,
          },
        showgrid: false,
        width : 250,
        height : 300,
        margin: {
          l: 20,
          r: 10,
          b: 70,
          t: 50,
          pad: 0
        }

      }


      const popup = new mapboxgl.Popup({ closeOnClick: true })
      .setLngLat(coordinates)
      .setHTML("<div id='myDiv' padding-top: 0px; padding-right: 10px; padding-bottom: 0px; padding-left: 0px;></div>")
      .setMaxWidth("300px")
      .on('open', () => {
        Plotly.newPlot('myDiv', data, layout, {staticPlot: true});
      })
      .addTo(map);
      })
      });

  //
  // Change the cursor to a pointer when the mouse is over the places layer.
  map.on('mouseenter', 'illegal_dumping', () => {
    map.getCanvas().style.cursor = 'pointer';
  });

  map.on('mouseenter', 'homeless_encampments', () => {
    map.getCanvas().style.cursor = 'pointer';
    });

  map.on('mouseenter', 'violent_crime', () => {
    map.getCanvas().style.cursor = 'pointer';
    });

  // Change it back to a pointer when it leaves.
  map.on('mouseleave', 'illegal_dumping', () => {
  map.getCanvas().style.cursor = '';
  });

  // Change it back to a pointer when it leaves.
  map.on('mouseleave', 'homeless_encampments', () => {
  map.getCanvas().style.cursor = '';
  });

  // Change it back to a pointer when it leaves.
  map.on('mouseleave', 'violent_crime', () => {
  map.getCanvas().style.cursor = '';
  });
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
})
})
})
