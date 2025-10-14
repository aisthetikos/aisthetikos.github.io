// script.js
function secondsCounterWithIncrement(initialMaxCount, initialRepetitions) {
  let maxCount = initialMaxCount;
  let repetitions = initialRepetitions;
  const counterElement = document.getElementById('counter');
  const incrementElement = document.getElementById('increment');
  let incrementCount = 1;
  // Create an Audio object for the ding sound
  const dingSound = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');

  function formatSeconds(seconds) {
    return String(seconds).padStart(2, '0');
  }

  function runCounter() {
    function repeatLoop(repeatIndex) {
      if (repeatIndex < repetitions) {
        function countLoop(count) {
          if (count <= maxCount) {
            counterElement.textContent = formatSeconds(count);
            setTimeout(() => countLoop(count + 1), 1000);
          } else {
            // Play the ding sound at the end of the countdown
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
  runCounter();
}

document.addEventListener('DOMContentLoaded', () => {
  secondsCounterWithIncrement(5, 3);
});
