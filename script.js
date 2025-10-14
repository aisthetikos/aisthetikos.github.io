// script.js
function secondsCounterWithIncrement(initialMaxCount, initialRepetitions) {
  let maxCount = initialMaxCount;
  let repetitions = initialRepetitions;
  const counterElement = document.getElementById('counter');
  const incrementElement = document.getElementById('increment');
  let incrementCount = 1;
  const dingSound = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');

  function formatSeconds(seconds) {
    return String(seconds).padStart(2, '0');
  }

  // This is the function that contains the main timer loop
  function runCounter() {
    function repeatLoop(repeatIndex) {
      if (repeatIndex < repetitions) {
        function countLoop(count) {
          if (count <= maxCount) {
            counterElement.textContent = formatSeconds(count);
            setTimeout(() => countLoop(count + 1), 1000);
          } else {
            dingSound.play();
            repeatLoop(repeatIndex + 1);
          }
        }
        countLoop(1);
      } else {
        maxCount++;
        incrementCount++;
        incrementElement.textContent = `Increment: ${incrementCount}`;
        runCounter();
      }
    }
    repeatLoop(0);
  }

  // KEY CHANGE: Instead of running the timer, we return the function that runs it.
  return runCounter;
}

document.addEventListener('DOMContentLoaded', () => {
  const startButton = document.getElementById('startButton');

  startButton.addEventListener('click', () => {
    // Hide the button after it's clicked
    startButton.style.display = 'none';

    // 1. Call the setup function to prepare the timer and get the starter function
    const startTheTimer = secondsCounterWithIncrement(5, 3);

    // 2. Now, call the returned function to actually begin the countdown
    startTheTimer();
  });
});
