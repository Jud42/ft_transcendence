const home = (
	`
	<div class="row gy-4 justify-content-center">
        <div class="col-md-6 mx-auto">
            <div class="container_hl">
                <div class="container_homeLeft">
                        <form action="/game" method="get">
                        <button type="submit" class="game-btn">
                            <img class="game-img" src="./src/img/game.png" alt="Image du game">
                        </button>
                    </form>
                </div>
            </div>
        </div>
        <div class="col-md-6 mx-auto">
            <div class="container_hr">
                <div class="container_homeR">
                    <form action="/chat" methode="get">
                        <button type="submit" class="chat-btn">
                            <img class="bulles-img" src="./src/img/Bulles.png" alt="Image des bulles">
                        </button>
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
              <P class="custom-spacing">Choose what do you want to do: play or chat ?</P>
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
	`
);

export default home;