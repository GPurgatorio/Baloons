function openGame() {
    document.getElementById('game').style.bottom = 0;
    document.getElementById('game').style.opacity = 1;
}

function openInfos() {
    document.getElementById('modal-overlay').style.display = 'block';
    document.getElementById('infos').style.display = 'flex';
}

function closeInfos() {
    document.getElementById('modal-overlay').style.display = 'none';
    document.getElementById('infos').style.display = 'none';
}

function hideButtons() {
    document.body.style.cursor = 'default';
    gameStarted = true;
    editing = false;
    adding = false;
    removing = false;
    
    var buttons = document.getElementsByClassName('button');
    for (var i = 0; i < buttons.length; i++) {
        buttons[i].style.height = 0;
        buttons[i].style.padding = 0;
        buttons[i].style.fontSize = 0;
        buttons[i].style.minWidth = 0;
    }
    document.getElementById('canvas').style.marginRight = 0;
}

function addBaloons(){
    document.body.style.cursor = 'default';
    adding = true;
    editing = false;
    removing = false;
}

function editTerrain(){
    adding = false;
    editing = true;
    removing = !removing;
    document.body.style.cursor = "cell"; 
}

function restartSetup(){
    document.body.style.cursor = 'default';
    adding = false;
    editing = false;
    removing = false;
    while(PALLONI.length != 0)
        PALLONI.splice(0,1);
    worldMap.createWorld(world);
}