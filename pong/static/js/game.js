export function game(gameId) {
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
	let player1;
	let player2;
	let ballSpeed;
	let paddleSpeed;
	let paddle1Color;
	let paddle2Color;
	let ballColor;
	let boardBackground;
	const paddleBorder = "white";
	const ballBorderColor = "white";
	const ballRadius = 12.5;
	// const paddleSpeed = {{ paddle_speed }};
	let gameRunning = false;

	// État des touches
	const keys = {
		w: false,
		s: false,
		z: false,
		q: false,
		d: false,
		ArrowUp: false,
		ArrowDown: false,
		ArrowLeft: false,
		ArrowRight: false
	};

	// Gestionnaire d'événements pour les touches
	function handleKeyDown(e) {
		if (e.key in keys) {
			keys[e.key] = true;
			e.preventDefault(); // Empêcher le défilement de la page avec les flèches
		} else {
			const key = e.key.toLowerCase();
			if (key in keys) {
				keys[key] = true;
			}
		}
	}

	function handleKeyUp(e) {
		if (e.key in keys) {
			keys[e.key] = false;
		} else {
			const key = e.key.toLowerCase();
			if (key in keys) {
				keys[key] = false;
			}
		}
	}

	// Mise à jour de la position des paddles
	function updatePaddlePositions() {
		if (!gameRunning) return;

		// Paddle 1 (QWERTY + AZERTY)
		if ((keys.w || keys.z) && paddle1.y > 0) {
			paddle1.y -= paddleSpeed;
		}
		if (keys.s && paddle1.y < gameHeight - paddle1.height) {
			paddle1.y += paddleSpeed;
		}
		if (keys.q && paddle1.x > 0) {
			paddle1.x -= paddleSpeed;
		}
		if (keys.d && paddle1.x < gameWidth / 4) {
			paddle1.x += paddleSpeed;
		}

		// Paddle 2 (Flèches)
		if (keys.ArrowUp && paddle2.y > 0) {
			paddle2.y -= paddleSpeed;
		}
		if (keys.ArrowDown && paddle2.y < gameHeight - paddle2.height) {
			paddle2.y += paddleSpeed;
		}
		if (keys.ArrowLeft && paddle2.x > gameWidth * 3/4) {
			paddle2.x -= paddleSpeed;
		}
		if (keys.ArrowRight && paddle2.x < gameWidth - paddle2.width) {
			paddle2.x += paddleSpeed;
		}
	}

	function initializeGame() {
		fetch('/profil/settings/data/')
			.then(response => response.json())
			.then(data => {
				console.log(data);
				ballSpeed = data.ballSpeed;
				paddleSpeed = data.paddleSpeed;
				paddle1Color = data.paddleColor;
				paddle2Color = data.paddleColor;
				ballColor = data.ballColor;
				boardBackground = data.backgroundColor;
				console.log("ball speed: ", ballSpeed);
				console.log("paddle speed: ", paddleSpeed);
			})
			.catch(error => {
				console.error('Erreur lors de la requête AJAX :', error);
			});

		fetch(`/game/${gameId}/get-nickname/`)
			.then(response => response.json())
			.then(data => {
				player1 = data.player1_nickname;
				player2 = data.player2_nickname;
				console.log(player1);
				console.log(player2);
				document.getElementById('player1').textContent = player1;
				document.getElementById('player2').textContent = player2;
			})
			.catch(error => {
				console.error('Erreur lors de la requête AJAX :', error);
			});

		fetch(`/game/${gameId}/get-scores/`)
			.then(response => response.json())
			.then(data => {
				player1Score = data.player1Score;
				player2Score = data.player2Score;
				console.log(player1Score);
				console.log(player2Score);
			})
			.catch(error => {
				console.error('Erreur lors de la requête AJAX :', error);
			});

		gameBoard = document.getElementById("gameBoard");
		ctx = gameBoard.getContext("2d");
		scoreText = document.getElementById("scoreText");
		gameWidth = gameBoard.width;
		gameHeight = gameBoard.height;
		player1Score = 0;
		player2Score = 0;
		paddle1 = { width: 25, height: 100, x: 10, y: 0 };
		paddle2 = { width: 25, height: 100, x: gameWidth - 35, y: gameHeight - 100 };
		gameRunning = false;
		// ballSpeed = 1;
		ballX = gameWidth / 2;
		ballY = gameHeight / 2;
		ballXDirection = 0;
		ballYDirection = 0;
		clearBoard();
		document.getElementsByClassName("close")[0].addEventListener("click", function () {
			document.getElementById("myModalGame").style.display = "none";
		});
		document.querySelector('.modalButton').addEventListener('click', function () {
			document.getElementById("myModalGame").style.display = "none";
		});
	}

	document.getElementById("start-game").addEventListener("click", startGame);
	document.getElementById("stop-game").addEventListener("click", stopGame);

	function drawGame() {
		clearBoard();
		drawPaddles();
		drawBall(ballX, ballY);
	}

	function clearBoard() {
		ctx.fillStyle = boardBackground;
		ctx.fillRect(0, 0, gameWidth, gameHeight);
		ctx.strokeStyle = 'white';
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

	function moveBall() {
		ballX += ballSpeed * ballXDirection;
		ballY += ballSpeed * ballYDirection;
	}

	function drawBall(ballX, ballY) {
		ctx.fillStyle = ballColor;
		ctx.strokeStyle = ballBorderColor;
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.arc(ballX, ballY, ballRadius, 0, 2 * Math.PI);
		ctx.stroke();
		ctx.fill();
	}

	function createBall() {
		ballX = gameWidth / 2;
		ballY = gameHeight / 2;
		drawBall(ballX, ballY);
		ballXDirection = Math.random() < 0.5 ? -1 : 1;
		ballYDirection = Math.random() < 0.5 ? -1 : 1;
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
		endGame();
	}

	function updateScore() {
		scoreText.textContent = `${player1Score} : ${player2Score}`;
	}

	function startGame() {
		if (!gameRunning) {
			gameRunning = true;
			createBall();
			document.getElementById("gameBoard").focus();
			// Ajouter les écouteurs d'événements
			document.addEventListener("keydown", handleKeyDown);
			document.addEventListener("keyup", handleKeyUp);
			// Démarrer la boucle de jeu
			gameLoop();
		}
	}

	function stopGame() {
		gameRunning = false;
		// Retirer les écouteurs d'événements
		document.removeEventListener("keydown", handleKeyDown);
		document.removeEventListener("keyup", handleKeyUp);
	}

	function endGame() {
		const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
		if (!csrftoken) {
			console.error('CSRF token not found');
			return;
		}
		if (player1Score >= 5 || player2Score >= 5) {
		// if (player1Score >= 1 || player2Score >= 1) {
			stopGame();
			let winnerMessage = "Game Over! ";
			if (player1Score > player2Score) {
				winnerMessage += player1 + " wins!";
			} else if (player2Score > player1Score) {
				winnerMessage += player2 + " wins!";
			} else {
				winnerMessage += "It's a draw!";
			}

			document.getElementById("modalGame-message").textContent = winnerMessage;
			document.getElementById("myModalGame").style.display = "block";
			var data = {
				player1Score: player1Score,
				player2Score: player2Score
			};

			fetch(`/game/${gameId}/get-scores/`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-Requested-With': 'XMLHttpRequest',
					'X-CSRFToken': csrftoken,
				},
				body: JSON.stringify(data),
			})
				.then(response => response.json())
				.then(result => {
					console.log("score_end:", player1Score);
					console.log("score_end:", player2Score);
					// met à jour le statut du user en ligne a la fin du jeu
					fetch('/update-status/', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							'X-CSRFToken': csrftoken,
						}
					})
						.then(response => response.json())
						.then(data => console.log(data))
						.catch(error => console.error('Error updating user status:', error));
				})
				.catch(error => {
					console.error('Error Fetch request :', error);
				});
		}
	}

	function gameLoop() {
		if (gameRunning) {
			updatePaddlePositions();
			moveBall();
			checkCollision();
			drawGame();
			requestAnimationFrame(gameLoop);
		}
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

	initializeGame();
	updateScore();
}