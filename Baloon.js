"use strict"
//GPurgatorio - Final PI

class Baloon {

    constructor(coordX, coordY, count) { //, team, turn){
        this.x = coordX;
        this.y = coordY;
        this.ballRadius = 10;
        this.dx = 2;
        this.dy = -2;
        this.jumping = false;
        this.goingUp = false;
        this.myTurn = count;
        this.hp = 100;
        this.aimX = 0;
        this.aimY = 0;
        this.angleAim = 0;
        this.weapon = 0;
        this.color = Baloon.getRandomColor();           //some colors are not appreciated with the background eheh
    }

    static getRandomColor() {
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    static drawBaloons(array) {
        if(array.length!=0) {
            for(var n = 0; n < array.length; n++){
                var obj = array[n];
                ctx.beginPath();
                ctx.arc(obj.x, obj.y, obj.ballRadius, 0, Math.PI*2);
                ctx.fillStyle = obj.color;
                ctx.fill();
                if(obj.weapon == 0)
                    ctx.fillText("Arma: Bazooka", obj.x, obj.y - obj.ballRadius - 5);
                else if(obj.weapon == 1)
                    ctx.fillText("Arma: Sfera", obj.x, obj.y - obj.ballRadius - 5);        
                else if(obj.weapon == 2)
                    ctx.fillText("Arma: Analog Clock", obj.x, obj.y - obj.ballRadius - 5);
                ctx.closePath();
            }
        }
    }

    static moveRight(array, p) {
        let obj = array[p];
        if(obj.x < canvas.width - obj.ballRadius && obj.y <= world[obj.x+1] + 3){ 
            var t = Math.floor(obj.y) + obj.ballRadius;
            var z = Math.floor(world[obj.x]);
            if(t < z) {
                obj.x += 4;
            }
            else                                    //no collisioni
                obj.x += 2; 
            /*else if(!worldMap.isOccupied(PALLONI, obj.x, p)) {
                obj.x += 2;
                console.log("Not occupied (R)");
            }
            if(worldMap.isOccupied(PALLONI, obj.x, p)){
                console.log("Sovrapposizione");
                obj.y = world[obj.x] - obj.ballRadius * 2;
            }
            else */if(obj.y > world[obj.x] + obj.ballRadius || obj.x < world[obj.x] + obj.ballRadius || obj.x > world[obj.x] + obj.ballRadius){
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
                obj.x -= 4;
            }
            else 
                obj.x -= 2;
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
            obj.dy = -13;
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

    static updateBaloons(array) {
        for(var i = 0; i < array.length; i++) {
            var obj = array[i];
            
            if(obj.hp <= 0) {
                //TODO: death animation
                //TODO: call a function that sets myTurn of every Baloon # > i . Ballon.myTurn = array[pos]
                array.splice(i,1);
            }
            //gravity
            else if(Math.abs(obj.y) < world[obj.x] - obj.ballRadius && !obj.goingUp){
                array[i].y += obj.dy;
                if(obj.dy < 1) 
                    obj.dy = 1.05;
                else 
                    obj.dy *= 1.04;            
            }
        }
    }

    static weaponSwitchForward(array, turn){
        var obj = array[turn];
        obj.weapon = (obj.weapon + 1) % Baloon.WEAPON_NUMBER;
    }

    static weaponSwitchBackward(array, turn){
        var obj = array[turn];
        if(obj.weapon != 0)
            obj.weapon = obj.weapon - 1;
        else
            obj.weapon = Baloon.WEAPON_NUMBER - 1;
    }

    static aimWeaponRight(array, turn){
        let obj = array[turn];
        obj.angleAim += Math.PI * 5 / 180;
    }
    
    static aimWeaponLeft(array, turn){
        let obj = array[turn];
        obj.angleAim -= Math.PI * 5 / 180;
    }

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
        
        else if(obj.aimX < 0){  //<-
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

        //point of where you're actually aiming     (ctx.fillRect(10,10,1,1);   fill in the pixel at (10,10))
        //x = cx + r * cos(a) && y = cy + r * sin(a)
        //var angle = Math.atan2(obj.aimY - obj.y, obj.aimX - obj.x);       

        obj.aimX = obj.ballRadius * Math.cos(obj.angleAim) * 3;
        obj.aimY = obj.ballRadius * Math.sin(obj.angleAim) * 3;
        
        ctx.fillStyle = "#000000";
        ctx.fillRect(obj.x + obj.aimX -2, obj.y + obj.aimY -2, 4, 4);
    }

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
            //console.log("Se obj.x " + obj.x + " > t: " + t + " OR obj.x < " + z);
            if(Math.floor(obj.x) > t && Math.floor(obj.x) < z) {
                dmg -= Math.abs(coordX - obj.x);
                obj.hp -= Math.floor(dmg);
                //console.log("Hit for " + dmg + " hp");
            }
        }

    }
}