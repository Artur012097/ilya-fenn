import CreateGameAudio from "./audio.js";
import { vibrate } from "./vibrate.js";

// Create game complete stage
export const createVideoPlayer = async ({
	items,
	index
} = {}) => {
	const clickAudio = new CreateGameAudio("/game/sound/click.mp3");
	const profile = JSON.parse(localStorage.getItem("g_profile"))

	// wrapper element, where the complete block should be placed
	const el = document.querySelector('#wrapper')

	const wrapper = `
		<div
          class="w-screen h-screen flex flex-col pt-[60px] items-center absolute z-[5] bg-[#1A1A1A] bg-opacity-90"
          id="playerWrapper"
        >
			<div class="absolute top-[20px] left-[20px]">
				<button id="closeBtn" class="w-[20px] h-[20px]">
					<img src="/game/icons/cross.svg" alt="Close" />
				</button>
			</div>
			<div class="video-player__content mt-[20px]"></div>
			<div class="max-w-[87vw] w-full grid grid-cols-2 justify-around items-center mt-[20px]">
				<div class="w-full flex justify-center items-center">
					<button class="flex items-center gap-[10px] ${+index <= 0 ? 'hidden' : ''}" id="prevBtn">
						<span class="text-white-100 f-semi text-[30px]">
							${+index === items.length - 1 ? index : +index}
						</span>
						<img src="/game/icons/arrow_left.svg" alt="prev" />
					</button>
				</div>
				<div class="w-full flex justify-center items-center">
					<button class="flex items-center gap-[10px] ${!items[+index + 1] ? 'hidden' : ''}" id="nextBtn">
						<img src="/game/icons/arrow_right.svg" alt="prev" />
						<span class="text-white-100 f-semi text-[30px]">
							${+index + 2}
						</span>
					</button>
				</div>
			</div>
			<div class="max-w-[87vw] w-full rounded-sm bg-white-100 bg-opacity-80 p-[20px] mt-[20px]">
				Banner
			</div>
		</div>
		`;
	el.insertAdjacentHTML("afterbegin", wrapper);
	
	const generateContent = (idx) => {
		return new Promise((resolve) => {
			const current = items[idx]
			
			const content = `
			<div class="text-white-100 f-semi absolute top-[20px] -translate-x-1/2 left-1/2">${current?.title}</div>
				<div class="max-w-[87vw] w-full h-[360px] relative">
					<video src="${current?.video_url}" controls class="video w-full h-full"></video>
					<div class="w-full h-full absolute top-0 left-0 flex flex-col justify-center items-center bg-[#1A1A1A] bg-opacity-50 z-[1]">
						<img src="/game/icons/lock.svg" alt="Lock icon" class="w-[146px]"/>
						<div class="h-[28px] flex items-center px-[5px] bg-blue-100 rounded-xs mt-[20px] mb-[10px]">
							<img src="/game/icons/lock.svg" alt="Lock icon" class="w-[17px]"/>
							<img src="/game/icons/heart.png" alt="Heart icon" class="w-[17px]" />
							<span class="text-[16px] f-semi text-white-100">${current?.cost}</span>
						</div>
						<div class="flex items-center">
							<img src="/game/icons/heart.png" alt="Heart icon" class="w-[37px]" />
							<span class="text-[30px] f-semi text-white-100">${profile?.balance ?? 0}</span>
						</div>
					</div>
				</div>
			`
			document.querySelector('.video-player__content').innerHTML = content
			resolve()
		})
	}

	await generateContent(index).then(() => {
		// get actions buttons
		const prevBtn = document.querySelector("#prevBtn");
		const nextBtn = document.querySelector("#nextBtn");
		const closeBtn = document.querySelector("#closeBtn");

		const setPrevBtnContent = () => {
			console.log(items.length - 1);
			if (+index <= 0) {
				prevBtn.classList.add('hidden')
			}
			else
			prevBtn.classList.remove('hidden')
			prevBtn.querySelector('span').innerText = +index === items.length - 1 ? index : +index
		}
		const setNextBtnContent = () => {
			if (!items[index + 1]) {
				nextBtn.classList.add('hidden')
			}
			else
			nextBtn.classList.remove('hidden')
			nextBtn.querySelector('span').innerText = +index + 2
		}
		const prevStage = () => {
			const canSoundPlay = JSON.parse(localStorage.getItem("g_sound_switch"));
			vibrate();
			canSoundPlay && clickAudio.play();
			index--
			setPrevBtnContent()
			setNextBtnContent()
			generateContent(index)
		}
		const nextStage = () => {
			const canSoundPlay = JSON.parse(localStorage.getItem("g_sound_switch"));
			vibrate();
			canSoundPlay && clickAudio.play();
			index++
			setPrevBtnContent()
			setNextBtnContent()
			generateContent(index)
		}
	
		prevBtn && prevBtn.addEventListener("click", prevStage)
		nextBtn && nextBtn.addEventListener("click", nextStage)
		closeBtn && closeBtn.addEventListener("click", () => {
			const canSoundPlay = JSON.parse(localStorage.getItem("g_sound_switch"));
			vibrate();
			canSoundPlay && clickAudio.play();
			prevBtn.removeEventListener("click", prevStage)
			prevBtn.removeEventListener("click", nextStage)
			document.querySelector('#playerWrapper').remove()
		})
	})
};
