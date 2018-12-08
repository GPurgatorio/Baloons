//global settings
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var editWorld = document.getElementById("editWorld");
var editing = false;
var dragging = true;

//keyboard settings
var rightPressed = false;
var leftPressed = false;
var upPressed = false;
var downPressed = false;

//balls settings
var ballRadius = 10;
var jumping = false;
var inAir = true;
var x = canvas.width/2;
var y = 1;
var dx = 2;
var dy = -2;
var gravity = -2;
var balls = [];

//world generation
var world = [];
// && parametri
var STEP_MAX = 2.5;
var STEP_CHANGE = 1.0;
var BASE = canvas.height;
var HEIGHT_MAX = canvas.height/4;

// starting conditions
var height = BASE*3/4;
var slope = (Math.random() * STEP_MAX) * 2 - STEP_MAX;

function updateWorld(){
    editing = !editing;
    if(editing)
        changeCursor();
    else
        restoreCursor();
}


// creating the landscape
function createWorld(){
    for (var n = 0; n < canvas.width; n++) {
        // change height and slope
        height += slope;
        slope += (Math.random() * STEP_CHANGE) * 2 - STEP_CHANGE;

        // clip height and slope to maximum
        if (slope > STEP_MAX) { slope = STEP_MAX };
        if (slope < -STEP_MAX) { slope = -STEP_MAX };
    
        if(height < HEIGHT_MAX){
            height = HEIGHT_MAX;
            slope *= -1;
        }
        if (height > BASE * 6/7) { 
            height = BASE * 6/7;
            slope *= -1;
        }
        world[n] = height;  
        // draw column
        ctx.beginPath();
        ctx.moveTo(n, BASE);
        ctx.lineTo(n, height);
        ctx.stroke();
    }
}

function drawWorld(){
    for (var n = 0; n < canvas.width; n++) {
        var height = world[n];
        //https://www.w3schools.com/colors/colors_names.asp
        //terrain
        ctx.beginPath();
        ctx.moveTo(n, BASE);
        if(editing)
            ctx.strokeStyle="#DC143C";
        else
           ctx.strokeStyle="#CD853F";
        ctx.lineTo(n, height);
        ctx.stroke();

        //sky
        ctx.beginPath();
        ctx.moveTo(n,height+1);
        ctx.strokeStyle="#00FFFF";
        ctx.lineTo(n,0);
        ctx.stroke();
    }
}

function drawBaloon() {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI*2);
    ctx.fillStyle = "#FFB6C1";
    ctx.fill();
    ctx.closePath();
}

//window.setTimeout(function, ms);      chiama function dopo ms

function gameLoop(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);   
    drawWorld();

    if(editing) {

    }
    
    else {
        drawBaloon();
        
        if(rightPressed && x < canvas.width - ballRadius){ 
            x += 2;
            if(y > world[x] + ballRadius || x < world[x] + ballRadius || x > world[x] + ballRadius){
                y = world[x] - ballRadius;
            }
        }
        else if(leftPressed && x > ballRadius + 1) { 
            x -= 2;
            if(y > world[x] + ballRadius || x < world[x] + ballRadius || x > world[x] + ballRadius) {
                y = world[x] - ballRadius;
            }
        }
        else if(upPressed && !jumping) {
            jumping = true;
            y -= 30;
        }
        else if(downPressed && y < world[x] - ballRadius) {
            y += 2;
        }
        //gravity
        if(Math.abs(y) < world[x] - ballRadius){   //assoluto perché se vado sopra lo schermo devo tornare giù comunque
            y *= 1.05;
        }
        if(y == world[x] - ballRadius){
            jumping = false;
        }
    }
    requestAnimationFrame(gameLoop);
}

//execution
createWorld();
gameLoop();

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

//mouse
document.addEventListener("mousemove", mouseMoveHandler, false);
document.addEventListener("click", mouseClickHandler, false);

function keyDownHandler(e) {
    if(e.keyCode == 38){
        upPressed = true;
    }
    else if(e.keyCode == 39) {
        rightPressed = true;
    }
    else if(e.keyCode == 37) {
        leftPressed = true;
    }
    else if(e.keyCode == 40){
        downPressed = true;
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

function removeWorldPart(coordinate){
    for(var i = 0;i< 10; i++) {
        if(coordinate > world[coordinate] + 10 || coordinate > world[coordinate] - 10) {
            world[coordinate+i] += 10;
            world[coordinate-i] += 10;
        }
    }
}

function changeCursor() {
    document.body.style.cursor = "cell"; 
}

function restoreCursor() {
    document.body.style.cursor = 'default';
}

function mouseClickHandler(e){
    dragging = !dragging;
    console.log(e);
}

function mouseMoveHandler(e) {
    var relativeX = e.clientX - canvas.offsetLeft;
    if(relativeX < canvas.width && dragging && editing) {
        removeWorldPart(relativeX);
    }
}