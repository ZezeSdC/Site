// Default location
var initialLocation = {
    lat: 70,
    lng: -45.949417
};

// Change current position of user and map view
function changeLocation(position){
    initialLocation.lat = position.coords.latitude;
    initialLocation.lng = position.coords.longitude;
    map.setCenter(initialLocation);
    map.setZoom(15);
}

// Store the map
var map;

// Store the markers
var markers;

// Store the cluster of markers for distant view
var markerCluster;

// Store the server address and port
var server = "http://192.168.0.92:3000";

function addControl(nome, radi, func, icon, title) {

    // Set CSS for the control border.
    var controlUI = document.createElement('div');
    controlUI.style.backgroundColor = '#fff';
    controlUI.style.border = '2px solid #fff';
    controlUI.style.borderRadius = radi;
    controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
    controlUI.style.cursor = 'pointer';
    controlUI.style.margin = '10px';
    controlUI.style.textAlign = 'center';
    controlUI.title = title;
    //controlUI.className = "mdl-button mdl-js-button mdl-button--fab mdl-js-ripple-effect";
    nome.appendChild(controlUI);

    // Set CSS for the control interior.
    var controlText = document.createElement('div');
    controlText.style.color = 'rgb(25,25,25)';
    controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
    controlText.style.fontSize = '16px';
    controlText.style.paddingLeft = '10px';
    controlText.style.paddingRight = '10px';
    controlText.style.paddingTop = '10px';
    controlText.style.paddingBottom = '6px';
    controlText.innerHTML = icon;
    controlUI.appendChild(controlText);

    // Setup the click event listeners
    controlUI.addEventListener('click', func);
}

function changeBtn(pos, div){
    // remove botao atual
    map.controls[google.maps.ControlPosition.TOP_RIGHT].removeAt(pos);

    // adiciona novo botao
    map.controls[google.maps.ControlPosition.TOP_RIGHT].insertAt(pos,div);
}

// Get the index of marker on array of makers
/**
 * Implement binary search someway
 */
function getMarkerPos(id){
    var i;
    if(id){
        for(i=0; i < markers.length; i++){
            if(markers[i].id == id){
                return i;
            }
        }
    }
    return -1;
}

// Get the id for a new marker
function newId(){
    var last = markers.length - 1;
    return markers[last].id + 1;
}

// Store the event of click on map to add new point
var eventoAdd;

// Control display and functions of update / add markers
function aud(aaaa) {

    if (dialog.returnValue == 'yes') {
        // poem isso no lugar certo depois

        var userMessage; // Store the message for user interface on add / update / delete point
        var desc = document.getElementById("desc").value; // Get description of form
        if(!desc){
            desc = "Sem descrição."
        }
        desc = desc.substr(0, 300);
        var tipo = document.querySelector('input[name="tipo"]:checked').value; // get the selected value
        
        if (!Date.now) {
            // To IE8...
            Date.now = function() { return new Date().getTime(); }
        }
        var data = Date.now(); // Get local date in unix timestamp
        
        if(titulo.innerHTML == "Adicionar novo"){
            // If action is add new point
            /**
             * Get all data from form,
             * send data to backend,
             * wait by response.
             */
            var add = new XMLHttpRequest(); // create new xmlhttp request
            add.onreadystatechange = function() { // wait for server response
                if (this.readyState == 4 && this.status == 200) {
                    if(this.responseText == "err"){ // on error display error mensage
                        userMessage = {message: 'Erro ao adicionar ponto.'};
                    }
                    else{ // on success display success mensage and
                        // add new marker to map
                        var m = JSON.parse(this.responseText);
                        
                        var marker = new google.maps.Marker({
                            position: eventoAdd.latLng,
                            map: map,
                            title: tipo,
                            descricao: desc,
                            id: newId(),
                            _id: m._id
                        });
                        
                        markers.push(marker); // Add new marker to array of markers

                        marker.addListener('click', function() {
                            // Insert data from marker on form
                            document.getElementById("d-title").innerHTML = "Atualizar";
                            document.getElementById("desc").value = this.descricao;
                            document.querySelector('input[value="'+ this.title +'"]').checked = true;
                            dialog.id = this.id;
                            dialog.showModal();
                            dialog.addEventListener('close', aud);
                        });
                        
                        markerCluster.addMarker(marker);
                        userMessage = {message: 'Ponto adicionado com sucesso!'};
                    }
                    // show message
                    snackbarContainer.MaterialSnackbar.showSnackbar(userMessage);
                }
                else if (this.readyState == 4 && this.status == 401) {
                    userMessage = {message: 'Faça login antes de adicionar pontos.'};
                    snackbarContainer.MaterialSnackbar.showSnackbar(userMessage);
                }
            };
            var url = server + "/auth/crime"; // server url
            
            add.open("POST", url ,true);
            add.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            add.send("lat="+ eventoAdd.latLng.lat() +"&lng="+ eventoAdd.latLng.lng() +"&date="+ data +"&type="+ tipo +"&desc="+ desc +"&facebook_id="+id);
        }
        else{
            // If action is update a point
            /**
             * Get all data from form,
             * send data to backend,
             * wait by response.
             */

            var m = markers[getMarkerPos(dialog.id)]; // Get the marker to be updated
            var up = new XMLHttpRequest(); // create new xmlhttp request
            up.onreadystatechange = function() { // wait for server response
                if (this.readyState == 4 && this.status == 200) {
                    // on success display success mensage and
                    // add update the marker on screen
                    
                    // Update the marker
                    m.title = tipo;
                    m.descricao = desc;

                    userMessage = {message: 'Ponto atualizado com sucesso!'};
                    
                    // show message
                    snackbarContainer.MaterialSnackbar.showSnackbar(userMessage);
                }
                else if (this.readyState == 4 && this.status == 500) {
                    userMessage = {message: 'Erro interno ao adicionar ponto.'};
                    snackbarContainer.MaterialSnackbar.showSnackbar(userMessage);
                }
                else if (this.readyState == 4 && this.status == 401) {
                    userMessage = {message: 'Você só pode editar seus próprios pontos.'};
                    snackbarContainer.MaterialSnackbar.showSnackbar(userMessage);
                }
                else if (this.readyState == 4 && this.status == 404) {
                    userMessage = {message: 'O ponto não existe.'};
                    snackbarContainer.MaterialSnackbar.showSnackbar(userMessage);
                }
            };
            var url = server + "/auth/crime/" + m._id; // server url
            
            up.open("PUT", url ,true);
            up.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            up.send("&type="+ tipo +"&desc="+ desc);
        }
    }
    else{
        if (dialog.returnValue == 'del') {
            // If action is delete a point
            /**
             * Get all data from form,
             * send data to backend,
             * wait by response.
             */

            var index = getMarkerPos(dialog.id); // Get the marker to be updated
            if (index > -1) {
                var m = markers[index]; // Get the marker to be updated
                var del = new XMLHttpRequest(); // create new xmlhttp request
                del.onreadystatechange = function() { // wait for server response
                    if (this.readyState == 4 && this.status == 200) {
                        // on success display success mensage and
                        // add remove the marker of screen
                        
                        markers[index].setMap(null);
                        markerCluster.removeMarker(markers[index]);
                        markers.splice(index, 1);
                        userMessage = {message: 'Ponto removido com sucesso!'};
                        
                        // show message
                        snackbarContainer.MaterialSnackbar.showSnackbar(userMessage);
                    }
                    else if (this.readyState == 4 && this.status == 500) {
                        userMessage = {message: 'Erro interno ao remove ponto.'};
                        snackbarContainer.MaterialSnackbar.showSnackbar(userMessage);
                    }
                    else if (this.readyState == 4 && this.status == 401) {
                        userMessage = {message: 'Você só excluir seus próprios pontos.'};
                        snackbarContainer.MaterialSnackbar.showSnackbar(userMessage);
                    }
                    else if (this.readyState == 4 && this.status == 404) {
                        userMessage = {message: 'O ponto não existe.'};
                        snackbarContainer.MaterialSnackbar.showSnackbar(userMessage);
                    }
                };
                var url = server + "/auth/crime/" + m._id; // server url
                
                del.open("DELETE", url ,true);
                del.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                del.send();
            }
            else{
                userMessage = {message: 'Erro ao remover ponto.'};
                snackbarContainer.MaterialSnackbar.showSnackbar(userMessage);
            } 
        }
        
    }
    
    dialog.removeEventListener("close", aud); 
    // Return elements to default state
    document.getElementById("desc").value = "";
    document.querySelector('input[value="Roubo"]').checked = true;
    titulo.innerHTML = "Adicionar novo";
}

function initMap() {
    // Create the map
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 2,
        center: initialLocation,
        gestureHandling: 'greedy',
        disableDefaultUI: true,
        styles: [
            {elementType: 'geometry', stylers: [{color: '#242f3e'}]},
            {elementType: 'labels.text.stroke', stylers: [{color: '#242f3e'}]},
            {elementType: 'labels.text.fill', stylers: [{color: '#746855'}]},
            {
            featureType: 'administrative.locality',
            elementType: 'labels.text.fill',
            stylers: [{color: '#d59563'}]
            },
            {
            featureType: 'poi',
            elementType: 'labels.text.fill',
            stylers: [{color: '#d59563'}]
            },
            {
            featureType: 'poi.park',
            elementType: 'geometry',
            stylers: [{color: '#263c3f'}]
            },
            {
            featureType: 'poi.park',
            elementType: 'labels.text.fill',
            stylers: [{color: '#6b9a76'}]
            },
            {
            featureType: 'road',
            elementType: 'geometry',
            stylers: [{color: '#38414e'}]
            },
            {
            featureType: 'road',
            elementType: 'geometry.stroke',
            stylers: [{color: '#212a37'}]
            },
            {
            featureType: 'road',
            elementType: 'labels.text.fill',
            stylers: [{color: '#9ca5b3'}]
            },
            {
            featureType: 'road.highway',
            elementType: 'geometry',
            stylers: [{color: '#746855'}]
            },
            {
            featureType: 'road.highway',
            elementType: 'geometry.stroke',
            stylers: [{color: '#1f2835'}]
            },
            {
            featureType: 'road.highway',
            elementType: 'labels.text.fill',
            stylers: [{color: '#f3d19c'}]
            },
            {
            featureType: 'transit',
            elementType: 'geometry',
            stylers: [{color: '#2f3948'}]
            },
            {
            featureType: 'transit.station',
            elementType: 'labels.text.fill',
            stylers: [{color: '#d59563'}]
            },
            {
            featureType: 'water',
            elementType: 'geometry',
            stylers: [{color: '#17263c'}]
            },
            {
            featureType: 'water',
            elementType: 'labels.text.fill',
            stylers: [{color: '#515c6d'}]
            },
            {
            featureType: 'water',
            elementType: 'labels.text.stroke',
            stylers: [{color: '#17263c'}]
            }
        ]
    });

    // Listener to click on a marker
    var listenerClick;

    // Create button to center map
    var addDiv = document.createElement('div');

    var addBtnControl = new addControl(addDiv, '100%',
        function(){
            // remove add button
            changeBtn(0,deleteDiv);
            listenerClick = google.maps.event.addListener(map, 'click', function(event) {

                eventoAdd = event;
                
                dialog.showModal();

                // When dialog close
                dialog.addEventListener('close', aud);

                // Close edit mode
                changeBtn(0,addDiv);
                listenerClick.remove();
            });
            
        },
        '<i class="material-icons">add</i>',
        'Adicionar ponto'
    );
    
    // Create new div
    var deleteDiv = document.createElement('div');
    var closeControl = new addControl(deleteDiv, '100%',
    function(){
        // Remove close button
        changeBtn(0,addDiv);
        listenerClick.remove();
    },
    '<i class="material-icons">close</i>',
    'Parar adição de ponto'
    );

    // Create button to center map
    var centerDiv = document.createElement('div');
    var centerControl = new addControl(centerDiv, '100%', function(){
        map.setCenter(initialLocation);},
        '<i class="material-icons">filter_center_focus</i>',
        'Centralizar mapa'
    );

    // Create button to reset zoom
    var zoomDiv = document.createElement('div');
    var zoomControl = new addControl(zoomDiv, '100%', function(){
        map.setZoom(15);},
        '<i class="material-icons">aspect_ratio</i>',
        'Resetar zoom'
    );

    // Create button to zoom control
    var zoomControlDiv = document.createElement('div');
    var zoomIn = new addControl(zoomControlDiv, '5px', function(){
        map.setZoom( map.getZoom() + 1 );},
        '<i class="material-icons">zoom_in</i>',
        'Almentar zoom'
    );
    var zoomOut = new addControl(zoomControlDiv, '5px', function(){
        map.setZoom( map.getZoom() - 1 );},
        '<i class="material-icons">zoom_out</i>',
        'Diminuir zoom'
    );

    // Create button to update the map
    var updateDiv = document.createElement('div');
    var updateBtn = new addControl(updateDiv, '100%', function(){
        location.href = './app';},
        '<i class="material-icons">refresh</i>',
        'Atualizar dados'
    );

    // Add buttons to map
    deleteDiv.index = 1;
    addDiv.index = 1;
    centerDiv.index = 2;
    zoomDiv.index = 3;
    zoomControlDiv.index = 4;
    updateDiv.index = 5;

    map.controls[google.maps.ControlPosition.TOP_RIGHT].push(addDiv);
    map.controls[google.maps.ControlPosition.TOP_RIGHT].push(centerDiv);
    map.controls[google.maps.ControlPosition.TOP_RIGHT].push(zoomDiv);
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(zoomControlDiv);
    map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(updateDiv);

    //  ------- Request json with markers to backend ---------
    var getMarkers = new XMLHttpRequest();
    getMarkers.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
        var m = JSON.parse(this.responseText);
        markers = m.map(function(pos, i) {
            var marker = new google.maps.Marker({
                position: {lat: pos.lat, lng: pos.lng},
                map: map,
                title: pos.type,
                descricao: pos.desc,
                id: i,
                _id: pos._id
            });
            
            marker.addListener('click', function() {
                // Insert data from marker on form
                document.getElementById("d-title").innerHTML = "Atualizar";
                document.getElementById("desc").value = this.descricao;
                document.querySelector('input[value="'+ this.title +'"]').checked = true;
                dialog.id = this.id;
                dialog.showModal();
                dialog.addEventListener('close', aud);
            });

            return marker;
        });
        // Add a marker clusterer to manage the markers.
        markerCluster = new MarkerClusterer(map, markers,
        {imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'});
    
    }
    };
    var url = server + "/crimes"; // server url
    getMarkers.open("GET", url ,true);
    getMarkers.send();
}