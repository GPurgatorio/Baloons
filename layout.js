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
        document.getElementById('tooltip').innerHTML="Questo tasto inizia la partita. Non credo tu voglia far iniziare una partita senza giocatori.."
    }
}

function addBaloons(){
    document.getElementById('adding').classList.add('red');
    document.getElementById('editing').classList.remove('red');
    document.getElementById("tooltip").innerHTML="Questo tasto permette l'aggiunta di Baloons. Clicka nel cielo per aggiungere un Baloon.";
    document.body.style.cursor = 'default';
    adding = true;
    editing = false;
    removing = false;
}

function lastRandomColor() {
    var last = PALLONI.length -1;

    if(last >= 0) {
        document.getElementById("tooltip").innerHTML="Questo tasto permette di cambiare randomicamente il colore dell'ultimo Baloon inserito.";
        PALLONI[last].color = Baloon.getRandomColor();
    }
    else {
        document.getElementById("tooltip").innerHTML="Questo tasto permette di cambiare il colore di un Baloon. Prima però creane uno!";
    }
}

function editTerrain(){
    document.getElementById('editing').classList.add('red');
    document.getElementById('adding').classList.remove('red');
    document.getElementById("tooltip").innerHTML="Questo tasto permette la modifica manuale del terreno. Sposta il mouse sul terreno per cancellarlo.";
    adding = false;
    editing = true;
    removing = true;
    document.body.style.cursor = "cell"; 
}

function fixTerrain(){
    document.getElementById("tooltip").innerHTML="Questo tasto controlla la consistenza del terreno. Hai appena smussato un po' il terreno.";
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
        document.getElementById("tooltip").innerHTML="Questo tasto controlla la consistenza del terreno. Il terreno risulta coerente, nulla da smussare.";
    }
}

function restartSetup(){
    document.body.style.cursor = 'default';
    document.getElementById('editing').classList.remove('red');
    document.getElementById('adding').classList.remove('red');
    document.getElementById("tooltip").innerHTML="Questo tasto permette di resettare ogni azione precedente. Mappa rigenerata e tutte le azioni azzerate.";
    adding = false;
    editing = false;
    removing = false;
    while(PALLONI.length != 0)
        PALLONI.splice(0,1);
    worldMap.createWorld(world);
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
}

function end() {
    ended = true;
    gameStarted = false;
    document.getElementById("announcer").innerHTML="";
    document.getElementById("timer").innerHTML="Partita terminata";
    unslideResume();
}