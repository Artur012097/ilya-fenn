import CreateGameAudio from "./audio.js";
import { vibrate } from "./vibrate.js";

export const createSoundSwitchButton = (element) => {
  const button = `
		<button id="soundSwitch" class="w-[24px] h-[24px] absolute top-[20px] right-[20px] z-[2]" aria-label="Sound switch">
			<img src="/game/icons/sound_on.svg" width="24" height="24" alt="Sound switch" />
		</button>
	`;

  if (document.querySelector("#soundSwitch")) {
    document.querySelector("#soundSwitch").remove();
  }
  const wrapper = element ?? document.querySelector("#wrapper");
  wrapper.insertAdjacentHTML("afterbegin", button);

  // set default value, if there is no value yet
  if (localStorage.getItem("f_sound_switch") === null)
    localStorage.setItem("f_sound_switch", true);
  // change sound icon
  const setIcon = () => {
    const soundSwitch = JSON.parse(localStorage.getItem("f_sound_switch"));
    document.querySelector("#soundSwitch img").src =
      soundSwitch || soundSwitch === undefined
        ? "/game/icons/sound_on.svg"
        : "/game/icons/sound_off.svg";
  };
  // change icon by default by checking buffered value
  setIcon();

  // add click listener on button
  document.querySelector("#soundSwitch").addEventListener("click", () => {
    vibrate()
    const soundSwitch = JSON.parse(localStorage.getItem("f_sound_switch"));
    const clickAudio = new CreateGameAudio("/game/sound/click.mp3");
    // set new value on localStorage
    localStorage.setItem(
      "f_sound_switch",
      JSON.stringify(soundSwitch !== undefined ? !soundSwitch : true),
    );
    // play click audio when sound set ON
    if (JSON.parse(localStorage.getItem("f_sound_switch"))) {
      clickAudio.play();
    }
    // update sound icon
    setIcon();
  });
};
