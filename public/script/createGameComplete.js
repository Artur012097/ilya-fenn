import CreateGameAudio from "./audio.js";
import { vibrate } from "./vibrate.js";

// Create game complete stage
export const createGameComplete = ({
  selector,
  targets,
} = {}) => {
  const clickAudio = new CreateGameAudio("/game/sound/click.mp3");
  const api = localStorage.getItem("f_api");
  const token = localStorage.getItem("f_token");
  // passive (idle) rewards
  const przs = [5, 10, 15, "+1"];
  // wrapper element, where the complete block should be placed
  const el = document.querySelector(
    selector.startsWith(".") ? selector : `.${selector}`,
  )

  const html = `
		<div
          class="w-full h-full flex flex-col justify-center items-center absolute z-[5] ${targets ? "!w-screen !h-screen !fixed top-0 left-0" : ""}"
          id="completedWrapper"
        >
         <div class="w-full h-full flex flex-col justify-start items-center bg-black-100 bg-opacity rounded-[8px] p-40 id="completedContent">
        ${
          !targets
            ? `
        <img src="/game/images/sad_face.png" alt="Sad" />
		<h3 class="text-[36px] f-semi text-white-100 mt-[10px] mb-[20px]">
		  Time’s up
		</h3>
            <div class="w-full flex justify-center items-center gap-[6vw]">
		<button
                class="w-[50px] h-[50px] rounded-sm bg-[#1E3384] flex justify-center items-center"
				id="repeatBtn"
              >
                <img src="/game/icons/repeat.svg" alt="Main menu" />
              </button>
              <button
                class="w-[50px] h-[50px] rounded-[8px] bg-[#1E3384] flex justify-center items-center"
				id="backBtn"
              >
                <img src="/game/icons/menu.svg" alt="Menu" />
              </button>
            </div>`
            : `
         <h3 class="text-18 f-semi text-[#FEDA2C] mb-[45px]">
              Congratulations!
            </h3>
            <div class="r-collected w-[180px] h-[64px] flex justify-center items-center rounded-sm" id="collected">
                <img src="/game/icons/coin_icon.svg" alt="Coin icon" class="w-48 h-48 mr-4" />
                <div class="text-36 text-white-100 text flex items-end">${extraTargetsCollected ? coinsCollected * 2 : coinsCollected}</div>
            </div>
            <button
                  class="w-full h-[50px] rounded-[8px] text-18 f-semi text-white-100 bg-[#1E3384] flex justify-center items-center shadow-[0px_0px_17px_#FCDC59] mt-auto pulse-gold"
                  id="extraRewardsBtn"
                >
                  Get Extra Rewards
                </button> 
        `
        }
            </div>   
		</div>
		`;
  el.insertAdjacentHTML("afterbegin", html);

  // get actions buttons
  const repeatBtn = document.querySelector("#repeatBtn");
  const backBtn = document.querySelector("#backBtn");

  // return promise, because parent js file should know about it
  // for example for repeat game or back to the game intro
  return new Promise((resolve) => {
    if (repeatBtn)
      repeatBtn.addEventListener("click", () => {
        const canSoundPlay = JSON.parse(localStorage.getItem("f_sound_switch"));
        vibrate();
        canSoundPlay && clickAudio.play();
        resolve("repeat");
      });
    if (backBtn)
      backBtn.addEventListener("click", () => {
        const canSoundPlay = JSON.parse(localStorage.getItem("f_sound_switch"));
        vibrate();
        canSoundPlay && clickAudio.play();
        resolve("back");
      });
  });
};
