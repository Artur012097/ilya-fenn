import { createIntro } from "./createIntro.js";
import { vibrate } from "./vibrate.js";
import { clearAllIntervalsAndTimeouts } from "./utils.js";
import CreateGameAudio from "./audio.js";

const createBackButton = (element) => {
  const clickAudio = new CreateGameAudio("/game/sound/click.mp3");
  const button = `
	<button id="gameBack" class="absolute top-[20px] left-[20px] z-[9]">
		<img src="/game/icons/back-arrow.svg" alt="Back" />
	</button>`;

  if (document.querySelector("#gameBack")) {
    document.querySelector("#gameBack").remove();
  }
  const wrapper = element ?? document.querySelector("#wrapper");
  
  wrapper.insertAdjacentHTML("afterbegin", button);

  document.querySelector("#gameBack").addEventListener("click", () => {
    const canSoundPlay = JSON.parse(localStorage.getItem("f_sound_switch"));
    vibrate();
    canSoundPlay && clickAudio.play();
    // clear all intervals and timeouts
    clearAllIntervalsAndTimeouts().then(() => {
      const goldRain = document.querySelector(".gold-rain");
      if (goldRain) goldRain.remove();
      // create game default screen
      createIntro();
    });
  });
};

export { createBackButton };
