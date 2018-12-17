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
        this.lastWeapon = 0;
        this.aimX = 0;
        this.aimY = 0;
        this.angleAim = 0;
        this.weapon = 0;
    }

    static drawBaloons(array) {
        if(array.length!=0) {
            for(var n = 0; n < array.length; n++){
                ctx.beginPath();
                ctx.arc(array[n].x, array[n].y, array[n].ballRadius, 0, Math.PI*2);
                ctx.fillStyle = "#0095DD";
                ctx.fill();
                ctx.closePath();
            }
        }
    }

    static moveRight(array, p) {
        let obj = array[p];
        if(obj.x < canvas.width - obj.ballRadius && obj.y <= world[obj.x+1] + 3){ 
            if(obj.jumping)
                obj.x += 4;
            else
                obj.x += 2;
            if(obj.y > world[obj.x] + obj.ballRadius || obj.x < world[obj.x] + obj.ballRadius || obj.x > world[obj.x] + obj.ballRadius){
                if(obj.y > world[obj.x] - obj.ballRadius*2)
                    obj.y = world[obj.x] - obj.ballRadius;
            }
        }
    }

    static moveLeft(array, p) {
        let obj = array[p];
        if(obj.x > obj.ballRadius + 1 && obj.y <= world[obj.x-1] + 3) { 
            if(obj.jumping)
                obj.x -= 4;
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
            if(obj.hp < 1) {
                //TODO: death animation
                //TODO: call a function that sets myTurn of every Baloon # > i . Ballon.myTurn = array[pos]
                array.splice(i,1);
            }
            //gravity
            if(Math.abs(obj.y) < world[obj.x] - obj.ballRadius && !obj.goingUp){   //assoluto perché se vado sopra lo schermo devo tornare giù comunque
                array[i].y += obj.dy;
                if(obj.dy < 1) 
                    obj.dy = 1.05;
                else 
                    obj.dy *= 1.04;            
            }
        }
    }

    static weaponSwitchForward(array, turn){
        array[turn].lastWeapon = (array[turn].lastWeapon + 1) % WEAPON_NUMBER;
    }

    static weaponSwitchBackward(array, turn){
        array[turn].lastWeapon = (array[turn].lastWeapon - 1) % WEAPON_NUMBER;
    }

    //(x – h)^2 + (y – k)^2 = r^2       (h,k) = center
    static aimWeaponRight(array, turn){
        let obj = array[turn];
        obj.angleAim -= Math.PI * 5 / 180;
    }
    

    static aimWeaponLeft(array, turn){
        let obj = array[turn];
        obj.angleAim += Math.PI * 5 / 180;
    }

    static drawAim(array, turn){
        let obj = array[turn];
        var eAngle = 0;
        var sAngle = 0;
        //to see why sAngle and eAngle are like this:
        //https://www.w3schools.com/tags/canvas_arc.asp
        
        if(obj.aimX >= obj.x){      // ->
            if(obj.aimY < obj.y) {
                sAngle = Math.PI * 1.5;
                eAngle = Math.PI * 2;
            }
            else {
                sAngle = 0;
                eAngle = Math.PI * 0.5;
            }
        }
        
        else if(obj.aimX < obj.x){  //<-
            if(obj.aimY < obj.y) {
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
        ctx.arc(obj.x,obj.y,obj.ballRadius*3,sAngle,eAngle,false);
        ctx.strokeStyle = "#000000";
        ctx.stroke();
        ctx.closePath();

        //point of where you're actually aiming     (ctx.fillRect(10,10,1,1);   fill in the pixel at (10,10))
        //x = cx + r * cos(a) && y = cy + r * sin(a)
        //var angle = Math.atan2(obj.aimY - obj.y, obj.aimX - obj.x);       //OMEGALUL

        obj.aimX = obj.x + obj.ballRadius * Math.cos(obj.angleAim) * 3;
        obj.aimY = obj.y + obj.ballRadius * Math.sin(obj.angleAim) * 3;
        
        ctx.fillStyle = "#000000";
        ctx.fillRect(obj.aimX-2, obj.aimY-2, 4, 4);
    }
}