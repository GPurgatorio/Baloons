
class Baloon {

    constructor(coordX, coordY, count) { //, team, turn){
        this.x = coordX;
        this.y = coordY;
        this.ballRadius = 10;
        this.dx = 2;
        this.dy = -2;
        this.jumping = false;
        this.goingUp = false;
        this.inAir = true;
        this.myTurn = count;
        this.hp = 100;
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
        let relX = array[p].x;
        let relY = array[p].y;
        if(relX < canvas.width - obj.ballRadius){ 
            array[p].x += 2;
            if(relY > world[relX] + array[p].ballRadius || relX < world[relX] + array[p].ballRadius || relX > world[relX] + array[p].ballRadius){
                if(!array[p].jumping)
                    array[p].y = world[relX] - array[p].ballRadius;
            }
        }
    }

    static moveLeft(array, p) {
        let relX = array[p].x;
        let relY = array[p].y;
        if(relX > array[p].ballRadius + 1) { 
            array[p].x -= 2;
            if(relY > world[relX] + array[p].ballRadius || relX < world[relX] + array[p].ballRadius || relX > world[relX] + array[p].ballRadius) {
                if(!array[p].jumping)
                    array[p].y = world[relX] - array[p].ballRadius;
            }
        }
    }

    static moveUp(array, p) {
        if(!array[p].jumping) {
            array[p].jumping = true;
            array[p].goingUp = true;
        }
    }

    static moveDown(array, p){
        let relY = array[p].y;
        let relX = array[p].x;
        if(relY < world[relX] - array[p].ballRadius) {
            array[p].y += 2;
        }
    }

    static movementTurn(array, p){
        let relX = array[p].x;
        let relY = array[p].y;

        if(relY >= world[relX] - 10){
            array[p].jumping = false;
        }
        if(array[p].goingUp){
            array[p].y -= 10;
        }
        if(relY <= world[relX] - 80){
            array[p].goingUp = false;
        }
    }

    static updateBaloons(array) {
        for(var i = 0; i < array.length; i++) {
            //gravity
            if(Math.abs(array[i].y) < world[array[i].x] - array[i].ballRadius && !array[i].goingUp){   //assoluto perché se vado sopra lo schermo devo tornare giù comunque
                array[i].y *= 1.02;
            }
        }
    }
}