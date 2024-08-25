import { vibrate } from "./vibrate.js";
import { createSoundSwitchButton } from "./createSoundSwitchButton.js";
import { createGame } from "./createGame.js";
import CreateGameAudio from "./audio.js";
import { createVideoPlayer } from './createVideoPlayer.js';
const clickAudio = new CreateGameAudio("/game/sound/click.mp3");

const createIntro = async () => {
  const token = localStorage.getItem("g_token")
  // change main bg image
  document.querySelector(".wrapper").style.backgroundImage =
    "url(/game/images/bg.png)";

  const wrapper = document.querySelector("#wrapper");

  let profile = null
  let scenes = null
  let nextLockedScene = null
  const fetchScenes = async () => {
    try {
      await fetch('https://api.liteplay.online/a/video/list/video_1', {
        headers: {
          Authorization: token
        }
      })
        .then(res => res.json())
        .then(res => {
          scenes = [...res?.data]
          nextLockedScene = res?.data?.find(i => !i.user_unlocked) ?? res?.data?.[res?.data?.lnegth - 1] ?? null
          profile = res?.user ?? null
          localStorage.setItem('g_scenes', JSON.stringify(scenes))
          localStorage.setItem('g_profile', JSON.stringify(profile))
        })
    } catch (e) {
      console.error(e);
      window?.Telegram?.WebApp?.showAlert?.(
        JSON.stringify(e?.details ?? "Error :("),
      );
      throw new Error(e);
    }
  }
  await fetchScenes()

  const createIndicators = () => {
    const el = document.querySelector(".intro-steps");
    for (let i = 0; i < scenes.length; i++) {
      const icon = `
        <div 
        aria-level="${+i + 1}"
        class="
        level-item w-[41px] h-[41px] flex justify-center items-center rounded-full relative ${!scenes[i].user_unlocked ? 'border-[4px] border-[#DEDEDE]' : ''}
        after:content-[''] after:w-[5px] after:h-[24px] after:absolute after:top-[calc(100%+4px)] after:left-[calc(50%-2.5px)] after:bg-[#DEDEDE] last:after:hidden
        ">
          <span class="absolute -bottom-[10px] -right-[15px] text-white-100 f-semi">${+i + 1}</span>
          ${scenes[i].user_unlocked ? '<img src="/game/icons/play_round.svg" class="w-full h-full" />' : '<img src="/game/icons/lock.svg" />'} 
        </div>
      `

      el.insertAdjacentHTML('afterbegin', icon);
    }
    
    requestAnimationFrame(() => {
      const next = document.querySelector(`.level-item[aria-level="${scenes.indexOf(nextLockedScene) + 1}"]`)
      
      if (next) {
        const rect = next.getBoundingClientRect();
        const elRect = el.getBoundingClientRect();
        
        const top = rect.top - elRect.top
        
        const levelEl = `
          <div class="h-[28px] flex items-center px-[5px] bg-blue-100 rounded-xs absolute top-[${top + 8}px] left-[70px]">
            <img src="/game/icons/lock.svg" alt="Lock icon" class="w-[20px] h-[20px]"/>
            <img src="/game/icons/heart.png" alt="Heart icon" class="w-[20px] h-[20px] mx-[4px]" />
            <span class="text-[16px] f-semi text-white-100">${nextLockedScene?.cost ?? 0}</span>
          </div>
        `

        el.insertAdjacentHTML('afterbegin', levelEl);
      }
    });
  };

  wrapper.innerHTML = `
  <div class="intro w-full h-full relative flex-col flex justify-start items-center bg-opacity-50 overflow-y-auto pt-[50px] pb-20">
    <div class="intro-steps max-w-[87vw] w-full flex flex-col items-start gap-[24px] relative"></div>
    <div class="intro__footer max-w-[87vw] w-full flex justify-between items-center p-[4vw] bg-[#1A1A1A] bg-opacity-80 rounded-[6px] mt-auto mb-[50px]">
      <div class="flex items-center">
        <img src="/game/icons/heart.png" alt="heart" class="w-[47px]"/>
        <span class="text-white-100 text-[30px] f-semi">${profile?.balance ?? 0}</span>
      </div>
      <button id="gameStartBtn" class="start h-[44px] text-[16px] px-[10px] f-regular text-white-100 rounded-[8px] bg-blue-100 ml-[10px]">Играть</button>
      </div>
    </div>
  </div>`;

  createIndicators()

  const buttons = document.querySelectorAll(".level-item")
  for (const button of buttons) {
    button.addEventListener("click", (e) => {
      const target = e.currentTarget
      const index = target.getAttribute("aria-level")

      
      if (scenes[+index - 1].user_unlocked) {
        const canSoundPlay = JSON.parse(localStorage.getItem("g_sound_switch"));
        vibrate();
        canSoundPlay && clickAudio.play();
        createVideoPlayer({
          items: scenes,
          index: index - 1,
        });
      }
    });
  }
  document.querySelector("#gameStartBtn").addEventListener("click", () => {
    const canSoundPlay = JSON.parse(localStorage.getItem("g_sound_switch"));
    vibrate();
    canSoundPlay && clickAudio.play();
    createGame();
  });

  createSoundSwitchButton();

  const backButton = document.querySelector("#gameBack");
  if (backButton) backButton.style.display = "none";
};

export { createIntro };
