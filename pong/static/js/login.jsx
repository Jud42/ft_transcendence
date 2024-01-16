
const home = (
	`
	<main id="app">
		<section class="py-5">
			<div class="container">
				<div class="row gy-4">
					<div class="col-12 col-md-12">
						<div class="login-container">
							<h1>Log in</h1>
								<form action="http://localhost:8000/auth/login" method="post">
									<button type="submit" class="btn bg-vert">Connexion</button>
								</form>
						</div>
					</div>
				</div>
			</div>
			<div class="container-info">
				<section class="py-4 mb-4 text-center">
					<div class="container-fluid">
						<div class="row justify-content-center align-items-center">
							<div class="col-lg-6">
								<div class="scrolling-text-container">
									<p class="custom-spacing">Welcome to the Pong-Chos website !</p>
									<p class="custom-spacing">                                                                  </p>
									<P class="custom-spacing">To access to the game and the chat, please log in...</P>
								</div>
							</div>
						</div>
					</div>
				</section>
			</div>
			<section>
				<div class="espace">
					<div class="container-fluid">
						<p></p>
					</div>
				</div>
			</section>
		</section>
</main >`

);

export default home;