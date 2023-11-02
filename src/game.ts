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
  SHIFT_SIZE = 0.05;
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
    console.log("draw");
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
    const gridTiles = new Array(this.vX).fill(null).map((elt, XindeX) => {
      return new Array(this.vX)
        .fill(null)
        .map((elt, yIndex) => new Tile({ x: XindeX, y: yIndex }));
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

  private goToNextFrame = () => {
    if (this.isAnimationDone) {
      console.log("Animation is done");
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
          // console.log("[game.goToNextFrame] UP");
          if (tile.y == tile.nextY) {
            break;
          }
          if (tile.y - this.SHIFT_SIZE < tile.nextY) {
            tile.y = tile.nextY;
            // console.log("UP IN", tile.y);
            break;
          }
          tile.y = tile.y - this.SHIFT_SIZE;
          // console.log("UP OUT", tile.y);
          break;
        case DIRECTIONS.DOWN:
          // console.log("[game.goToNextFrame] DOWN");
          if (tile.y == tile.nextY) break;
          if (tile.y + this.SHIFT_SIZE > tile.nextY) {
            tile.y = tile.nextY;
            break;
          }
          tile.y = tile.y + this.SHIFT_SIZE;
          tile.y = tile.y + this.SHIFT_SIZE >= 3 ? 3 : tile.y + this.SHIFT_SIZE;
          break;
        case DIRECTIONS.LEFT:
          // console.log("[game.goToNextFrame] LEFT");
          if (tile.x == tile.nextX) break;
          if (tile.x - this.SHIFT_SIZE < tile.nextX) {
            tile.x = tile.nextX;
            break;
          }
          tile.x = tile.x - this.SHIFT_SIZE;
          break;
        case DIRECTIONS.RIGHT:
          // console.log("[game.goToNextFrame] RIGHT");
          if (tile.x == tile.nextX) break;
          if (tile.x + this.SHIFT_SIZE > tile.nextX) {
            tile.x = tile.nextX;
            break;
          }
          tile.x = tile.x + this.SHIFT_SIZE;
          break;
        default:
          // console.log("[game.goToNextFrame] DEFAULT");
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
    // setTimeout(() => {}, 500);
    this.handleMoveEvent();
    this.draw();
  }

  setMove(direction: DIRECTIONS) {
    this.lastMove = direction;
    if (this.moveElt) {
      this.moveElt.textContent = direction;
    }
  }

  handleMoveEvent() {
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
      if (
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.code)
      ) {
        this.isAnimationDone = false;
        this.draw(true);
      }
    });
  }

  handleReload() {
    window.onbeforeunload = (e) => {
      this.isAnimationDone = true;
      console.log("RELOADDDDDDDD");
    };
  }
}
