/*
 * Aplicacion para visualizar datos de idera en telefonos moviles 
 * Se intenta respetar una estructura que permita compilar apk de Android con phonegap
 */

var app = {
    // Application Constructor
    mapa:null,
    locateControl:null,
    posicion:null,
    inicializar: function() {        
        this.ocultarLoading();
        this.inicializarTemplateBootstrap();
    },
    ocultarLoading: function(){
        $(".loading").fadeOut("slow");
    },
    inicializarTemplateBootstrap: function(){
      $("#barra").fadeIn("slow");
      $("#container").fadeIn("slow");
             
      // Highlight search box text on click /
      /*
      $("#searchbox").click(function () {
        $(this).select();
      });
      */
      
      $("#nav-btn").click(function() {
        $(".navbar-collapse").collapse("toggle");
        return false;
      });

      $("#sidebar-toggle-btn").click(function() {
        $("#sidebar").toggle();
        //map.invalidateSize();
        return false;
      });

/*
      $("#sidebar-hide-btn").click(function() {
        $('#sidebar').hide();
      });
*/      
      $("#categorias tr").click(function(e) {
        
        var categoria=$(this).attr('id');
        $("#opcion-consulta").data("categoria",categoria);

        $("#categorias").hide();
        $("#opcion-consulta").fadeIn("slow");
      });
      
       $("#opcion-consulta button").click(function(){
        var opcion=$(this).val();
        var categoria=$("#opcion-consulta").data("categoria");

       if(opcion==="posicion-actual"){
          app.mostrarMensaje("Buscando los eventos cercanos a su posicion");
          map.locate({setView: true, watch: true}).on('locationfound', 
            function(e){
              // TODO : agregar marker y circulo de la posicion               
              app.buscar(categoria,e.latlng);              
            });
       }else{
              app.mostrarMensaje("Seleccione con un click en el mapa el lugar donde quiere hacer la busqueda");
              map.on("click", function(e) {                
                app.buscar(categoria,e.latlng);                          
              });
        }    
    });
    
    $("#resetearBusqueda").click(function(e){
        app.resetearBusqueda();
    });
    

      this.inicializarMapa();
    },
    inicializarMapa: function(){
        
      // Servicios
      var WMSmapaeducativo="http://www.mapaeducativo.edu.ar/geoserver/ogc/wms";
      var WMSgobierno ="http://sig.gobierno.gba.gov.ar:8080/geoserver/wms";

      // Basemap Layers /
      var mapquestOSM = L.tileLayer("http://{s}.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.png", {
        maxZoom: 19,
        subdomains: ["otile1", "otile2", "otile3", "otile4"],
        attribution: 'Tiles courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a> <img src="http://developer.mapquest.com/content/osm/mq_logo.png">. Map data (c) <a href="http://www.openstreetmap.org/" target="_blank">OpenStreetMap</a> contributors, CC-BY-SA.'
      });
      var mapquestOAM = L.tileLayer("http://{s}.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.jpg", {
        maxZoom: 18,
        subdomains: ["oatile1", "oatile2", "oatile3", "oatile4"],
        attribution: 'Tiles courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a>. Portions Courtesy NASA/JPL-Caltech and U.S. Depart. of Agriculture, Farm Service Agency'
      });
      var mapquestHYB = L.layerGroup([L.tileLayer("http://{s}.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.jpg", {
        maxZoom: 18,
        subdomains: ["oatile1", "oatile2", "oatile3", "oatile4"]
      }), L.tileLayer("http://{s}.mqcdn.com/tiles/1.0.0/hyb/{z}/{x}/{y}.png", {
        maxZoom: 19,
        subdomains: ["oatile1", "oatile2", "oatile3", "oatile4"],
        attribution: 'Labels courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a> <img src="http://developer.mapquest.com/content/osm/mq_logo.png">. Map data (c) <a href="http://www.openstreetmap.org/" target="_blank">OpenStreetMap</a> contributors, CC-BY-SA. Portions Courtesy NASA/JPL-Caltech and U.S. Depart. of Agriculture, Farm Service Agency'
      })]);

      // Overlay Layers /

      var escuelas = L.tileLayer.wms(WMSmapaeducativo, {
          layers: 'escuelas',
          format: 'image/png8',
          transparent: true,
          version: '1.1.0',
          attribution: ""
      });

      var universidades = L.tileLayer.wms(WMSmapaeducativo, {
          layers: 'universidades',
          format: 'image/png8',
          transparent: true,
          version: '1.1.0',
          attribution: ""
      });
      
      var comisarias=L.tileLayer.wms(WMSgobierno, {
          layers: 'comisarias',
          format: 'image/png8',
          transparent: true,
          version: '1.1.0',
          attribution: ""
      });
      
       var salud=L.tileLayer.wms(WMSgobierno, {
          layers: 'salud2012_publicos',
          format: 'image/png8',
          transparent: true,
          version: '1.1.0',
          attribution: ""
      });

        map=  L.map("map", {
           zoom: 7,
           center: [-36.82687474287728, 	-59.94140624999999],
           layers: [mapquestOSM, escuelas,universidades,comisarias,salud],
           zoomControl: false,
           attributionControl: false
        });
        
        L.control.zoom({
         position: "bottomright"
        }).addTo(map);
        
        this.locateControl = L.control.locate({
        position: "bottomright",
        drawCircle: true,
        follow: false, //para que no siga
        setView: true,
        keepCurrentZoomLevel: true,
        markerStyle: {
          weight: 1,
          opacity: 0.8,
          fillOpacity: 0.8
        },
        circleStyle: {
          weight: 1,
          clickable: false
        },
        icon: "icon-direction",
        metric: false,
        strings: {
          title: "My location",
          popup: "You are within {distance} {unit} from this point",
          outsideMapBoundsMsg: "You seem located outside the boundaries of the map"
        },
        locateOptions: {
          maxZoom: 18,
          watch: true,
          enableHighAccuracy: true,
          maximumAge: 10000,
          timeout: 10000
        }
      }).addTo(map);

      var baseLayers = {
        "Street Map": mapquestOSM,
        "Aerial Imagery": mapquestOAM,
        "Imagery with Streets": mapquestHYB
      };

     var groupedOverlays = {
      "Educación": {
      "<img src='assets/img/escuelas.png' >&nbsp;Escuelas": escuelas,
      "<img src='assets/img/universidades.png' >&nbsp;Universidades": universidades            
      },
      "Salud": {
      "<img src='assets/img/salud.png' >&nbsp;Salud Pública": salud
      },
      "Seguridad":{
          "<img src='assets/img/comisarias.png' >&nbsp;Comisarias": comisarias
      }
      };
     
     // Larger screens get expanded layer control and visible sidebar /
      if (document.body.clientWidth <= 767) {
         var isCollapsed = true;
        } else {
          var isCollapsed = false;
      }
        
      L.control.groupedLayers(baseLayers, groupedOverlays, {
        collapsed: isCollapsed
      }).addTo(map);

      this.mapa=map;
    },
    buscar: function(categoria,latlng){
        $.ajax({
                url:"http://192.168.0.104/idera_movil_web/buscar.php",
                data:{
                     x:latlng.lat,
                     y:latlng.lng,
                     tipo:categoria
                }
		    }).done(function(e) {                	
              app.mostrarResultados(e);                    
        	})
        	 .fail(function() {
                	app.mostrarMensaje( "ERROR: error en la busqueda, revisar log" );
        	});
    },
    formatearaGeojson:function(f){
        var g = {
                 "type":"Feature",
                 "properties":{
                               "nombre": f.nombre                              
                              },
                 "geometry": {
                              "type": "Point",
                              "coordinates": [f.x,f.y]
                             }
                };   
        return g;                    
    },
    mostrarResultados: function(r){      
        $("#resultados").html("");
        $("#opcion-consulta").hide();
        $("#msg").hide();
        
        $("#categorias").hide();        
        
        $.each( r, function( key, val ) {
                //$("#resultados").append( "<a href='#' class='list-group-item' id='" + key + "'>" + val.nombre + "</a>" );
                $("#resultados").append("<tr class='feature-row' id="+key+">\
                      <td style='vertical-align: middle;'>\
                        <img width='16' height='18' src='assets/img/comisarias.png'></td>\
                      <td class='feature-name'>"+val.nombre+"</td>\
                      <td style='vertical-align: middle;'>\
                          <i class='fa fa-chevron-right pull-right'></i>\
                      </td>\
                    </tr>");
        });
                
        $("#resultados tr").click(function(e){
            var feature=app.formatearaGeojson(r[$(this).attr('id')]);
            var icono = {
                radius: 8,
                fillColor: "#ff7800",
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
                };
            var layer=L.geoJson(feature,{
                pointToLayer: function (feature, latlng) {
                    return L.circleMarker(latlng, icono);
                }
            }).addTo(map);

            var bounds=layer.getBounds();
            map.fitBounds(bounds);
        });
        $("#resultados").fadeIn();
        $("#resetearBusqueda").fadeIn();
        $("#sidebar").show();
    
    },
    resetearBusqueda:function(){
        
        $("#resultados").html("");
        
        $("#categorias").fadeIn();
        $("#opcion-consulta").fadeOut();
        $("#resetearBusqueda").fadeOut();
        
    },
    mostrarMensaje:function(msg){
        $("#opcion-consulta").hide();
        $("#msg").fadeOut("fast");
        $("#msg").html(msg);
        $("#msg").fadeIn("slow");            
    }
    
    
};


  
