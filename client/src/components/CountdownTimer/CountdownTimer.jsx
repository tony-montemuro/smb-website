/* ===== IMPORTS ===== */
import { useEffect } from "react";
import CountdownTimerLogic from "./CountdownTimer.js";

function CountdownTimer() {
  /* ===== STATES & FUNCTIONS ===== */

  // states & functions from the js file
  const { remainingTime, updateRemainingTime } = CountdownTimerLogic();

  /* ===== EFFECTS ===== */

  // code that is executed every second
  useEffect(() => {
    const id = setInterval(() => {
      updateRemainingTime();
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ===== COUNTDOWN TIMER COMPONENT ===== */
  return (
    <span>
      <span>{ remainingTime.hours }</span>
      <span>:</span>
      <span>{ remainingTime.minutes }</span>
      <span>:</span>
      <span>{ remainingTime.seconds }</span>
    </span>
  );
};

/* ===== EXPORTS ===== */
export default CountdownTimer;