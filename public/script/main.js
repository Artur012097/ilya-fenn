import { createIntro } from "./createIntro.js";

const tg =
  typeof window !== undefined && window?.Telegram?.WebApp
    ? window.Telegram.WebApp
    : null;

const getPageParams = async () => {
  return await fetch(`${window?.location?.origin}/api/`, {
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
    },
    credentials: "same-origin",
  })
    .then(async (res) => {
      const { api } = await res.json();

      return { api };
    })
    .catch((e) => {
      tg?.showAlert?.(JSON.stringify(e?.details ?? "Error :("));
      throw new Error(e);
    });
};

document.addEventListener("DOMContentLoaded", async () => {
  // localStorage.setItem("f_game_show_claim_popup", true);
  // localStorage.setItem("f_api", "https://stable.easydev.group");
  // localStorage.setItem(
  //   "f_token",
  //   "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzIxMTMzOTI1LCJpYXQiOjE3MTk4Mzc5MjUsImp0aSI6ImM2ZWU2MTZlOTcxMzQ4MTdiNmEwMjZmMmM3MjAyYzRhIiwidXNlcl9pZCI6MTZ9.ay1NZwySVDApYM2zZwiBA4v8l895Edt-BvXEjxrXGv0",
  // );
  return await createIntro();
  if (tg) {
    if (
      tg.platform.toLowerCase() === "ios" ||
      tg.platform.toLowerCase() === "android"
    ) {
      tg.expand();
      // disable app closing by swipe down
      const overflow = 3000;
      document.body.style.marginTop = `${overflow}px`;
      document.body.style.height = window.innerHeight + overflow + "px";
      document.body.style.paddingBottom = `${overflow}px`;
      window.scrollTo(0, overflow);
      document.body.style.overflow = "hidden";

      let ts;
      const onTouchStart = (e) => {
        ts = e.touches[0].clientY;
      };
      const onTouchMove = (e) => {
        if (scrollableEl) {
          const scroll = scrollableEl.scrollTop;
          const te = e.changedTouches[0].clientY;
          if (scroll <= 0 && ts > te) {
            e.preventDefault();
          }
        } else {
          e.preventDefault();
        }
      };
      document.documentElement.addEventListener("touchstart", onTouchStart, {
        passive: false,
      });
      document.documentElement.addEventListener("touchmove", onTouchMove, {
        passive: false,
      });
    }

    // change main bg position for web
    if (
      tg.platform.toLowerCase() !== "ios" &&
      tg.platform.toLowerCase() !== "android"
    ) {
      document.querySelector(".f-wrapper")?.classList?.add?.("xs:bg-[7%_80%]");
    }
    tg.ready();

    // set close by confirming
    tg.enableClosingConfirmation();
    const webAppInitData = tg.initDataUnsafe;
    const userData = webAppInitData?.user;
    localStorage.removeItem("f_tg_profile");
    localStorage.setItem("f_tg_profile", JSON.stringify(userData));

    const body = {
      id: +userData?.id,
      first_name: userData?.first_name,
      username: userData?.username,
      hash: webAppInitData.hash,
      auth_date: +webAppInitData?.auth_date,
      photo_url: userData?.photo_url ?? "",
    };

    const { api } = await getPageParams();

    // user register
    try {
      fetch(`${api}/api/auth/telegram/authorize/`, {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify(body),
      })
        .then(async (res) => {
          const response = await res.json();
          const { access } = await response;

          if (access) {
            // set claim popup show value for first time
            localStorage.setItem("f_game_show_claim_popup", true);
            localStorage.removeItem("f_token");
            localStorage.removeItem("f_api");
            localStorage.setItem("f_api", api);
            localStorage.setItem("f_token", `Bearer ${access}`);
            // create game intro page
            await createIntro();
          } else {
            window?.Telegram?.WebApp?.showAlert?.(
              JSON.stringify(response?.()?.details ?? "Error :("),
            );
          }
        })
        .catch((e) => {
          window?.Telegram?.WebApp?.showAlert?.(
            JSON.stringify(e?.details ?? "Error :("),
          );
          throw new Error(e);
        });
    } catch (e) {
      console.error(e);
      window?.Telegram?.WebApp?.showAlert?.(
        JSON.stringify(e?.details ?? "Error :("),
      );
      throw new Error(e);
    }
  }
});
