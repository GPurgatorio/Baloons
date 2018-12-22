"use strict"
//GPurgatorio - Final PI

//global settings
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var world = [];

//gameLogic settings
var selected = false;
var adding = false;
var editing = false;
var removing = false;
var adding = false;
var dragging = false;
var set = false;
var winnable = false;
var ended = false;
var gameStarted = false;
var aiming = false;
var shooting = false;
var alreadyShot = false;
var projectileRIP = false;
var stopMoving = false;
var deadBaloon = false;
var doubleBufferCnt = 0;
var doubleBuffer = true;
var forceExplosion = false;
var sbadabum = 0;
var exploding = 0;

//gameLogic vars
var PALLONI = [];
var projectiles = [];
var cnt = 0;
var team = 0;
var turn = 0;
var w;

//event listeners
document.addEventListener("keyup", keyUpHandler, false);  
document.addEventListener("keydown", keyDownHandler, false);           
document.addEventListener("mouseup", addBaloon, false); 
document.addEventListener("mousemove", mouseMoveHandler, false);        
document.addEventListener("click", mouseClickHandler, false);           
           

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
    Baloon.WEAPON_NUMBER = 3;
}

//(GS) -> to be moved in the gameStarted if condition

//what actually happens in the game 60 times/second
function gameLoop(){

    cnt = PALLONI.length;

    ctx.clearRect(0, 0, canvas.width, canvas.height);       //clear previous screen
    worldMap.drawWorld(world);                              //draw terrain + sky
    
    if(!gameStarted && PALLONI.length != 0) {
        Baloon.drawBaloons(PALLONI);                        //draw every Baloon in its position
        Baloon.updateBaloons(PALLONI);                      //update the state of every Baloon (e.g. gravity)
    }

    if(gameStarted) {

        if(cnt > 1)
            winnable = true;
        if(!ended && winnable && cnt == 1) {
            //vai ad un menù di riepilogo, fine della partita
            alert("Fine!");
            ended = true;
        }

        if(!set && !ended) {                                          //timer
            set = true;
            updateGameState();
        }

        if(PALLONI.length!=0) {
            if(PALLONI[turn].hp == 0)
                deadBaloon = true;
            Baloon.drawBaloons(PALLONI);
            Baloon.updateBaloons(PALLONI);
            Baloon.movementTurn(PALLONI, turn);
            
            if(aiming)                                              
                Baloon.drawAim(PALLONI, turn);

            if(projectiles.length != 0) {                           
                alreadyShot = true;
                if(projectiles[0].weapon == 0)
                    Weapon.shootRect(projectiles);
                else if(projectiles[0].weapon == 1) 
                    Weapon.shootBall(projectiles, world);
            
                else if (projectiles[0].weapon == 2) {
                    if(doubleBufferCnt < 15 || (doubleBufferCnt > 31 && doubleBufferCnt < 45) || doubleBuffer)
                        Weapon.shootAnalogClock(projectiles);
                    else if(doubleBufferCnt >= 60)
                        doubleBufferCnt = 0;
                    doubleBufferCnt = (doubleBufferCnt + 1)
                }

                //if projectile shot goes beyond the canvas in some direction (not topside)
                if(projectiles[0].x < 0 || projectiles[0].x > canvas.width || projectiles[0].y > canvas.heigth)
                    projectiles.splice(0,1);
                //if projectile shot hits the ground || stucked at some point, forcing explosion..
                else if(projectiles[0].weapon == 1) {
                    if(world[Math.floor(projectiles[0].x)] > world[Math.floor(projectiles[0].x) - 1]) {
                        projectileRIP = true;
                    }
                }
                else if(forceExplosion || (Math.floor(projectiles[0].y) > world[Math.floor(projectiles[0].x)])) {
                    if(projectiles[0].weapon == 0) {
                        projectileRIP = true;
                    }
                    else if(projectiles[0].weapon == 2 && forceExplosion) {
                        projectileRIP = true;
                    }
                }

                if(projectileRIP) {
                    Baloon.hitBaloons(PALLONI, projectiles[0].x, projectiles[0].weapon);
                    worldMap.terrainHit(world, projectiles[0].x, projectiles[0].y, projectiles[0].weapon);
                    projectiles.splice(0,1);
                }
            }
        }
    }
}

function keyDownHandler(e) {
   
    if(gameStarted && !stopMoving){                  
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
            if (e.keyCode == 69)                                    //the "e" key, aim (->)
                Baloon.aimWeaponRight(PALLONI, turn);
            else                                                    //the "q" key, aim (<-)
                Baloon.aimWeaponLeft(PALLONI, turn);
            aiming = true;
        }

        if(e.keyCode == 32 && !alreadyShot) {                       //"spacebar" key, shoot
            if(sbadabum < 10)
                sbadabum++;
            shooting = true;
            Weapon.drawIntensity(sbadabum, PALLONI, turn);
        }
            
        if(e.keyCode == 187)                                        //the "+" key, change weapon (->)
            Baloon.weaponSwitchForward(PALLONI, turn); 
        if(e.keyCode == 189)                                        //the "-" key, change weapon (<-)
            Baloon.weaponSwitchBackward(PALLONI, turn);
    }

    if(e.keyCode == 191) {                                          //debug purpose, "ù" 
        console.log("Flattening..");
        for(var n = 0; n < world.length; n++)
            world[n]=400;
    }
}

function keyUpHandler(e) {
    if(gameStarted && PALLONI.length != 0) {
        if(e.keyCode == 32) {
            w = new Weapon(PALLONI[turn].x, PALLONI[turn].y, PALLONI[turn].aimX, PALLONI[turn].aimY, sbadabum, PALLONI[turn].weapon)
            projectiles.push(w);
        }
    }
}

function mouseClickHandler(e){
    if(editing)
        dragging = !dragging;
}

function addBaloon(e) {
    if(!editing && !gameStarted) {
        //se ho preso un pallone..
        //if(worldMap.isOccupied(world, e.clientX - canvas.offSetLeft)) {     //check H
        //    Baloon.dragNdrop(PALLONI, e.clientX - canvas.offsetLeft);
        //}
        //altrimenti (SCRIVI ELSE GRZ)
        if(adding && e.clientY < world[e.clientX - canvas.offsetLeft]) {
            PALLONI.push(new Baloon(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop, cnt));         //team
            cnt++;
        }
    }
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
    if(adding) {
        ctx.beginPath();
        ctx.arc(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop, 10, 0, Math.PI*2);
        ctx.fillStyle = "#696969";
        ctx.fill();
        ctx.closePath();
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

//timer
function updateGameState(){
    deadBaloon = false;
    stopMoving = false;
    forceExplosion = false;
    alreadyShot = false;
    projectileRIP = false;
    exploding = 0;
    var alreadyDidThis = false;
    var countDown = 15000;
    var now = 0;
    var a = setInterval(function() {
        var distance = countDown - now;
        var seconds;
        now += 1000;

        if(distance >= 0)
            seconds = Math.floor((distance % (1000 * 60)) / 1000);
        else
            seconds = 0;

        //Shows seconds left for the turn
        document.getElementById("timer").innerHTML = seconds + "s ";

        if(shooting == true) {
            if(seconds > 4 && !alreadyDidThis) {
                countDown = 4000;
                now = 0;
                seconds = 4;
                alreadyDidThis = true;
                shooting = false;
            }
        }

        if(distance <= 0)
            stopMoving = true;

        if (projectiles[0] == null && (distance <= 0 || deadBaloon)) {
            clearInterval(a);
            set = false;
            shooting = false;
            sbadabum = 0;            
            if(!deadBaloon)
                turn = (turn + 1) % cnt;
            if(ended)
                document.getElementById("timer").innerHTML = "Thanks for playing!";
            else
               document.getElementById("timer").innerHTML = "End Turn";
        }
        if(projectiles[0] != null) {
            if(projectiles[0].dx == 0 && projectiles[0].dy == 0) {
                console.log("tick..");
                exploding++;
            }
            if(exploding >= 3)
                forceExplosion = true;
        }
    }, 1000);
}