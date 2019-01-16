function openGame() {
    document.getElementById('game').classList.add('shown');
}

function openInfos() {
    document.getElementById('modal-overlay').classList.add('shown');
    document.getElementById('infos').classList.add('shown');
}

function closeInfos() {
    document.getElementById('modal-overlay').classList.remove('shown');
    document.getElementById('infos').classList.remove('shown');
}

function hideButtons() {
    if(PALLONI.length > 0) {
        document.body.style.cursor = 'default';
        gameStarted = true;
        editing = false;
        adding = false;
        removing = false;
        
        document.getElementById("tooltip").classList.add('hidden');
        
        var buttons = document.getElementsByClassName('setup-button');
        for (var i = 0; i < buttons.length; i++) {
            buttons[i].classList.add('hidden');
        }
        document.getElementById('canvas').style.marginRight = 0;
    }
    else {
        document.getElementById('tooltip').innerHTML="Non credo tu voglia far iniziare una partita senza giocatori.."
    }
}

function addBaloons(){
    document.getElementById('adding').classList.add('red');
    document.getElementById('editing').classList.remove('red');
    document.getElementById("tooltip").innerHTML="Clicka nel cielo per aggiungere Baloons!";
    document.body.style.cursor = 'default';
    adding = true;
    editing = false;
    removing = false;
}

function lastRandomColor() {
    var last = PALLONI.length -1;

    if(last >= 0) {
        document.getElementById("tooltip").innerHTML="Colore dell'ultimo Baloon cambiato!";
        PALLONI[last].color = Baloon.getRandomColor();
    }
    else {
        document.getElementById("tooltip").innerHTML="Per cambiare il colore di un Baloon però prima creane uno!";
    }
}

function editTerrain(){
    document.getElementById('editing').classList.add('red');
    document.getElementById('adding').classList.remove('red');
    if(removing)
        document.getElementById("tooltip").innerHTML="Modalità: Modifica. Sposta il mouse sul terreno per modificarlo.";
    else
        document.getElementById("tooltip").innerHTML="Modalità: Mostra. Clicka per passare a modalità Modifica.";
    adding = false;
    editing = true;
    removing = true;
    document.body.style.cursor = "cell"; 
}

function fixTerrain(){
    document.getElementById("tooltip").innerHTML="Hai appena smussato un po' il terreno!";
    var check = checkMap(world);
    if(check) {
        worldMap.fixWorld(world);
        for(var n = 0; n < PALLONI.length; n++) {
            var obj = PALLONI[n];
            if(obj.y > world[obj.x]) {
                obj.y = world[obj.x] - obj.ballRadius;;
            }
        }
    }
    else {
        document.getElementById("tooltip").innerHTML="Il terreno risulta coerente, nulla da smussare.";
    }
}

function restartSetup(){
    document.body.style.cursor = 'default';
    document.getElementById('editing').classList.remove('red');
    document.getElementById('adding').classList.remove('red');
    document.getElementById("tooltip").innerHTML="Mappa rigenerata e tutte le azioni azzerate!";
    adding = false;
    editing = false;
    removing = false;
    while(PALLONI.length != 0)
        PALLONI.splice(0,1);
    worldMap.createWorld(world);
    frase = "Seleziona uno dei pulsanti per maggiori info."
}

function slidePause() {
    document.getElementById('modal-overlay').classList.add('shown');
    document.getElementById('pause').classList.add('shown');
}

function unslidePause() {
    document.getElementById('pause').classList.remove('shown');
}

function unslideResume(){
    menu = false;
    unslidePause();
    document.getElementById('modal-overlay').classList.remove('shown');
}

function openSettings() {
    document.getElementById('settingScreen').classList.add('shown');
}

function closeSettings() {
    document.getElementById('settingScreen').classList.remove('shown');
    unslideResume();
}

function updateSliderValue() {
    var slider = document.getElementById("slider");
    var valueBox = document.getElementById("slider-value");
    valueBox.innerHTML = slider.value;
    ballSensitivity = parseInt(slider.value);
}

function end() {
    ended = true;
    gameStarted = false;
    document.getElementById("announcer").innerHTML="";
    document.getElementById("timer").innerHTML="Partita terminata";
    unslideResume();
}

function infoAdd() {
    if(!adding) {
        frase = document.getElementById("tooltip").innerHTML;
        console.log(frase);
        document.getElementById("tooltip").innerHTML="Questo pulsante permette di aggiungere Baloons.";
    }
}

function infoColor() {
    frase = document.getElementById("tooltip").innerHTML;
    document.getElementById("tooltip").innerHTML="Questo pulsante permette di cambiare randomicamente il colore dell'ultimo Baloon aggiunto.";
}

function infoEdit() {
    if(!editing) {
        frase = document.getElementById("tooltip").innerHTML;
        document.getElementById("tooltip").innerHTML="Questo pulsante permette di modificare manualmente il terreno.";
    }
}

function infoFix() {
    frase = document.getElementById("tooltip").innerHTML;
    document.getElementById("tooltip").innerHTML="Questo pulsante permette di aggiustare automaticamente il terreno.";
}

function infoStart() {
    frase = document.getElementById("tooltip").innerHTML;
    document.getElementById("tooltip").innerHTML="Questo pulsante permette di iniziare la partita.";
}

function infoReset() {
    frase = document.getElementById("tooltip").innerHTML;
    document.getElementById("tooltip").innerHTML="Questo pulsante permette di azzerare le impostazioni attuali e generare una nuova mappa.";
}

function restoreTooltip() {
    document.getElementById("tooltip").innerHTML = frase;
}

function restoreTooltipAdd() {
    if(!adding)
        document.getElementById("tooltip").innerHTML = frase;
}

function restoreTooltipEdit() {
    if(!editing)
        document.getElementById("tooltip").innerHTML = frase;
}