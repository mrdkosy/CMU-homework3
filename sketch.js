var Canvas;
var shaderCanvas;
var program;
var shaderTimeControl = 0;
var isRoll = false;

var hour12 = -1; //時間表示 12-hour
var isChangeHour = false;
var isStartNumberAnimation = false;
var numberAnimationFrameCounter = 0;
var eyeImage1, eyeImage2, closedeyeImage1, closedeyeImage2, legImage1, legImage2, heartIamge;
var winkPlobability = 0.05;
var sleepPlobability = 0.001;
var isWalk = false;
var maxWalkDegree = 10;
var nowWalkDegree = 0;
var rotateSpeed = 2.5;
var walkX = 0;
var walkY = 0;
var isOutsideBother = false;
var isOutsideScreen = false;
var walkSpeed = 3.0;
var border1 = 600;
var border2 = 1000;
var moreRoll = 0;
var moreRoll2 = 0;
// ----------------------------------------------
var ClassNumber = {
  number: 0,
  x: 0,
  y: 0,
  size: 0,
  minSize: 0,
  maxSize: 0,
  Init: function(number, x, y, size, minSize, maxSize) {
    this.number = number;
    this.x = x;
    this.y = y;
    this.size = size;
    this.minSize = minSize;
    this.maxSize = maxSize;
  },
  Draw: function() {
    var defaultColor = color(63, 62, 71);
    var impressiveColor = color(159, 81, 105);
    var r = map(this.size, this.minSize, this.maxSize, red(defaultColor), red(impressiveColor));
    var g = map(this.size, this.minSize, this.maxSize, green(defaultColor), green(impressiveColor));
    var b = map(this.size, this.minSize, this.maxSize, blue(defaultColor), blue(impressiveColor));
    fill(r, g, b);

    push();
    textSize(this.size);
    translate(this.x, this.y);
    if(this.number == hour12 || (this.number == 12 && hour12 == 0)) rotate(nowWalkDegree);
    translate(0, this.size / 3);
    text(str(this.number), 0, 0);
    pop();
  }
};

var radius = 300;
var NumbersParameter = [
  [12, 0, -300, 170, 170, 230],
  [1, 0.5 * radius + 10, -0.866 * radius, 130, 130, 240],
  [2, 0.866 * radius+10, -0.5 * radius - 30, 120, 120, 220],
  [3, 300, 0, 250, 250, 330],
  [4, 0.866 * radius, 0.5 * radius, 110, 110, 250],
  [5, 0.5 * radius + 12, 0.866 * radius - 15, 150, 150, 200],
  [6, 0, 280, 240, 240, 310],
  [7, -0.5 * radius - 10, 0.866 * radius, 130, 130, 220],
  [8, -0.866 * radius, 0.5 * radius - 15, 190, 190, 250],
  [9, -300, 0, 120, 120, 220],
  [10, -0.866 * radius, -0.5 * radius, 160, 160, 230],
  [11, -0.5 * radius - 10, -0.866 * radius - 10, 80, 80, 120]
];

var Numbers = []; //数字情報を保管する配列
// ----------------------------------------------
var ClassClockHands = {
  name: "",
  x: 0,
  y: 0,
  w: 0,
  h: 0,
  rotate: 0,
  Init: function(name, rotate, x, y, w, h) {
    this.name = name;
    this.w = w;
    this.h = h;
    this.x = x - this.w / 2;
    this.y = y - 20;
    this.rotate = rotate;
  },
  Update: function() {
    switch (this.name) {
      case "second":
        this.rotate = map(second(), 0, 60, 0, 360) + moreRoll2;
        break;
      case "minute":
        this.rotate = map(minute(), 0, 60, 0, 360) + map(second(), 0, 60, 0, 6) + moreRoll2;
        break;
      case "hour":
       	//this.rotate = map(hour(), 0, 23, 0, 690) + map(minute(), 0, 60, 0, 30);
       	var d = atan2(Numbers[hour12].y+walkY, Numbers[hour12].x+walkX);
       	this.rotate = map(d, -180, 180, 0, 360)-90 + map(minute(), 0, 60, 0, 30) + moreRoll2;  

        break;
    }
  },
  Draw: function() {
    this.Update();
    fill(63, 62, 71);
    
    push();
    rotate(180);
    rotate(this.rotate);
    rect(this.x, this.y, this.w, this.h);
    pop();
  }

};

var ClockHandsParameter = [
  ["second", 0, 0, 0, 5, 250],
  ["minute", 0, 0, 0, 10, 200],
  ["hour", 0, 0, 0, 15, 150]
];

var ClockHands = [];

// ----------------------------------------------
var Eye = {
  x: 0,
  y: 0,
  x1: 0,
  y1: 0,
  x2: 0,
  y2: 0,
  size: 0.1,
  num: 1,
  winkTimer: 0,
  isWink: false,
  isSleep: false,

  Wink: function() {
    if (!this.isSleep) { //寝ていない時は瞬きをする wink when not sleeping
      if (random() < winkPlobability) {
        this.isWink = true;
        this.winkTimer = 5;
      }
    }
  },
  Sleep: function() {
    if (!this.isSleep) { //連続で寝ない not continue sleeping
      if (random() < sleepPlobability) {
        this.winkTimer = 300;
        this.isSleep = true;
      }
    }
  },
  Init: function(x, y, x1, y1, x2, y2, size, num) {
    this.x = x;
    this.y = y;
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.size = size;
    this.num = num;
  },
  Update: function() {

    if (isChangeHour) { //目の位置を設定 update eye position
      Eye.Init(
        Numbers[hour12].x,
        Numbers[hour12].y,
        EyeParameter[hour12][2],
        EyeParameter[hour12][3],
        EyeParameter[hour12][4],
        EyeParameter[hour12][5],
        EyeParameter[hour12][6],
        EyeParameter[hour12][7]
      );
    }
    this.Wink();
    //this.Sleep();
  },

  Draw: function() {
    this.Update();


    //まばたき wink animation
    //tint(63, 62, 71);
    //tint(255);
    noTint();
    if (this.isWink || this.isSleep) { //目を閉じる close eyes
      push();
      translate(this.x, this.y);
      rotate(nowWalkDegree);
      image(closedeyeImage1, this.x1, this.y1+15,
        closedeyeImage1.width * this.size, closedeyeImage1.height * this.size);
      if (this.num == 2) {
        image(closedeyeImage2, this.x2, this.y2+15,
          closedeyeImage2.width * this.size, closedeyeImage2.height * this.size);
      }
      pop();
      this.winkTimer--;
      if (this.winkTimer <= 0) {
        this.isWink = false;
        this.isSleep = false;
      }
    } else if (!this.isSleep) { //目を開ける open eyes
      push();
      translate(this.x, this.y);
      rotate(nowWalkDegree);
      image(eyeImage1, this.x1, this.y1,
        eyeImage1.width * this.size, eyeImage1.height * this.size);
      if (this.num == 2) image(eyeImage2, this.x2, this.y2,
        eyeImage2.width * this.size, eyeImage2.height * this.size);
      pop();
    }


    //寝る sleep

    if (this.isSleep) {
      fill(177, 139, 140);
      var val = [
        [40, 40, -20],
        [80, 93, -40],
        [120, 165, -60]
      ];
      var j = int((frameCount % 40) / 10); //Zをいくつ描くか how many Z
      for (var i = 0; i < j; i++) {
        textSize(val[i][0]);
        text("Z", this.x + val[i][1], this.y + val[i][2]);
      }
    }


  }
};

var EyeParameter = [ //x, y, x1, y1, x2, y2, size, num
  [0, 0, 50, 30, -65, 30, 0.17, 2], //12
  [0, 0, 0, 10, 0, 0, 0.2, 1], //1
  [0, 0, 25, -20, 0, 0, 0.13, 1], //2
  [0, 0, 40, -100, -40, -100, 0.12, 2], //3
  [0, 0, 13, -15, 0, 0, 0.17, 1], //4
  [0, 0, -15, -62, 30, -62, 0.075, 2], //5
  [0, 0, -43, 40, 52, 40, 0.1, 2], //6
  [0, 0, 18, -25, 0, 0, 0.14, 1], //7
  [0, 0, 38, -60, -10, -60, 0.08, 2], //8
  [0, 0, -5, -25, 0, 0, 0.18, 1], //9
  [0, 0, -70, 0, 60, 0, 0.16, 2], //10
  [0, 0, -25, 5, 30, 5, 0.09, 2] //11
];

// ----------------------------------------------
var Leg = {
  x: 0,
  y: 0,
  x1: 0,
  y1: 0,
  x2: 0,
  y2: 0,
  size: 0,
  rotate1: 0,
  rotate2: 0,
  Init: function(x, y, x1, y1, x2, y2, size) {
    this.x = x;
    this.y = y;
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.size = size;
    this.rotate1 = 0;
    this.rotate2 = 0;
  },
  Update: function() {
    if (isChangeHour) {
      this.Init(
        Numbers[hour12].x,
        Numbers[hour12].y,
        LegParameter[hour12][2],
        LegParameter[hour12][3],
        LegParameter[hour12][4],
        LegParameter[hour12][5],
        LegParameter[hour12][6]
      );
    }


  },
  Draw: function() {
    this.Update();
    
    if(isWalk){
      imageMode(CORNER);
      noTint();

      push();
      translate(this.x, this.y);
      rotate(nowWalkDegree);
      image(legImage1, this.x1, this.y1,
        legImage1.width * this.size, legImage1.height * this.size);
      pop();

      push();
      translate(this.x, this.y);
      rotate(nowWalkDegree);
      image(legImage2, this.x2, this.y2,
        legImage2.width * this.size, legImage2.height * this.size);
      pop();

      noTint();
      imageMode(CENTER);
  	}
  }
};

var LegParameter = [ //x1, y1, x2, y2, size
  [0, 0, 20, 65, -100, 65, 0.23], //12
  [0, 0, 10, 70, -60, 70, 0.2], //1
  [0, 0, 15, 65, -65, 65, 0.18], //2 
  [0, 0, 20, 92, -80, 92, 0.24], //3
  [0, 0, 20, 70, -60, 73, 0.22], //4
  [0, 0, 10, 60, -70, 60, 0.2], //5
  [0, 0, 30, 80, -80, 80, 0.22], //6
  [0, 0, 0, 60, -70, 60, 0.2], //7
  [0, 0, 20, 82, -65, 82, 0.2], //8
  [0, 0, 10, 55, -60, 55, 0.2], //9
  [0, 0, 40, 65, -120, 65, 0.25], //10
  [0, 0, 15, 28, -65, 28, 0.2]
];

// ----------------------------------------------
var Heart = {
  x: 0,
  y: 0,
  x1: 0,
  y1: 0,
  size: 1,
  Init: function(x, y, x1, y1, size){
    this.x = x;
    this.y = y;
    this.x1 = x1;
    this.y1 = y1;
    this.size = size;
  },
  Update: function(){
    if (isChangeHour){
      this.Init(
        Numbers[hour12].x,
        Numbers[hour12].y,
        HeartParameter[hour12][2],
        HeartParameter[hour12][3],
        HeartParameter[hour12][4]
      );
    }
  },
  Draw: function(){
      this.Update();
      push();
      translate(this.x, this.y);
      rotate(nowWalkDegree);
      var s = this.size;
      if(frameCount%20 == 0) s *= 1.25;
      image(heartImage, this.x1, this.y1,
        heartImage.width * s, heartImage.height * s);
      pop();
  }
};

var HeartParameter = [
  [0,0,100,-50,0.13], //12
  [0,0,25,73,0.08], //1
  [0,0,0,40,0.095], //2
  [0,0,50,30,0.14], //3
  [0,0,33,48,0.08], //4
  [0,0,35,32,0.1], //5
  [0,0,-35,-30,0.12], //6
  [0,0,18,38,0.09], //7
  [0,0,-33,20,0.1], //8
  [0,0,23,43,0.08], //9
  [0,0,100,68,0.12], //10
  [0,0,45,50,0.075] //11
];


// ----------------------------------------------
function init() {

  for (var i = 0; i < NumbersParameter.length; i++) {
    var n = Object.assign({}, ClassNumber);
    n.Init(NumbersParameter[i][0],
      NumbersParameter[i][1],
      NumbersParameter[i][2],
      NumbersParameter[i][3],
      NumbersParameter[i][4],
      NumbersParameter[i][5]
    );
    append(Numbers, n);
  }

  for (var i = 0; i < ClockHandsParameter.length; i++) {
    var c = Object.assign({}, ClassClockHands);
    c.Init(ClockHandsParameter[i][0],
      ClockHandsParameter[i][1],
      ClockHandsParameter[i][2],
      ClockHandsParameter[i][3],
      ClockHandsParameter[i][4],
      ClockHandsParameter[i][5]
    );
    append(ClockHands, c);
  }

  Eye.Init(EyeParameter[0][0],
    EyeParameter[0][1],
    EyeParameter[0][2],
    EyeParameter[0][3],
    EyeParameter[0][4],
    EyeParameter[0][5],
    EyeParameter[0][6],
    EyeParameter[0][7]
  );

  Leg.Init(
    LegParameter[0][0],
    LegParameter[0][1],
    LegParameter[0][2],
    LegParameter[0][3],
    LegParameter[0][4],
    LegParameter[0][5],
    LegParameter[0][6],
    LegParameter[0][7]
  );

  Heart.Init(
    HeartParameter[0][0],
    HeartParameter[0][1],
    HeartParameter[0][2],
    HeartParameter[0][3],
    HeartParameter[0][4]
  );
}

function setup() {

  init();

  //画像 setup image
  eyeImage1 = loadImage("https://raw.githubusercontent.com/mrdkosy/CMU-Material/master/eye2.png");
  eyeImage2 = loadImage("https://raw.githubusercontent.com/mrdkosy/CMU-Material/master/eye2.png");
  closedeyeImage1 = loadImage("https://raw.githubusercontent.com/mrdkosy/CMU-Material/master/closedeye2.png");
  closedeyeImage2 = loadImage("https://raw.githubusercontent.com/mrdkosy/CMU-Material/master/closedeye2.png");
  legImage1 = loadImage("https://raw.githubusercontent.com/mrdkosy/CMU-Material/master/leg_right3.png");
  legImage2 = loadImage("https://raw.githubusercontent.com/mrdkosy/CMU-Material/master/leg_left3.png");
  heartImage = loadImage("https://raw.githubusercontent.com/mrdkosy/CMU-Material/master/heart.png");

  //画面設定 screen settings
  Canvas = createCanvas(800, 800, P2D);
  setupShader();
  frameRate(30);
  textFont("Miltonian Tattoo");
  textAlign(CENTER);
  angleMode(DEGREES);
  imageMode(CENTER);
  pixelDensity(1);
  noStroke();

}

function draw() {


  background(214, 207, 203);
  translate(width / 2, height / 2);
  noStroke();


  //時間が変わったかどうか whether the hour has been just changed or not
  h = hour() % 12;
  //h = 8;
  if (isChangeHour) isChangeHour = false;
  if (hour12 != h) isChangeHour = true;
  hour12 = h;



  NumberAnimationControl();


  //描画 draw

  for (var i = 0; i < Numbers.length; i++)
    if (i != hour12) Numbers[i].Draw();
  for (var i = 0; i < ClockHands.length; i++) ClockHands[i].Draw();

  drawShader();

  push();
  translate(walkX, walkY);
  //Leg.Draw();
  Numbers[hour12].Draw();
  Eye.Draw();
  Heart.Draw();
  pop();

}

// ----------------------------------------------
function NumberAnimationControl() {

  if (isChangeHour) {
    isStartNumberAnimation = true;
    numberAnimationFrameCounter = 0;
  }

  //数字の大きさを変化させる change the size of numbers
  var nowHour = Numbers[hour12];
  var preHour = Numbers[(hour12 == 0 ? 11 : hour12 - 1)];
  if (isStartNumberAnimation) {

    var m = int(millis()) % 1000;
    nowHour.size = min(map(numberAnimationFrameCounter, 0, 5, nowHour.minSize, nowHour.maxSize), nowHour.maxSize);
    preHour.size = max(map(numberAnimationFrameCounter, 0, 5, preHour.maxSize, preHour.minSize), preHour.minSize);
    numberAnimationFrameCounter > 5 ? isStartNumberAnimation = false : numberAnimationFrameCounter++;
  }


  //歩く動き walk motion
  if (second() == 10 && !isWalk) isWalk = true; //debug---

   
  if (isWalk) { //歩いている walking
    nowWalkDegree += rotateSpeed;
    if (maxWalkDegree <= nowWalkDegree || -maxWalkDegree >= nowWalkDegree) 
    	rotateSpeed *= -1;
    
    if(!isOutsideBother){ //どこかへ行く
      if(Numbers[hour12].x < 0) walkX += walkSpeed;
      else walkX -= walkSpeed;
    	walkY += walkSpeed*sin(frameCount);
      
      
    }else{ //戻ってくる      
      var normX = -norm(walkX, -400-Numbers[hour12].x, 400-Numbers[hour12].x);
      var normY = -norm(walkY, -400-Numbers[hour12].y, 400-Numbers[hour12].y);
      
      var i = 100.0;
      var j = 100.0;
            
    	if(abs(walkX) < 50) i = 10.0;
      if(abs(walkY) < 50) j = 10.0;
      
      var VX,VY;
      walkX < 0 ? VX = min(-(walkX)/i, walkSpeed) : VX = max(-(walkX)/i, -walkSpeed);
      walkY < 0 ? VY = min(-(walkY)/j, walkSpeed) : VY = max(-(walkY)/j, -walkSpeed);
      
      walkX += VX;
      walkY += VY;

      if( abs(walkX) < 5 && abs(walkY) < 5){ //定位置に戻る
        walkX = 0;
        walkY = 0;
        isWalk = false;
        isOutsideBother = false;
        nowWalkDegree = 0;
      }    
  	}
  }
  
  var _x = Numbers[hour12].x + walkX;
  var _y = Numbers[hour12].y + walkY;
  if( _x > border2 || _y > border2 || _x < -border2 || _y < -border2) 
  	isOutsideBother = true; //border2の外に出たか　outside border2 or not
  
  

}
// ----------------------------------------------
//shader program
function setupShader() {
  shaderCanvas = createGraphics(800, 800, WEBGL);
  program = shaderCanvas.createShader(vert, frag);
  shaderCanvas.noStroke();
}

function drawShader() {

  shaderCanvas.background(0);
  shaderCanvas.fill(255);
  shaderCanvas.shader(program);
  program.setUniform('resolution', [shaderCanvas.width, shaderCanvas.height]);
  program.setUniform('time', shaderTimeControl);
  program.setUniform('image0', Canvas);
  program.setUniform('isRoll', isRoll);
  shaderCanvas.rect(-shaderCanvas.width / 2, -shaderCanvas.height / 2,
    shaderCanvas.width, shaderCanvas.height);
  image(shaderCanvas, 0, 0);



  var _x = Numbers[hour12].x + walkX;
  var _y = Numbers[hour12].y + walkY;

  //画面の外に出たか outside screen or not
  if( _x > width/2 || _y > height/2 || _x < -width/2 || _y < -height/2){
	if(!isOutsideScreen) moreRoll +=0.2;
  }else {
  	isOutsideScreen = false;
  	moreRoll = 0;
    moreRoll2 = 0;
  }
  moreRoll2 += moreRoll;

  //border1の外に出たか outside border1 or not
  if( _x > border1 || _y > border1 || _x < -border1 || _y < -border1) 
  		isOutsideScreen = true;


  //画面を捻る twist screen
  if (isOutsideScreen) {
    isRoll = true;
    shaderTimeControl += 0.05;
  } else {
    if (shaderTimeControl > 0) shaderTimeControl -= 1;
    else{
    	shaderTimeControl = 0;
    }
    isRoll = false;
  }
}

var vert = `
#ifdef GL_ES
    precision highp float;
    precision highp int;

#endif

    // attributes, in
    attribute vec3 aPosition;
    attribute vec3 aNormal;
    attribute vec2 aTexCoord;
    attribute vec4 aVertexColor;

    // attributes, out
    varying vec3 var_vertPos;
    varying vec4 var_vertCol;
    varying vec3 var_vertNormal;
    varying vec2 var_vertTexCoord;

    // matrices
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;
    //uniform mat3 uNormalMatrix;

    void main() {
      gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);

      // var_vertPos      = aPosition;
      // var_vertCol      = aVertexColor;
      // var_vertNormal   = aNormal;
      var_vertTexCoord = aTexCoord;

}`;

var frag = `
precision highp float;
#define PI 3.14159265359
varying vec2 var_vertTexCoord;

uniform vec2 resolution;
uniform float time;
uniform sampler2D image0;
uniform bool isRoll;

void main(void)
{
		
		vec2 uv = var_vertTexCoord;
		vec2 st = 2.0*uv - 1.0;
		
		
		//roll	
	
		float len = length(st);
		//float speed = pow(len,2.0)*0.05;
		float speed = len*0.2;
		float t = time*speed;
		st = mat2(
			cos(t), -sin(t),
			sin(t), cos(t)
		)*st;
	
		st = (st+vec2(1.0))/2.0;
		vec4 color = texture2D(image0, st);

		gl_FragColor = color;

		//gl_FragColor = vec4(st, 0.0, 1.0);//texture2D(image0, uv);
		
}`;