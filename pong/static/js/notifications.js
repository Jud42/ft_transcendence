class NotificationManager {
    constructor() {
        this.container = document.createElement('div');
        this.container.id = 'notificationContainer';
        this.container.className = 'notification-container';
        document.body.appendChild(this.container);
        this.setupWebSocket();
    }

    setupWebSocket() {
        this.socket = new WebSocket(
            `ws://${window.location.host}/ws/notifications/`
        );

        this.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'game_invite') {
                this.showGameInvite(data);
            } else if (data.type === 'game_accepted') {
                // Afficher une notification temporaire pour l'hôte
                this.showTemporaryNotification(
                    `${data.inviter} a accepté votre invitation !`,
                    'success'
                );

                // Créer le jeu et rediriger
                const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
                if (!csrftoken) {
                    console.error('CSRF token not found');
                    this.showTemporaryNotification(
                        'Erreur: CSRF token manquant',
                        'error'
                    );
                    return;
                }

                setTimeout(() => {
                    console.log('Creating game with inviter:', data.inviter);
                    fetch('/remote/', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRFToken': csrftoken,
                            'X-Requested-With': 'XMLHttpRequest'
                        },
                        body: JSON.stringify({ 
                            inviter: data.inviter
                        })
                    })
                    .then(response => {
                        if (!response.ok) {
                            return response.json().then(data => {
                                throw new Error(data.error || 'Network response was not ok');
                            });
                        }
                        return response.json();
                    })
                    .then(data => {
                        console.log('Game created successfully:', data);
                        if (data.redirect) {
                            window.location.href = data.redirect;
                        } else {
                            throw new Error('No redirect URL provided');
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        this.showTemporaryNotification(
                            `Erreur lors de la création du jeu: ${error.message}`,
                            'error'
                        );
                    });
                }, 2000);

            } else if (data.type === 'game_declined') {
                // Afficher une notification temporaire pour l'hôte
                this.showTemporaryNotification(
                    `${data.inviter} a décliné votre invitation !`,
                    'success'
                );
            } else if (data.type === 'game_created') {
                // Afficher une notification temporaire pour l'hôte
                this.showTemporaryNotification(
                    `The game has been created by ${data.host} !`,
                    'success'
                );
                // Rediriger vers la page du jeu
                window.location.href = data.redirect_url;
            }
        };
    }

    showTemporaryNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                ${message}
            </div>
        `;
        
        this.container.appendChild(notification);
        
        // Auto-suppression après la durée spécifiée
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, duration);
    }

    showGameInvite(data) {
        const notification = document.createElement('div');
        notification.className = 'notification game-invite';
        notification.dataset.sender = data.sender;  // Stocker l'expéditeur pour l'utiliser lors de l'acceptation
        notification.innerHTML = `
            <div class="notification-content">
                <strong>${data.sender}</strong> vous invite à jouer une partie !
            </div>
            <div class="notification-actions">
                <button class="notification-accept" onclick="notificationManager.acceptInvite(this.parentElement.parentElement)">Accepter</button>
                <button class="notification-decline" onclick="notificationManager.declineInvite(this.parentElement.parentElement)">Décliner</button>
            </div>
        `;
        
        this.container.appendChild(notification);
        
        // Auto-suppression après 30 secondes
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 30000);
    }

    acceptInvite(notificationElement) {
        if (!notificationElement) {
            console.error('Notification element not found');
            return;
        }
        // Afficher une notification temporaire pour le joueur qui accepte
        this.showTemporaryNotification(
            'Invitation acceptée ! Redirection vers le jeu...',
            'success'
        );
        // Notifier l'hôte via WebSocket
        this.socket.send(JSON.stringify({
            'type': 'game_invitation_confirmation',
            'status': 'game_accepted',
            'invitation_sender': notificationElement.dataset.sender
        }));
        notificationElement.remove();

        // Rediriger après un court délai
        // setTimeout(() => {
        //     window.location.href = '/remote/';
        // }, 2000);
    }

    declineInvite(notificationElement) {
        if (!notificationElement) {
            console.error('Notification element not found');
            return;
        }
        this.showTemporaryNotification(
            'Invitation déclinée',
            'info'
        );
        this.socket.send(JSON.stringify({
            'type': 'game_invitation_confirmation',
            'status': 'game_declined',
            'invitation_sender': notificationElement.dataset.sender
        }));
        notificationElement.remove();
    }
}

// Initialiser le gestionnaire de notifications
window.notificationManager = new NotificationManager();
