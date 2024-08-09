export const createGoldRain = ({ duration = 4000, frequency = 1000 } = {}) => {
  const html = `<div class="gold-rain fixed top-0 left-0 w-screen h-screen z-[4] bg-[#000F29] bg-opacity-60"></div>`;
  let interval = null;

  // remove gold rain animation container if it already exists
  if (document.querySelector(".gold-rain"))
    document.querySelector(".gold-rain").remove();

  document.body.insertAdjacentHTML("afterbegin", html);
  const container = document.querySelector(".gold-rain");

  const createCoin = () => {
    const coin = document.createElement("div");
    coin.className = "coin";
    const size = Math.random() * 30 + 30; // Random size between 30px and 60px
    coin.style.width = `${size}px`;
    coin.style.height = `${size}px`;
    coin.style.position = "absolute";
    coin.style.top = "0";
    coin.style.left = `${Math.random() * window.innerWidth}px`;
    coin.style.backgroundImage = "url(/game/icons/coin_icon.svg)";
    coin.style.backgroundRepeat = "no-repeat";
    coin.style.backgroundSize = "contain";
    coin.style.transform = `translateY(-${size + 30}px) rotate(0deg)`;
    coin.style.transition = `all ${duration / 1000 + size / 15}s linear`;
    container.appendChild(coin);

    setTimeout(() => {
      animateCoin(coin);
    }, 50);

    return coin;
  };

  const animateCoin = (coin) => {
    coin.style.transform = `translateY(${window.innerHeight + 100}px) rotate(${Math.random() < 0.5 ? "-" : ""}${Math.random() * 100}deg)`;
    const width = coin.style.width.replace("px", "") || 0;

    setTimeout(
      () => {
        coin.remove();
      },
      duration * 1000 + +width / 5,
    );
  };

  const collectCoins = () => {
    let count = 0;
    setTimeout(() => {
      createCoin();
      if (count < 1) count++;
      if (count === 1) {
        clearInterval(interval);
        interval = setInterval(() => {
          createCoin();
        }, frequency);
      }
    }, count);
  };

  collectCoins();
};
