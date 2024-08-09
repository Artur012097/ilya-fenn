import { createGoldRain } from "./createGoldRain.js";
import { vibrate } from "./vibrate.js";
import { calcIntlNumber, clearAllIntervalsAndTimeouts } from "./utils.js";

const createIdleClaimPopup = (value = 0) => {
  return new Promise((resolve) => {
    const html = `
    <div class="f-modal w-screen h-screen fixed top-0 left-0 z-[5]">
        <div class="f-modal-content w-full h-max flex flex-col items-center absolute bottom-0 left-0 bg-[#1A1A1A] p-20 rounded-tl-lg rounded-tr-lg shadow-[0px_-6px_9px_#FCDC59] z-[5]">
            <h3 class="text-14 f-semi text-white-100">Claim accrued coins</h3>
            <div class="flex items-center mt-10">
                <img src="/game/icons/coin_icon.svg" alt="Coin" class="w-56 h-56 mr-10">
                <span class="text-40 f-semi text-white-100">${calcIntlNumber(value, false)}</span>
            </div>
            <button class="bg-blue-100 w-full h-48 flex justify-center items-center text-14 f-semi text-white-100 rounded-sm mt-20" id="claimIdle">Claim</button>
        </div>
    </div>
    `;

    // remove modal if it already exists
    if (document.querySelector(".f-modal"))
      document.querySelector(".f-modal").remove();
    document.body.insertAdjacentHTML("afterbegin", html);

    createGoldRain({
      duration: 2000,
      frequency: 500,
    });

    document
      .querySelector("#claimIdle")
      .addEventListener("click", () => claim());

    const claim = () => {
      vibrate();
      clearAllIntervalsAndTimeouts().then(() => {
        const modal = document.querySelector(".f-modal");
        const modalContent = document.querySelector(".f-modal-content");

        modalContent.style.transition = ".5s ease";
        modalContent.style.transform = "translateY(110%)";
        setTimeout(() => {
          const goldRain = document.querySelector(".gold-rain");
          if (goldRain) goldRain.remove();
          modal.remove();
          resolve(value);
        }, 500);
      });
    };
  });
};

export { createIdleClaimPopup };
