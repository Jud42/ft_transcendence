export function game(){
    // const socket = new WebSocket(`ws://${window.location.host}/game/${gameId}/ws/`);
	  //document.addEventListener("keyup", test);
    //
  	//socket.onmessage = (event) => {
    // console.log("Rcvd: " + event.data);
  	//};
    //
  	//function test() {
	  // console.log("PAUSE");
  	// let myObj = { type: "PAUSE" };
    // socket.send(JSON.stringify(myObj));
  	//};

    let gameBoard;
    let ctx;
    let scoreText;
    let gameWidth;
    let gameHeight;
    let paddle1;
    let paddle2;
    let ballX;
    let ballY;
    let ballXDirection;
    let ballYDirection;
    let player1Score;
    let player2Score;
    let ballSpeed;
    const boardBackground = "black";
    const paddle1Color = "white";
    const paddle2Color = "white";
    const paddleBorder = "white";
    const ballColor = "white";
    const ballBorderColor = "white";
    const ballRadius = 12.5;
    const paddleSpeed = 12;
    // const paddleSpeed = {{ paddle_speed }};
    let gameRunning = false;

    function initializeGame() {
    gameBoard = document.getElementById("gameBoard");
    ctx = gameBoard.getContext("2d");
    scoreText = document.getElementById("scoreText");
    gameWidth = gameBoard.width;
    gameHeight = gameBoard.height;
    player1Score = 0;
    player2Score = 0;
    paddle1 = { width: 25, height: 100, x: 10, y: 5 };
    paddle2 = { width: 25, height: 100, x: gameWidth - 35, y: gameHeight - 105 };
    gameRunning = false;
    ballSpeed = 1;
    ballX = gameWidth / 2;
    ballY = gameHeight / 2;
    ballXDirection = 0;
    ballYDirection = 0;
    console.log("initialize1");
    clearBoard();
    console.log("initialize2");

    }

    document.getElementById("start-game").addEventListener("click", startGame);
    document.getElementById("stop-game").addEventListener("click", stopGame);
    document.getElementById("reset-game").addEventListener("click", resetGame);


    function draw() {
    if (!gameRunning) {
        return;
    }

    clearBoard();
    drawPaddles();
    moveBall();
    drawBall(ballX, ballY);
    checkCollision();
    // console.log("draw1");
    requestAnimationFrame(draw);
    // console.log("draw2");
    }

    function clearBoard() {
    ctx.fillStyle = boardBackground;
    ctx.fillRect(0, 0, gameWidth, gameHeight);
    ctx.strokeStyle = 'white';
    ctx.beginPath();
    ctx.moveTo(gameWidth / 2, 0);
    ctx.lineTo(gameWidth / 2, gameHeight);
    ctx.stroke();
    console.log("clearboard");
    }

    function drawPaddles() {
    ctx.strokeStyle = paddleBorder;

    ctx.fillStyle = paddle1Color;
    ctx.fillRect(paddle1.x, paddle1.y, paddle1.width, paddle1.height);
    ctx.strokeRect(paddle1.x, paddle1.y, paddle1.width, paddle1.height);

    ctx.fillStyle = paddle2Color;
    ctx.fillRect(paddle2.x, paddle2.y, paddle2.width, paddle2.height);
    ctx.strokeRect(paddle2.x, paddle2.y, paddle2.width, paddle2.height);
    console.log("drawpaddles");
    }

    function moveBall() {
    ballX += ballSpeed * ballXDirection;
    ballY += ballSpeed * ballYDirection;
    console.log("moveBall");
    }

    function drawBall(ballX, ballY) {
    ctx.fillStyle = ballColor;
    ctx.strokeStyle = ballBorderColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(ballX, ballY, ballRadius, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.fill();
    console.log("drawball");
    }

    function createBall() {
    ballSpeed = 2;
    ballXDirection = Math.random() < 0.5 ? -1 : 1;
    ballYDirection = Math.random() < 0.5 ? -1 : 1;

    ballX = gameWidth / 2;
    ballY = gameHeight / 2;
    drawBall(ballX, ballY);
    console.log("createBalle");
    }

    function checkCollision() {
    if (ballY <= 0 + ballRadius) {
        ballYDirection *= -1;
    }
    if (ballY >= gameHeight - ballRadius) {
        ballYDirection *= -1;
    }
    if (ballX <= 0) {
        player2Score += 1;
        updateScore();
        createBall();
        return;
    }
    if (ballX >= gameWidth) {
        player1Score += 1;
        updateScore();
        createBall();
        return;
    }
    if (ballX <= paddle1.x + paddle1.width + ballRadius) {
        if (ballY > paddle1.y && ballY < paddle1.y + paddle1.height) {
            ballX = paddle1.x + paddle1.width + ballRadius;
            ballXDirection *= -1;
            ballSpeed += 1;
        }
    }
    if (ballX >= paddle2.x - ballRadius) {
        if (ballY > paddle2.y && ballY < paddle2.y + paddle2.height) {
            ballX = paddle2.x - ballRadius;
            ballXDirection *= -1;
            ballSpeed += 1;
        }
    }
    console.log("checkCollision");
    }

    function changeDirection(event) {
    const keyPressed = event.keyCode;
    const paddle1Up = 87;
    const paddle1Down = 83;
    const paddle2Up = 38;
    const paddle2Down = 40;

    if (keyPressed === paddle2Down) {
        // Empêcher le défilement de la page vers le bas lors de l'appui sur la flèche vers le bas
        event.preventDefault();
    }

    switch (keyPressed) {
        case paddle1Up:
            if (paddle1.y > 0) {
                paddle1.y -= paddleSpeed;
            }
            break;
        case paddle1Down:
            if (paddle1.y < gameHeight - paddle1.height) {
                paddle1.y += paddleSpeed;
            }
            break;
        case paddle2Up:
            if (paddle2.y > 0) {
                paddle2.y -= paddleSpeed;
            }
            break;
        case paddle2Down:
            if (paddle2.y < gameHeight - paddle2.height) {
                paddle2.y += paddleSpeed;
            }
            break;
    }
    console.log("changedirection");
    }

    function updateScore() {
    scoreText.textContent = `${player1Score} : ${player2Score}`;
    console.log("updatescore");
    }

    function resetGame() {
    initializeGame();
    updateScore();
    console.log("resetGame");
    }

    function startGame() {
    console.log("startgame1");
    if (!gameRunning) {
        gameRunning = true;
        createBall();
        // draw();
        // document.getElementById("gameBoard").focus(); // Assurez-vous que le canevas a le focus
        // document.getElementById("gameBoard").addEventListener("keydown", changeDirection);
        // document.getElementById("gameBoard").addEventListener("keydown", changeDirection);
        document.getElementById("gameBoard").focus(); // Donner le focus au canevas
        draw();
        document.getElementById("gameBoard").addEventListener("keydown", changeDirection);
        console.log("startgame2");
    }
    console.log("startgame3");
    }

    function stopGame() {
    gameRunning = false;
    }

    // Appel initial pour l'initialisation
    initializeGame();
    updateScore();
}