//global settings
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

//keyboard settings
var rightPressed = false;
var leftPressed = false;
var upPressed = false;
var downPressed = false;
var world = [];

//gameLogic settings
var editing = false;
var dragging = false;
var set = false;
var gameStarted = false;

//gameLogic arguments
var PALLONI = [];
var cnt = 0;
var team = 0;
var turn = 0;

//listeners
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
    PALLONI.push(new Baloon(100,200,cnt));         //at least one to prevent errors     --TO BE REMOVE IN FINAL
    cnt++;
}

//what actually happens in the game 60 times/second
function gameLoop(){
    
    //world stuff
    ctx.clearRect(0, 0, canvas.width, canvas.height);   //clear previous screen
    worldMap.drawWorld(world);                          //draw terrain + sky
    
    //player stuff
    Baloon.drawBaloons(PALLONI);                        //draw every Baloon in its position
    Baloon.updateBaloons(PALLONI);                      //update the state of every Baloon (e.g. gravity)
    Baloon.movementTurn(PALLONI, turn);                   //let the player move Baloon # "turn"
    
    //game started
    if(gameStarted) {
        //timer
        if(!set) {
            set = true;
            updateGameState();
        }
    }
    //game not started yet
    else {
        
    }
    //requestAnimationFrame(gameLoop);      --not used because of possible framerate loss
}

function keyDownHandler(e) {
    //the next 4 are the classic WASD movement
    if(e.keyCode == 37) 
        Baloon.moveLeft(PALLONI,turn);
    else if(e.keyCode == 38)
        Baloon.moveUp(PALLONI,turn);
    else if(e.keyCode == 39) 
        Baloon.moveRight(PALLONI,turn);
    else if(e.keyCode == 40)
        Baloon.moveDown(PALLONI,turn);

    else if(e.keyCode == 70){       //the "f" key, start the game (can't be undone atm)
        gameStarted = true;
    }
    else if(e.keyCode == 79){       //the "o" key, edit terrain (only, can be undone)
        editing = !editing;
        if(!editing)
            worldMap.fixWorld(world);
        updateWorld();
    }
 
}

function updateWorld(){
    //editing = !editing;
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
        PALLONI.push(new Baloon(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop, cnt));         //team
        cnt++;
        console.log("Contatore: " + cnt);
    }
}

function drawCursorIndicator(relativeX, relativeY){
    ctx.beginPath();
    ctx.arc(relativeX, relativeY, 10, 0, Math.PI*2);
    ctx.fillStyle = "#008B8B";
    ctx.fill();
    ctx.closePath();
}

function mouseMoveHandler(e) {
    var relativeX = e.clientX - canvas.offsetLeft;
    var relativeY = e.clientY - canvas.offsetTop;
    if(editing) {
        drawCursorIndicator(relativeX, relativeY);
        if(relativeX < canvas.width && dragging && (relativeY < world[relativeX] + 20 && (relativeY > world[relativeX]))) {
            worldMap.removeWorldPart(world, relativeX, relativeY);
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
        
        if (distance < 0) {
            clearInterval(a);
            set = false;
            turn = (turn + 1) % cnt;
            document.getElementById("demo").innerHTML = "EXPIRED";
        }
    }, 1000);
}