import CreateGameAudio from "./audio.js";
import { createGoldRain } from "./createGoldRain.js";
import { vibrate } from "./vibrate.js";
import { clearAllIntervalsAndTimeouts } from "./utils.js";

// Create game complete stage
export const createGameComplete = ({
  selector,
  coinsCollected,
  roundId,
  targetsCollected,
  extraTargetsCollected,
} = {}) => {
  const clickAudio = new CreateGameAudio("/game/sound/click.mp3");
  const api = localStorage.getItem("f_api");
  const token = localStorage.getItem("f_token");
  // passive (idle) rewards
  const przs = [5, 10, 15, "+1"];
  // wrapper element, where the complete block should be placed
  const el =
    targetsCollected || extraTargetsCollected
      ? document.body
      : document.querySelector(
          selector.startsWith(".") ? selector : `.${selector}`,
        );

  // Get round reward
  const getRoundReward = async () => {
    try {
      const rwd = await fetch(`${api}/api/games/5d1afcb3/bonus/`, {
        method: "POST",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          round_id: roundId,
        }),
      })
        .then(async (res) => await res.json())
        .catch((e) => {
          window?.Telegram?.WebApp?.showAlert?.(
            JSON.stringify(e?.details ?? "Error :("),
          );
          throw new Error(e);
        });

      return rwd ?? null;
    } catch (e) {
      console.error(e);
      window?.Telegram?.WebApp?.showAlert?.(
        JSON.stringify(e?.details ?? "Error :("),
      );
      throw new Error(e);
    }
  };

  const html = `
		<div
          class="w-full h-full flex flex-col justify-center items-center absolute z-[5] ${targetsCollected || extraTargetsCollected ? "!w-screen !h-screen !fixed top-0 left-0" : ""}"
          id="completedWrapper"
        >
         <div class="w-[90%] h-[300px] flex flex-col justify-start items-center bg-black-100 bg-opacity rounded-[8px] p-40 ${!targetsCollected && !extraTargetsCollected ? "w-full h-full" : ""}" id="completedContent">
        ${
          !targetsCollected && !extraTargetsCollected
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
                <img src="/game/icons/menu.svg" alt="Play" />
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
  const extraRewardsBtn = document.querySelector("#extraRewardsBtn");
  // show collect animation
  if (targetsCollected || extraTargetsCollected)
    createGoldRain({
      duration: 2000,
      frequency: 500,
    });

  // return promise, because parent js file should know about it
  // for example for repeat game or back to the game intro
  return new Promise((resolve) => {
    let interval;
    let currentIndex = 0;
    let speed = 50;
    // roulette states, generating or already generated
    let generating = false;
    let generated = false;

    const startRoulette = async () => {
      if (generating) return;
      else if (generated) {
        claim();
        return;
      }

      vibrate();
      const { value } = await getRoundReward();

      if (!value) return;

      generating = true;
      generated = false;
      const btn = extraRewardsBtn;
      extraRewardsBtn.remove();
      clearInterval(interval);
      // reset animation start speed
      speed = 10;

      const changeElement = () => {
        currentIndex = (currentIndex + 1) % przs.length;

        const collected = document.getElementById("collected");
        const text = collected.querySelector(".text");
        collected.classList.add("roulette");
        text.classList.add("!text-red-100");
        const val = `
          <span>${przs[currentIndex]?.startsWith?.("+") ? `+${przs[currentIndex].replace("+", "")}` : `+${przs[currentIndex]}`}</span>
          ${przs[currentIndex]?.startsWith?.("+") ? '<span class="text-[17px] leading-[35px]">/hour</span>' : ""}
        `;
        text.innerHTML = val;

        // add animation speed until 1000, to set speed slowly
        if (speed < 1000) {
          speed += 10;
          clearInterval(interval);
          interval = setInterval(changeElement, speed);
        }
      };

      interval = setInterval(changeElement, speed);

      // stop the animation until timeout, now it's 5 seconds
      setTimeout(() => {
        clearInterval(interval);
        collected.querySelector(".text").innerHTML = `
          <span>${value?.startsWith?.("+") ? `+${value.replace("+", "")}` : `+${value}`}</span>
          ${value?.startsWith?.("+") ? '<span class="text-[17px] leading-[35px]">/hour</span>' : ""}
        `;
        generating = false;
        generated = true;

        setTimeout(() => {
          btn.innerHTML = "Claim Extra Reward";
          document.getElementById("completedContent").append(btn);
        }, 400);
      }, 5000);
    };

    // claim generated result
    const claim = () => {
      vibrate();
      clearAllIntervalsAndTimeouts().then(() => {
        // clear data and go to the main page
        clearInterval(interval);
        const goldRain = document.querySelector(".gold-rain");
        if (goldRain) goldRain.remove();
        document.getElementById("completedWrapper").remove();
        resolve("back");
      });
    };

    if (extraRewardsBtn) {
      extraRewardsBtn.addEventListener("click", () => startRoulette());
    }

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
