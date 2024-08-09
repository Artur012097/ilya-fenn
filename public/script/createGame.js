/* eslint-disable */
import { createBackButton } from "./createBackButton.js";
import { createSoundSwitchButton } from "./createSoundSwitchButton.js";
import { createIntro } from "./createIntro.js";
import { createGameComplete } from "./createGameComplete.js";
import { vibrate } from "./vibrate.js";
import { calculateSize } from "./utils.js";
import CreateGameAudio from "./audio.js";

const createGame = () => {
  // sound effects
  const swapAudio = new CreateGameAudio("/game/sound/swap.mp3");
  const bonusAudio = new CreateGameAudio("/game/sound/bonus.mp3");
  const bonusCollectAudio = new CreateGameAudio(
    "/game/sound/bonus_collect.mp3",
  );
  const collectAudio = new CreateGameAudio("/game/sound/collect.mp3");

  swapAudio.setVolume(0.4);

  const api = localStorage.getItem("f_api");
  const token = localStorage.getItem("f_token");
  const profile = JSON.parse(localStorage.getItem("f_profile"));
  let gameData = JSON.parse(localStorage.getItem("f_game_data"));

  // user scored value
  let score = 0;
  // block, that user started to move
  let firstTargetEvent = null;

  // game config
  const config = {
    rowsCount: 6,
    colsCount: 6,

    gameWrapperBg: "#000000",
    gameHeaderBg: "rgba(26, 26, 26, .5)",

    borderRadiusXs: 4,
    borderRadiusSm: 8,

    blockSize: calculateSize(40, 60, 14),
    blockClass: "food-block",
    blockIdPrefix: "block",
    blockBg: "#1A1A1A",
    blockIcons: [
      "/game/icons/drink.png",
      "/game/icons/donut.png",
      "/game/icons/fries.png",
      "/game/icons/pizza.png",
      "/game/icons/broccoli.png",
    ],

    gameState: "",
    gameStates: ["pick", "switch", "revert", "remove", "refill"],

    movingItems: 0,
    checking: false,
    targets: [],
  };
  // player game information
  const player = {
    selectedRow: -1,
    selectedCol: -1,
    posX: "",
    posY: "",
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0,
  };
  // coin information
  const coin = {
    coinGenerated: false,
    coinsCollected: 0,
    collected: false,
    cnt: gameData?.coins,
    timeouts: [],
  };
  // game components
  const components = {
    wrapper: document.querySelector("#wrapper"),
    container: document.createElement("div"),
    gWrapper: document.createElement("div"),
    header: document.createElement("div"),
    timer: document.createElement("div"),
    score: document.createElement("div"),
    targets: document.createElement("div"),
    blocks: [],
  };
  // game timer
  const timer = {
    interval: null,
    time: 120,
  };

  const timeFormatter = (seconds) => {
    if (typeof seconds === "number") {
      const m = Math.floor(Math.round(seconds) / 60);
      const s = seconds % 60;

      return `${m < 10 ? `0${m}` : m}:${s < 10 ? `0${s}` : s}`;
    }
  };
  // Create game page
  const createGamePage = () => {
    components.container.classList.add("f-game-container");
    components.container.style.height = "100vh";
    components.container.style.overflow = "hidden";
    components.container.style.display = "flex";
    components.container.style.flexDirection = "column";
    components.container.style.alignItems = "center";
    components.container.style.justifyContent = "center";

    components.wrapper.append(components.container);
  };

  // Create game wrapper
  const createGameWrapper = () => {
    components.gWrapper.classList.add("f-game-wrapper");
    components.gWrapper.style.width = `${config.blockSize * config.rowsCount}px`;
    components.gWrapper.style.height = `${config.blockSize * config.colsCount}px`;
    components.gWrapper.style.position = "relative";
    components.gWrapper.style.backgroundColor = config.gameWrapperBg;
    components.gWrapper.style.borderRadius = `${config.borderRadiusXs}px`;
    components.gWrapper.style.marginTop = "10px";

    components.gWrapper.addEventListener("mousedown", handleSwipeStart);
    components.gWrapper.addEventListener("touchstart", handleSwipeStart);
    components.gWrapper.addEventListener("mouseup", handleSwipeEnd);
    components.gWrapper.addEventListener("touchend", handleSwipeEnd);
    components.container.append(components.gWrapper);
    // click to work, put it aside for now
    // components.gWrapper.addEventListener("click", handlerTab);
  };

  // Creating a block
  const createBlock = (t, l, row, col, img, className = null) => {
    const block = document.createElement("div");

    block.classList.add(config.blockClass);
    if (className) block.classList.add(className);
    block.id = `${config.blockIdPrefix}_${row}_${col}`;
    block.style.boxSizing = "border-box";
    block.style.cursor = "pointer";
    block.style.position = "absolute";
    block.style.top = t + "px";
    block.style.left = l + "px";
    block.style.width = `${config.blockSize - 2}px`;
    block.style.height = `${config.blockSize - 2}px`;
    block.style.border = "1px solid transparent";
    block.style.backgroundColor = config.blockBg;
    if (img) {
      block.style.borderRadius = `${config.borderRadiusSm}px`;
      block.style.backgroundImage = `url(${img})`;
      block.style.backgroundSize = "80%";
      block.style.backgroundRepeat = "no-repeat";
      block.style.backgroundPosition = "center";
    }

    components.gWrapper.append(block);
  };

  // Creating and populating the grid for blocks
  const createGameGrid = () => {
    // Creating an empty grid
    for (let i = 0; i < config.rowsCount; i++) {
      components.blocks[i] = [];
      for (let j = 0; j < config.colsCount; j++) {
        components.blocks[i][j] = -1;
      }
    }

    // Populating the grid
    for (let i = 0; i < config.rowsCount; i++) {
      for (let j = 0; j < config.colsCount; j++) {
        do {
          components.blocks[i][j] = Math.floor(
            Math.random() * config.blockIcons.length,
          );
        } while (isStreak(i, j));

        createBlock(
          i * config.blockSize,
          j * config.blockSize,
          i,
          j,
          config.blockIcons[components.blocks[i][j]],
        );
      }
    }
  };

  // Create game header
  const createGameHeader = () => {
    components.header.style.width = window.innerWidth < 640 ? "88vw" : "420px";
    components.header.style.position = "relative";
    components.header.style.display = "flex";
    components.header.style.flexDirection = "column";
    components.header.style.justifyContent = "center";
    components.header.style.alignItems = "center";
    components.header.style.padding =
      window.innerWidth < 640 ? "3vw 0" : "10px 0";
    components.header.style.backgroundColor = config.gameHeaderBg;
    components.header.style.borderRadius = `${config.borderRadiusSm}px`;

    components.header.style.fontFamily = "sans-serif";
    components.header.style.fontSize = "16px";
    components.header.style.color = "#ffffff";

    components.header.classList.add("f-game-header");
    components.score.classList.add("score");
    components.timer.classList.add("timer");
    components.targets.setAttribute("class", "targets w-full px-16 mt-10");
    components.container.append(components.header);

    updateGameHeader();
  };

  // Create game score
  const createGameScore = () => {
    components.score.innerHTML = `Score: ${score}`;

    components.score.style.display = "flex";
    components.score.style.alignItems = "center";
    components.score.style.fontsize = window.innerWidth < 640 ? "5vw" : "24px";
    components.score.style.fontWeight = "600";
    components.score.style.marginBottom =
      window.innerWidth < 640 ? "2vw" : "8px";
    components.header.append(components.score);
  };

  // Create game timer
  const createGameTimer = () => {
    components.timer.innerHTML = "";
    const icon = document.createElement("img");
    const time = document.createElement("span");
    time.style.fontSize = "40px";
    time.style.lineHeight = "50px";
    time.style.marginLeft = "5px";
    icon.setAttribute("src", "/game/icons/time.svg");
    time.innerHTML = timeFormatter(timer.time);

    components.timer.append(icon);
    components.timer.append(time);
    components.timer.style.display = "flex";
    components.timer.style.alignItems = "center";
    components.timer.style.fontWeight = "600";
    components.header.append(components.timer);
  };

  // Create game targets
  const createGameTargets = () => {
    components.targets.innerHTML = "";

    const tHeader = `
        <div class="grid grid-cols-4 pb-8">
          <span class="col-span-3 f-semi text-gray-100" style="font-size: ${window.innerWidth < 640 ? "3.7vw" : "16px"}">Target</span>
          <span class="f-semi text-gray-100" style="font-size: ${window.innerWidth < 640 ? "3.7vw" : "16px"}">Reward</span>
      </div>
    `;
    components.targets.innerHTML += tHeader;

    for (const i in config.targets) {
      const row = document.createElement("div");
      row.setAttribute(
        "class",
        `grid grid-cols-4 justify-between items-center border-t-[1px] border-gray-80 py-8 ${config.targets[i - 1] && !checkTargetsCollect(i - 1) ? "opacity-50" : ""}`,
      );

      const tRow = document.createElement("div");
      tRow.setAttribute("class", "flex gap-8 col-span-3");

      {
        for (const [key, value] of Object.entries(config.targets[i])) {
          const target = `
            <div class="flex items-end">
                <img src="${config.blockIcons[key]}" alt="Target" style="width: ${window.innerWidth < 640 ? "7vw" : "32px"}" width="32" height="32">
                <span class="f-semi" style="font-size: ${window.innerWidth < 640 ? "3.7vw" : "16px"}">${value}</span>
            </div> 
          `;
          tRow.innerHTML += target;
        }

        const rewRow = document.createElement("div");
        const rewardHtml = `
          <div class="flex items-center">
                <div class="flex items-center">
                    <img src="/game/icons/coin_icon.svg" alt="Coin" style="width: ${window.innerWidth < 640 ? "7vw" : "32px"}" width="32" height="32">
                    <span class="f-semi ml-2" style="font-size: ${window.innerWidth < 640 ? "4.2vw" : "16px"}">
                      ${+i === config.targets?.length - 1 ? "x2" : coin.coinsCollected}
                    </span>
                </div>
                ${checkTargetsCollect(i) ? '<img src="/game/icons/done.svg" alt="Done"  width="32" height="32" class="w-16 h-16 ml-16">' : '<div class="w-16 h-16 ml-16"></div>'}
            </div>
        `;
        rewRow.innerHTML += rewardHtml;

        row.append(tRow);
        row.append(rewRow);
        components.targets.append(row);
        components.header.append(components.targets);
      }
    }
  };

  // Обновить очки на странице
  const updateGameHeader = () => {
    createGameScore();
    createGameTimer();
    createGameTargets();
  };

  // Checking for a group collection
  const isStreak = (row, col) => {
    return isVerticalStreak(row, col) || isHorizontalStreak(row, col);
  };

  // Checking for a vertical group collection
  const isVerticalStreak = (row, col) => {
    const blockValue = components.blocks[row][col];
    let streak = 0;
    let tmp = row;

    while (
      tmp > 0 &&
      (components.blocks[tmp - 1][col] === blockValue || blockValue === 7)
    ) {
      streak++;
      tmp--;
    }

    tmp = row;

    while (
      tmp < config.rowsCount - 1 &&
      (components.blocks[tmp + 1][col] === blockValue || blockValue === 7)
    ) {
      streak++;
      tmp++;
    }

    return streak > 1;
  };

  // Checking for a horizontal group collection
  const isHorizontalStreak = (row, col) => {
    const blockValue = components.blocks[row][col];
    let streak = 0;
    let tmp = col;

    while (
      tmp > 0 &&
      (components.blocks[row][tmp - 1] === blockValue || blockValue === 7)
    ) {
      streak++;
      tmp--;
    }

    tmp = col;

    while (
      tmp < config.colsCount - 1 &&
      (components.blocks[row][tmp + 1] === blockValue || blockValue === 7)
    ) {
      streak++;
      tmp++;
    }

    return streak > 1;
  };

  // Add bonus block
  const addBonusCoin = () => {
    if (
      !coin.coinGenerated &&
      coin.cnt > 0 &&
      Boolean(document.querySelector(".f-game"))
    ) {
      // get random row
      const row = getRandomRow();
      // get random column
      const col = getRandomColumn();
      // get element, that placed on that coordinats
      const el = document.querySelector(
        `#${config.blockIdPrefix}_${row}_${col}`,
      );
      // remove the element
      el.remove();
      // create new element and push it to the prev element place
      createBlock(
        row * config.blockSize,
        col * config.blockSize,
        row,
        col,
        null,
        "bonus-block",
      );
      // add value for block
      components.blocks[row][col] = 7;
      // change state, that coin is already generated
      coin.coinGenerated = true;

      const canSoundPlay = JSON.parse(localStorage.getItem("f_sound_switch"));
      canSoundPlay && bonusAudio.play();
      vibrate({
        style: 'heavy'
      })

      // add gold bgf generating when coin is generating
      document
        .querySelector(".f-game-container")
        ?.classList?.add?.("generate-bonus");
      // remove gold bg after coin generating animation end (duration 700md, set in main.css file)
      setTimeout(() => {
        document
          .querySelector(".f-game-container")
          ?.classList?.remove?.("generate-bonus");
      }, 700);
    }
  };

  // Generate random targets
  const generateTargets = ({
    minValue = 10,
    maxValue = 15,
    targetsCount = 3,
  } = {}) => {
    const targets = {};
    const chosenIndexes = [];

    while (targetsCount > 0) {
      let random = Math.floor(Math.random() * config.blockIcons.length);

      // check, if the random index is already in array
      while (chosenIndexes.includes(random)) {
        random = Math.floor(Math.random() * config.blockIcons.length);
      }

      // add index to indexes array to check dublicates
      chosenIndexes.push(random);

      // generate new target with value
      targets[random] =
        Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue;
      targetsCount--;
    }
    config.targets.push(targets);
  };

  // Score increment function
  const scoreIncrement = (count) => {
    // if coincidences count mote than 4 (equal 5 or more blocks in line),
    // add 15 points
    // for > 3 (equal 4 blocks in line)
    // add 10 points
    // fos > 2 (equal default 3 blocks in line)
    // add 5 points
    if (count >= 4) {
      score += 15;
    } else if (count >= 3) {
      score += 10;
    } else {
      score += 5;
    }
    updateGameHeader();
  };

  const generateCoinsInterval = () => {
    const interval = coin.cnt > 0 ? Math.floor(timer.time / coin.cnt) : 0;
    for (let i = 0; i < coin.cnt; i++) {
      // get timeout in milliseconds
      const timeout = (+i + 1) * interval;
      coin.timeouts.push(
        setTimeout(
          () => {
            addBonusCoin();
          },
          //   if the timeout is equal game end time - 5 seconds, set timeout - 10 seconds
          //   else set timeout
          timeout >= timer.time - 5 ? (timeout - 5) * 1000 : timeout * 1000,
        ),
      );
    }
  };

  // Get random row
  const getRandomRow = () => {
    return Math.floor(Math.random() * config.rowsCount);
  };

  // Get random column
  const getRandomColumn = () => {
    return Math.floor(Math.random() * config.colsCount);
  };

  // Collect bonus by clicking
  const handleBonusCollect = (block) => {
    const row = parseInt(block.getAttribute('id').split('_')[1]);
    const col = parseInt(block.getAttribute('id').split('_')[2]);

    config.movingItems++
    player.selectedRow = row
    player.selectedCol = col
    player.posX = config.rowsCount - 1
    player.posY = config.colsCount - 1
    config.gameState = config.gameStates[1];
    checkMoving()
  }

  // Swipe start action
  const handleSwipeStart = (event) => {
    if (config.checking) return;
    // Save the initial targeted element
    firstTargetEvent = event;
    // Remember the initial swipe coordinates

    player.startX =
      event.type === "touchstart" ? event.touches[0].clientX : event.clientX;
    player.startY =
      event.type === "touchstart" ? event.touches[0].clientY : event.clientY;
  };

  // Swipe end action
  const handleSwipeEnd = (event) => {
    if (
      config.checking ||
      !firstTargetEvent ||
      ![...firstTargetEvent?.target?.classList]?.includes(config.blockClass)
    )
      return;
    // Get the final swipe coordinates
    player.endX =
      event.type === "touchend"
        ? event.changedTouches[0].clientX
        : event.clientX;
    player.endY =
      event.type === "touchend"
        ? event.changedTouches[0].clientY
        : event.clientY;

    // Calculate the swipe distance horizontally and vertically
    const deltaX = player.endX - player.startX;
    const deltaY = player.endY - player.startY;

    // collect bonus if user click on bonus block
    if (deltaX === 0 && deltaY === 0 && firstTargetEvent?.target?.classList?.contains('bonus-block')) {
      return handleBonusCollect(event.target)
    }

    // Determine the swipe direction
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (deltaX > 5) {
        // Swipe right
        handlerSwipe(firstTargetEvent, "right");
      } else if (deltaX < -5) {
        // Swipe left
        handlerSwipe(firstTargetEvent, "left");
      }
    } else if (deltaY > 5) {
      // Swipe down
      handlerSwipe(firstTargetEvent, "down");
    } else if (deltaY < -5) {
      // Swipe up
      handlerSwipe(firstTargetEvent, "up");
    }
  };

  // Swipe handler
  const handlerSwipe = async (targetEvent, position) => {
    const target = targetEvent?.target;
    if (target.classList.contains(config.blockClass) && config.gameStates[0]) {
      // Determine row and column
      let row = parseInt(target.getAttribute("id").split("_")[1]);
      let col = parseInt(target.getAttribute("id").split("_")[2]);

      // Save the selection of the first position
      player.selectedRow = row;
      player.selectedCol = col;

      // After selection, change the game state
      config.gameState = config.gameStates[1];

      // Check the direction of the swipe
      // If swiped left, decrease the column selected by 1
      // If swiped right, increase the column selected by 1
      // If swiped up, decrease the row selected by 1
      // If swiped down, increase the row selected by 1
      switch (position) {
        case "left":
          col--;
          break;
        case "right":
          col++;
          break;
        case "up":
          row--;
          break;
        case "down":
          row++;
          break;
      }
      player.posX = col;
      player.posY = row;

      // Swap the blocks only if the next block is inside the grid
      if (
        row >= 0 &&
        row < config.rowsCount &&
        col >= 0 &&
        col < config.colsCount
      ) {
        await swapBlocks();
      }
    }
  };

  // Swap blocks
  const swapBlocks = async () => {
    const canSoundPlay = JSON.parse(localStorage.getItem("f_sound_switch"));

    vibrate();
    canSoundPlay && swapAudio.play();
    const yOffset = player.selectedRow - player.posY;
    const xOffset = player.selectedCol - player.posX;

    // Mark blocks to move
    document
      .querySelector(
        `#${config.blockIdPrefix}_${player.selectedRow}_${player.selectedCol}`,
      )
      .classList.add("switch");
    document
      .querySelector(
        `#${config.blockIdPrefix}_${player.selectedRow}_${player.selectedCol}`,
      )
      .setAttribute("dir", "-1");

    document
      .querySelector(`#${config.blockIdPrefix}_${player.posY}_${player.posX}`)
      .classList.add("switch");
    document
      .querySelector(`#${config.blockIdPrefix}_${player.posY}_${player.posX}`)
      .setAttribute("dir", "1");

    // Swap blocks
    await $(".switch").each(function () {
      config.movingItems++;

      $(this).animate(
        {
          left: `+=${xOffset * config.blockSize * $(this).attr("dir")}`,
          top: `+=${yOffset * config.blockSize * $(this).attr("dir")}`,
        },
        100,
        function () {
          // Check the availability of the move
          checkMoving();
        },
      );

      $(this).removeClass("switch");
    });

    // Swap identifiers
    document
      .querySelector(
        `#${config.blockIdPrefix}_${player.selectedRow}_${player.selectedCol}`,
      )
      .setAttribute("id", "temp");
    document
      .querySelector(`#${config.blockIdPrefix}_${player.posY}_${player.posX}`)
      .setAttribute(
        "id",
        `${config.blockIdPrefix}_${player.selectedRow}_${player.selectedCol}`,
      );
    document
      .querySelector("#temp")
      .setAttribute(
        "id",
        `${config.blockIdPrefix}_${player.posY}_${player.posX}`,
      );

    // Swap blocks in the grid
    const temp = components.blocks[player.selectedRow][player.selectedCol];
    components.blocks[player.selectedRow][player.selectedCol] =
      components.blocks[player.posY][player.posX];
    components.blocks[player.posY][player.posX] = temp;
  };

  // Check moved blocks
  const checkMoving = () => {
    config.checking = true;
    config.movingItems--;

    // Actions after all moves
    if (config.movingItems === 0) {
      // Actions depending on the game state
      switch (config.gameState) {
        // After block movement, check for appearing streaks
        case config.gameStates[1]:
        case config.gameStates[2]:
          // Check for appearing streaks
          if (
            !isStreak(player.selectedRow, player.selectedCol) &&
            !isStreak(player.posY, player.posX)
          ) {
            // If there are no streaks, revert the move
            if (config.gameState !== config.gameStates[2]) {
              config.gameState = config.gameStates[2];
              swapBlocks();
            }
            // If the move is already being reverted, return to the initial selection state
            else {
              config.checking = false;
              firstTargetEvent = null;
              config.gameState = config.gameStates[0];
              player.selectedRow = -1;
              player.selectedCol = -1;
            }
          } else {
            // If there are streaks, remove them
            config.gameState = config.gameStates[3];

            // Mark all blocks to remove
            if (isStreak(player.selectedRow, player.selectedCol)) {
              markRemovingBlocks(player.selectedRow, player.selectedCol);
            }

            if (isStreak(player.posY, player.posX)) {
              markRemovingBlocks(player.posY, player.posX);
            }

            // Remove from the field
            removeBlocksFromDOM();
          }
          break;
        // After removal, fill the empty spaces
        case config.gameStates[3]:
          checkFalling();
          break;
        case config.gameStates[4]:
          placeNewBlocks();
          break;
      }
    }
  };

  // Fill the empty spaces
  const checkFalling = () => {
    let fellDown = 0;

    for (let j = 0; j < config.colsCount; j++) {
      for (let i = config.rowsCount - 1; i > 0; i--) {
        if (
          components.blocks[i][j] === -1 &&
          components.blocks[i - 1][j] >= 0
        ) {
          document
            .querySelector(`#${config.blockIdPrefix}_${i - 1}_${j}`)
            .classList.add("fall");
          document
            .querySelector(`#${config.blockIdPrefix}_${i - 1}_${j}`)
            .setAttribute("id", `${config.blockIdPrefix}_${i}_${j}`);
          components.blocks[i][j] = components.blocks[i - 1][j];
          components.blocks[i - 1][j] = -1;
          fellDown++;
        }
      }
    }

    $(".fall").each(function () {
      config.movingItems++;

      $(this).animate(
        {
          top: "+=" + config.blockSize,
        },
        70,
        function () {
          $(this).removeClass("fall");
          checkMoving();
        },
      );
    });

    // If all elements have moved down,
    // change the game state
    if (fellDown === 0) {
      config.gameState = config.gameStates[4];
      config.movingItems = 1;
      checkMoving();
    }
  };

  // Mark blocks for removal and remove them from the grid
  const markRemovingBlocks = (row, col) => {
    let removedBlocksCount = 0;
    const blockValue = components.blocks[row][col];
    let tmp = row;

    document
      .querySelector(`#${config.blockIdPrefix}_${row}_${col}`)
      .classList.add("remove");

    if (isVerticalStreak(row, col)) {
      tmp = row;

      while (
        tmp > 0 &&
        (components.blocks[tmp - 1][col] === blockValue || blockValue === 7)
      ) {
        document
          .querySelector(`#${config.blockIdPrefix}_${tmp - 1}_${col}`)
          .classList.add("remove");
        components.blocks[tmp - 1][col] = -1;
        tmp--;
        removedBlocksCount++;
      }

      tmp = row;

      while (
        tmp < config.rowsCount - 1 &&
        (components.blocks[tmp + 1][col] === blockValue || blockValue === 7)
      ) {
        document
          .querySelector(`#${config.blockIdPrefix}_${tmp + 1}_${col}`)
          .classList.add("remove");
        components.blocks[tmp + 1][col] = -1;
        tmp++;
        removedBlocksCount++;
      }
    }

    if (isHorizontalStreak(row, col)) {
      tmp = col;

      while (
        tmp > 0 &&
        (components.blocks[row][tmp - 1] === blockValue || blockValue === 7)
      ) {
        document
          .querySelector(`#${config.blockIdPrefix}_${row}_${tmp - 1}`)
          .classList.add("remove");
        components.blocks[row][tmp - 1] = -1;
        tmp--;
        removedBlocksCount++;
      }

      tmp = col;

      while (
        tmp < config.colsCount - 1 &&
        (components.blocks[row][tmp + 1] === blockValue || blockValue === 7)
      ) {
        document
          .querySelector(`#${config.blockIdPrefix}_${row}_${tmp + 1}`)
          .classList.add("remove");
        components.blocks[row][tmp + 1] = -1;
        tmp++;
        removedBlocksCount++;
      }
    }

    if (components.blocks[row][col] === 7) {
      coin.coinsCollected++;
      coin.coinGenerated = false;
    }

    for (const i in config.targets) {
      if (!checkTargetsCollect(i)) {
        if (
          config.targets[i][blockValue] !== undefined &&
          config.targets[i][blockValue] > 0
        ) {
          config.targets[i][blockValue] - (removedBlocksCount + 1) <= 0
            ? (config.targets[i][blockValue] = 0)
            : (config.targets[i][blockValue] -= removedBlocksCount + 1);
        }
        break;
      }
    }

    const canSoundPlay = JSON.parse(localStorage.getItem("f_sound_switch"));
    // stop swap sound
    canSoundPlay && swapAudio.stop();

    // play collect sound
    if (components.blocks[row][col] === 7) {
      canSoundPlay && bonusCollectAudio.play();
      // vibrate device
      vibrate({
        duration: 50,
        style: 'heavy'
      })
    } else {
      canSoundPlay && collectAudio.stop();
      canSoundPlay && collectAudio.play();
      // vibrate device
      vibrate({
        duration: 50,
      });
    }
    // increment score
    scoreIncrement(removedBlocksCount);
    // mark elements to delete
    components.blocks[row][col] = -1;
  };

  // Remove blocks
  const removeBlocksFromDOM = () => {
    $(".remove").each(function () {
      config.movingItems++;

      $(this).animate({ scale: 0 }, 400, function () {
        $(this).remove();
        checkMoving();
      });
    });
  };

  // Create new blocks
  const placeNewBlocks = () => {
    let blocksPlaced = 0;

    // Find places to create blocks
    for (let i = 0; i < config.colsCount; i++) {
      if (components.blocks[0][i] === -1) {
        components.blocks[0][i] = Math.floor(
          Math.random() * config.blockIcons.length,
        );

        createBlock(
          0,
          i * config.blockSize,
          0,
          i,
          config.blockIcons[components.blocks[0][i]],
        );
        blocksPlaced++;
      }
    }

    // If blocks are created, check if they need to be moved down.
    if (blocksPlaced) {
      config.gameState = config.gameStates[3];
      checkFalling();
    } else {
      // Check for streaks
      let combo = 0;

      for (let i = 0; i < config.rowsCount; i++) {
        for (let j = 0; j < config.colsCount; j++) {
          if (
            j <= config.colsCount - 3 &&
            components.blocks[i][j] === components.blocks[i][j + 1] &&
            components.blocks[i][j] === components.blocks[i][j + 2]
          ) {
            combo++;
            markRemovingBlocks(i, j);
          }
          if (
            i <= config.rowsCount - 3 &&
            components.blocks[i][j] === components.blocks[i + 1][j] &&
            components.blocks[i][j] === components.blocks[i + 2][j]
          ) {
            combo++;
            markRemovingBlocks(i, j);
          }
        }
      }

      // Remove found streaks
      if (combo > 0) {
        config.gameState = config.gameStates[3];
        removeBlocksFromDOM();
      } else {
        // Start the main game state
        config.checking = false;
        firstTargetEvent = null;
        config.gameState = config.gameStates[0];
        player.selectedRow = -1;
      }
    }
  };

  // Check game result
  const checkResults = async () => {
    if (timer.time === 0) {
      // remove swipe listeners when game time is out
      components.gWrapper.removeEventListener("mousedown", handleSwipeStart);
      components.gWrapper.removeEventListener("touchstart", handleSwipeStart);
      components.gWrapper.removeEventListener("mouseup", handleSwipeEnd);
      components.gWrapper.removeEventListener("touchend", handleSwipeEnd);
      // check game targets, if there are not collected, game score will bie 0
      clearTimer();
      await setRoundResults();
    }
  };

  // check targets collect results
  const checkTargetsCollect = (index = 0) =>
    !Object.values(config.targets[index]).some((i) => +i !== 0);

  // Start timer
  const startTimer = () => {
    timer.interval = setInterval(() => {
      if (timer.time === 0) {
        clearTimer();
        checkResults();
        return;
      }
      --timer.time;
      updateGameHeader();
    }, 1000);
  };

  // Start round
  const startRound = async () => {
    try {
      const game = await fetch(
        `${api}/api/games/5d1afcb3/start_round/?referer=${profile?.ref_code ?? null}`,
        {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        },
      )
        .then(async (res) => await res.json())
        .catch((e) => {
          window?.Telegram?.WebApp?.showAlert?.(
            JSON.stringify(e?.details ?? "Error :("),
          );
          throw new Error(e);
        });
      if (game?.id) {
        // reset game data to local storage
        localStorage.removeItem("f_game_data");
        localStorage.setItem("f_game_data", JSON.stringify(game));
        gameData = game;
        coin.cnt = game?.coins;

        document.querySelector(".f-game").innerHTML = "";
        initGame();
        return Boolean(game?.id);
      } else {
        window?.Telegram?.WebApp?.showAlert?.(
          JSON.stringify(game?.details ?? "Error :("),
        );
      }
    } catch (e) {
      console.error(e);
      window?.Telegram?.WebApp?.showAlert?.(
        JSON.stringify(e?.details ?? "Error :("),
      );
      throw new Error(e);
    }
  };

  // Save game results
  const setRoundResults = async () => {
    try {
      const payload = {
        id: gameData?.id,
        exp: score,
        mined_coins:
          !checkTargetsCollect(0) &&
            !checkTargetsCollect(config.targets.length - 1)
            ? 0
            : coin.coinsCollected > coin.cnt
              ? coin.cnt
              : coin.coinsCollected,
        extra_target: checkTargetsCollect(config.targets.length - 1),
      };
      const saved = await fetch(`${api}/api/games/5d1afcb3/set_result/`, {
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify(payload),
      })
        .then(async (res) => await res.json())
        .catch((e) => {
          window?.Telegram?.WebApp?.showAlert?.(
            JSON.stringify(e?.details ?? "Error :("),
          );
          throw new Error(e);
        });

      // clear wrapper
      if (saved?.status?.toLowerCase() === "error") {
        window?.Telegram?.WebApp?.showAlert?.(
          JSON.stringify(saved?.details ?? "Error :("),
        );
      } else {
        // remove game data from local storage
        localStorage.removeItem("f_game_data");
        createGameComplete({
          selector: ".f-game-wrapper",
          coinsCollected: coin.coinsCollected,
          roundId: gameData.id,
          targetsCollected: checkTargetsCollect(0),
          extraTargetsCollected: checkTargetsCollect(config.targets.length - 1),
        }).then((res) => {
          if (res === "back") backToIntro();
          else if (res === "repeat") repeatGame();
        });
        return saved?.status?.toLowerCase() === "success";
      }
    } catch (e) {
      console.error(e);
      window?.Telegram?.WebApp?.showAlert?.(
        JSON.stringify(e?.details ?? "Error :("),
      );
      throw new Error(e);
    }
  };

  // Clear timer
  const clearTimer = () => {
    clearInterval(timer.interval);
    timer.interval = null;
  };

  const clearData = () => {
    clearTimer();
    config.targets = [];
    config.checking = false;
    coin.coinGenerated = false;
    coin.coinsCollected = 0;
    for (const timeout in coin.timeouts) {
      if (timeout) {
        clearTimeout(timeout);
      }
    }
    timer.interval = null;
    timer.time = 120;
    score = 0;
    firstTargetEvent = null;
  };

  const clearGameComponents = () => {
    components.container.removeEventListener("mousedown", handleSwipeStart);
    components.container.removeEventListener("touchstart", handleSwipeStart);
    components.container.removeEventListener("mouseup", handleSwipeEnd);
    components.container.removeEventListener("touchend", handleSwipeEnd);
    components.wrapper.innerHTML = "";
    components.container = document.createElement("div");
    components.gWrapper = document.createElement("div");
    components.header = document.createElement("div");
    components.timer = document.createElement("div");
    components.score = document.createElement("div");
    components.targets = document.createElement("div");
    components.blocks = [];
  };

  const repeatGame = async () => {
    coin.cnt = 0;
    clearData();
    clearGameComponents();
    await startRound();
    generateCoinsInterval();
  };

  const backToIntro = async () => {
    clearData();
    clearGameComponents();
    createIntro();
  };

  // Initialize all game components
  const initGame = () => {
    // clear timer
    clearTimer();
    // clear all data
    clearData();
    // disable scroll
    document.body.style.overflow = "hidden";
    // generate game targets
    generateTargets();
    // generate extra targets
    generateTargets({
      minValue: 15,
      maxValue: 30,
    });
    // create the game container
    createGamePage();
    // create the game header
    createGameHeader();
    // create the game wrapper
    createGameWrapper();
    // create the game grid (2-dimensional array)
    createGameGrid();
    // create back button
    createBackButton(document?.querySelector?.(".f-game-header") ?? null);
    // create sound switch button
    createSoundSwitchButton(
      document?.querySelector?.(".f-game-header") ?? null,
    );
    // start game timer
    startTimer();
    // generate intervals to add bonus coins
    generateCoinsInterval();
    // switch the game state to "selection"
    config.gameState = config.gameStates[0];
  };

  if (profile) initGame();

  document
    .querySelector("#gameBack")
    .addEventListener("click", () => clearData());
};

export { createGame };
