"use strict"
//GPurgatorio - Final PI

//global settings
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var menu = false;
var world = [];
var frase = "Seleziona uno dei pulsanti per maggiori info."

//gameLogic settings
var adding = false;
var editing = false;
var removing = false;
var adding = false;
var dragging = false;
var set = false;
var winnable = false;
var ended = false;
var gameStarted = false;
var antiBugBoolean = false;
var aiming = false;
var shooting = false;
var alreadyShot = false;
var projectileRIP = false;
var stopMoving = false;
var deadBaloon = false;
var doubleBufferCnt = 0;
var doubleBuffer = false;
var indestructibleTerrain = false;
var forceExplosion = false;
var sbadabum = 0;
var exploding = 0;

//gameLogic vars
var PALLONI = [];
var projectiles = [];
var cnt = 0;
var team = 0;
var turn = 0;
var ballSensitivity = 3;
var w;
var relativeX;
var relativeY;
var explosionImg = new Image();

//event listeners
document.addEventListener("keyup", keyUpHandler, false);  
document.addEventListener("keydown", keyDownHandler, false);           
document.addEventListener("mouseup", addBaloon, false); 
document.addEventListener("mousemove", mouseMoveHandler, false);        
document.addEventListener("click", mouseClickHandler, false);           
           

//actual flow of the program
setupVariables();
//setInterval(gameLoop,1000/60);  
gameLoop();

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

    explosionImg.src = 'images/explosion.png';
    
    document.getElementById("slider").value = ballSensitivity;
    updateSliderValue();
}

//what actually happens in the game 60 times/second
function gameLoop(){

    cnt = PALLONI.length;

    ctx.clearRect(0, 0, canvas.width, canvas.height);       //clear previous screen
    worldMap.drawWorld(world);                              //draw terrain + sky
    
    if(!gameStarted) {
        if(editing || adding) {
            drawCursorIndicator();
        }
        if(PALLONI.length != 0) {
            Baloon.drawBaloons(PALLONI);                        //draw every Baloon in its position
            Baloon.updateBaloons(PALLONI);                      //update the state of every Baloon (e.g. gravity)
        }
    }

    if(gameStarted) {

        if(cnt > 1)
            winnable = true;

        if(!ended && winnable && cnt == 1) {
            alert("Fine!");
            ended = true;
        }

        if(!set && !ended) {                                //timer
            set = true;
            updateGameState();
        }

        if(deadBaloon && turn == cnt) {                    
            antiBugBoolean = true;
            turn = 0;
        }

        if(PALLONI.length!=0) {
            if(PALLONI[turn] == null || PALLONI[turn].hp <= 0)
                deadBaloon = true;

            Baloon.drawBaloons(PALLONI);
            Baloon.updateBaloons(PALLONI);

            if(!deadBaloon) {
                Baloon.movementTurn(PALLONI, turn);
            
                if(aiming)                                              
                    Baloon.drawAim(PALLONI, turn);
            }

            if(sbadabum > 0)
                Weapon.drawIntensity(sbadabum, PALLONI, turn); 

            if(projectiles.length != 0) {                           
                alreadyShot = true;
                if(projectiles[0].weapon == 0)
                    Weapon.shootRect(projectiles);

                else if(projectiles[0].weapon == 1) 
                    Weapon.shootBall(projectiles, world);
            
                else if (projectiles[0].weapon == 2) {
                    if(doubleBufferCnt < 45 || doubleBuffer)
                        Weapon.shootAnalogClock(projectiles);
                    else if(doubleBufferCnt >= 60)
                        doubleBufferCnt = 0;
                    doubleBufferCnt = (doubleBufferCnt + 1);
                }

                //if projectile shot goes beyond the canvas in some direction (not topside)
                if(projectiles[0].x < 0 || projectiles[0].x > canvas.width || projectiles[0].y > canvas.height)
                    projectiles.splice(0,1);
                
                else if(projectiles[0].weapon == 1) {
                    if(projectiles[0].dx < 0) {
                        if(world[Math.floor(projectiles[0].x)] > world[Math.floor(projectiles[0].x) - ballSensitivity]) {
                            projectileRIP = true;
                        }
                    }
                    else {
                        if(world[Math.floor(projectiles[0].x)] > world[Math.floor(projectiles[0].x) + ballSensitivity]) {
                            projectileRIP = true;
                        }
                    }
                }
                //if stucked at some point, forcing explosion || projectile shot hits the ground
                else if(forceExplosion || (Math.floor(projectiles[0].y) > world[Math.floor(projectiles[0].x)])) {
                    if(projectiles[0].weapon == 0) {
                        projectileRIP = true;
                    }
                    else if(projectiles[0].weapon == 2 && forceExplosion) {
                        projectileRIP = true;
                    }
                }

                if(projectileRIP) {
                    var pCoordX = projectiles[0].x - 20;
                    ctx.beginPath();
                    ctx.drawImage(explosionImg, pCoordX, projectiles[0].y, 75, 75);
                    ctx.closePath();
                    Baloon.hitBaloons(PALLONI, projectiles[0].x, projectiles[0].weapon);
                    if(!indestructibleTerrain)
                        worldMap.terrainHit(world, projectiles[0].x, projectiles[0].y, projectiles[0].weapon);
                    projectiles.splice(0,1);
                }
            }
        }
    }
    requestAnimationFrame(gameLoop);
}

function keyDownHandler(e) {
   
    if(gameStarted) {
        
        if(!stopMoving) {                  
            if(e.keyCode == 37) {                                      //classic keys movement
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
                Baloon.announceWeapon(PALLONI, turn);
            }
        }

        if(e.keyCode == 32 && !alreadyShot && aiming) {                       //"spacebar" key, shoot
            if(sbadabum < 10)
                sbadabum++;
            shooting = true;
            stopMoving = true;
        }
            
        if(e.keyCode == 187)                                        //the "+" key, change weapon (->)
            Baloon.weaponSwitchForward(PALLONI, turn); 
        if(e.keyCode == 189)                                        //the "-" key, change weapon (<-)
            Baloon.weaponSwitchBackward(PALLONI, turn);

        if(e.keyCode == 27) {                                        //the "esc" key, menù
            menu = true;
            if(menu)
                slidePause();
        }
    }

    if(e.keyCode == 191) {                                          //debug purpose, "ù" 
        //insert foo to debug here
        ;
    }
}

function keyUpHandler(e) {
    if(gameStarted && PALLONI.length != 0 && !alreadyShot) {
        if(e.keyCode == 32 && aiming) {
            w = new Weapon(PALLONI[turn].x, PALLONI[turn].y, PALLONI[turn].aimX, PALLONI[turn].aimY, sbadabum, PALLONI[turn].weapon)
            if(PALLONI[turn].weapon == 1)   //sfera
                w.x += PALLONI[turn].aimX/10;
            projectiles.push(w);
            stopMoving = false;
            sbadabum = 0;
        }
    }
}

function mouseClickHandler(e){
    if(editing)
        dragging = !dragging;
}

function addBaloon(e) {
    if(!editing && !gameStarted) {
        relativeX = e.clientX - canvas.offsetLeft;
        relativeY = e.clientY - canvas.offsetTop;
        if(adding && relativeY < world[relativeX]) {
            document.getElementById("tooltip").innerHTML="Aggiungi quanti Baloons desideri!";
            PALLONI.push(new Baloon(relativeX, relativeY, cnt));       
            cnt++;
        }
        else {
            if(adding) {
                document.getElementById("tooltip").innerHTML="Impossibile far nascere Baloons nel terreno! Clicka nel cielo.";
            }
        }
    }
}

function mouseMoveHandler(e) {
    relativeX = e.clientX - canvas.offsetLeft;
    relativeY = e.clientY - canvas.offsetTop;
    if(editing) {
        if(relativeX < canvas.width && dragging && (relativeY < world[relativeX] + 20 && (relativeY > world[relativeX]))) {
            if(removing)
                worldMap.removeWorldPart(world, relativeX, relativeY);
        }
    }
}

function drawCursorIndicator(){
    ctx.beginPath();
    ctx.arc(relativeX, relativeY, 10, 0, Math.PI*2);
    if(adding)
        ctx.fillStyle = "#A9A9A9";
    else if(!dragging)
        ctx.fillStyle = "#008B8B";
    else
        ctx.fillStyle = "#FF0000";
    ctx.fill();
    ctx.closePath();
}

function checkMap(world) {

    for(var i=0; i<world.length -1; i++) {
        if(world[i] > world[i+1] + 13 || world[i] < world[i+1] - 13) {
            return true;
        }
    }
    
    return false;
}

function fixWorld() {
    worldMap.fixWorld(world);
    document.getElementById("tooltip").innerHTML="Rende il terreno meno seghettato.";
}

//timer
function updateGameState(){
    document.getElementById("announcer").innerHTML="Tocca a Baloon#" + turn + "!";
    deadBaloon = false;
    stopMoving = false;
    forceExplosion = false;
    alreadyShot = false;
    projectileRIP = false;
    shooting = false;
    exploding = 0;
    antiBugBoolean = false;
    var alreadyDidThis = false;
    var countDown = 20000;
    var now = 0;
    var a = setInterval(function() {
        if(!menu && !ended) {
            
            var distance = countDown - now;
            var seconds;
            now += 1000;

            if(distance >= 0)
                seconds = Math.floor((distance % (1000 * 60)) / 1000);
            else
                seconds = 0;

            if(shooting == true) {
                if(seconds > 4 && !alreadyDidThis) {
                    countDown = 4000;
                    now = 0;
                    seconds = 4;
                    alreadyDidThis = true;
                }
            }

            //Shows seconds left for the turn
            document.getElementById("timer").innerHTML = seconds + "s ";

            if(distance <= 0) 
                stopMoving = true;

            if (projectiles[0] == null && (distance <= 0 || deadBaloon || antiBugBoolean)) {
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
                    exploding++;
                }
                if(exploding >= 3)
                    forceExplosion = true;
            }
        }
    }, 1000);
}