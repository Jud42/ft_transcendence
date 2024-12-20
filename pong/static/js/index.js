import { router } from "./router.js";

export var socket = new WebSocket(`ws://${window.location.host}/ws/`);

document.onpopstate = router;
window.addEventListener("popstate", router);
window.addEventListener("DOMContentLoaded", router);
window.addEventListener("click", e => {
	if (e.target.hasAttribute("url")) {
		e.preventDefault();
		history.pushState(null, null, e.target.getAttribute("url"));
		router();
	} else if (e.target.matches("[data-link]")) {
		e.preventDefault();
		history.pushState(null, null, e.target.getAttribute("data-link"));
		router();
	}
});

console.log('index called');


// < !--SCRIPT BOUTON NB / COLOR-- >
document.addEventListener('DOMContentLoaded', function () {
	const toggleSwitch = document.getElementById('toggle-switch');
	const nightModeOn = document.getElementById('nightModeOn');
	const nightModeOff = document.getElementById('nightModeOff');
	const separator = document.querySelector('.separator');
	const footer = document.getElementById('footer');
	const signupContainer = document.getElementById('signup-container');
	const loginContainer = document.getElementById('login-container');


	let nightModeActivated = false;

	nightModeOn.addEventListener('click', function () {
		if (!nightModeActivated) {
			toggleSwitch.checked = true;
			document.body.classList.add('night-mode');
			separator.style.background = 'black';
			toggleSwitch.dispatchEvent(new Event('change'))
			nightModeActivated = true;
		}
	});

	nightModeOff.addEventListener('click', function () {
		if (nightModeActivated) {
			toggleSwitch.checked = false;
			document.body.classList.remove('night-mode');
			separator.style.background = '';
			toggleSwitch.dispatchEvent(new Event('change'));
			nightModeActivated = false;
		}
	});

	document.addEventListener("mousemove", function(event) {
		const mouseY = event.clientY;
		const windowHeight = window.innerHeight;
	
		// If the cursor is close to the bottom of the window, show the footer
		//console.log(`position mouse Y: ${mouseY}`);
		if (mouseY >= windowHeight - 10) {
			footer.classList.add("show");
		} else if (mouseY < windowHeight - 40) {
			footer.classList.remove("show");
		}
	});

	if (signupContainer) {

		signupContainer.addEventListener("submit", function(event) {
			console.log("submit signupContainer");
			event.preventDefault();
			const data = {
				username: document.getElementById("username").value,
				email: document.getElementById("email").value,
				password: document.getElementById("password").value,
				passwordRepeat: document.getElementById("passwordRepeat").value
			};
			console.log(`mp: ${data.password}\nmprepeat: ${data.passwordRepeat}`);
			if (data.password !== data.passwordRepeat)
				alert("Password not match !");
			else {
				
				fetch("/accounts/signup/", { 
					method: "POST",
					headers: { 
						"Content-Type": "application/json", 
					},
					body: JSON.stringify(data)
				})
				.then(response => response.json())
				.then(data => {
					if (data.status == "error")
						throw new Error(data.message);
					console.log("success");
					window.location.href = data.redirect_uri;
				})
				.catch((error) => {
					console.error("error", error);
					alert(error);
				});
			}	
		});
	}
	else if (loginContainer) {
		
		document.getElementById("loginForm").addEventListener("submit", function(event) {
			console.log("submit loginForm");
			event.preventDefault();
			
			const data = {
				username: document.getElementById("username").value,
				password: document.getElementById("password").value,
			};
			console.log(`username: ${data.username}\nmpass: ${data.password}`);
			
			fetch("/accounts/login-form/", { 
				method: "POST",
				headers: { 
					"Content-Type": "application/json", 
				},
				body: JSON.stringify(data)
			})
			.then(response => response.json())
			.then(data => {
				if (data.status == "error")
					throw new Error(data.message);
				console.log(data.message);
				window.location.href = data.redirect_uri;
			})
			.catch((error) => {
				console.error("error", error);
				alert(error);
			});

		});	
	}
	
});