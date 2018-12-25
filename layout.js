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
    document.body.style.cursor = 'default';
    gameStarted = true;
    editing = false;
    adding = false;
    removing = false;
    
    var buttons = document.getElementsByClassName('setup');
    for (var i = 0; i < buttons.length; i++) {
        buttons[i].classList.add('hidden');
    }
    document.getElementById('canvas').style.marginRight = 0;
}

function addBaloons(){
    document.getElementById('adding').classList.add('red');
    document.getElementById('editing').classList.remove('red');
    document.body.style.cursor = 'default';
    adding = true;
    editing = false;
    removing = false;
}

function editTerrain(){
    document.getElementById('editing').classList.add('red');
    document.getElementById('adding').classList.remove('red');
    adding = false;
    editing = true;
    removing = !removing;
    document.body.style.cursor = "cell"; 
}

function restartSetup(){
    document.body.style.cursor = 'default';
    document.getElementById('editing').classList.remove('red');
    document.getElementById('adding').classList.remove('red');
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