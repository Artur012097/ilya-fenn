import { createBackButton } from "./createBackButton.js";
import { createSoundSwitchButton } from "./createSoundSwitchButton.js";

// Create share page
const createReferals = async () => {
  // remove game data from local storage
  localStorage.removeItem("f_game_data");
  const api = localStorage.getItem("f_api");
  const token = localStorage.getItem("f_token");
  const referrals = await fetch(`${api}/api/games/5d1afcb3/referals/`, {
    headers: {
      Authorization: token,
      "Content-Type": "application/json",
    },
  })
    .then(async (res) => {
      const response = await res.json();

      if (response?.details) {
        console.error(e);
        window?.Telegram?.WebApp?.showAlert?.(
          JSON.stringify(response?.details ?? "Error :("),
        );
      } else {
        return response;
      }
    })
    .catch((e) => {
      console.error(e);
      window?.Telegram?.WebApp?.showAlert?.(
        JSON.stringify(e?.details ?? "Error :("),
      );
      throw new Error(e);
    });
  // profile from backend
  const profile = JSON.parse(localStorage.getItem("f_profile"));
  // profile from telegram
  const tgProfile = JSON.parse(localStorage.getItem("f_tg_profile"));

  const username = tgProfile?.username ?? "";
  const nickname = profile?.nickname ?? "";
  const fio = profile?.name ?? "";
  const avatar = tgProfile?.photo_url ?? profile?.avatar?.default?.url ?? null;

  const referrer = profile?.ref_code;
  const shareUrl = `https://t.me/share/url?url=https://t.me/FennTestBot/start?startapp=rid${referrer}`;

  const mainedFromRefs = referrals?.total_from_refs ?? 0;

  const romanSymbols = [
    "I",
    "II",
    "III",
    "IV",
    "V",
    "VI",
    "VII",
    "VIII",
    "IX",
    "X",
  ];

  const createLevels = () => {
    const refLevelsArr = Object.values(referrals?.ref_levels ?? {});
    const mainWrapper = document.querySelector(".f-referrals__content");
    // set values for first level
    document.querySelector(`.refs-row__pie--1`).innerHTML =
      `${refLevelsArr?.[0]?.pie ?? 0.5} from every 1`;
    document.querySelector(`.refs-row__mained--1`).innerHTML =
      refLevelsArr?.[0]?.coins_from_refs ?? 0;

    for (const i in refLevelsArr) {
      const r = refLevelsArr[i] ?? null;

      const html = `<div class="refs-row">
            <div class="flex justify-between pb-[4px] mb-[4px] border-b-[1px] border-white-100">
                <span class="xs:text-[3.5vw] mdmf:text-[16px] f-semi text-white-100">${romanSymbols[i]} Referral Level</span>
                <div class="flex items-center">
                    <img src="/game/icons/coin_icon.svg" alt="Coin icon" class="xs:w-[4.5vw] xs:h-[4.5vw] mdmf:w-[20px] mdmf:h-[20px]" />
                    <span class="refs-row__mained refs-row__mained--${+i + 1} xs:text-[4vw] mdmf:text-[16px] f-semi text-white-100">${r?.coins_from_refs ?? 0}</span>
                </div>
            </div>
            <div class="flex items-center">
                <img src="/game/icons/coin_icon.svg" alt="Coin icon" class="xs:w-[3.4vw] xs:h-[3.4vw] mdmf:w-[16px] mdmf:h-[16px]" />
                <span class="refs-row__pie refs-row__pie--${+i + 1} xs:text-[3vw] mdmf:text-[14px] f-semi text-white-100 ml-[4px]">${r?.pie ?? 0} from every 1</span>
            </div>
            <div class="refs-row__content refs-row__content--${+i + 1} flex flex-wrap gap-[12px] pt-[16px] pb-[24px]">
            	<p class="xs:text-[3vw] mfmd:text-[14px] text-white-100 pt-[16px] pb-[24px] pl-[16px]">
            	Players invited by your friends will appear here
				</p>
				</div>
        </div>`;

      // add content dynamic after first level
      if (+i > 0 && r?.referals?.length) {
        mainWrapper.insertAdjacentHTML("beforeend", html);
      }

      const refEl = document.querySelector(`.refs-row__content--${+i + 1}`);
      // clear referrals empty text, if the level is more than 1
      if (+i > 0) refEl.innerHTML = "";

      for (const ref of r?.referals ?? []) {
        const avatarHtml = `
          <div class="w-[${+i === 0 ? "60px" : "40px"}] h-[${+i === 0 ? "60px" : "40px"}] rounded-[100%] image-contain overflow-hidden">
        	<img src="${ref?.avatar ?? "/game/images/avatar-placeholder.svg"}" alt="${ref.nickname ?? "Avatar"}" class="w-full h-full">
        </div>
          `;
        const unFieldHtml = `
        <div class="w-[${+i === 0 ? "60px" : "40px"}] h-[${+i === 0 ? "60px" : "40px"}] rounded-[100%] flex justify-center items-center bg-blue-100">
            <span class="xs:text-[3.5vw] mdmf:text-[15px] f-semi text-white-100">${ref?.nickname?.[0] ?? ref?.nickname?.[0] ?? ""}</span>
        </div>`;

        refEl.insertAdjacentHTML(
          "beforeend",
          ref?.avatar ? avatarHtml : unFieldHtml,
        );
      }
    }
  };

  const wrapper = document.querySelector("#wrapper");
  wrapper.innerHTML = `
  <div class="f-referrals w-full h-full relative bg-opacity-50 py-[50px] overflow-y-auto pt-[80px]">
    <div class="f-referrals__wrapper xs:max-w-[88vw] mdmf:w-[400px] w-full xs:p-[6vw] mdmf:p-[20px] bg-[#1A1A1A] bg-opacity-50 rounded-sm mx-auto">
        <div class="f-referrals__user flex items-center">
        ${
          avatar
            ? `<img
                    src="${avatar}"
                    class="xs:w-[11vw] xs:h-[11vw] mdmf:w-[40px] mdmf:h-[40px] mr-[8px] rounded-[100%] overflow-hidden"
                    alt="${nickname ?? username ?? "Avatar"}"
                    title="${nickname ?? username ?? "Avatar"}"
                    width="34"
                    height="34"
            />`
            : `<div class="xs:w-[11vw] xs:h-[11vw] mdmf:w-[40px] mdmf:h-[40px] mr-[8px] rounded-[100%] flex justify-center items-center bg-blue-100">
                <span class="xs:text-[4vw] mdmf:text-[20px] f-semi text-white-100">${nickname?.[0].toUpperCase?.() ?? fio?.[0].toUpperCase?.() ?? username?.[0].toUpperCase?.() ?? ""}</span>
               </div>`
        }
            <div>
                <h4 class="xs:text-[4.4vw] mdmf:text-[20px] xs:leading-[6vw] mdmf:leading-[240x] f-semi text-white-100">
                    ${fio}
                </h4>
                <p class="xs:text-[2.8vw] mdmf:text-[15px] xs:leading-[4.4vw] mdmf:leading-[22px] f-regular text-white-100">
                    @${nickname ?? username}
                </p>
            </div>
        </div>
        <div class="flex justify-between py-[16px]">
            <span class="xs:text-[4vw] mdmf:text-[20px] f-semi text-white-100">Total from all referrers</span>
            <div class="flex items-center">
                <img src="/game/icons/coin_icon.svg" alt="Coin icon" class="xs:w-[6vw] xs:h-[6vw] mdmf:w-[24px] mdmf:h-[24px]" />
                <span class="xs:text-[4vw] mdmf:text-[20px] f-semi text-white-100">${mainedFromRefs}</span>
            </div>
        </div>
		<!-- first level referrals-->
		<div class="f-referrals__content">
        <div class="refs-row">
            <div class="flex justify-between pb-[4px] mb-[4px] border-b-[1px] border-white-100">
                <span class="xs:text-[3.5vw] mdmf:text-[16px] f-semi text-white-100">I Referral Level</span>
                <div class="flex items-center">
                    <img src="/game/icons/coin_icon.svg" alt="Coin icon" class="xs:w-[4.5vw] xs:h-[4.5vw] mdmf:w-[20px] mdmf:h-[20px]" />
                    <span class="refs-row__mained refs-row__mained--1 xs:text-[4vw] mdmf:text-[16px] f-semi text-white-100"></span>
                </div>
            </div>
            <div class="flex items-center">
                <img src="/game/icons/coin_icon.svg" alt="Coin icon" class="xs:w-[3.4vw] xs:h-[3.4vw] mdmf:w-[16px] mdmf:h-[16px]" />
                <span class="refs-row__pie refs-row__pie--1 xs:text-[3vw] mdmf:text-[14px] f-semi text-white-100 ml-[4px]"></span>
            </div>
            <div class="refs-row__content refs-row__content--1 flex flex-wrap gap-[24px] pt-[16px] pb-[24px]">
            	<a href="${shareUrl}" class="flex justify-center items-center w-[60px] h-[60px] shrink-0 bg-blue-100 rounded-[100%]">
            		<img src="/game/icons/plus.svg" alt="Plus">
				</a>
			</div>
        </div>
       </div>
        
    </div>
    <a href="${shareUrl}" class="
    flex justify-center items-center shrink-0 
    xs:max-w-[88vw] mdmf:w-[400px] w-full xs:h-[10vw] 
    mdmf:h-[46px] xs:text-[4vw] text-white-100 rounded-sm bg-blue-100 
    mt-[10px] mx-auto sticky -bottom-40">
        Invite friend
	</a>`;

  createLevels();
  createBackButton();
  createSoundSwitchButton();
};

export { createReferals };
