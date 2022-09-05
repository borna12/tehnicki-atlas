let geomURL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRCip2W1fRY266HT33kuiBA3W9FXT7Ar8kb6DJj9Q6eczWEj4Vovqf84u7Wzcnou5XI8chf_O4Bu8ce/pub?output=csv";
let pointsURL =
  "test.csv";

window.addEventListener("DOMContentLoaded", init);
let sidebar;
let panelID = "my-info-panel";
let releatedUsageMap ;
let mcg ;
zemlja=[]
////////////////////////////////////////////////
// Quick and dirty implementation of enableMCG
////////////////////////////////////////////////
function init() {
L.Control.TagFilterButton.include({
  // Goal: read from MCG instead of from _map
  enableMCG: function(mcgInstance) {
    this.registerCustomSource({
      name: 'mcg',
      source: {
        mcg: mcgInstance,
        hide: function(layerSource) {
          var releatedLayers = [];

          for (
            var r = 0; r < this._releatedFilterButtons.length; r++
          ) {
            releatedLayers = releatedLayers.concat(
              this._releatedFilterButtons[r].getInvisibles()
            );
          }

          var toBeRemovedFromInvisibles = [],
            i,
            toAdd = [];

          for (var i = 0; i < this._invisibles.length; i++) {
            if (releatedLayers.indexOf(this._invisibles[i]) == -1) {
              for (
                var j = 0; j < this._invisibles[i].options.tags.length; j++
              ) {
                if (
                  this._selectedTags.length == 0 ||
                  this._selectedTags.indexOf(
                    this._invisibles[i].options.tags[j]
                  ) !== -1
                ) {
                  //this._map.addLayer(this._invisibles[i]);
                  toAdd.push(this._invisibles[i]);
                  toBeRemovedFromInvisibles.push(i);
                  break;
                }
              }
            }
          }

          // Batch add into MCG
          layerSource.mcg.addLayers(toAdd);

          while (toBeRemovedFromInvisibles.length > 0) {
            this._invisibles.splice(
              toBeRemovedFromInvisibles.pop(),
              1
            );
          }

          var removedMarkers = [];
          var totalCount = 0;

          if (this._selectedTags.length > 0) {
            //this._map.eachLayer(
            layerSource.mcg.eachLayer(
              function(layer) {
                if (
                  layer &&
                  layer.options &&
                  layer.options.tags
                ) {
                  totalCount++;
                  if (releatedLayers.indexOf(layer) == -1) {
                    var found = false;
                    for (
                      var i = 0; i < layer.options.tags.length; i++
                    ) {
                      found =
                        this._selectedTags.indexOf(
                          layer.options.tags[i]
                        ) !== -1;
                      if (found) {
                        break;
                      }
                    }
                    if (!found) {
                      removedMarkers.push(layer);
                    }
                  }
                }
              }.bind(this)
            );

            for (i = 0; i < removedMarkers.length; i++) {
              //this._map.removeLayer(removedMarkers[i]);
              this._invisibles.push(removedMarkers[i]);
            }

            // Batch remove from MCG
            layerSource.mcg.removeLayers(removedMarkers);
          }

          return totalCount - removedMarkers.length;
        },
      },
    });

    this.layerSources.currentSource = this.layerSources.sources[
      'mcg'
    ];
  },
});

////////////////////////////////////////////////
// Fix for TagFilterButton
////////////////////////////////////////////////
L.Control.TagFilterButton.include({
  _prepareLayerSources: function() {
    this.layerSources = new Object();
    this.layerSources['sources'] = new Object();

    this.registerCustomSource({
      name: 'default',
      source: {
        hide: function() {
          var releatedLayers = [];

          for (var r = 0; r < this._releatedFilterButtons.length; r++) {
            releatedLayers = releatedLayers.concat(
              this._releatedFilterButtons[r].getInvisibles()
            );
          }

          var toBeRemovedFromInvisibles = [],
            i;

          // "Fix": add var
          for (var i = 0; i < this._invisibles.length; i++) {
            if (releatedLayers.indexOf(this._invisibles[i]) == -1) {
              // "Fix": add var
              for (var j = 0; j < this._invisibles[i].options.tags.length; j++) {
                if (
                  this._selectedTags.length == 0 ||
                  this._selectedTags.indexOf(
                    this._invisibles[i].options.tags[j]
                  ) !== -1
                ) {
                  this._map.addLayer(this._invisibles[i]);
                  toBeRemovedFromInvisibles.push(i);
                  break;
                }
              }
            }
          }

          while (toBeRemovedFromInvisibles.length > 0) {
            this._invisibles.splice(toBeRemovedFromInvisibles.pop(), 1);
          }

          var removedMarkers = [];
          var totalCount = 0;

          if (this._selectedTags.length > 0) {
            this._map.eachLayer(
              function(layer) {
                if (layer && layer.options && layer.options.tags) {
                  totalCount++;
                  if (releatedLayers.indexOf(layer) == -1) {
                    var found = false;
                    for (var i = 0; i < layer.options.tags.length; i++) {
                      found =
                        this._selectedTags.indexOf(layer.options.tags[i]) !==
                        -1;
                      if (found) {
                        break;
                      }
                    }
                    if (!found) {
                      removedMarkers.push(layer);
                    }
                  }
                }
              }.bind(this)
            );

            for (i = 0; i < removedMarkers.length; i++) {
              this._map.removeLayer(removedMarkers[i]);
              this._invisibles.push(removedMarkers[i]);
            }
          }

          return totalCount - removedMarkers.length;
        },
      },
    });
    this.layerSources.currentSource = this.layerSources.sources['default'];
  },
});

////////////////////////////////////////////////
// Adapted from TagFilterButton demo
// https://github.com/maydemirx/leaflet-tag-filter-button/blob/0.0.4/docs/assets/js/main.js
////////////////////////////////////////////////
var osmUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  
  osm = L.tileLayer(osmUrl, {
    maxZoom: 19,
    attribution:
        "&copy; <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> &copy; <a href='https://www.lzmk.hr/'>LZMK</a>",
  });


// initialize the map on the "map" div with a given center and zoom
 releatedUsageMap = L.map('releated-usage-map',{minZoom: 3})
    .setView([20, 0], 3)
  .addLayer(osm);

  var southWest = L.latLng(-90, -190),
  northEast = L.latLng(90, 190);
  var bounds = L.latLngBounds(southWest, northEast);
  
  releatedUsageMap.setMaxBounds(bounds);
  releatedUsageMap.on('drag', function() {
    releatedUsageMap.panInsideBounds(bounds, { animate: false });
  });
  
  sidebar = L.control
    .sidebar({
      container: "sidebar",
      closeButton: true,
      position: "right",
    })
    .addTo(releatedUsageMap);

  let panelContent = {
    id: panelID,
    tab: "<i class='fa fa-bars active'></i>",
    pane: "<p> <ul id='sidebar-content'></ul></p>",
    title: "<h2 id='sidebar-title'>Odaberi lokaciju</h2>",
  };
  sidebar.addPanel(panelContent);

  /* add an external link */
/*sidebar.addPanel({
  id: 'ghlink',
  tab: '<i class="fa fa-filter"></i>',
  pane: "<h3>Tip baštine</h3><label for='hide'>○ prirodna baština</label><input id='prirodna' type='checkbox' checked/> <br><label for='hide'>◇ kulturna baština</label><input id='kulturna' type='checkbox' checked/> <br><label for='hide'><img src='img/kul-pri2.png' style='height:10px'> kulturna i prirodna baština</label><input id='kult-prirod' type='checkbox' checked/></p>",
  title: "<h2 id='sidebar-title'>Filteri</h2>",
});*/

/* add a button with click listener */
sidebar.addPanel({
  id: 'click',
  tab: '<i class="fa fa-info"></i>',
  title: "<h2 id='sidebar-title'>Info</h2>",
  pane: "<h3>Karta svjetske prirodne i kulturne baštine</h3><p style='padding-right:50px;text-align:justify'>Karta koja prikazuje lokacije svih prirodnih i kulturnih dobra koja su međunarodno priznata te koja su izvanredne i univerzalne vrijednosti koja su kao takva podvrgnuta i posebnomu režimu zaštite i očuvanja. <br><a href='https://enciklopedija.hr/natuknica.aspx?ID=59130'>doznaj više...</a></p><p></p><p>&copy;2022&nbsp;Leksikografski zavod Miroslav Krleža. <br>Sva prava pridržana.</p><p><strong>Urednice<br></strong>Irina Starčević Stančić (voditeljica), Cvijeta Kraus</p><p><strong>Programsko-informatička rje&scaron;enja i upis podataka</strong><br>Josip Mihaljević</p>",
});

releatedUsageMap.on("click", function () {
    sidebar.close(panelID);
  });

  // Use PapaParse to load data from Google Sheets
  // And call the respective functions to add those to the map.
  Papa.parse(geomURL, {
    download: true,
    header: true,
    complete: addGeoms,
  });
  Papa.parse(pointsURL, {
    download: true,
    header: true,
    complete: addPoints,
  });
  var s = document.getElementsByClassName('preloader')[0].style;
s.opacity = 1;
(function fade(){(s.opacity-=.1)<0?s.display="none":setTimeout(fade,40)})();

 mcg = L.markerClusterGroup().addTo(releatedUsageMap);



var statusFilterButton = L.control
  .tagFilterButton({
    data: ['kulturna baština', 'prirodna baština', 'kulturna i prirodna baština'],
    filterOnEveryClick: true,
    icon: '<i class="fa fa-filter"></i>',
    clearText:'isključi filtere'
  })
  .addTo(releatedUsageMap);

// Enable MCG integration
statusFilterButton.enableMCG(mcg);

/*var foodFilterButton = L.control
  .tagFilterButton({
    data: ['tomato', 'cherry', 'strawberry'],
    filterOnEveryClick: true,
    icon: '<i class="fa fa-pagelines"></i>',
  })
  .addTo(releatedUsageMap);

foodFilterButton.addToReleated(statusFilterButton);*/
}
function addGeoms(data) {
  data = data.data;
  // Need to convert the PapaParse JSON into a GeoJSON
  // Start with an empty GeoJSON of type FeatureCollection
  // All the rows will be inserted into a single GeoJSON
  let fc = {
    type: "FeatureCollection",
    features: [],
  };

  for (let row in data) {
    // The Sheets data has a column 'include' that specifies if that row should be mapped
    if (data[row].include == "y") {
      let features = parseGeom(JSON.parse(data[row].geometry));
      features.forEach((el) => {
        el.properties = {
          name: data[row].name,
          description: data[row].description,
        };
        fc.features.push(el);
      });
    }
  }

  // The geometries are styled slightly differently on mouse hovers
  let geomStyle = { color: "#2ca25f", fillColor: "#99d8c9", weight: 2 };
  let geomHoverStyle = { color: "green", fillColor: "#2ca25f", weight: 3 };

  L.geoJSON(fc, {
    onEachFeature: function (feature, layer) {
      layer.on({
        mouseout: function (e) {
          e.target.setStyle(geomStyle);
        },
        mouseover: function (e) {
          e.target.setStyle(geomHoverStyle);
        },
        click: function (e) {
          // This zooms the map to the clicked geometry
          // Uncomment to enable
          // map.fitBounds(e.target.getBounds());

          // if this isn't added, then map.click is also fired!
         /* L.DomEvent.stopPropagation(e);

          document.getElementById("sidebar-title").innerHTML =
            e.target.feature.properties.name;
          document.getElementById("sidebar-content").innerHTML =
            e.target.feature.properties.description;
          sidebar.open(panelID);*/
          //alert(e.target.feature.properties.name)
        },
      });
    },
    style: geomStyle,
  }).addTo(releatedUsageMap);
}

function addPoints(data) {
  data = data.data;

  // Choose marker type. Options are:
  // (these are case-sensitive, defaults to marker!)
  // marker: standard point with an icon
  // circleMarker: a circle with a radius set in pixels
  // circle: a circle with a radius set in meters
  let markerType = "marker";

  // Marker radius
  // Wil be in pixels for circleMarker, metres for circle
  // Ignore for point
  let markerRadius = 100;

  for (let row = 0; row < data.length; row++) {
    let marker;
    if (markerType == "circleMarker") {
      marker = L.circleMarker([data[row].lat, data[row].lon], {
        radius: markerRadius,
      });
    } else if (markerType == "circle") {
      marker = L.circle([data[row].lat, data[row].lon], {
        radius: markerRadius,
      });
    } else {
      marker = L.marker([data[row].lat, data[row].lon],{id: data[row].name, class: data[row].bastina, tags: [data[row].bastina]});
    }
    //marker.addTo(pointGroupLayer);


    /*naredba=Swal.fire({title:"<strong>"+data[row].name+"</strong>",html:'<img src="'+data[row].img+'"><p style="text-align:justify">'+data[row].description+'</p><p style="text-align:center;"><a href="'+data[row].link+'" target="_blank">doznaj vi\u0161e</a></p>',showCloseButton:!0})*/
    if (!zemlja.includes(data[row].zemlja)){
    document.getElementById("sidebar-content").innerHTML +="<h3>"+data[row].zemlja+"</h3><ul id='"+data[row].zemlja.split(' ').join('_').toLowerCase()+"'></ul>"
    zemlja.push(data[row].zemlja) 
  }
    document.getElementById(data[row].zemlja.split(' ').join('_').toLowerCase()).innerHTML +="<li class='"+data[row].bastina.split(' ').join('_').toLowerCase()+"'><a onclick='funkcija(this)' data-img='"+data[row].img2+"' data-opis='"+data[row].description+"' data-link='"+data[row].link+"'>"+data[row].name+"</a></li>"

    // UNCOMMENT THIS LINE TO USE POPUPS
    //marker.bindPopup('<h2>' + data[row].name + '</h2>There's a ' + data[row].description + ' here');

    // COMMENT THE NEXT GROUP OF LINES TO DISABLE SIDEBAR FOR THE MARKERS
    marker.feature = {
      properties: {
        name: data[row].name,
        description: data[row].description,
        img: data[row].img2,
        link: data[row].link,
        id: data[row].name,
      },
    };
    marker.on({
      click: function (e) {
        releatedUsageMap.setView(e.latlng);
        L.DomEvent.stopPropagation(e);
        /*document.getElementById("sidebar-title").innerHTML =
          e.target.feature.properties.name;
        document.getElementById("sidebar-content").innerHTML =
          e.target.feature.properties.description;
        sidebar.open(panelID);*/
        if(data[row].img2.length>3){
        slika='<img src="./img/slika/'+data[row].img2+'"></img>'}
        else{slika=""}
       if (data[row].link.length>3){
        
        Swal.fire({
          title: '<strong>'+data[row].name+'</strong>',
          html:
          slika+'<p style="text-align:justify">'+data[row].description+'</p><p style="text-align:center;"><a href="'+data[row].link+'" target="_blank">doznaj više</a></p>',
          showCloseButton: true,
          confirmButtonText: "zatvori",
          confirmButtonColor: "#0074d9"
        })}
        else{
          Swal.fire({
            title: '<strong>'+data[row].name+'</strong>',
            html:
            slika+'<p style="text-align:justify">'+data[row].description+'</p><p style="text-align:center;"></p>',
            showCloseButton: true,
            confirmButtonText: "zatvori",
            confirmButtonColor: "#0074d9"
          })
        }     
      },
    });
    // COMMENT UNTIL HERE TO DISABLE SIDEBAR FOR THE MARKERS

    // AwesomeMarkers is used to create fancier icons
    let icon = L.divIcon({
      className: '',
      iconAnchor: [12, 25],
      labelAnchor: [-6, 0],
      popupAnchor: [0, -15],
      iconSize: [25, 41],
      html: '<div class="pin tooltip '+data[row].bastina.split(' ').join('_')+" "+data[row].name.split(' ').join('_')+" "+data[row].zemlja.split(' ').join('_')+'"><span class="span-'+data[row].bastina.split(' ').join('_')+'"></span><span class="tooltiptext">'+data[row].name+'</span></div>'
      
    });
    
   /* let icon = L.AwesomeMarkers.icon({
      icon: "info-circle "+ data[row].bastina.split(' ').join('_')+" "+data[row].name.split(' ').join('_')+" "+data[row].zemlja.split(' ').join('_'),
      iconColor: "white",
      markerColor: data[row].color,
      prefix:  "fa",
      extraClasses:"fa-rotate-0",
    });*/
    if (!markerType.includes("circle")) {
      marker.setIcon(icon);
    }
    marker.addTo(mcg);

  }
}

function funkcija(e){
  
  if (e.getAttribute("data-img").length<3){
    slika=""
  }
  else{slika='<img src="./img/slika/'+e.getAttribute("data-img")+'">'}
    if (e.getAttribute("data-link").length>3){
    Swal.fire({
      title: '<strong>'+e.innerHTML+'</strong>',
      html:
      slika+'<p style="text-align:justify">'+e.getAttribute("data-opis")+'</p><p style="text-align:center;"></p><a href="'+e.getAttribute("data-link")+'" target="_blank">doznaj više</a>',
      showCloseButton: true,
      confirmButtonText: "zatvori",
      confirmButtonColor: "#0074d9"
    })}
  else{Swal.fire({
    title: '<strong>'+e.innerHTML+'</strong>',
    html:
    slika+'<p style="text-align:justify">'+e.getAttribute("data-opis")+'</p><p style="text-align:center;"></p>',
    showCloseButton: true,
    confirmButtonText: "zatvori",
    confirmButtonColor: "#0074d9"
  })}
  }

  $( document ).ready(function() {
    $("#prirodna").change(function() {
      $(".easy-button-container").click()
    }) 
      
      $("#kulturna").change(function() {
        $("div.kulturna_baština").parent().toggleClass("hidden");
      })
      
      $("#kult-prirod").change(function() {
        $("div.kulturna_i_prirodna_baština").parent().toggleClass("hidden");
      })
  
    
  })