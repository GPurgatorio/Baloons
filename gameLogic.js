"use strict"
//GPurgatorio - Final PI

//global settings
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var selected = false;

//keyboard settings
var rightPressed = false;
var leftPressed = false;
var upPressed = false;
var downPressed = false;
var world = [];

//gameLogic settings
var editing = false;
var removing = false;
var adding = false;
var dragging = false;
var set = false;
var gameStarted = false;
var aiming = false;
var shooting = false;

//weird stuff #mafia
var proj;

//gameLogic arguments
var PALLONI = [];
var cnt = 0;
var team = 0;
var turn = 0;

//listeners
//document.addEventListener("keyup", keyUpHandler, false);  
document.addEventListener("keydown", keyDownHandler, false);            //keyboard DOWN
document.addEventListener("mousemove", mouseMoveHandler, false);        //mouse MOVE
document.addEventListener("click", mouseClickHandler, false);           //mouse CLICK
document.addEventListener("mouseup", addBaloon, false);                 //mouse UP

//actual flow of the program
setupVariables();
setInterval(gameLoop,1000/60);          //loop

//sets up used variables
function setupVariables(){
    worldMap.canvas = document.getElementById("canvas");
    worldMap.STEP_MAX = 2.5;
    worldMap.STEP_CHANGE = 1.0;
    worldMap.BASE = worldMap.canvas.height;
    worldMap.HEIGHT_MAX = worldMap.canvas.height/4;
    worldMap.height = worldMap.BASE*3/4;
    worldMap.slope = (Math.random() * worldMap.STEP_MAX) * 2 - worldMap.STEP_MAX;
    worldMap.createWorld(world);
    Baloon.WEAPON_NUMBER = 1;
    Baloon.SHOOTING_RADIUS = 15;
    PALLONI.push(new Baloon(300,30,cnt));         //at least one to prevent errors     --TO BE REMOVED IN FINAL
    cnt++;
}

//(GS) -> to be moved in the gameStarted if condition

//what actually happens in the game 60 times/second
function gameLoop(){
    
    //world stuff
    ctx.clearRect(0, 0, canvas.width, canvas.height);   //clear previous screen
    worldMap.drawWorld(world);                          //draw terrain + sky
    
    //player stuff
    Baloon.drawBaloons(PALLONI);                        //draw every Baloon in its position
    Baloon.updateBaloons(PALLONI);                      //update the state of every Baloon (e.g. gravity)
    Baloon.movementTurn(PALLONI, turn);                 //let the player move Baloon # "turn"      (GS)

    if(aiming)                              //(GS)
        Baloon.drawAim(PALLONI, turn);                  //if aiming, draw where you're aiming

    //game started
    if(gameStarted) {
        if(!set) {                                      //timer     TODO: set to 0 when hero dies
            set = true;
            updateGameState();
        }
        
    }
    //game not started yet
    else {
        
    }
    //requestAnimationFrame(gameLoop);      --not used because of possible framerate loss
}

function keyDownHandler(e) {                    //TO-DO: (check) try to pass instead of (palloni,turn) -> palloni[turn] : efficiency <> now?
    //the next 4 are the classic WASD movement                          
    if(e.keyCode == 37) {
        Baloon.moveLeft(PALLONI,turn);
        aiming = false;
    }
    if(e.keyCode == 39) {
        Baloon.moveRight(PALLONI,turn);
        aiming = false;
    }
    if(e.keyCode == 40) {
        Baloon.moveDown(PALLONI,turn);
        aiming = false;
    }
    if(e.keyCode == 38) {
        Baloon.moveUp(PALLONI,turn);
        aiming = false;
    }
    
    if(e.keyCode == 69 || e.keyCode == 81) {
        if (e.keyCode == 69)       //the "e" key, aim (->)
            Baloon.aimWeaponRight(PALLONI, turn);
        else                       //the "q" key, aim (<-)
            Baloon.aimWeaponLeft(PALLONI, turn);
        aiming = true;
    }

    if(e.keyCode == 32) {           //"spacebar" key, shoot
        shooting = true;
        Weapon.shootDot(PALLONI,turn);
    }

    if(e.keyCode == 187)            //the "+" key, change weapon (->)
        Baloon.weaponSwitchForward(PALLONI, turn);
    if(e.keyCode == 189)            //the "-" key, change weapon (<-)
        Baloon.weaponSwitchBackward(PALLONI, turn);

    if(e.keyCode == 70){            //the "f" key, starts the game (can't be undone atm)
        alert("Partita iniziata!");
        gameStarted = true;
    }

    if(!gameStarted && e.keyCode == 79){       //the "o" key, remove terrain
        editing = !editing;
        removing = !removing;
        updateWorld();
    }
 
}

function updateWorld(){
    if(editing)
        document.body.style.cursor = "cell"; 
    else
        document.body.style.cursor = 'default';
}

function mouseClickHandler(e){
    if(editing)
        dragging = !dragging;
}

function addBaloon(e) {
    if(!editing && !gameStarted) {
        if(e.clientY < world[e.clientX - canvas.offsetLeft]) {
            PALLONI.push(new Baloon(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop, cnt));         //team
            cnt++;
        }
    }
}

function drawCursorIndicator(relativeX, relativeY){
    ctx.beginPath();
    ctx.arc(relativeX, relativeY, 10, 0, Math.PI*2);
    if(!dragging)
        ctx.fillStyle = "#008B8B";
    else
        ctx.fillStyle = "#FF0000";
    ctx.fill();
    ctx.closePath();
}

function mouseMoveHandler(e) {
    var relativeX = e.clientX - canvas.offsetLeft;
    var relativeY = e.clientY - canvas.offsetTop;
    if(editing) {
        drawCursorIndicator(relativeX, relativeY);
        if(relativeX < canvas.width && dragging && (relativeY < world[relativeX] + 20 && (relativeY > world[relativeX]))) {
            if(removing)
                worldMap.removeWorldPart(world, relativeX, relativeY);
            //else 
            //    worldMap.addWorldPart(world, relativeX, relativeY);
        }
    }
}

//timer
function updateGameState(){
    var countDown = 6000;
    var now = 0;
    var a = setInterval(function() {
        var distance = countDown - now;
        now += 1000;
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Output the result in an element with id="demo"
        document.getElementById("demo").innerHTML = seconds + "s ";
        
        if (distance < 0 || PALLONI[turn].hp == 0) {
            clearInterval(a);
            set = false;
            shooting = false;
            turn = (turn + 1) % cnt;
            document.getElementById("demo").innerHTML = "End Turn";
        }
    }, 1000);
}