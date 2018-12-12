//global settings
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

var editing = false;
var dragging = true;
var set = false;

//keyboard settings
var rightPressed = false;
var leftPressed = false;
var upPressed = false;
var downPressed = false;
var world = [];

var PALLONI = [];
var cnt = 0;
var team = 0;
var turn = 0;

function gameLoop(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);   
      
    worldMap.drawWorld(world);
    Baloon.drawBaloons(PALLONI);  
    Baloon.updatesMovement(world, turn);
    if(!set) {
        set = true;
        updateGameState();
    }

    //requestAnimationFrame(gameLoop);
}

setupVariables();
setInterval(gameLoop,1000/60);



document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

//mouse
document.addEventListener("mousemove", mouseMoveHandler, false);
document.addEventListener("click", mouseClickHandler, false);
document.addEventListener("mouseup", addBaloon, false);


function keyDownHandler(e) {
    if(e.keyCode == 38){
        Baloon.moveUp(PALLONI,turn);
    }
    else if(e.keyCode == 39) {
        Baloon.moveRight(PALLONI,turn);
    }
    else if(e.keyCode == 37) {
        Baloon.moveLeft(PALLONI,turn);
    }
    else if(e.keyCode == 40){
        Baloon.moveDown(PALLONI,turn);
    }
}

function keyUpHandler(e) {
    if(e.keyCode == 38){
        upPressed = false;
    }
    else if(e.keyCode == 39) {
        rightPressed = false;
    }
    else if(e.keyCode == 37) {
        leftPressed = false;
    }
    else if (e.keyCode == 40){
        downPressed = false;
    }
}

function removeWorldPart(coordX, coordY){
    for(var i = 0; i< 5; i++) {
        if(coordX > world[coordX] + 5 || coordX > world[coordX] - 5) {
            world[coordX+i] += 6-i/2;
            world[coordX-i] += 6-i/2;
        }
    }
}


function updateWorld(){
    editing = !editing;
    if(editing)
        changeCursorCell();
    else
        restoreCursor();
}

function changeCursorCell() {
    document.body.style.cursor = "cell"; 
}

function restoreCursor() {
    document.body.style.cursor = 'default';
}

function mouseClickHandler(e){
    dragging = !dragging;
    console.log(PALLONI.length);
}

function addBaloon(e) {
    PALLONI.push(new Baloon(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop, cnt));         //team
    cnt++;
    console.log("Contatore: " + cnt);
}

function drawCursorIndicator(relativeX, relativeY){
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI*2);
    ctx.fillStyle = "#008B8B";
    ctx.fill();
    ctx.closePath();
}

function mouseMoveHandler(e) {
    var relativeX = e.clientX - canvas.offsetLeft;
    var relativeY = e.clientY - canvas.offsetTop;
    if(relativeX < canvas.width && dragging && editing && 
        (relativeY < world[relativeX] + 20 && (relativeY > world[relativeX]))
        ) {
        //drawCursorIndicator(relativeX, relativeY);
        removeWorldPart(relativeX, relativeY);
    }
}


function setupVariables(){
    worldMap.canvas = document.getElementById("canvas");
        
    worldMap.STEP_MAX = 2.5;
    worldMap.STEP_CHANGE = 1.0;
    worldMap.BASE = worldMap.canvas.height;
    worldMap.HEIGHT_MAX = worldMap.canvas.height/4;

    worldMap.height = worldMap.BASE*3/4;
    worldMap.slope = (Math.random() * worldMap.STEP_MAX) * 2 - worldMap.STEP_MAX;

    worldMap.createWorld(world);

}

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