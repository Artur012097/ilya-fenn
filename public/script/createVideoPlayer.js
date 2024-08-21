import CreateGameAudio from "./audio.js";

// Create game complete stage
export const createVideoPlayer = ({
	items
} = {}) => {
	const clickAudio = new CreateGameAudio("/game/sound/click.mp3");
	const token = localStorage.getItem("g_token")

	// wrapper element, where the complete block should be placed
	const el = document.querySelector('#wrapper')

	const html = `
		<div
          class="w-screen h-screen flex flex-col pt-[60px] items-center absolute z-[5] bg-[#1A1A1A] bg-opacity-90"
          id="playerWrapper"
        >
         <div class="text-white-100 f-semi absolute top-[20px] -translate-x-1/2 left-1/2">Глава 3</div>
		 <div class="max-w-[87vw] w-full h-[360px] relative">
		 	<video :src="${items[0].video_url}" controls class="w-full h-full"></video>
			<div class="w-full h-full absolute top-0 left-0 flex flex-col justify-center items-center bg-[#1A1A1A] bg-opacity-50 z-[1]">
				<img src="/game/icons/lock.svg" alt="Lock icon" class="w-[146px]"/>
				<div class="h-[28px] flex items-center px-[5px] bg-blue-100 rounded-xs mt-[20px] mb-[10px]">
					<img src="/game/icons/lock.svg" alt="Lock icon" class="w-[17px]"/>
					<img src="/game/icons/heart.png" alt="Heart icon" class="w-[17px]" />
					<span class="text-[16px] f-semi text-white-100">5</span>
				</div>
				<div class="flex items-center">
					<img src="/game/icons/heart.png" alt="Heart icon" class="w-[37px]" />
					<span class="text-[30px] f-semi text-white-100">137</span>
				</div>
			</div>
		 </div>
		 <div class="max-w-[87vw] w-full flex justify-around items-center mt-[10px]">
		 	<button class="flex items-center gap-[10px]" id="prevBtn">
				<span class="text-white-100 f-semi text-[30px]">
					2
				</span>
				<img src="/game/icons/arrow_left.svg" alt="prev" />
			</button>
		 	<button class="flex items-center gap-[10px]" id="nextBtn">
			 <img src="/game/icons/arrow_right.svg" alt="prev" />
			 <span class="text-white-100 f-semi text-[30px]">
				 4
			 </span>
			</button>
		 </div>
		 <div class="max-w-[87vw] w-full rounded-sm bg-white-100 bg-opacity-80 p-[10px] mt-[20px]">
		 	Banner
		 </div>
		</div>
		`;
	el.insertAdjacentHTML("afterbegin", html);

	// get actions buttons
	const prevBtn = document.querySelector("#prevBtn");
	const nextBtn = document.querySelector("#nextBtn");
};
