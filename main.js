/* OpenStreetMap® sadrži otvorene podatke, licencirane pod Open Data Commons Open Database License (ODbL) licencom od strane OpenStreetMap zaklade (OSMF).

Slobodni ste kopirati, distribuirati, prenositi i adaptirati naše podatke, sve dok navodite OpenStreetMap i njegove doprinositelje kao izvor. Ako izmijenite ili nadogradite naše podatke, možete distribuirati rezultate samo pod istom licencom. Puni pravni tekst objašnjava vaša prava i odgovornosti.

Naša dokumentacija licencirana je pod Imenovanje-Dijeli pod istim uvjetima 2.0 licencijom (CC BY-SA 2.0).*/

/* Leaflet
BSD 2-Clause License

Copyright (c) 2010-2022, Vladimir Agafonkin
Copyright (c) 2010-2011, CloudMade
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this
   list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/* 
MIT License

Copyright (c) 2018 Chris Arderne

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.*/
let geomURL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRCip2W1fRY266HT33kuiBA3W9FXT7Ar8kb6DJj9Q6eczWEj4Vovqf84u7Wzcnou5XI8chf_O4Bu8ce/pub?output=csv";
let pointsURL =
  "test.csv";

window.addEventListener("DOMContentLoaded", init);

let map;
let sidebar;
let panelID = "my-info-panel";
zemlja=[]
/*
 * init() is called when the page has loaded
 */

function funkcija(e){
  document.getElementsByClassName(e.innerHTML.split(' ').join('_'))[0].click()}
function init() {
  // Create a new Leaflet map centered on the continental US
  map = L.map("map").setView([51.5, -0.1], 2);

  // This is the Carto Positron basemap
  L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      attribution:
        "&copy; <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> &copy; <a href='https://www.lzmk.hr/'>LZMK</a>",
      maxZoom: 19,
    }
  ).addTo(map);

  sidebar = L.control
    .sidebar({
      container: "sidebar",
      closeButton: true,
      position: "right",
    })
    .addTo(map);

  let panelContent = {
    id: panelID,
    tab: "<i class='fa fa-bars active'></i>",
    pane: "<p> <ul id='sidebar-content'></ul></p>",
    title: "<h2 id='sidebar-title'>Odaberi lokaciju</h2>",
  };
  sidebar.addPanel(panelContent);

  /* add an external link */
sidebar.addPanel({
  id: 'ghlink',
  tab: '<i class="fa fa-filter"></i>',
  pane: "<h3>Tip baštine</h3><label for='hide'>○ prirodna baština</label><input id='prirodna' type='checkbox' checked/> <br><label for='hide'>◇ kulturna baština</label><input id='kulturna' type='checkbox' checked/> <br><label for='hide'><img src='img/kul-pri2.png' style='height:10px'> kulturna i prirodna baština</label><input id='kult-prirod' type='checkbox' checked/></p>",
  title: "<h2 id='sidebar-title'>Filteri</h2>",
});

/* add a button with click listener */
sidebar.addPanel({
  id: 'click',
  tab: '<i class="fa fa-info"></i>',
  title: "<h2 id='sidebar-title'>Info</h2>",
  pane: "<h3>Karta svjetske prirodne i kulturne baštine</h3><p style='padding-right:50px;text-align:justify'>Karta koja prikazuje lokacije svih prirodnih i kulturnih dobra koja su međunarodno priznata te koja su izvanredne i univerzalne vrijednosti koja su kao takva podvrgnuta i posebnomu režimu zaštite i očuvanja. <br><a href='https://enciklopedija.hr/natuknica.aspx?ID=59130'>doznaj više...</a></p><p></p><p>&copy;2022&nbsp;Leksikografski zavod Miroslav Krleža. <br>Sva prava pridržana.</p><p><strong>Urednice<br></strong>Irina Starčević Stančić (voditeljica), Cvijeta Kraus</p><p><strong>Programsko-informatička rje&scaron;enja i upis podataka</strong><br>Josip Mihaljević</p>",
});

  map.on("click", function () {
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
}

/*
 * Expects a JSON representation of the table with properties columns
 * and a 'geometry' column that can be parsed by parseGeom()
 */
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
  }).addTo(map);
}

/*
 * addPoints is a bit simpler, as no GeoJSON is needed for the points
 */
function addPoints(data) {
  data = data.data;
  let pointGroupLayer = L.layerGroup().addTo(map);

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
      marker = L.marker([data[row].lat, data[row].lon],{id: data[row].name, class: data[row].bastina});
    }
    marker.addTo(pointGroupLayer);
    

    /*naredba=Swal.fire({title:"<strong>"+data[row].name+"</strong>",html:'<img src="'+data[row].img+'"><p style="text-align:justify">'+data[row].description+'</p><p style="text-align:center;"><a href="'+data[row].link+'" target="_blank">doznaj vi\u0161e</a></p>',showCloseButton:!0})*/
    if (!zemlja.includes(data[row].zemlja)){
    document.getElementById("sidebar-content").innerHTML +="<h3>"+data[row].zemlja+"</h3><ul id='"+data[row].zemlja.split(' ').join('_').toLowerCase()+"'></ul>"
    zemlja.push(data[row].zemlja) 
  }
    document.getElementById(data[row].zemlja.split(' ').join('_').toLowerCase()).innerHTML +="<li class='"+data[row].bastina.split(' ').join('_').toLowerCase()+"'><a onclick='funkcija(this)'>"+data[row].name+"</a></li>"

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
        map.setView(e.latlng);
        L.DomEvent.stopPropagation(e);
        /*document.getElementById("sidebar-title").innerHTML =
          e.target.feature.properties.name;
        document.getElementById("sidebar-content").innerHTML =
          e.target.feature.properties.description;
        sidebar.open(panelID);*/
       if (data[row].link.length>3){
   
        Swal.fire({
          title: '<strong>'+data[row].name+'</strong>',
          html:
            '<img src="./img/slika/'+data[row].img2+'"><p style="text-align:justify">'+data[row].description+'</p><p style="text-align:center;"><a href="'+data[row].link+'" target="_blank">doznaj više</a></p>',
          showCloseButton: true,
          confirmButtonText: "zatvori",
          confirmButtonColor: "#0074d9"
        })}
        else{
          Swal.fire({
            title: '<strong>'+data[row].name+'</strong>',
            html:
              '<img src="./img/slika/'+data[row].img2+'"><p style="text-align:justify">'+data[row].description+'</p><p style="text-align:center;"></p>',
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
  }
}

/*
 * Accepts any GeoJSON-ish object and returns an Array of
 * GeoJSON Features. Attempts to guess the geometry type
 * when a bare coordinates Array is supplied.
 */
function parseGeom(gj) {
  // FeatureCollection
  if (gj.type == "FeatureCollection") {
    return gj.features;
  }

  // Feature
  else if (gj.type == "Feature") {
    return [gj];
  }

  // Geometry
  else if ("type" in gj) {
    return [{ type: "Feature", geometry: gj }];
  }

  // Coordinates
  else {
    let type;
    if (typeof gj[0] == "number") {
      type = "Point";
    } else if (typeof gj[0][0] == "number") {
      type = "LineString";
    } else if (typeof gj[0][0][0] == "number") {
      type = "Polygon";
    } else {
      type = "MultiPolygon";
    }
    return [{ type: "Feature", geometry: { type: type, coordinates: gj } }];
  }
}

$( document ).ready(function() {
  $("#prirodna").change(function() {
    $(".prirodna_baština").parent().toggleClass("hidden");
  }) 
    
    $("#kulturna").change(function() {
      $(".kulturna_baština").parent().toggleClass("hidden");
    })
    
    $("#kult-prirod").change(function() {
      $(".kulturna_i_prirodna_baština").parent().toggleClass("hidden");
    })

  
}

);