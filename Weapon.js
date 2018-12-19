"use strict"
//GPurgatorio - Final PI

class Weapon {

    constructor(x, y, dx, dy) { //, team, turn){
        this.x = x;
        this.y = y;
        this.dx = dx;
        this.dy = dy;
    }

    static shootDot(array, world){
        var obj = array[0];             //per ora non più di un proiettile per volta
        ctx.fillStyle = "#000000";
        obj.x += obj.dx/5;
        if(obj.dy < 0)
            obj.dy += 1;
        else if (obj.dy == 0)
            obj.dy = 10;
        else
            obj.dy = obj.dy * 1.1;
        obj.y += obj.dy;
        ctx.beginPath();
        ctx.fillRect(obj.x, obj.y, 10, 10);
        ctx.closePath();
        if(Math.floor(obj.y) > world[Math.floor(obj.x)] || obj.x < 0 || obj.x > canvas.width || obj.y > canvas.heigth){
            array.splice(0,1);
        }
    }
}