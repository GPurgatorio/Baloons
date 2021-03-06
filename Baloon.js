"use strict"
//GPurgatorio - Final PI

class Baloon {

    constructor(coordX, coordY) { //, team, turn){
        
        this.x = coordX;
        this.y = coordY;
        this.ballRadius = Baloon.BALOON_RADIUS;
        this.dx = 2;
        this.dy = -2;
        this.jumping = false;
        this.goingUp = false;
        this.hp = Baloon.MAX_HP;
        this.aimX = 5;
        this.aimY = 5;
        this.angleAim = Math.PI * 1.75;
        this.weapon = 0;

        // Some colors aren't good for the background, but I didn't care about it
        this.color = Baloon.getRandomColor();
    }

    // Gets a random color for the baloon
    static getRandomColor() {
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    // Draws every Baloon
    static drawBaloons(array) {
        if(array.length!=0) {
            for(var n = 0; n < array.length; n++){
                var obj = array[n];
                
                ctx.beginPath();
                ctx.arc(obj.x, obj.y, obj.ballRadius, 0, Math.PI*2);
                ctx.fillStyle = obj.color;
                ctx.fill();
                ctx.fillText(obj.hp, obj.x - 8, obj.y - obj.ballRadius - 5);
                ctx.closePath();
            }
        }
    }

    // Movements (right, left, jump, down)
    static moveRight(array, p) {
        let obj = array[p];
        if(obj.x < canvas.width - obj.ballRadius && obj.y <= world[obj.x+1] + 3){ 
            var t = Math.floor(obj.y) + obj.ballRadius;
            var z = Math.floor(world[obj.x]);
            if(t < z) {
                obj.x += 2;
            }
            else if(world[obj.x] + 20 > world[obj.x+1] || world[obj.x] < world[obj.x+1])  //check                                 //no collisioni
                obj.x += 1; 
            
            if(obj.y > world[obj.x] + obj.ballRadius || obj.x < world[obj.x] + obj.ballRadius || obj.x > world[obj.x] + obj.ballRadius){
                if(obj.y > world[obj.x] - obj.ballRadius*2)
                    obj.y = world[obj.x] - obj.ballRadius;
            }
        }
    }

    static moveLeft(array, p) {
        let obj = array[p];
        if(obj.x > obj.ballRadius + 1 && obj.y <= world[obj.x-1] + 3) { 
            var t = Math.floor(obj.y) + obj.ballRadius;
            var z = Math.floor(world[obj.x]);
            if(t < z) {
                obj.x -= 2;
            }
            else if(world[obj.x] + 20 > world[obj.x-1] || world[obj.x] < world[obj.x-1])
                obj.x -= 1;
            if(obj.y > world[obj.x] + obj.ballRadius || obj.x < world[obj.x] + obj.ballRadius || obj.x > world[obj.x] + obj.ballRadius) {
                //if I'm not in the air due to jumping..
                if(obj.y > world[obj.x] - obj.ballRadius*2)
                    obj.y = world[obj.x] - obj.ballRadius;
            }
        }
    }

    static moveUp(array, p) {
        let obj = array[p];
        if(obj.y >= world[obj.x] - obj.ballRadius) {
            obj.jumping = true;
            obj.goingUp = true;
            obj.dy = -11;
        }
    }

    static moveDown(array, p){
        let obj = array[p];
        let relY = obj.y;
        let relX = obj.x;
        if(relY < world[relX] - obj.ballRadius) {
            obj.y += 2;
        }
    }

    // Something like "environment movement", like you can't jump in air, if you're jumping you go up by a bit, etc..
    static movementTurn(array, p){
        let obj = array[p];
        let relX = obj.x;
        let relY = obj.y;

        if(relY >= world[relX] - obj.ballRadius && relY < world[relX]){
            obj.jumping = false;
        }
        if(obj.dy >= 0){
            obj.goingUp = false;
        }
        if(obj.goingUp && obj.dy != 0){
            obj.y += obj.dy;
            obj.dy += 1;
        }
        if(obj.y < 10)
            obj.y = 10;
        if(obj.y > canvas.height)
            obj.hp = 0;

    }

    // Checks if there are dead Baloons and applies gravity to every Baloon that's alive
    static updateBaloons(array) {
        for(var i = 0; i < array.length; i++) {
            var obj = array[i];
            
            if(obj.hp <= 0) {
                someoneIsDead(i);               // gameLogic.js
                array.splice(i,1);
                i--;
                continue;
            }
            // Gravity
            else if(Math.abs(obj.y) < world[obj.x] - obj.ballRadius && !obj.goingUp){
                array[i].y += obj.dy;
                if(obj.dy < 1) 
                    obj.dy = 1.05;
                else 
                    obj.dy *= 1.04;            
            }
        }
    }

    // Bazooka -> Sfera -> Analog Clock -> Bazooka -> ...
    static weaponSwitchForward(array, turn){
        var obj = array[turn];
        obj.weapon = (obj.weapon + 1) % Baloon.WEAPON_NUMBER;
        if(obj.weapon == 0)
            document.getElementById("announcer").innerHTML="Arma attuale: Bazooka";
        else if(obj.weapon == 1)
            document.getElementById("announcer").innerHTML="Arma attuale: Sfera";
        else if(obj.weapon == 2)
            document.getElementById("announcer").innerHTML="Arma attuale: Analog Clock";
    }

    // The opposite order, Bazooka -> Analog Clock -> Sfera -> Bazooka -> ...
    static weaponSwitchBackward(array, turn){
        var obj = array[turn];
        if(obj.weapon != 0)
            obj.weapon = obj.weapon - 1;
        else
            obj.weapon = Baloon.WEAPON_NUMBER - 1;
        if(obj.weapon == 0)
            document.getElementById("announcer").innerHTML="Arma attuale: Bazooka";
        else if(obj.weapon == 1)
            document.getElementById("announcer").innerHTML="Arma attuale: Sfera";
        else if(obj.weapon == 2)
            document.getElementById("announcer").innerHTML="Arma attuale: Analog Clock";
    }

    // Aim to the right
    static aimWeaponRight(array, turn){
        let obj = array[turn];
        obj.angleAim += Math.PI * 3 / 180;
    }
    
    // Aim to the left
    static aimWeaponLeft(array, turn){
        let obj = array[turn];
        obj.angleAim -= Math.PI * 3 / 180;
    }

    // Draws the correct quadrant you're aiming and draws where you're aiming
    static drawAim(array, turn){
        let obj = array[turn];
        var eAngle = 0;
        var sAngle = 0;
        //to see why sAngle and eAngle are like this:
        //https://www.w3schools.com/tags/canvas_arc.asp
        
        if(obj.aimX >= 0){      // ->
            if(obj.aimY < 0) {
                sAngle = Math.PI * 1.5;
                eAngle = Math.PI * 2;
            }
            else {
                sAngle = 0;
                eAngle = Math.PI * 0.5;
            }
        }
        
        else if(obj.aimX < 0){  // <-
            if(obj.aimY < 0) {
                sAngle = Math.PI;
                eAngle = Math.PI * 1.5; 
            }
            else {
                sAngle = Math.PI * 0.5;
                eAngle = Math.PI;
            }
        }

        //quarter of circle
        ctx.beginPath();
        ctx.arc(obj.x, obj.y, obj.ballRadius*3, sAngle, eAngle, false);
        ctx.strokeStyle = "#000000";
        ctx.stroke();
        ctx.closePath();

        //x = cx + r * cos(a) && y = cy + r * sin(a)
        //var angle = Math.atan2(obj.aimY - obj.y, obj.aimX - obj.x);       

        obj.aimX = obj.ballRadius * Math.cos(obj.angleAim) * 3;
        obj.aimY = obj.ballRadius * Math.sin(obj.angleAim) * 3;
        
        ctx.fillStyle = "#000000";
        ctx.fillRect(obj.x + obj.aimX -2, obj.y + obj.aimY -2, 4, 4);
    }

    // Simple damage calculation
    static hitBaloons(array, coordX, weaponType){
        var dmg, radius;
        if(weaponType == 0) { 
            dmg = 50;
            radius = 25;
        }
        else if(weaponType == 1) {
            dmg = 20;
            radius = 35;
        }
        else if(weaponType == 2) {
            dmg = 80;
            radius = 50;
        }
        else 
            console.log("Baloon.hitBaloons, weaponType non riconosciuta");
        for(var n = 0; n < array.length; n++){
            var obj = array[n];
            var t = Math.floor(coordX) - radius;
            var z = Math.floor(coordX) + radius;

            if(Math.floor(obj.x) > t && Math.floor(obj.x) < z) {
                dmg -= Math.abs(coordX - obj.x);
                obj.hp -= Math.abs(Math.floor(dmg));
            }
        }

    }

    // Announcer text
    static announceWeapon(array, turn) {
        var obj = array[turn];
        if(obj.weapon == 0)
            document.getElementById("announcer").innerHTML="Bazooka";
        else if(obj.weapon == 1)
            document.getElementById("announcer").innerHTML="Sfera";
        else if(obj.weapon == 2)
            document.getElementById("announcer").innerHTML="Analog Clock";
    }
}