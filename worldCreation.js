"use strict"
//GPurgatorio - Final PI

class worldMap {
    
    // Populates the array of heights to create a new terrain
    static createWorld(world){

        for (var n = 0; n < canvas.width+2; n++) {
            
            // Update height & slope ...
            worldMap.height += worldMap.slope;
            worldMap.slope += (Math.random() * worldMap.STEP_CHANGE) * 2 - worldMap.STEP_CHANGE;

            // ... To a Maximum
            if (worldMap.slope > worldMap.STEP_MAX) { 
                worldMap.slope = worldMap.STEP_MAX 
            };
            if (worldMap.slope < -worldMap.STEP_MAX) { 
                worldMap.slope = -worldMap.STEP_MAX 
            };
        
            if(worldMap.height < worldMap.HEIGHT_MAX){
                worldMap.height = worldMap.HEIGHT_MAX;
                worldMap.slope *= -1;
            }
            if (worldMap.height > worldMap.BASE * 6/7) { 
                worldMap.height = worldMap.BASE * 6/7;
                worldMap.slope *= -1;
            }
            // Save it
            world[n] = worldMap.height;
        }
    }

    // Draws the terrain
    static drawWorld(world){
        var h;
        for (var n = 0; n < world.length -1; n++) {
            h = world[n];
            //https://www.w3schools.com/colors/colors_names.asp
            // Terrain
            ctx.beginPath();
            ctx.moveTo(n, worldMap.BASE);
            if(editing) {
                ctx.strokeStyle="#DC143C";
                ctx.lineTo(n, h);
                ctx.stroke();
            }
            else {
                ctx.strokeStyle="#A0522D";
                ctx.lineTo(n, h);
                ctx.stroke();
            }
            
            // Sky
            ctx.beginPath();
            ctx.moveTo(n, h+1);
            ctx.strokeStyle="#87CEEB";
            ctx.lineTo(n,0);
            ctx.stroke();
        }
    }

    // Removes the terrain (circle-thingy)
    static removeWorldPart(world, coordX, coordY) {
        var x, d, a; 
        if(coordX < 10)
            x = coordX;
        else
            x = coordX - 10;
        for(x; x < coordX + 11; x++) {
            a = Math.abs(x - coordX);
            d = 10 * Math.sin(Math.acos(a/10));
            if(world[x] <= d + coordY)
                world[x] = d + coordY;
        }
    }

    // I don't even think I used this, should be bugged af imo
    static addWorldPart(world, coordX, coordY) {
        var x, d, a; 
        if(coordX < 10)
            x = coordX;
        else
            x = coordX - 10;
        for(x; x < coordX + 11; x++) {
            a = Math.abs(x - coordX);
            d = 10 * Math.cos(Math.asin(a/10));
            if(world[x] >= d - coordY)
                world[x] = d - coordY;
        }
    }


    static isOccupied(array, coordX, pos) {
        var x;
        if(coordX < 10)
            x = coordX;
        else    
            x = coordX - 10;
        for(var n = 0; n < array.length; n++){
            if(n == pos)
                continue;
            var t = array[n].x - 21;
            var z = array[n].x + 21;            // NEVER put + in compares or it's considered a string
            if(x > t && x < z) {                // So use variables and compare them
                return true;
            }
        }
        return false;
    }

    static terrainHit(world, coordX, coordY, weaponType) {

        var x, d, a, explosionR;
        if(weaponType == 0)
            explosionR = 25;
        else if (weaponType == 1)
            explosionR = 35;
        else if(weaponType == 2)
            explosionR = 50;


        if(coordX < explosionR)
            x = coordX;
        else
            x = coordX - explosionR;
        for(x; x < coordX + explosionR + 1; x++) {
            a = Math.abs(x - coordX);
            d = explosionR * Math.sin(Math.acos(a/explosionR));
            if(world[Math.floor(x)] <= d + coordY)
                world[Math.floor(x)] = d + coordY;
        }
    }

    // Simple brute-forced (my)eye-pleasing terrain smoothing algorythm eheh
    static fixWorld(world){
        var n, i;
        
        for(n = 0; n < 10; n++) {
            for(i = 0; i < world.length - 1; i++){
                if(world[i] < world[i+1] + 20 || world[i] > world[i+1] - 20) {
                    world[i] -= (world[i]-world[i+1])/2;
                }
                else if(world[i] < world[i-1] + 20 || world[i] > world[i-1] - 20) {
                    world[i] += (world[i]-world[i+1])/2;
                }
            }
        }
    }
}