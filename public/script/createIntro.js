import { vibrate } from "./vibrate.js";
import { createSoundSwitchButton } from "./createSoundSwitchButton.js";
import { createGame } from "./createGame.js";
import CreateGameAudio from "./audio.js";
const clickAudio = new CreateGameAudio("/game/sound/click.mp3");

const createIntro = async () => {
  // change main bg image
  document.querySelector(".wrapper").style.backgroundImage =
    "url(/game/images/bg.png)";

  const wrapper = document.querySelector("#wrapper");

  const level = [
    {
      id: 1,
      active: true
    },
    {
      id: 2,
      active: true
    },
    {
      id: 3
    },
    {
      id: 4
    },
    {
      id: 5
    },
    {
      id: 6
    },
  ]

  const createIndicators = () => {
    const el = document.querySelector(".intro-steps");
    for (let i = 0; i < level.length; i++) {
      const icon = `
        <div 
        aria-level="${+i+1}"
        class="
        level-item w-[41px] h-[41px] flex justify-center items-center rounded-full relative ${!level[i].active ? 'border-[4px] border-[#DEDEDE]' : ''}
        after:content-[''] after:w-[5px] after:h-[24px] after:absolute after:top-[calc(100%+4px)] after:left-[calc(50%-2.5px)] after:bg-[#DEDEDE] last:after:hidden
        ">
          <span class="absolute -bottom-[10px] -right-[15px] text-white-100 f-semi">${+i+1}</span>
          ${level[i].active ? '<img src="/game/icons/play_round.svg" class="w-full h-full" />' : '<img src="/game/icons/lock.svg" />'} 
        </div>
      `
      
      el.insertAdjacentHTML('afterbegin', icon);
    }

    const active = document.querySelector('.level-item[aria-level="1"]')
    const rect = active.getBoundingClientRect()
    const top = rect.top
    
    
    const levelEl = `
      <div class="h-[28px] flex items-center px-[5px] bg-blue-100 rounded-xs absolute top-[${top}px] left-[80px]">
        <img src="/game/icons/lock.svg" alt="Lock icon" class="w-[17px]"/>
        <img src="/game/icons/heart.svg" alt="Heart icon" class="w-[17px]" />
        <span class="text-[16px] f-semi text-white-100">5</span>
      </div>
    `

    el.insertAdjacentHTML('afterbegin', levelEl);
  };

  wrapper.innerHTML = `
  <div class="intro w-full h-full relative flex-col flex justify-start items-center bg-opacity-50 overflow-y-auto pt-[50px] pb-20">
    <div class="intro-steps max-w-[87vw] w-full flex flex-col items-start gap-[24px]"></div>
    <div class="intro__footer max-w-[87vw] w-full flex justify-between items-center p-[4vw] bg-[#1A1A1A] bg-opacity-80 rounded-[6px] mt-auto mb-[50px]">
      <div class="flex items-center">
        <img src="/game/icons/heart.svg" alt="heart"/>
        <span class="text-white-100 text-[30px] f-semi">123</span>
      </div>
      <button id="gameStartBtn" class="start h-[44px] text-[16px] px-[10px] f-regular text-white-100 rounded-[8px] bg-blue-100 ml-[10px]">Играть</button>
      </div>
    </div>
  </div>`;

  createIndicators()

  document.querySelector("#gameStartBtn").addEventListener("click", () => {
    const canSoundPlay = JSON.parse(localStorage.getItem("f_sound_switch"));
    vibrate();
    canSoundPlay && clickAudio.play();
    createGame();
  });

  createSoundSwitchButton();

  const backButton = document.querySelector("#gameBack");
  if (backButton) backButton.style.display = "none";
};

export { createIntro };
