


// initial values
var player1score = 0;
var player2score = 0;
var showingStartScreen = true;
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
var currentLevel = 'level1';



//constants
const MAP_WIDTH = 50;
const MAP_HEIGHT = 38;
const GRID_SIZE = 15;


var startMessages = [
	{ message: "Kye clone in JS ",
	title:true},
	{ message: "Move with WASD, avoid the bad guys, get the diamonds"},
	{ message: "Click to start"}
]

//Sprite and icon correspondence

var properties = {
	//icon: [name,walkable,pushable,enemy, eatable]
	'@':['player',false,false,false,false],
	'B':['block',false,true,false,false],
	'H':['hole',false,false,false,false],
	'h':['fhole',true,false,false,false],
	'w':['wall',false,false,false,false],
	'd':['diamond',true,false,false,false],
	'e':['enemy',false,true,true,false],
	's':['spinner',false,true,true,false],
	'n':['sponge',true,false,false,true],
	'R':['arrow-right',false,true,false,false],
	'E':['arrow-left',false,true,false,false],
	'W':['arrow-down',false,true,false,false],
	'Q':['arrow-up',false,true,false,false],
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
	this.eatable = properties[icon][4];
	this.memory = '';
	if (this.icon == '@') {this.alive = true;}
	entities.unshift(this);
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
			} else if (collided.eatable) {
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
	if ("QWER".indexOf(this.icon) > -1 && map[newx][newy]) {
		var collided = getFromMap(newx,newy);
		if (collided.pushable && collided.move(d)) {
			this.reverseArrow();
			return true;
		}
		this.reverseArrow();
		return true;
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
	var otheritem = getFromMap(this.x,this.y);
	if (otheritem) {
		otheritem.redraw();
	}

}

Element.prototype.reverseArrow = function() {
	var reverseKey = {
		'R':'E',
		'E':'R',
		'W':'Q',
		'Q':'W'
	}

	var x = this.x;
	var y = this.y;
	var icon = this.icon;

	this.remove();

	var newarrow = new Element(reverseKey[icon],x,y);

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
				if (key == 82) { //r
					resetLevel()
				}



}



function handleMouseClick(evt) {
        if(showingStartScreen) {
                showingStartScreen = false;
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


function resetLevel() {
	remainingDiamonds = 0;
	entities = [];
	player.alive = true;
	map = createMap(MAP_WIDTH,MAP_HEIGHT);
	map = importMap(currentLevel,MAP_WIDTH,MAP_HEIGHT);
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

function importMap(levelName,sizeX,sizeY) {
	var importmap = Levels[levelName];
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
   	if (sprite.width == 30) {
   		if (timecount > 45) {
   			canvasContext.drawImage(sprite,15,0,15,15,xcoor, ycoor,15,15);
   		} else if (timecount > 30) {
   			canvasContext.drawImage(sprite,0,0,15,15,xcoor, ycoor,15,15);
   		} else if (timecount > 15) {
   			canvasContext.drawImage(sprite,15,0,15,15,xcoor, ycoor,15,15);
   		} else {
   			canvasContext.drawImage(sprite,0,0,15,15,xcoor, ycoor,15,15);
   		}

   	} else if (sprite.width == 60) {
   		if (timecount > 45) {
   			canvasContext.drawImage(sprite,45,0,15,15,xcoor, ycoor,15,15);
   		} else if (timecount > 30) {
   			canvasContext.drawImage(sprite,30,0,15,15,xcoor, ycoor,15,15);
   		} else if (timecount > 15) {
   			canvasContext.drawImage(sprite,15,0,15,15,xcoor, ycoor,15,15);
   		} else {
   			canvasContext.drawImage(sprite,0,0,15,15,xcoor, ycoor,15,15);
   		}
   	} else {
    	canvasContext.drawImage(sprite,xcoor, ycoor);
	}
}


function drawStartScreen() {
	canvasContext.fillStyle = 'rgba(255,255,255,0.9)';
	canvasContext.fillRect(0,0,canvas.width,canvas.height);
	canvasContext.fillStyle = 'rgb(100,100,100)';
	for (var i = 0; i<startMessages.length;i++) {
		var message = startMessages[i].message;
		var title = startMessages[i].title;
		if (title) {
			canvasContext.font = 'bold 30px Lato'
		} else {
			canvasContext.font = '20px Lato'
		}
		canvasContext.fillText(message,(canvas.width/2)-canvasContext.measureText(message)['width']/2,(canvas.height/2)-100 + 50*i);
	}


}

function drawBG() {
	colorRect(0,0,canvas.width, canvas.height, 'white');
	colorRect(0,0,2,canvas.height, 'black');
	colorRect(canvas.width-2,0,2,canvas.height, 'black');
	colorRect(0,0,canvas.width,2, 'black');
	colorRect(0,canvas.height-2,canvas.width,2, 'black');
}

function drawUI() {

    //draw mapborder:
    colorRect(mapXoffset-2,mapYoffset,2,MAP_HEIGHT*GRID_SIZE, 'black'); //Left
    colorRect(mapXoffset-2,mapYoffset-2,MAP_WIDTH*GRID_SIZE,2, 'black'); //top
    colorRect(mapXoffset-2,mapYoffset+MAP_HEIGHT*GRID_SIZE,MAP_WIDTH*GRID_SIZE+2,2, 'black'); //Down
    colorRect(mapXoffset+MAP_WIDTH*GRID_SIZE,mapYoffset,2,MAP_HEIGHT*GRID_SIZE+2, 'black');   //Down
    canvasContext.font= '20px Lato';
    canvasContext.textAlign = true;
 	canvasContext.fillText(remainingDiamonds, UIXoffset+22-canvasContext.measureText(remainingDiamonds)['width']/2, UIYoffset+50);
 	var sprite = ASSET_MANAGER.getAsset('img/diamond.png');
 	canvasContext.drawImage(sprite, UIXoffset+12, UIYoffset+12,20,20);
	canvasContext.fillStyle = "rgb(100,100,100)";
	var message = "Press r to reset level";
	canvasContext.fillText(message, (canvas.width/2)-canvasContext.measureText(message)['width']/2, canvas.height-7);

}


function drawEverything() { //Draw UI then map

				drawBG();
        refreshMap();
				drawUI();


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
	for (var key in properties) {
		ASSET_MANAGER.queueDownload('img/' + properties[key][0] + '.png');
	}
}


// Main loop

function updateEveryting() {
	if (!showingStartScreen) {
	        timecount++;
			if (timecount % 30 == 0) {
				moveEverything();
				if(timecount == 60){
					timecount = 0;
				}
			};
	        drawEverything();
	}
}

function moveEverything() {
	for (var i = 0; i<entities.length;i++) {
		var entity = entities[i];
		if (entity.icon== 's') {  //spinner move
			var directions = ['u','l','d','r'];
			if (entity.memory  && entity.memory < 5) {

				if (entity.memory == 4) {
					//entity.memory = 0;
				} else { entity.move(directions[entity.memory]);}
				entity.memory += 1;
			} else {
				var rand = Math.floor(Math.random() * directions.length);
				entity.memory = rand;
				entity.move(directions[rand]);
			}
		}

		if ("QWER".indexOf(entity.icon) > -1) { //arrowmove
			if (entity.icon == 'Q') {
				entity.move('u');
			} else if (entity.icon == 'W') {
				entity.move('d');
			} else if (entity.icon == 'E') {
				entity.move('l');
			} else if (entity.icon == 'R') {
				entity.move('r');
			}
		}
	}
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
        map = importMap(currentLevel,MAP_WIDTH,MAP_HEIGHT);

        queueSpriteDownloads();

        var framesPerSecond = 30;


        ASSET_MANAGER.downloadAll(function() {
					drawEverything();
					drawStartScreen();
          setInterval(updateEveryting, 1000/framesPerSecond);
          })



}
