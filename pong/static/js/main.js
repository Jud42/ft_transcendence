import { StartGame } from "./game.js";
import { profil } from "./profil.js";
import { chat } from "./chat.js";
// import { logout_user } from "./index.js";


function router() {
	const target = (location.pathname == "/") ? "/home" : location.pathname;
	const access_token = localStorage.getItem("access_token");
	console.log("Access_token:" + access_token);
	const headers = { "Authorization": access_token };
	fetch(target, { headers })
		.then(response => {
			if (response.redirected) {
				history.pushState(null, null, response.url);
			}
			return response.text();
		})
		.then(html => {
			document.querySelector("#app").innerHTML = html;
			if (target.startsWith("/profil")) profil();
			else if (target.startsWith("/chat")) chat();
		});
};



window.addEventListener("popstate", router);

window.addEventListener("DOMContentLoaded", router);

window.addEventListener("click", e => {
	if (e.target.matches("[data-link]")) {
		e.preventDefault();
		history.pushState(null, null, e.target.href);
		router();
	}
});
