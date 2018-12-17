"use strict"
//GPurgatorio - Final PI

class Weapon {

    static shootDot(array, turn){
        var obj = array[turn];
        var projectileX = obj.aimX + obj.x;
        var projectileY = obj.aimY + obj.y;
        ctx.fillStyle = "#000000";
        while(projectileY <= world[projectileX]){
            console.log("calculating");
            projectileY *= 1.02;
            projectileX += Math.cos(obj.angleAim);
            ctx.fillRect(projectileX,projectileY,2,2);
        }
    }
}