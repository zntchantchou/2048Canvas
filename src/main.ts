import Game from "./Game";

let isCanvasReady = false;

let interval = setInterval(() => {
  console.log("Waiting for canvas...");
  const canvas = document.getElementById("myCanvas");
  if (!canvas || isCanvasReady) return;
  isCanvasReady = true;
  const game = new Game();
  clearInterval(interval);
  game.start();
}, 300);
