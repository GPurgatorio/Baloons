"use strict"

/**
 * Final PI - Baloons
 * 
 * Baloons is a Worms-like game that I created for the "Interface Programming"'s exam @Pisa's University (2018-2019, Italy).
 * 
 * This code is my first attempt at coding in Javascript and, when I was coding this, I wasn't really paying attention
 * for the code's quality or other good practices, I was just following the line of my twisted mind.
 *      If you're here to learn Javascript, please go somewhere else.
 *      If you're here to see how good my code is, please check other projects or simply ask me for my private ones.
 * No, the teacher wouldn't (and didn't) look at the code, he just wanted to check the results.
 * 
 * I'll from time to time try to refactor this code, but you could be reading this in 2040 and I might still have this
 * Frankenstein-ish creation.
 * 
 * I miss many constants, like radius of the Baloons, (max) seconds to retreat after shooting, etc
 *      Every single number you'll see in this code is probably a missed constant.
 * 
 * If you're here to have a laugh tho, let's go! I always laugh every time I read this thing ahah
 * 
 * No libraries were used in the creation of this game, so I kinda had to reimplement everything I needed.
 * 
 * GPurgatorio      -       https://github.com/GPurgatorio
 *  */ 



/*  Global settings  */
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var menu = false;
var world = [];
var frase = "Seleziona uno dei pulsanti per maggiori info."


/*  GameLogic settings  */
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
var moveUp = false;
var moveDown = false;
var moveLeft = false;
var moveRight = false;
var aimRight = false;
var aimLeft = false;


/*  GameLogic vars  */
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


/*     Event listeners     */
document.addEventListener("keyup", keyUpHandler, false);  
document.addEventListener("keydown", keyDownHandler, false);           
document.addEventListener("mouseup", addBaloon, false); 
document.addEventListener("mousemove", mouseMoveHandler, false);        
document.addEventListener("click", mouseClickHandler, false);           
           


/*   Actual flow of the program   */
setupVariables();       
setupGame();
/*   End of flow    */



/** Functions */


/*   Sets up used variables   */
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


/*  Simple game setting  */
function setupGame() {
    drawWorld();
    drawBaloons();
    if(!gameStarted) 
        requestAnimationFrame(setupGame);
    else { 
        if(cnt > 1)                                         // If there's at least 2 Baloons, it's a Deathmatch
            winnable = true;                                // therefore it's a legal game
        
        gameLoop();
    }
}


/*     What actually happens in the game     */
function gameLoop(){
    
    if(!ended && winnable && cnt == 1) {                // If it was a legal game and only one Baloon left
        alert("The end!");                              // the game has ended with a winner!
        ended = true;
    }

    if(!set && !ended) {                                // "When I wrote this, only 
        set = true;                                     //      God and I understood what I was doing.
        updateGameState();                              //          ... Now, God only knows."
    }

    if(deadBaloon) {                                    // I really can't remember why this is like this but :^)
        if(turn == cnt)                                 // This one simply checks if the last Baloon died (a.k.a. "turn" % cnt)
            turn = 0;          
        else
            antiBugBoolean = true;                      // I remember it caused a bug in the turns, but ugh dunno
    }

    // If there are Baloons alive..
    if(PALLONI.length!=0) {        
        
        // If this/last Baloon's dead, let's remember that
        if(PALLONI[turn] == null || PALLONI[turn].hp <= 0)
            deadBaloon = true;

        drawWorld();
        drawBaloons();
        aimWeapon();

        // If the Baloon that's playing is not dead, then.. let him play
        if(!deadBaloon) {
            
            Baloon.movementTurn(PALLONI, turn);
            moveBaloon();                                           
        }

        // Please just laugh with me with these variables names
        if(sbadabum > 0)
            Weapon.drawIntensity(sbadabum, PALLONI, turn); 

        // I have an array of projectiles because maybe I wanted to shoot with weapons that had more projectiles at once
        if(projectiles.length != 0) {                           

            // But guess what, this array will only be used at index 0 because I only have weapons with one projectile :^)
            shootThe0Index();
            
            // Has science gone too far? And what about method's naming?
            hasTheProjectileGoneTooFar();
        }
    }

    // Repeat this quality code over and over baby
    requestAnimationFrame(gameLoop);
}


// Draws the background
function drawWorld() {
    cnt = PALLONI.length;

    // Clears previous screen
    ctx.clearRect(0, 0, canvas.width, canvas.height);          
    
    // Draws terrain and sky
    worldMap.drawWorld(world);
    
    if(!gameStarted) {
        
        if(editing || adding) {
            // Shows the cursor depending on the actual setting
            drawCursorIndicator();
        }
    }
}



// Draws the Baloons (and calls gravity et similia on them because YES)
function drawBaloons() {
    if(PALLONI.length != 0) {
        // Draws every Baloon in its position
        Baloon.drawBaloons(PALLONI);         
        
        // Updates the state of each Baloon (e.g. gravity)
        Baloon.updateBaloons(PALLONI);                      
    }
}


// Juuuuust move the Baloon
function moveBaloon () {
    if(gameStarted && !stopMoving) {                  
        if(moveLeft) {
            Baloon.moveLeft(PALLONI,turn);
            aiming = false;
        }
        if(moveRight) {
            Baloon.moveRight(PALLONI,turn);
            aiming = false;
        }
        if(moveDown) {
            Baloon.moveDown(PALLONI,turn);
            aiming = false;
        }
        if(moveUp) {
            Baloon.moveUp(PALLONI,turn);
            aiming = false;
        }
    }
}


// Iiiiiiiit shows where you're aiming
function aimWeapon() {
    if(aimRight)
        Baloon.aimWeaponRight(PALLONI, turn);

    else if (aimLeft)
        Baloon.aimWeaponLeft(PALLONI, turn);

    Baloon.announceWeapon(PALLONI, turn);

    if(aiming)
        Baloon.drawAim(PALLONI, turn);
}


// Kaboom
function shoot() {
    if(gameStarted && !alreadyShot) {
        var t = PALLONI[turn];
        w = new Weapon(t.x, t.y, t.aimX, t.aimY, sbadabum, t.weapon)
        
        if(t.weapon == 1)   
            w.x += t.aimX/10;
        
        projectiles.push(w);
        alreadyShot = true;                                     // Can't shoot twice / turn
        stopMoving = false;
        sbadabum = 0;
    }
}

// This one shoots the projectile at index 0 (big motivation wrote in gameLoop ())
function shootThe0Index() {
    if(projectiles[0].weapon == 0)
        Weapon.shootRect(projectiles);

    else if(projectiles[0].weapon == 1) 
        Weapon.shootBall(projectiles, world);

    // "Double Buffer" is an Easter Egg of our course, don't mind it. It simply simulates the flickering
    else if (projectiles[0].weapon == 2) {
        
        if(doubleBufferCnt < 45 || doubleBuffer)
            Weapon.shootAnalogClock(projectiles);
        
        else if(doubleBufferCnt >= 60)
            doubleBufferCnt = 0;
        
        doubleBufferCnt = (doubleBufferCnt + 1);
    }
}


// It checks if the projectile should explode or is simply out of the canvas
function hasTheProjectileGoneTooFar() {
    // If projectile goes beyond the canvas in some direction (but not topside, so it can fall back down)
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

    // If projectile shot hits the ground or [check at the end of the code updateGameState()]
    else if(forceExplosion || (Math.floor(projectiles[0].y) > world[Math.floor(projectiles[0].x)])) {
        if(projectiles[0].weapon == 0) {
            projectileRIP = true;
        }
        else if(projectiles[0].weapon == 2 && forceExplosion) {
            projectileRIP = true;
        }
    }

    // I seriously have too much fun naming these, "if the projectile has to explode.."
    if(projectileRIP) {
        var pCoordX = projectiles[0].x - 20;

        // This was just to test img loading, to show that "Baloons" can be actual Worms if you have the JPG or w/e
        ctx.beginPath();
        ctx.drawImage(explosionImg, pCoordX, projectiles[0].y, 75, 75);
        ctx.closePath();

        Baloon.hitBaloons(PALLONI, projectiles[0].x, projectiles[0].weapon);

        // If the terrain isn't indestructible, damage it
        if(!indestructibleTerrain)
            worldMap.terrainHit(world, projectiles[0].x, projectiles[0].y, projectiles[0].weapon);
        
        projectiles.splice(0,1);
    }
}



// Triple-nested if for really practical and intuitive debugging
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


// I'm not even following a pattern, sometimes I update booleans, sometimes I directly call methods.. Oh God
function keyDownHandler(e) {
   
    if(gameStarted) {
                  
        if(e.keyCode == 37) {                                      // Classic movements
            moveLeft = true;
            aiming = false;
        }
        if(e.keyCode == 39) {
            moveRight = true;
            aiming = false;
        }
        if(e.keyCode == 40) {
            moveDown = true;
            aiming = false;
        }
        if(e.keyCode == 38) {
            moveUp = true;
            aiming = false;
        }
    
        if(e.keyCode == 69 || e.keyCode == 81) {
            if (e.keyCode == 69)                                    // The "e" key, aim (->)
                aimRight = true;
            else                                                    // The "q" key, aim (<-)
                aimLeft = true;
            aiming = true;
        }

        if(e.keyCode == 32 && !alreadyShot && aiming) {             // The "spacebar" key, shoot
            if(sbadabum < 10)
                sbadabum++;
            shooting = true;
            stopMoving = true;                                      // Can't move while shooting
        }
            
        if(e.keyCode == 187)                                        // The "+" key, change weapon (->)
            Baloon.weaponSwitchForward(PALLONI, turn); 
        if(e.keyCode == 189)                                        // The "-" key, change weapon (<-)
            Baloon.weaponSwitchBackward(PALLONI, turn);

        if(e.keyCode == 27) {                                       // The "esc" key, menù
            menu = true;
            slidePause();
        }
    }

    if(e.keyCode == 191) {                                          // Debug purpose, the "ù" key
        //insert foo to debug here
        ;
    }
}

function keyUpHandler(e) {
        
        if(e.keyCode == 37)                                         // Classic keys movement
            moveLeft = false;

        if(e.keyCode == 39)
            moveRight = false;

        if(e.keyCode == 40)
            moveDown = false;

        if(e.keyCode == 38) 
            moveUp = false;
        
        if(e.keyCode == 32 && aiming) 
            shoot();

        if(e.keyCode == 69 || e.keyCode == 81) {
            if (e.keyCode == 69)                                    // The "e" key, aim (->)
                aimRight = false;
            else                                                    // The "q" key, aim (<-)
                aimLeft = false;
        }
}

function mouseClickHandler(e){
    if(editing)
        dragging = !dragging;
}


// This one adds a Baloon in the point you're clicking (if you're adding Baloons)
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


// This just shows a circle around your pointer
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


// This one is an oversemplification of what a well-defined terrain is like
//      ... yeah I might have brute forced it 'till it pleased my eye
function checkMap(world) {

    for(var i=0; i<world.length -1; i++) {
        if(world[i] > world[i+1] + 13 || world[i] < world[i+1] - 13) {
            return true;
        }
    }
    
    return false;
}

// This smooths the terrain a bit
function fixWorld() {
    worldMap.fixWorld(world);
    document.getElementById("tooltip").innerHTML="Rende il terreno meno seghettato.";
}


// Timer related events
function updateGameState(){

    document.getElementById("announcer").innerHTML="Tocca a Baloon#" + turn + "!";
    
    // Well it's a new turn so lets put everything at its place
    deadBaloon = false;
    stopMoving = false;
    forceExplosion = false;
    alreadyShot = false;
    projectileRIP = false;
    shooting = false;
    exploding = 0;
    antiBugBoolean = false;
    
    // And lets use some more variables to do other stuff
    var alreadyDidThis = false;
    var countDown = 20000;
    var now = 0;
    var a = setInterval(function() {
        
        // Calculates seconds left 'till turn's over
        if(!menu && !ended) {
            
            var distance = countDown - now;
            var seconds;
            now += 1000;

            if(distance >= 0)
                seconds = Math.floor((distance % (1000 * 60)) / 1000);
            else
                seconds = 0;

            // If you shot, then you have (max) 4 seconds left to run
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

            // If there's no time left, you won't be able to move anymore this turn
            if(distance <= 0) 
                stopMoving = true;

            // Ok I think this is "if your turn is over" (no projectiles on screen && no time left, or your dead, or that.. Idk)
            if (projectiles[0] == null && (distance <= 0 || deadBaloon || antiBugBoolean)) {
                
                clearInterval(a);
                
                PALLONI[turn].goingUp = false;
                set = false;
                shooting = false;
                sbadabum = 0;            

                // If there are no dead Baloons, increase counter to go let the next one play
                if(!deadBaloon)
                    turn = (turn + 1) % cnt;        // (this because killing a Baloon calls the splice() method)
                
                // Good quality code here 
                if(ended)
                    document.getElementById("timer").innerHTML = "Thanks for playing!";
                else
                    document.getElementById("timer").innerHTML = "End Turn";

            }

            // And this is because the "special weapon" (Analog Clock) has it's own behavious (Holy Grenade)
            if(projectiles[0] != null) {

                // Dx and Dy are for how much the projectile has to move in the X (or Y) axis
                // So if they're both == 0, the projectile is surely standing still forever
                if(projectiles[0].dx == 0 && projectiles[0].dy == 0) {
                    exploding++;
                }

                // If it has been standing still for 3 seconds, then let the grenade explode
                if(exploding >= 3)
                    forceExplosion = true;
            }
        }
    }, 1000);
}