


// initial values
var player1score = 0;
var player2score = 0;
var showingWinScreen = false;
var map = [];
var img = [];
var mapXoffset = 48;
var mapYoffset = 2;
var UIXoffset = 2;
var UIYoffset = 2;

var timecount = 0;
var map = [];
var entities = [];
var remainingDiamonds = 0;



//constants
const MAP_WIDTH = 50;
const MAP_HEIGHT = 38;
const GRID_SIZE = 15;

var examplemap = ""+
"wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww"+
"w............wwwwwwwww....w...w..................w"+
"w....................wwwwww...w..................w"+
"w.........e.........d.H@....B.w..................w"+
"w............wwwwwwwwwwwwwwww.www................w"+
"wwwww.wwwwwwww.............wd.w..................w"+
"w...w.w....................wwww..................w"+
"w...wdw..........................................w"+
"w...www.....................www..................w"+
"w...........................wBw..................w"+
"w...........................www..................w"+
"w................................................w"+
"w................................................w"+
"w................................................w"+
"w................................................w"+
"w................................................w"+
"w................................................w"+
"w................................................w"+
"w................................................w"+
"w................................................w"+
"w................................................w"+
"w.........................H......................w"+
"w................................................w"+
"w................................................w"+
"w................................................w"+
"w................................................w"+
"w................................................w"+
"w................................................w"+
"w................................................w"+
"w................................................w"+
"w................................................w"+
"w................................................w"+
"w................................................w"+
"w................................................w"+
"w................................................w"+
"w................................................w"+
"w................................................w"+
"wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww";


var emptymap = ""+
".................................................."+
".................................................."+
".................................................."+
".................................................."+
".................................................."+
".................................................."+
".................................................."+
".................................................."+
".................................................."+
"..............................@..................."+
".................................................."+
".................................................."+
".................................................."+
".................................................."+
".................................................."+
".................................................."+
".................................................."+
".................................................."+
".................................................."+
".................................................."+
".................................................."+
".................................................."+
".................................................."+
".................................................."+
".................................................."+
".................................................."+
".................................................."+
".................................................."+
".................................................."+
".................................................."+
".................................................."+
".................................................."+
".................................................."+
".................................................."+
".................................................."+
".................................................."+
".................................................."+
"..................................................";







//Sprite and icon correspondence
var sprites = {
	'@':'img/player.png',
	'B':'img/block.png',
	'H':'img/hole.png',
	'h':'img/fhole.png',
	'w':'img/wall.png',
	'd':'img/diamond.png',
	'e':'img/enemy.png'
}


var properties = {
	//name: [icon,walkable,pushable,enemy]
	'@':['player',false,false,false],
	'B':['block',false,true,false],
	'H':['hole',false,false,false],
	'h':['fhole',true,false,false],
	'w':['wall',false,false,false],
	'd':['diamond',true,false,false],
	'e':['enemy',false,false,true]
}

//Classes

function Element(icon, x, y) { //Elements in the map
	this.name = properties[icon][0];
	this.x = x;
	this.y = y;
	this.icon = icon;
	this.walkable = properties[icon][1];	
	this.pushable = properties[icon][2];
	this.sprite = 'img/' + this.name + '.png';
	this.enemy = properties[icon][3];
	if (this.icon == '@') {this.alive = true;}
	entities.push(this);
	if (!(map[x][y])) {
		map[x][y] = this.icon;
	} else {
		console.log("Error while placing " + icon + " on " + x + " " + y + ", " + map[x][y] + " is already present.");
	}
} 

Element.prototype.move = function(d) {
	if (d == 'u') {
		var newx = this.x;
		var newy = this.y -1;
	} else if (d == 'd') {
		var newx = this.x;
		var newy = this.y + 1;
	} else if (d == 'l') {
		var newx = this.x-1;
		var newy = this.y;
	} else if (d =='r') {
		var newx = this.x+1;
		var newy = this.y;
	}
	if (!this.collision(newx,newy,d)) { //If there is no collision, move
		var icon = this.icon;
		var oldx = this.x;
		var oldy = this.y;
		map[this.x][this.y] = '';
		map[newx][newy] = icon;
		this.x = newx;
		this.y = newy;
		steppedon = getFromMap(oldx,oldy);
		if (steppedon) {
			steppedon.redraw();
		}
		if (this.icon == '@' || this.enemy) { //Check for enemies near the player if any of them moves
			for (var i = player.x-1;i<= player.x+1;i++) {
				for (var j = player.y-1;j<= player.y+1;j++) {
					var entity = getFromMap(i,j);
					if (entity.enemy) {
						console.log('dead');
						player.alive = false;
					}
				}
			}
		}
		return true;
	}
	
	return false;
}

Element.prototype.collision  = function(newx, newy,d) {

	var isPlayer = (this.icon == '@'); //true if this is the player
	if ((map[newx] === undefined) || (map[newx][newy] === undefined) ) {
		return true;
	}
	if (isPlayer && map[newx][newy]) {
		var collided = getFromMap(newx,newy);
		if (collided.walkable){
			if (collided.icon == 'd') {
				remainingDiamonds -= 1;
				collided.remove();
				return false;
			}
			return false;
		} else if (collided.pushable && collided.move(d)) {
			return false;
		} else {
		return true;
		}	
	}



	if (this.icon =='B' && map[newx][newy] == 'H') {
		var hole = getFromMap(newx,newy);
		//fill hole
		hole.remove();
		this.remove();
		var fhole = new Element('h',newx,newy);
		fhole.redraw();
		return false;

	}

	if (map[newx][newy]) {
		return true;
	}
	return false;
}

Element.prototype.redraw = function() {
	//map[this.x][this.y] = this.icon;
	draw(this.x,this.y,this.sprite);
}

Element.prototype.remove = function() {
	map[this.x][this.y] = '';
	var index = entities.indexOf(this);
	entities.splice(index,1);
	otheritem = getFromMap(this.x,this.y);
	if (otheritem) {
		otheritem.redraw();
	}

}


function AssetManager() { //manages images
    this.successCount = 0;
    this.errorCount = 0;
    this.downloadQueue = [];
    this.cache = {};
}


AssetManager.prototype.queueDownload = function(path) {
    this.downloadQueue.push(path);
}

AssetManager.prototype.downloadAll = function(downloadCallback) {
	if (this.downloadQueue.length === 0) {
      downloadCallback();
  }
  for (var i = 0; i < this.downloadQueue.length; i++) {
    var path = this.downloadQueue[i];
    var img = new Image();
    var that = this;
    img.addEventListener("load", function() {
        that.successCount += 1;
        if (that.isDone()) {
        	downloadCallback();
    }
    }, false);
    img.addEventListener("error", function() {
        that.errorCount += 1;
        if (that.isDone()) {
        	downloadCallback();
    }
    }, false);
    img.src = path;
    this.cache[path] = img;
  }
}

AssetManager.prototype.isDone = function() {
    return (this.downloadQueue.length == this.successCount + this.errorCount);
}

AssetManager.prototype.getAsset = function(path) {
    return this.cache[path];
}



//Event listeners

function setUpEventListeners() {
        canvas.addEventListener('mousemove',
                function(evt) {
                        var mousePos = calculateMousePos(evt);
                        paddle1Y = mousePos.y;
                })

        canvas.addEventListener('mousedown', handleMouseClick);
        
        canvas.addEventListener('keydown',handleKeyboard);
  
}




function handleKeyboard(evt) {
        
        key = evt.keyCode;
	        if (player.alive) {
	        
	        if (key == 65) { //left
	        	if (player.move('l')) {mirrorMove('r');}
	        	
	        }
	        if (key == 68) { // right
	        	if (player.move('r')){mirrorMove('l');}
	        }
	        if (key == 87) { // up
	        	if (player.move('u')){mirrorMove('d');}
	        }
	        if (key == 83) { //down
	        	if (player.move('d')){mirrorMove('u');}
	        }
        }
  
  
}



function handleMouseClick(evt) {
        if(showingWinScreen) {
                player1score = 0;
                player2score = 0;
                showingWinScreen = false;
        }
}

function calculateMousePos(evt) {
        var rect = canvas.getBoundingClientRect();
        var root = document.documentElement;
        var mouseX = evt.clientX - rect.left - root.scrollLeft;
        var mouseY = evt.clientY - rect.top - root.scrollTop;
        return {
                x:mouseX,
                y:mouseY
        };
}




//Create an empty map

function createMap(sizeX, sizeY) {
  var map = []
  for (i = 0; i < sizeX; i++) {
    var col = [];
    for (j = 0; j < sizeY; j++) {
      col.push('');
      
     }
    map.push(col);
    
    }
  return map;
}




function getFromMap(x,y) {
	for (var i= 0; i < entities.length; i++) {
		if (entities[i].x == x && entities[i].y == y) {
			return entities[i];
		}
	}
	return false;
}

function refreshMap() {
	for (var i= 0; i < entities.length; i++) {
		if (entities[i].walkable) {entities[i].redraw();}
	
	}
	for (var i= 0; i < entities.length; i++) {
		if (entities[i] != player && !(entities[i].walkable)) {entities[i].redraw();}
	}
	if (player.alive) {
		player.redraw();
		}
}

function importMap(importmap,sizeX,sizeY) {
  for (var i = 0; i < sizeY; i++) {
    var col = [];
    for (var j = 0; j < sizeX; j++) {
    	if (importmap[i*sizeX+j] != '.') {
    		if(importmap[i*sizeX+j] == 'd') {remainingDiamonds++}
   		   col.push(importmap[i*sizeX+j]);
   		   var entity = new Element(importmap[i*sizeX+j],j,i);
   		   if (entity.icon == '@') {player = entity}
 		}
 		col.push('');
      
     }
    map.push(col);
    
    }
  return map;
}


//Drawing functions

function draw(X,Y,sprite){
	xcoor = X*GRID_SIZE+mapXoffset;
	ycoor = Y*GRID_SIZE+mapYoffset;
   	var sprite = ASSET_MANAGER.getAsset(sprite);
   	if (sprite.width > 15) {
   		if (timecount > 15) {
   			canvasContext.drawImage(sprite,0,0,15,15,xcoor, ycoor,15,15);
   		} else {
   			canvasContext.drawImage(sprite,15,0,15,15,xcoor, ycoor,15,15);
   		}


   	} else {
    	canvasContext.drawImage(sprite,xcoor, ycoor);
	}
}




function drawUI() {
    colorRect(0,0,canvas.width, canvas.height, 'white');
    colorRect(0,0,2,canvas.height, 'black');
    colorRect(canvas.width-2,0,2,canvas.height, 'black');
    colorRect(0,0,canvas.width,2, 'black');
    colorRect(0,canvas.height-2,canvas.width,2, 'black');
    //draw mapborder:
    colorRect(mapXoffset-2,mapYoffset,2,MAP_HEIGHT*GRID_SIZE, 'black'); //Left
    colorRect(mapXoffset-2,mapYoffset-2,MAP_WIDTH*GRID_SIZE,2, 'black'); //top
    colorRect(mapXoffset-2,mapYoffset+MAP_HEIGHT*GRID_SIZE,MAP_WIDTH*GRID_SIZE+2,2, 'black'); //Down
    colorRect(mapXoffset+MAP_WIDTH*GRID_SIZE,mapYoffset,2,MAP_HEIGHT*GRID_SIZE+2, 'black');   //Down
    canvasContext.font= '20px sans-serif';
    canvasContext.textAlign = true;
 	canvasContext.fillText(remainingDiamonds, UIXoffset+22-canvasContext.measureText(remainingDiamonds)['width']/2, UIYoffset+50);
 	var sprite = ASSET_MANAGER.getAsset('img/diamond.png');
 	canvasContext.drawImage(sprite, UIXoffset+12, UIYoffset+12,20,20);

}


function drawEverything() { //Draw UI then map

        drawUI();
        refreshMap();


}

function colorCircle(centerX,centerY, radius, color) {
        canvasContext.fillStyle = color;
        canvasContext.beginPath();
        canvasContext.arc(centerX,centerY, radius, 0, Math.PI*2, true);
        canvasContext.fill();


}

function colorRect(leftX,topY,width,height,drawColor) {
        canvasContext.fillStyle = drawColor;
        canvasContext.fillRect(leftX,topY,width,height);
}



function queueSpriteDownloads () {
	for (var key in sprites) {
		ASSET_MANAGER.queueDownload(sprites[key]);
	}
}


// Main loop

function updateEveryting() { 
        timecount++;
		if (timecount >= 30) {
			moveEverything();
			timecount = 0;
		};
        drawEverything();
}

function moveEverything() {

}

function mirrorMove(d) {
	for (var i = 0;i< entities.length; i++) {
		if (entities[i].icon == 'e') {
			entities[i].move(d);
		}
	}
}



//Main function

var ASSET_MANAGER = new AssetManager();
var canvas;
var canvasContext;



window.onload = function() {
        canvas = document.getElementById('gameCanvas');
        canvasContext = canvas.getContext('2d');

        
        setUpEventListeners();
        map = createMap(MAP_WIDTH,MAP_HEIGHT);
        map = importMap(examplemap,MAP_WIDTH,MAP_HEIGHT);

        queueSpriteDownloads();

        var framesPerSecond = 30;
	
        ASSET_MANAGER.downloadAll(function() {
            setInterval(updateEveryting, 1000/framesPerSecond);
          })



}