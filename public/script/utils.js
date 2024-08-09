export const calculateSize = (min, max, percentage) => {
  const screenWidth = window.innerWidth;
  const elementSize = (screenWidth * percentage) / 100;
  return Math.max(min, Math.min(max, elementSize));
};

export const clearAllIntervalsAndTimeouts = () => {
  return new Promise((resolve) => {
    // clear all intervals
    const highestIntervalId = window.setInterval(
      () => {},
      Number.MAX_SAFE_INTEGER,
    );
    for (let i = 1; i <= highestIntervalId; i++) {
      window.clearInterval(i);
    }

    // clear all timeouts
    const highestTimeoutId = window.setTimeout(
      () => {},
      Number.MAX_SAFE_INTEGER,
    );
    for (let i = 1; i <= highestTimeoutId; i++) {
      window.clearTimeout(i);
    }
    resolve();
  });
};

export const calcIntlNumber = (number, round = true) => {
  if (number < 10000) return round ? Math.round(number) : number;
  return new Intl.NumberFormat("en-EN", {
    notation: "compact",
    compactDisplay: "short",
  }).format(number);
};

export const calcAnimate = ({
  classname,
  counter = 0,
  duration = 800,
  formatFunc = null,
}) => {
  $(classname).each(function () {
    const $this = $(this);
    const currentVal = parseInt($this.text(), 10) || 0;

    $this.prop("Counter", currentVal).animate(
      {
        Counter: counter,
      },
      {
        duration: duration,
        easing: "swing",
        step: function (now) {
          $this.text(formatFunc ? formatFunc(now) : Math.ceil(now));
        },
      },
    );
  });
};
