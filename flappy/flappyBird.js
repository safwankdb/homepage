var cvs = document.getElementById("canvas");
var ctx = cvs.getContext("2d");

// load images

var bird = new Image();
var bg = new Image();
var fg = new Image();
var pipeNorth = new Image();
var pipeSouth = new Image();

bird.src = "/flappy/images/bird.png";
bg.src = "/flappy/images/bg.png";
fg.src = "/flappy/images/fg.png";
pipeNorth.src = "/flappy/images/pipeNorth.png";
pipeSouth.src = "/flappy/images/pipeSouth.png";


// some variables

var gap = 85;
var constant;

var bX = 50;
var bY = 150;
var t = 0;
var jump = 2;
var gravity = 0.035;
var vY = 0;
var score = 0;
var paused = false;
var step = 1.2;
var step_speedup_factor = 1.02;
var A_speedup_factor = 1.05;
var F_speedup_factor = 1.05;
var A = 10;
var F = 1 / 200;
var highscore = localStorage.getItem("highscore");


// audio files

var fly = new Audio();
var scor = new Audio();

fly.src = "sounds/fly.mp3";
scor.src = "sounds/score.mp3";

// on key down

document.addEventListener("keydown", moveUp);
document.addEventListener('keydown', pauseGameKeyHandler, false);

function togglePause() {
    paused = !paused;
    draw();
}

function pauseGameKeyHandler(e) {
    var keyCode = e.keyCode;
    switch (keyCode) {
        case 32: //space
            togglePause();
            break;
    }
}

function moveUp() {
    vY = jump;
    t = 0;
    fly.play();
}

function gaussianRandom(samples) {
    var ans = 0;
    for (let i = 0; i < samples; i++) {
        ans += Math.random();
    }
    return ans / samples;
}

// pipe coordinates
var pipe = [];
for (var i = 0; i < 3; i++) {
    pipe.push({
        x: cvs.width + 200 * i + Math.floor(100 * gaussianRandom(5)),
        y: Math.floor(gaussianRandom(3) * pipeNorth.height) - pipeNorth.height,
        freq: 2 * Math.PI * Math.random() * F,
        A: A * Math.random(),
        phase: Math.random() * 2 * Math.PI,
        offset: 0,
        passed: false,
    }
    )
}


// draw images
function draw() {
    ctx.drawImage(bg, 0, 0, cvs.height, cvs.height);
    pipe = pipe.filter(function (item) {
        return item.x > -60
    })
    for (var i = 0; i < pipe.length; i++) {
        pipe[i].offset = pipe[i].A * Math.sin(pipe[i].freq * pipe[i].x + pipe[i].phase);
        pipe[i].offset = Math.min(pipe[i].offset, -pipe[i].y);
    }
    for (var i = 0; i < pipe.length; i++) {
        constant = pipeNorth.height + 100 + 40 * Math.floor(gaussianRandom(3));
        ctx.drawImage(pipeNorth, pipe[i].x, pipe[i].y + pipe[i].offset);
        ctx.drawImage(pipeSouth, pipe[i].x, pipe[i].y + constant + pipe[i].offset);
        pipe[i].x -= step;
        if (pipe[i].x <= 0) {
            pipe.push({
                x: pipe[pipe.length - 1].x + 180 + Math.floor(120 * gaussianRandom(5)),
                y: Math.floor(gaussianRandom(3) * pipeNorth.height) - pipeNorth.height,
                freq: 2 * Math.PI * (0.6+0.4*Math.random()) * F,
                A: A * (0.6+0.4*Math.random()),
                phase: Math.random() * Math.PI * 2,
                offset: 0,
                passed: false,
            });
        }
        // detect collision
        if (bX + bird.width - 2 >= pipe[i].x && bX <= pipe[i].x + pipeNorth.width && (bY <= pipe[i].y + pipe[i].offset + pipeNorth.height || bY + bird.height - 2 >= pipe[i].y + pipe[i].offset + constant)) {
            location.reload(); // reload the page
            return;
        }
        if (pipe[i].x <= 0 && !pipe[i].passed) {
            score++;
            scor.play();
            step *= step_speedup_factor;
            A *= A_speedup_factor;
            A = Math.min(100, A)
            F *= F_speedup_factor;
            F = Math.min(1/50, F);
            pipe[i].passed = true;
        }
    }
    ctx.drawImage(fg, 0, cvs.height - fg.height, cvs.height, fg.height);
    ctx.drawImage(bird, bX, bY);
    bY += -vY + gravity * (2 * t + 1);
    t++;
    if (bY + bird.height >= cvs.height - fg.height) {
        location.reload();
        return;
    }
    if (!paused) {
        requestAnimationFrame(draw);
    }
    if(highscore !== null){
        if (score > highscore) {
            localStorage.setItem("highscore", score);      
        }
    }
    else{
        localStorage.setItem("highscore", score);
    }    
    ctx.fillStyle = "#000";
    ctx.font = "20px Verdana";
    ctx.fillText("Score : " + score, 10, cvs.height - 20);
    ctx.fillText("High Score : " + highscore, cvs.width/2 + 10, cvs.height - 20);
    console.log(A, F);
}

draw();
