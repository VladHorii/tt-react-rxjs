import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { interval, fromEvent, Observable } from "rxjs";
import { buffer, debounceTime, filter } from "rxjs/operators";

const intervalTime = 10;
let paused = false;

function App() {
  const [hours, setHours] = useState("00");
  const [minutes, setMinutes] = useState("00");
  const [seconds, setSeconds] = useState("00");
  const [timeStamp, setTimeStamp] = useState(0);
  const [stopwatchStatus, setStopwatchStatus] = useState(false);
  const timer$ = useRef(null);
  const btnWait = useRef(null);

  const observable = new Observable((subscriber) => {
    interval(intervalTime).subscribe(() => subscriber.next(null));
  });

  useLayoutEffect(() => {
    btnWait.current = fromEvent(document.getElementById("btn-wait"), "click");
    const doubleClick = (btn$) => {
      const btnBuffer$ = btn$.pipe(debounceTime(300));

      return btn$.pipe(
        buffer(btnBuffer$),
        filter((evt) => evt.length === 2)
      );
    };

    const waitBtnClickDebounce$ = doubleClick(btnWait.current);

    waitBtnClickDebounce$.subscribe(() => {
      paused = true;

      setStopwatchStatus(false);
      timer$.current.unsubscribe();
    });
  }, []);

  useEffect(() => {
    const setTimeToDOM = (value) => {
      const prettyTime = (time) => {
        if (time <= 9) {
          return `0${time}`;
        }
        return time;
      };

      setTimeStamp(value);

      const h = Math.floor(value / 60 / 60);
      const m = Math.floor(value / 60) - h * 60;
      const s = value % 60;

      setHours(prettyTime(h));
      setMinutes(prettyTime(m));
      setSeconds(prettyTime(s));
    };
    setTimeToDOM(timeStamp);
  }, [timeStamp]);

  const onStartClick = () => {
    paused = false;
    const status = !stopwatchStatus; // т.к. setState асинхронный, применил этот костыль
    setStopwatchStatus((status) => !status);

    if (status) {
      timer$.current = observable.subscribe({
        next() {
          setTimeStamp((time) => time + 1);
        },
      });
    }

    if (!status && timer$.current) {
      if (!paused) {
        setTimeStamp(0);
      }

      timer$.current.unsubscribe();
      timer$.current = null;
    }
  };

  return (
    <div className="App">
      <button onClick={onStartClick}>start / stop</button>
      <button id="btn-wait">wait</button>
      <button onClick={() => setTimeStamp(0)}>reset</button>

      <div>
        <span>{hours}</span>:<span>{minutes}</span>:<span>{seconds}</span>
      </div>
    </div>
  );
}

export default App;

// VANILLA JAVASCRIPT
/*
import { interval, fromEvent, Observable } from "rxjs";
import { takeUntil, buffer, debounceTime, filter } from "rxjs/operators";

let timeStamp = 0;
let stopwatchStatus = false;
const intervalTime = 1000;

const prettyTime = (time) => {
  if (time <= 9) {
    return `0${time}`;
  }
  return time;
};

const doubleClick = (btn$) => {
  const btnBuffer$ = btn$.pipe(debounceTime(300));

  return btn$.pipe(
    buffer(btnBuffer$),
    filter((evt) => evt.length === 2)
  );
};

const setTimeToDOM = (value) => {
  timeStamp = value;

  const hours = Math.floor(timeStamp / 60 / 60);
  const minutes = Math.floor(timeStamp / 60) - hours * 60;
  const seconds = timeStamp % 60;

  ref.hours.textContent = prettyTime(hours);
  ref.minutes.textContent = prettyTime(minutes);
  ref.seconds.textContent = prettyTime(seconds);
};

const ref = {
  hours: document.getElementById("hours"),
  minutes: document.getElementById("minutes"),
  seconds: document.getElementById("seconds"),

  startBtn: document.getElementById("start-btn"),
  resetBtn: document.getElementById("reset-btn"),
  waitBtn: document.getElementById("wait-btn"),
};

const startBtnClick$ = fromEvent(ref.startBtn, "click");
const resetBtnClick$ = fromEvent(ref.resetBtn, "click");
const waitBtnClick$ = fromEvent(ref.waitBtn, "click");
const waitBtnClickDebounce$ = doubleClick(waitBtnClick$);

const observable = new Observable((subscriber) => {
  interval(intervalTime)
    .pipe(takeUntil(waitBtnClickDebounce$), takeUntil(startBtnClick$))
    .subscribe(() => subscriber.next(timeStamp + 1));
});

startBtnClick$.subscribe(() => {
  stopwatchStatus = !stopwatchStatus;

  const timer$ = observable.subscribe({
    next(num) {
      setTimeToDOM(num);
    },
  });

  if (!stopwatchStatus) {
    setTimeToDOM(0);
    timer$.unsubscribe();
  }
});

resetBtnClick$.subscribe(() => {
  setTimeToDOM(0);
});

waitBtnClickDebounce$.subscribe(() => {
  stopwatchStatus = false;
});
<button id="start-btn">start / stop</button>
<button id="wait-btn">wait</button>
<button id="reset-btn">reset</button>

<div>
  <span id="hours">00</span>
  :
  <span id="minutes">00</span>
  :
  <span id="seconds">00</span>
</div>
*/
