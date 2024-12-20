export function remote(gameId) {

    const socket = new WebSocket(`ws://${window.location.host}/ws/game/${gameId}/`);

    let gameBoard = document.getElementById("gameBoard");
    let ctx = gameBoard.getContext("2d");
    let scoreText = document.getElementById("scoreText");
    let gameWidth = gameBoard.width;
    let gameHeight = gameBoard.height;
    let paddle1 = { width: 20, height: 100, x: 10, y: 5 };
    let paddle2 = { width: 20, height: 100, x: gameWidth - 30, y: gameHeight - 105 };
    let ball = { x: gameWidth / 2, y: gameHeight / 2, speed: 1 };
    let score = [0, 0];
    const boardBackground = "black";
    const paddleBorder = "white";
    const paddle1Color = "white";
    const paddle2Color = "white";
    const ballColor = "white";
    const ballBorderColor = "white";
    const ballRadius = 12.5;
    let gameRunning = false;
    let player1;
    let player2;
    
    let lastState = null;
    let currentState = null;
    
    function updatePlayerNames() {
        document.getElementById('player1').textContent = player1;
        document.getElementById('player2').textContent = player2;
    }

    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    function fetchPlayerNames() {
        fetch(`/game/${gameId}/get-nickname/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            }
        })
        .then(response => response.json())
        .then(data => {
            player1 = data.player1_nickname;
            player2 = data.player2_nickname;
            console.log(player1);
            console.log(player2);
            updatePlayerNames();
        })
        .catch(error => {
            console.error('Erreur lors de la requête AJAX :', error);
        });
    }

    function draw() {
        if (!gameRunning) return;
        clearBoard();
        
        interpolateState(); // Calculer les positions interpolées

        drawPaddles();
        drawBall();
        
        requestAnimationFrame(draw);
    }

    function clearBoard() {
        ctx.fillStyle = boardBackground;
        ctx.fillRect(0, 0, gameWidth, gameHeight);
        ctx.strokeStyle = "white";
        ctx.beginPath();
        ctx.moveTo(gameWidth / 2, 0);
        ctx.lineTo(gameWidth / 2, gameHeight);
        ctx.stroke();
    }

    function drawPaddles() {
        ctx.strokeStyle = paddleBorder;
        ctx.fillStyle = paddle1Color;
        ctx.fillRect(paddle1.x, paddle1.y, paddle1.width, paddle1.height);
        ctx.strokeRect(paddle1.x, paddle1.y, paddle1.width, paddle1.height);
        ctx.fillStyle = paddle2Color;
        ctx.fillRect(paddle2.x, paddle2.y, paddle2.width, paddle2.height);
        ctx.strokeRect(paddle2.x, paddle2.y, paddle2.width, paddle2.height);
    }

    function drawBall() {
        ctx.fillStyle = ballColor;
        ctx.strokeStyle = ballBorderColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ballRadius, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.fill();
    }

    function setupMovementControls() {
        const keyMappings = {
            qwerty: {
                up: 'w',
                down: 's',
                left: 'a',
                right: 'd',
            },
            azerty: {
                up: 'z',
                down: 's',
                left: 'q',
                right: 'd',
            },
            arrows: {
                up: 'ArrowUp',
                down: 'ArrowDown',
                left: 'ArrowLeft',
                right: 'ArrowRight',
            },
        };
    
        let detectedLayout = null;
    
        gameBoard.focus();
    
        gameBoard.onkeydown = function (event) {
            if (event.key in keyMappings.azerty || event.key in keyMappings.qwerty || event.key in keyMappings.arrows)
                event.preventDefault(); // Empêcher le défilement de la page avec les flèches
    
            if (!detectedLayout) {
                if (event.key === 'w' || event.key === 'a') detectedLayout = 'qwerty';
                else if (event.key === 'z' || event.key === 'q') detectedLayout = 'azerty';
                else if (event.key.startsWith('Arrow')) detectedLayout = 'arrows';
    
                console.log(`Keyboard layout detected : ${detectedLayout}`);
            }
    
            const layout = detectedLayout || 'azerty';
    
            if (event.key === keyMappings[layout].up || event.key === keyMappings.arrows.up) {
                socket.send(JSON.stringify({ type: 'game_move', direction: 'UP' }));
            } else if (event.key === keyMappings[layout].down || event.key === keyMappings.arrows.down) {
                socket.send(JSON.stringify({ type: 'game_move', direction: 'DOWN' }));
            } else if (event.key === keyMappings[layout].left || event.key === keyMappings.arrows.left) {
                socket.send(JSON.stringify({ type: 'game_move', direction: 'LEFT' }));
            } else if (event.key === keyMappings[layout].right || event.key === keyMappings.arrows.right) {
                socket.send(JSON.stringify({ type: 'game_move', direction: 'RIGHT' }));
            }
        };
    }

    document.getElementById("start-game").onclick = function () { socket.send(JSON.stringify({ 'type': 'player_ready' })); };
    document.getElementById("stop-game").onclick = stopGame;

    function startGame() {
        if (!gameRunning) {
            gameRunning = true;
            draw();
            setupMovementControls();
        }
    }

    function stopGame() {
        console.log("Asking for pause");
        socket.send(JSON.stringify({ 'type': 'player_pause' }));
    }

    function endGame() {
        gameRunning = false;
        clearBoard();
        let winnerMessage = "Game Over!";
        if (score[0] > score[1]) {
            winnerMessage += player1 + " wins!";
        } else if (score[0] < score[1]) {
            winnerMessage += player2 + " wins!";
        } else {
            winnerMessage += "It's a draw!";
        }

        document.getElementById("modalGame-message").textContent = winnerMessage;
        let myModalGame = new bootstrap.Modal(document.getElementById("myModalGame"), {});
        myModalGame.show();
    }

    function updateScore(team) {
        score[team] += 1;
        scoreText.textContent = `${score[0]} : ${score[1]}`;
    }

    function updateGame(state) {
        lastState = currentState;
        currentState = { ...state, timestamp: performance.now() };
    }

    function updateStatus(status) {
        if (status == "PLAY") startGame();
        else if (status == "PAUSE") stopGame();
        else if (status == "END") endGame();
    }

    document.getElementById("closeRulesButton").addEventListener("click", toggleRules);
    function toggleRules() {
        var rulesContent = document.getElementById("rulesContent");
        var closeButton = document.getElementById("closeRulesButton");
        if (rulesContent.style.display === "none") {
            rulesContent.style.display = "block";
            closeButton.textContent = "✗";
        } else {
            rulesContent.style.display = "none";
            closeButton.textContent = "-";
        }
    }

    socket.onopen = function (event) {
        console.log("Connected to WebSocket server");
        fetchPlayerNames();
        socket.send(JSON.stringify({ 'type': 'game_join', 'gameId': gameId }));
    };
    
    socket.onmessage = function (event) {
        const data = JSON.parse(event.data);
        if (data.type == "game_ready") console.log(`Player ${data.player} is ready`);
        else if (data.type == "game_status") updateStatus(data.status);
        else if (data.type == "game_update") updateGame(data.state);
        else if (data.type == "game_score") updateScore(data.team);
        else console.log(`Unknown data.type: ${data.type}`)
    };

    clearBoard();
    updateScore();

    function interpolateState() {
        if (!lastState || !currentState) return;

        const now = performance.now();
        const progress = Math.min((now - currentState.timestamp) / 100, 1); // Interpolation linéaire sur 100ms

        ball.x = lastState.ball_x + progress * (currentState.ball_x - lastState.ball_x);
        ball.y = lastState.ball_y + progress * (currentState.ball_y - lastState.ball_y);

        paddle1.y = lastState.player_0_y + progress * (currentState.player_0_y - lastState.player_0_y);
        paddle2.y = lastState.player_1_y + progress * (currentState.player_1_y - lastState.player_1_y);
    }
}
