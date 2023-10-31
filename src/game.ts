import { DIRECTIONS } from "./enums";
import GameState from "./state";
import COLORS from "./colors";
import Tile from "./Tile";
// CONSTANTS
export default class Game {
  canvas = document.getElementById("myCanvas") as HTMLCanvasElement;
  moveElt = document.getElementById("move");
  context = this.canvas.getContext("2d");
  font = "24px Arial";
  textAlign: CanvasTextAlign = "center";
  textFill = "#776E65";
  squareX = 0;
  squareY = 0;
  velocity = 4;
  gridGap = 20;
  vX = 4;
  vY = 4;
  SHIFT_SIZE = 0.2;
  cellSide = (this.canvas.height - 100) / 4;
  gameState: GameState = new GameState();
  lastMove: DIRECTIONS = DIRECTIONS.UP;
  isAnimationDone: boolean = false;
  currentAnimationNumber: number;

  private drawSquare = (tile: Tile) => {
    if (!this.context) return;
    // if animating
    const x =
      tile.x == 0
        ? this.gridGap
        : this.gridGap + (this.cellSide + this.gridGap) * tile.x;
    const y =
      tile.y == 0
        ? this.gridGap
        : this.gridGap + (this.cellSide + this.gridGap) * tile.y;
    this.context.fillStyle = COLORS[tile.value] || "blue";
    this.context.fillRect(x, y, this.cellSide, this.cellSide);
    this.context.font = this.font;
    this.context.textAlign = this.textAlign;
    this.context.fillStyle = this.textFill;
    this.context.font = "40px Arial";
    this.context.fillText(
      `${tile.value}`,
      x + this.cellSide / 2,
      y + this.cellSide / 2 + 12
    );
  };

  private draw = (animate?: boolean) => {
    console.log("draw");
    if (this.context) {
      this.clear();
    }
    for (let i = 0; i < this.gameState.tiles.length; i++) {
      this.drawSquare(this.gameState.tiles[i]);
    }
    if (animate) window.requestAnimationFrame(this.goToNextFrame);
  };

  private goToNextFrame = () => {
    if (this.isAnimationDone) {
      console.log("Animation is done");
      return;
    }
    if (this.context) {
      this.clear();
    }
    // console.log("step");
    const updatedTiles: Tile[] = [...this.gameState.tiles];

    updatedTiles.forEach((tile) => {
      switch (this.lastMove) {
        case DIRECTIONS.UP:
          console.log("[game.goToNextFrame] UP");
          if (tile.y == tile.nextY) break;
          if (tile.y - this.SHIFT_SIZE < tile.nextY) {
            tile.y = tile.nextY;
            break;
          }
          tile.y = tile.y - this.SHIFT_SIZE;
          break;
        case DIRECTIONS.DOWN:
          console.log("[game.goToNextFrame] DOWN");
          if (tile.y == tile.nextY) break;
          if (tile.y + this.SHIFT_SIZE > tile.nextY) {
            tile.y = tile.nextY;
            break;
          }
          tile.y = tile.y + this.SHIFT_SIZE;
          tile.y = tile.y + this.SHIFT_SIZE >= 3 ? 3 : tile.y + this.SHIFT_SIZE;
          break;
        case DIRECTIONS.LEFT:
          console.log("[game.goToNextFrame] LEFT");
          if (tile.x == tile.nextX) break;
          if (tile.x - this.SHIFT_SIZE < tile.nextX) {
            tile.x = tile.nextX;
            break;
          }
          tile.x = tile.x - this.SHIFT_SIZE;
          break;
        case DIRECTIONS.RIGHT:
          console.log("[game.goToNextFrame] RIGHT");
          if (tile.x == tile.nextX) break;
          if (tile.x + this.SHIFT_SIZE > tile.nextX) {
            tile.x = tile.nextX;
            break;
          }
          tile.x = tile.x + this.SHIFT_SIZE;
          break;
        default:
          console.log("[game.goToNextFrame] DEFAULT");
          break;
      }
    });

    const movingTiles = updatedTiles.filter((t) => {
      if ([DIRECTIONS.LEFT, DIRECTIONS.RIGHT].includes(this.lastMove)) {
        return t.x !== t.nextX;
      }
      return t.y !== t.nextY;
    });

    for (let i = 0; i < updatedTiles.length; i++) {
      this.drawSquare(updatedTiles[i]);
    }
    if (movingTiles.length > 0) {
      this.currentAnimationNumber = window.requestAnimationFrame(
        this.goToNextFrame
      );
      console.log("moving tiles", movingTiles);
    } else {
      this.isAnimationDone = true;
      console.log("currentAnimation", this.currentAnimationNumber);
      window.cancelAnimationFrame(this.currentAnimationNumber);
      this.gameState.deleteMergedTiles();
      this.gameState.spawnTile();
      this.draw();
      console.log("done");
    }
  };

  clear = () => {
    if (this.context) {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  };

  start() {
    this.handleEvents();
    this.draw();
  }

  setMove(direction: DIRECTIONS) {
    this.lastMove = direction;
    if (this.moveElt) {
      this.moveElt.textContent = direction;
    }
  }

  handleEvents() {
    document.addEventListener("keydown", (event) => {
      switch (event.code) {
        case "ArrowUp":
          this.gameState.move(DIRECTIONS.UP);
          this.setMove(DIRECTIONS.UP);
          break;
        case "ArrowDown":
          this.gameState.move(DIRECTIONS.DOWN);
          this.setMove(DIRECTIONS.DOWN);
          break;
        case "ArrowLeft":
          this.gameState.move(DIRECTIONS.LEFT);
          this.setMove(DIRECTIONS.LEFT);
          break;
        case "ArrowRight":
          this.gameState.move(DIRECTIONS.RIGHT);
          this.setMove(DIRECTIONS.RIGHT);
          break;
      }
      this.isAnimationDone = false;
      this.draw(true);
    });
  }
}
