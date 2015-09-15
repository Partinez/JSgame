var canvas;
var canvasContext;

var player1score = 0;
var player2score = 0;
var showingWinScreen = false;
var playerX = 15;
var playerY = 15;
var map = [];
var img = [];


window.onload = function() {
        canvas = document.getElementById('gameCanvas');
        canvasContext = canvas.getContext('2d');

        var framesPerSecond = 30;
        setUpEventListeners();
        map = createMap(50,38);
        
        
        imagepaths = [
          ['player','img/player.png']
            
          ]
        
        loadImages(imagepaths, function(imgs){
            setInterval(updateEveryting(imgs), 1000/framesPerSecond);
          }



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



function drawPlayer(X,Y) {
  var playerimg = new Image();
  console.log(1);
  playerimg.onload = function() {
    canvasContext.drawImage(playerimg,X,Y);
    console.log(2);
    }
  playerimg.scr = "img/player.png";

  }

function handleKeyboard(evt) {
        
        key = evt.keyCode;
        playerSpeed = 15;
        
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

function updateEveryting(imgs) {
        //moveEverything();
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

        colorRect(0,0,2,canvas.height, 'white');
        colorRect(0,canvas.width,2,canvas.height, 'white');
        colorRect(0,0,canvas.width,2, 'white');
        colorRect(0,canvas.height,canvas.width,2, 'white');

        //draw ball
        
        //colorCircle(playerX, playerY, 6, 'green');

        drawPlayer(playerX,playerY);

}
