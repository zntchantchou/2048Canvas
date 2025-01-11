import { DIRECTIONS } from "./enums";
import GameState from "./State";
import COLORS from "./colors";
import Tile from "./Tile";

export default class Game {
  // DOM selection ----------
  canvas = document.getElementById("myCanvas") as HTMLCanvasElement;
  moveElt = document.getElementById("move");
  context = this.canvas.getContext("2d");
  scoreElt = document.getElementById("currentScore") as HTMLSpanElement;
  bestScoreElt = document.getElementById("currentBestScore") as HTMLSpanElement;
  restartElt = document.getElementsByClassName("restart");
  overlayElt = document.getElementById("overlay") as HTMLDivElement;
  textElt = document.getElementById("text") as HTMLDivElement;
  resumeBtn = document.getElementById("resume") as HTMLDivElement;

  // CONSTANTS ----------
  font = "3em Arial";
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
  VICTORY_MSG = "YOU WIN !";
  shouldDisplayWinOverlay = true;
  touchStartX = 0;
  touchEndX = 0;
  touchStartY = 0;
  touchEndY = 0;
  swipeDistance = 30;

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
    this.context.strokeStyle = COLORS[tile.value] || "blue";
    this.context.fillStyle = COLORS[tile.value];
    this.context.beginPath();
    this.context.roundRect(x, y, this.cellSide, this.cellSide, [3]);
    this.context.fill();
    this.context.stroke();
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
    if (this.context) {
      this.clear();
      this.drawOverlay();
    }
    if (!this.canvas) return;
    for (let i = 0; i < this.gameState.tiles.length; i++) {
      this.drawSquare(this.gameState.tiles[i]);
    }
    if (animate) window.requestAnimationFrame(this.goToNextFrame);
  };

  private drawOverlay = () => {
    if (!this.context) return;
    const gridTiles = new Array(this.vX).fill(null).map((_, x) => {
      return new Array(this.vX).fill(null).map((_, y) => new Tile({ x, y }));
    });
    this.drawOverlayTiles(gridTiles.flat());
  };

  private drawOverlayTiles(tiles: Tile[]) {
    if (!this.context || this.context == null) return;
    tiles.forEach((tile) => {
      const x =
        tile.x == 0
          ? this.gridGap
          : this.gridGap + (this.cellSide + this.gridGap) * tile.x;
      const y =
        tile.y == 0
          ? this.gridGap
          : this.gridGap + (this.cellSide + this.gridGap) * tile.y;
      // @ts-ignore
      this.context.fillStyle = "#ffffff3b";
      // @ts-ignore
      this.context.strokeStyle = "#ffffff3b";
      this.context?.beginPath();
      this.context?.roundRect(x, y, this.cellSide, this.cellSide, [3]);
      this.context?.fill();
      this.context?.stroke();
    });
  }

  setMove(direction: DIRECTIONS) {
    this.lastMove = direction;
    if (this.moveElt) {
      this.moveElt.textContent = direction;
    }
  }

  private goToNextFrame = () => {
    if (this.isAnimationDone) {
      return;
    }
    if (this.context) {
      this.clear();
      this.drawOverlay();
    }

    const updatedTiles: Tile[] = [...this.gameState.tiles];

    updatedTiles.forEach((tile) => {
      switch (this.lastMove) {
        case DIRECTIONS.UP:
          if (tile.y == tile.nextY) {
            break;
          }
          if (tile.y - this.SHIFT_SIZE < tile.nextY) {
            tile.y = tile.nextY;
            break;
          }
          tile.y = tile.y - this.SHIFT_SIZE;
          break;
        case DIRECTIONS.DOWN:
          if (tile.y == tile.nextY) break;
          if (tile.y + this.SHIFT_SIZE > tile.nextY) {
            tile.y = tile.nextY;
            break;
          }
          tile.y = tile.y + this.SHIFT_SIZE;
          tile.y = tile.y + this.SHIFT_SIZE >= 3 ? 3 : tile.y + this.SHIFT_SIZE;
          break;
        case DIRECTIONS.LEFT:
          if (tile.x == tile.nextX) break;
          if (tile.x - this.SHIFT_SIZE < tile.nextX) {
            tile.x = tile.nextX;
            break;
          }
          tile.x = tile.x - this.SHIFT_SIZE;
          break;
        case DIRECTIONS.RIGHT:
          if (tile.x == tile.nextX) break;
          if (tile.x + this.SHIFT_SIZE > tile.nextX) {
            tile.x = tile.nextX;
            break;
          }
          tile.x = tile.x + this.SHIFT_SIZE;
          break;
        default:
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
    } else {
      this.isAnimationDone = true;
      window.cancelAnimationFrame(this.currentAnimationNumber);
      this.gameState.handleAnimationEnd();
      this.setScore();
      this.draw();
      this.handleGameEnd();
    }
  };

  clear = () => {
    if (this.context) {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    this.hideOverlay();
  };

  hideOverlay() {
    this.overlayElt.style.display = "none";
  }

  start() {
    this.setScore();
    this.handleResume();
    this.handleReload();
    this.handleArrowEvent();
    this.handleSwipeEvent();
    this.handleRestart();
    this.draw();
  }

  handleResume() {
    this.resumeBtn.addEventListener("click", (e) => {
      this.hideOverlay();
      this.gameState.resume();
    });
  }

  setDirection(direction: string) {
    switch (direction) {
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
    if (
      ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(direction)
    ) {
      this.isAnimationDone = false;
      this.draw(true);
    }
  }

  handleArrowEvent() {
    document.addEventListener("keydown", (e) => this.setDirection(e.code));
  }

  handleSwipeEvent() {
    document.addEventListener("touchstart", (e) => {
      e.preventDefault();
      this.touchStartX = e.changedTouches[0].screenX;
      this.touchStartY = e.changedTouches[0].screenY;
    });
    document.addEventListener("touchend", (e) => {
      e.preventDefault();
      console.log("TOUCHEND");
      this.touchEndX = e.changedTouches[0].screenX;
      this.touchEndY = e.changedTouches[0].screenY;
      if (this.touchEndX - this.touchStartX > this.swipeDistance) {
        this.setDirection("ArrowRight");
        return;
      }
      if (this.touchEndX - this.touchStartX < -this.swipeDistance) {
        this.setDirection("ArrowLeft");
        return;
      }
      if (this.touchEndY - this.touchStartY > this.swipeDistance) {
        this.setDirection("ArrowDown");
        return;
      }
      if (this.touchEndY - this.touchStartY < -this.swipeDistance) {
        this.setDirection("ArrowUp");
        return;
      }
    });
  }

  moveAfterSwipe() {
    if (this.touchEndX < this.touchStartX) return;
  }
  // avoid tiles when the page is reloaded
  handleReload() {
    window.onbeforeunload = (_) => {
      this.isAnimationDone = true;
    };
  }

  handleRestart() {
    Array.from(this.restartElt).forEach((restartButton) => {
      restartButton.addEventListener("click", () => {
        this.gameState.reset();
        this.draw();
      });
    });
  }

  handleGameEnd() {
    if (this.gameState.gameOver) {
      this.overlayElt.style.display = "flex";
    }
    if (this.gameState.hasWon && this.shouldDisplayWinOverlay) {
      this.overlayElt.style.display = "flex";
      this.textElt.textContent = this.VICTORY_MSG;
      this.resumeBtn.style.display = "flex";
      this.shouldDisplayWinOverlay = false;
    }
  }

  setScore() {
    this.scoreElt.textContent = this.gameState.score.toString();
    this.bestScoreElt.textContent = this.gameState.bestScore.toString();
  }
}
