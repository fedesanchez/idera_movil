/*
 * Aplicacion para visualizar datos de idera en telefonos moviles 
 * Se intenta respetar una estructura que permita compilar apk de Android con phonegap
 */

var app = {
    // Application Constructor    
    mapa:null,
    features:null,
    servicios:{
      "mapaeducativo":"http://wms.mapaeducativo.edu.ar/geoserver/ogc/wms",
      "gobiernoGBA":"http://sig.gobierno.gba.gov.ar:8080/geoserver/wms",
      "IGN":"http://wms.ign.gob.ar/geoserver/wms"
    },
    capas:{
      base:[
        {
          id:"osm",
          titulo:"OSM",
          url:"http://{s}.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.png",
          maxZoom: 19,
          base:true,
          activa:true,
          subdomains: ["otile1", "otile2", "otile3", "otile4"],
          attribution:''
        },
        {
          id:"osm-sat",
          titulo:"OSM Satelital",
          url:"http://{s}.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.jpg",
          maxZoom: 19,
          base:true,
          activa:false,
          subdomains: ["oatile1", "oatile2", "oatile3", "oatile4"],
          attribution:''
        },
        {
          id:"osm-hyb",
          titulo:"OSM Hibrido",
          url:"http://{s}.mqcdn.com/tiles/1.0.0/hyb/{z}/{x}/{y}.png",
          maxZoom: 19,
          base:true,
          activa:false,
          subdomains: ["oatile1", "oatile2", "oatile3", "oatile4"],
          attribution:''
        },{
          id:"ign-base",
          titulo:"Topónimos IGN",
          id_servicio:"IGN",
          layers:"capabaseargenmap",
          format: 'image/png8',
          transparent: true,
          version: '1.1.0',
          activa:false,
          tipo:"wms",
          attribution: ""
        }      
      ],
      superpuestas:[
        {
          id_servicio:"IGN",
          layers: 'salud',
          format: 'image/png8',
          transparent: true,
          version: '1.1.0',
          activa:false,
          titulo:"Salud",
          attribution: ""
        },
        {
          id_servicio:"IGN",
          layers: 'comisarias',
          format: 'image/png8',
          transparent: true,
          activa:false,
          titulo:"Comisarias",
          version: '1.1.0',
          attribution: ""
        }
      ]
    },
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
      $.support.cors = true; //para buscar en idera
      $("#barra").fadeIn("slow");
      $("#container").fadeIn("slow");                   
      
      $("#nav-btn").click(function() {
        $(".navbar-collapse").collapse("toggle");
        return false;
      });

      $("#acerca-btn").click(function(){
        $("#acerca-modal").modal("show");
      });

      $(".esconder-panel").click(function(){
        var lado=$(this).data("side");
        (lado=="left")? $("#sidebar").toggle() : $("#layersbar").toggle() ;
      });

      $("#sidebar-toggle-btn").click(function() {
        $("#sidebar").toggle();
        
        return false;
      });

       $("#layersbar-toggle-btn").click(function() {
        $("#layersbar").toggle();
        
        return false;
      });
      
      // al seleccionar categoria
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
            $("#resetearBusqueda").show();
            map.locate({setView: false, watch: false}).on('locationfound', function(e){
              app.buscar(categoria,e.latlng);
              //map.on("locationfound",function(){});              
            });
         }else{
                app.mostrarMensajeFlotante("Seleccione con un click <br>donde quiere realizar la búsqueda");
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
    cargarCapasBase:function(){
      
      for(var i in this.capas.base){
        var capa = this.capas.base[i];
        var activa = (capa.activa)?"<i class='fa fa-check fa-lg'></i>":''; //chanchada!
        var tr ="<tr class='feature-row' id='"+capa.id+"'>\
                        <td style='vertical-align: middle;'>\
                          <i class='fa fa-dot-circle-o'></i></td>\
                        <td class='feature-name'>"+capa.titulo+"</td>\
                        <td style='vertical-align: middle;'>"+activa+"</td>\
                      </tr>";
        $("#capas-base").append(tr);               
        if(capa.activa){
          if((capa.tipo) && (capa.tipo=="wms")){
            L.tileLayer.wms(this.servicios[capa.id_servicio], capa).addTo(map);
          }else{
           L.tileLayer(capa.url, capa).addTo(map); 
          }
           
        }
      };
      
      $("#capas-base tr").click(function(e){
        var capa=$(this).attr('id');
        var td = $(this).find("td:last");
        $("#capas-base .fa-check").removeClass("fa fa-check fa-lg");        
        $(td).addClass("fa fa-check fa-lg");        
        app.cambiarCapaBase(capa);
      });                  
            
    },
    cargarCapasSuperpuestas:function(){
      for(var i in this.capas.superpuestas){
        var capa = this.capas.superpuestas[i];
        var activa = (capa.activa)?"<i class='fa fa-check-circle fa-lg'></i>":'<i></i>'; //chanchada!
        var tr ="<tr class='feature-row' id='"+capa.layers+"'>\
                        <td style='vertical-align: middle;'>\
                          <img width='16' height='18' src='assets/img/"+capa.layers+".png'></td>\
                        <td class='feature-name'>"+capa.titulo+"</td>\
                        <td style='vertical-align: middle;'>"+activa+"</td>\
                      </tr>";
        $("#capas-superpuestas").append(tr);               
        if(capa.activa){
          L.tileLayer.wms(this.servicios[capa.id_servicio], capa).addTo(map);
        }
      };
      $("#capas-superpuestas tr").click(function(e){
        var id=$(this).attr('id');
        var capa=app.getCapaPorId(id,false);
        capa.activa=!capa.activa;
        var activa = (capa.activa)?"fa fa-check-circle fa-lg":'';

        var i = $(this).find("td:last i");      
        $(i).removeClass("fa fa-check-circle fa-lg");
        $(i).addClass(activa);        
        app.toogleCapa(capa);
      });
    },
    getCapaPorId:function(id,base){
      if(base){
        for(var i in app.capas.base){
          if (app.capas.base[i].id==id) return app.capas.base[i];
        }  
      }else{
        for(var i in app.capas.superpuestas){
          if (app.capas.superpuestas[i].layers==id) return app.capas.superpuestas[i];
        }
      }      
      
    },
    cambiarCapaBase:function(id){
      map.eachLayer(function(layer){
        if(layer.options){
          var l=layer.options;
          if(l.base){
            map.removeLayer(layer);
            var datos_nueva_capa=app.getCapaPorId(id,true);      
            //Agrego la capa
            if((datos_nueva_capa.tipo) && (datos_nueva_capa.tipo=="wms")){
              var nueva_capa=L.tileLayer.wms(app.servicios[datos_nueva_capa.id_servicio], datos_nueva_capa);
            }else{
              var nueva_capa=L.tileLayer(datos_nueva_capa.url, datos_nueva_capa); 
            }      
            
            map.addLayer(nueva_capa);
            nueva_capa.bringToBack();
          }
        };
      });
    },
    toogleCapa:function(capa){
      var existe=false;
      map.eachLayer(function(layer){
        if(layer.options){          
          if(!layer.options.base){
            if(layer.options.layers==capa.layers){
              existe=true;
              //console.log("borrando capa");
              map.removeLayer(layer);
            }
          }
        }
      });
      if(!existe){
        L.tileLayer.wms(this.servicios[capa.id_servicio], capa).addTo(map);
      }

    },
    inicializarMapa: function(){  
      
        map=  L.map("map", {
           zoom: 7,
           center: [-36.82687474287728, 	-59.94140624999999],
           //layers: [],
           zoomControl: false,
           attributionControl: false
        });
        this.cargarCapasBase();
        this.cargarCapasSuperpuestas();

        L.control.zoom({
         position: "bottomright"
        }).addTo(map);
        
        this.locateControl = L.control.locate({
        position: "bottomright",
        drawCircle: true,
        follow: false, //para que no siga
        setView: true,
        //keepCurrentZoomLevel: true,
        markerStyle: {
          weight: 1,
          opacity: 0.8,
          fillOpacity: 0.8
        },
        circleStyle: {
          weight: 1,
          clickable: false
        },
        //  icon: "icon-direction",
        metric: false,
        strings: {
          title: "Mi ubicacion",
          popup: "Estas a {distance} {unit} de este punto",
          outsideMapBoundsMsg: "Parece que estas ubicado afuera de las fronteras del mapa"
        },
        locateOptions: {
          maxZoom: 17,
          watch: false, // importante para que no se llame infinitamente el evento onlocationfound (que llama a buscar)
          enableHighAccuracy: true,
          maximumAge: 10000,
          timeout: 10000
        }
      }).addTo(map);

      // div para mostrar mensajes
      var info = L.control({position: 'bottomleft'});

      info.onAdd = function (map) {
          this._div = L.DomUtil.create('div', 'msg-flotante'); // create a div with a class "info"
          //this._div.innerHTML = '<h4>mensajito</h4>';
          return this._div;
      };  
      info.addTo(map);

     // Larger screens get expanded layer control and visible sidebar /
      if (document.body.clientWidth <= 767) {
         var isCollapsed = true;
        } else {
          var isCollapsed = false;
      }
      
      
      
      this.features = L.geoJson().addTo(map);
      this.mapa=map;
    },
    buscar: function(categoria,latlng){
        app.features.clearLayers();
        $.ajax({
                url:"http://www.idera.gob.ar/mapa/idera_movil/buscar.php",
                data:{
                     x:latlng.lat,
                     y:latlng.lng,
                     tipo:categoria
                }
		    }).done(function(e) {                	
              app.mostrarResultados(e);                    
        	})
        	 .fail(function() {
                	app.mostrarMensaje( "ERROR: error al conectarse al servidor." );
                  setTimeout(app.resetearBusqueda(),2000);
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
        this.quitarEventoClick();
        $("#resultados").html("");
        $("#opcion-consulta").hide();
        $("#msg").hide();
        
        $("#categorias").hide();        
        
        $.each( r, function( key, val ) {
          var capa=app.features.addData(app.formatearaGeojson(r[key]));
          
          
            $("#resultados").append("<tr class='feature-row' id='"+key+"'>\
                  <td style='vertical-align: middle;'>\
                    <img width='16' height='18' src='assets/img/"+val.tipo+".png'></td>\
                  <td class='feature-name'>"+val.nombre+"</td>\
                  <td style='vertical-align: middle;'>\
                      <i class='fa fa-chevron-right pull-right'></i>\
                  </td>\
                </tr>");
        });
        map.fitBounds(app.features.getBounds());
        app.features.eachLayer(function(l){
          l.bindPopup("<b>"+l.feature.properties.nombre+"</b>");
        });        

        //Al seleccionar un resultado del sidebar
        $("#resultados tr").click(function(e){
            
            var id=$(this).attr('id');
            var cont =0;
            app.features.eachLayer(function(l){
              if(Number(id)==cont){
                var latlng=l._latlng;
                map.setView(latlng,15);
                l.openPopup();
              };
              cont++;
              
            });
            
        });
        $("#resultados").fadeIn();
        $("#resetearBusqueda").fadeIn();
        $("#sidebar").show();
        
    
    },
    resetearBusqueda:function(){
        
        $("#resultados").html("");
        
        $("#categorias").fadeIn();
        $("#opcion-consulta").fadeOut();
        $("#posicion-actual").fadeOut();
        $("#resetearBusqueda").fadeOut();
        
    },
    mostrarMensaje:function(msg){
        $("#opcion-consulta").hide();
        $("#msg").fadeOut("fast");
        $("#msg").html(msg);
        $("#msg").fadeIn("slow");            
    },
    mostrarMensajeFlotante:function(msg){
      $("#sidebar").fadeOut();
      $(".msg-flotante").html(msg);
      $(".msg-flotante").fadeIn("slow");
      setTimeout(function() {
            $('.msg-flotante').fadeOut("slow");
        }, 3000);

    },
    quitarEventoClick:function(){
      map.off("click");
    }
    
    
};


  
