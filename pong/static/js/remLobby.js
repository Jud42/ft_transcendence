import { socket } from './index.js';
import { router } from './router.js';

export function remLobby(gameId) {
	let button = document.getElementById('startButton');
	let isNicknameValid = false;

	socket.onmessage = function (event) {
		const data = JSON.parse(event.data);
		if (data.type == "game_invitation" && data.message.includes("#accept")) {
			const gameId = parseInt(data.message.split(' ')[1]);
			history.pushState(null, null, `/remote/${gameId}`);
			router();
		}
	};


	document.getElementById('inviteButton').addEventListener('click', function () {
		var player2Nickname = document.getElementById('player2').value;
		const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

		// Bloque l'invitation à soi-même
		if (player2Nickname.trim() === document.getElementById('player1_username').value) {
			notificationManager.showTemporaryNotification(
				"You can't play against yourself !",
				'info'
			);
			return;
		}

		if (player2Nickname.trim() !== "") {
			fetch(`/remLobby/${encodeURIComponent(player2Nickname)}/`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-CSRFToken': csrftoken,
				},
				body: JSON.stringify({ player2Nickname: player2Nickname })
			})
			.then(response => response.json())
			.then(result => {
				if (result.error) {
					notificationManager.showTemporaryNotification(
						result.error,
						'error'
					);
					isNicknameValid = false;
				} else {
					document.getElementById('onlineFriend').textContent = player2Nickname;
					isNicknameValid = true;
					notificationManager.showTemporaryNotification(
						"Invitation sent successfully!",
						'success'
					);
				}
			})
			.catch(error => {
				console.error('Error:', error);
				notificationManager.showTemporaryNotification(
					"Error sending invitation",
					'error'
				);
				isNicknameValid = false;
			});
		} else {
			notificationManager.showTemporaryNotification(
				"Please enter the nickname of player 2 before inviting.",
				'info'
			);
			isNicknameValid = false;
		}
	});

	button.addEventListener('click', e => {
		if (isNicknameValid == false) {
			e.preventDefault();
			e.stopPropagation();
			notificationManager.showTemporaryNotification(
				"Please enter a valid nickname first.",
				'info'
			);
		}
	});
}