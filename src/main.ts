import Game from "./game";

let isCanvasReady = false;

let interval = setInterval(() => {
  console.log("Waiting for canvas...");
  const canvas = document.getElementById("myCanvas");
  if (!canvas || isCanvasReady) return;
  isCanvasReady = true;
  const game = new Game();
  game.start();
  clearInterval(interval);
}, 300);
