var canvas;
var canvasContext;

var player1score = 0;
var player2score = 0;
var showingWinScreen = false;
var playerX = 15;
var playerY = 15;
var map = [];
var img = [];

var ASSET_MANAGER = new AssetManager();





window.onload = function() {
        canvas = document.getElementById('gameCanvas');
        canvasContext = canvas.getContext('2d');

        
        setUpEventListeners();
        map = createMap(50,38);
        

        

        ASSET_MANAGER.queueDownload('img/player.png')
        ASSET_MANAGER.downloadAll(function() {
            init();}

        imagepaths = [
          ['player','img/player.png']
            
          ]
        
        loadImages(imagepaths, function(imgs){
            setInterval(updateEveryting(imgs), 1000/framesPerSecond);

          })



}

function init() {
	var framesPerSecond = 30;
	setInterval(updateEveryting, 1000/framesPerSecond);
}

function setUpEventListeners() {
        canvas.addEventListener('mousemove',
                function(evt) {
                        var mousePos = calculateMousePos(evt);
                        paddle1Y = mousePos.y;
                })

        canvas.addEventListener('mousedown', handleMouseClick);
        
        canvas.addEventListener('keydown',handleKeyboard);
  
}



function drawPlayer(x,y) {
    var sprite = ASSET_MANAGER.getAsset('img/player.png');
    canvasContext.drawImage(sprite, x - sprite.width/2, y - sprite.height/2);

  }

function handleKeyboard(evt) {
        
        key = evt.keyCode;
        playerSpeed = 15;
        console.log(key);
        console.log(playerX);
        
        if (key == 65) {
          playerX -= playerSpeed;
        }
        if (key == 68) {
          playerX += playerSpeed;
        }
        if (key == 87) {
          playerY -= playerSpeed;
        }
        if (key == 83) {
          playerY += playerSpeed;
        }
        
  
  
}



function handleMouseClick(evt) {
        if(showingWinScreen) {
                player1score = 0;
                player2score = 0;
                showingWinScreen = false;
        }
}

function updateEveryting() {
        //moveEverything();
        console.log('i');
        drawEverything();
}

function loadImages(paths,whenLoaded){
  var imgs=[];
  paths.forEach(function(path){
    var img = new Image;
    img.onload = function(){
      imgs.push(img);
      if (imgs.length==paths.length) whenLoaded(imgs);
    }
    // Simulate slow loading of images, even when cached
    setTimeout(function(){
      img.src = 'http://phrogz.net/tmp/'+path;
    },Math.random()*5000);
  });
}


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



function colorRect(leftX,topY,width,height,drawColor) {
        canvasContext.fillStyle = drawColor;
        canvasContext.fillRect(leftX,topY,width,height);
}






function moveEverything() {
        if (showingWinScreen) {
                return;
        }

}

function colorCircle(centerX,centerY, radius, color) {
        canvasContext.fillStyle = color;
        canvasContext.beginPath();
        canvasContext.arc(centerX,centerY, radius, 0, Math.PI*2, true);
        canvasContext.fill();


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


function draw(X,Y){}



function drawEverything() {

        colorRect(0,0,canvas.width, canvas.height, 'white');

        if (showingWinScreen) {
                canvasContext.fillStyle = "white";

                canvasContext.fillText("Click to continue", 350, 500);
                return;
        }

        colorRect(0,0,2,canvas.height, 'black');
        colorRect(0,canvas.width,2,canvas.height, 'black');
        colorRect(0,0,canvas.width,2, 'black');
        colorRect(0,canvas.height,canvas.width,2, 'black');

        //draw ball
        
        drawPlayer(playerX,playerY);

}


function AssetManager() {
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
