"use strict"
//GPurgatorio - Final PI

class Weapon {

    constructor(x, y, dx, dy, sbadabum, weapon) { //, team, turn){
        this.x = x;
        this.y = y;
        this.dx = dx;
        this.dy = dy * sbadabum/10;
        this.weapon = weapon;
    }

    static drawIntensity(intensity, array, pos) {
        var obj = array[pos];
        var x = obj.ballRadius * Math.cos(obj.angleAim) * 3;
        var y = obj.ballRadius * Math.sin(obj.angleAim) * 3;
        ctx.beginPath();
        ctx.strokeStyle="#000000"; 
        ctx.moveTo(obj.x, obj.y);
        ctx.lineTo(obj.x + x*intensity/10, obj.y + y*intensity/10);
        ctx.stroke();
        ctx.closePath();
    }

    static shootRect(array) {      //power 
        var obj = array[0];             //per ora non più di un proiettile per volta
        ctx.fillStyle = "#000000";
        obj.x += obj.dx/5;
        obj.dy += 0.5;
        obj.y += obj.dy;
        ctx.beginPath();
        ctx.fillRect(obj.x, obj.y, 10, 10);
        ctx.closePath();
    }   

    static shootBall(array, world) {
        var obj = array[0];
        ctx.fillStyle = "#000000";
        obj.x += obj.dx/20;
        obj.y = world[Math.floor(obj.x)] - 10;
        ctx.beginPath();
        ctx.arc(obj.x, obj.y, 15, 0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath();
    }

    //Some kind of Easter Egg from the course :)
    static shootAnalogClock(array) {
        var obj = array[0];
        
        if(obj.dx != 0) {
            var t = Math.floor(obj.x + obj.dx /5);
            var z = Math.floor(obj.y + obj.dy + 0.5);
            if((z+1) > world[t] && (z < world[t+1] || world[t] + 1 < world[t-1] || world[t] < world[t+1] - 1))// && z > world[t+1])
                obj.dx *= -1;
            obj.x += obj.dx / 5;
        }

        if(obj.dy != 0) {
            if(z > world[t])
                obj.dy *= -0.8;
            
            obj.dy += 0.5;
            obj.y += obj.dy;
        }
        else {
            obj.dy += 0.5;
        }

        if(Math.floor(obj.y) >= world[Math.floor(obj.x)] - 2) {
            obj.dy = 0;
            obj.dx = 0;
        }

        //draw analogClock
        var radius = 25;
        var ang, a, b;
        var now = new Date();
        var hour = now.getHours();
        var minute = now.getMinutes();
        var second = now.getSeconds();
        hour = hour%12;
        hour = (hour*Math.PI/6)+(minute*Math.PI/(6*60))+(second*Math.PI/(360*60)) - 1.8;
        //minute
        minute = (minute*Math.PI/30)+(second*Math.PI/(30*60)) - 1.5;
        // second
        second = (second*Math.PI/30) - 1.4;

        //body
        ctx.beginPath();
        ctx.arc(obj.x, obj.y, radius, 0, 2 * Math.PI);
        if(obj.dy == 0 && obj.dy == 0)
            ctx.fillStyle = 'yellow';
        else
            ctx.fillStyle = 'white';
        ctx.fill();
        ctx.closePath();

        //center
        ctx.beginPath();
        ctx.arc(obj.x, obj.y, radius * 0.1, 0, 2 * Math.PI);
        ctx.fillStyle = '#333';
        ctx.fill();
        ctx.closePath();

        //tacchette
        ctx.beginPath();
        for(var num = 0; num < 12; num++){
            ang = num * Math.PI / 6;
            a = radius * Math.cos(ang);
            b = radius * Math.sin(ang);
            
            if(obj.dy == 0 && obj.dy == 0)
                ctx.fillText("Haaalleluja!", obj.x, obj.y - radius - 5);
            ctx.moveTo(obj.x + a, obj.y + b);
            ctx.lineTo(obj.x + a*0.85, obj.y + b*0.85);
            ctx.stroke();

        }
        ctx.closePath();

        //lancette - h
        ctx.beginPath();
        ctx.moveTo(obj.x, obj.y);
        ctx.lineTo(obj.x + radius*Math.cos(hour)*0.5, obj.y + radius*Math.sin(hour)*0.5);
        ctx.stroke();
        ctx.closePath();

        //lancette - m
        ctx.beginPath();
        ctx.moveTo(obj.x,obj.y);
        ctx.lineTo(obj.x + radius*Math.cos(minute)*0.8, obj.y + radius*Math.sin(minute)*0.8);
        ctx.stroke();
        ctx.closePath();

        //lancette - s
        ctx.beginPath();
        ctx.moveTo(obj.x,obj.y);
        ctx.lineTo(obj.x + radius*Math.cos(second)*0.9, obj.y + radius*Math.sin(second)*0.9);
        ctx.stroke();
        ctx.closePath();
    }
}