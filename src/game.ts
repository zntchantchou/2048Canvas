import { DIRECTIONS } from "./enums";
import GameState from "./state";
import Tile from "./Tile";
// CONSTANTS
export default class Game {
  canvas = document.getElementById("myCanvas") as HTMLCanvasElement;
  context = this.canvas.getContext("2d");
  squareX = 0;
  squareY = 0;
  velocity = 4;
  gridGap = 20;
  vX = 4;
  vY = 4;
  cellSide = (this.canvas.height - 100) / 4;
  gameState: GameState = new GameState();


  private drawSquare = (tile: Tile) => {
    const x =
      tile.x == 0
        ? this.gridGap
        : this.gridGap + (this.cellSide + this.gridGap) * tile.x;
    const y =
      tile.y == 0
        ? this.gridGap
        : this.gridGap + (this.cellSide + this.gridGap) * tile.y;
    this.context.fillStyle = "#15a074";
    this.context.fillRect(x, y, this.cellSide, this.cellSide);
    this.context.font = "15px Arial";
    this.context.textAlign = "center";
    this.context.fillStyle = "white";
    this.context.fillText(
      `x: ${tile.x} \n y: ${tile.y} \n`,
      x + this.cellSide / 2,
      y + this.cellSide / 2
      );
    this.context.font = "20px Arial";
    this.context.fillText(`v: ${tile.value}`, x + this.cellSide / 2,y + (this.cellSide / 2) + 20);
  };


  private draw = () => {
    if (this.context) {
      this.clear();
    }
    for (let i = 0; i < this.gameState.tiles.length; i++) {
      this.drawSquare(this.gameState.tiles[i]);
    }
  };

  clear = () => {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  };

  start() {
    this.handleEvents();
    setInterval(this.draw, 15);
  }
  

  handleEvents() {
    document.addEventListener("keydown", (event) => {
      switch(event.code) {
        case "ArrowUp" : this.gameState.move(DIRECTIONS.UP);
        break;
        case "ArrowDown" : this.gameState.move(DIRECTIONS.DOWN);
        break;
        case "ArrowLeft" : this.gameState.move(DIRECTIONS.LEFT);
        break;
        case "ArrowRight" : this.gameState.move(DIRECTIONS.RIGHT);
        break;
      }
    });
  }
}
