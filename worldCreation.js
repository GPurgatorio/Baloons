"use strict"

class worldMap {

    // creating the landscape
    static createWorld(world){

        for (var n = 0; n < canvas.width; n++) {
            // change height and slope
            worldMap.height += worldMap.slope;
            worldMap.slope += (Math.random() * worldMap.STEP_CHANGE) * 2 - worldMap.STEP_CHANGE;

            // clip height and slope to maximum
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
            world[n] = worldMap.height;
        }
    }

    static drawWorld(world){
        
        for (var n = 0; n < world.length -1; n++) {
            var h = world[n];
            //https://www.w3schools.com/colors/colors_names.asp
            //terrain
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
            
            //sky
            ctx.beginPath();
            ctx.moveTo(n, h+1);
            ctx.strokeStyle="#87CEEB";
            ctx.lineTo(n,0);
            ctx.stroke();
        }
    }

    static removeWorldPart(world, coordX, coordY){
        for(var i = 0; i < 8; i++) {
            world[coordX+i] += 10-i/2;
            world[coordX-i] += 10-i/2;
        }
    }

    static fixWorld(world){
        for(var n = 0; n < 10; n++) {
            for(var i = 1;i<world.length - 1;i++){
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