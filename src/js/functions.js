window.addEventListener("resize",windowResize);
var dialog;
var titulo;
var snackbarContainer;

window.onload = function(){
    windowResize();
    getLocation();
    google.maps.event.trigger(map, 'resize')
    // Add suport to dialog element on browsers that doens't support it
    dialog = document.querySelector('dialog');
    if (! dialog.showModal) {
        dialogPolyfill.registerDialog(dialog);
    }
    titulo = document.querySelector("#d-title");
    titulo.innerHTML = "Adicionar novo";
    snackbarContainer = document.querySelector('#message');
}

function windowResize(){
    if(!document.querySelector(".is-small-screen")){
        document.querySelector(".title").style = "margin-left: -55px;";
        document.getElementById("demo-menu-lower-right").style = "margin-right: -15px;";
    }
    else{
        document.querySelector(".title").style = "margin-left: 0px;";
        document.getElementById("demo-menu-lower-right").style = "margin-right: 0px;";
    }
}

// HTML5 geolocation
function getLocation(){
    if (navigator.geolocation){
        navigator.geolocation.getCurrentPosition(changeLocation);
    }
    else{
        alert("O seu navegador não suporta Geolocalização."); // muda isso depois
    }
}
