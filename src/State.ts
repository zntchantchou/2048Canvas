import Tile from "./Tile";
import { DIRECTIONS } from "./enums";
import { Coordinates } from "./interfaces";

export default class GameState {
  isPastWin: boolean = false;
  score: number = 0;
  bestScore: number = 0;
  tiles: Tile[] = [];
  sortedTiles: Tile[];
  gameOver: boolean = false;
  ROW_SIZE: number = 3;
  VERTICAL_DIRECTIONS = [DIRECTIONS.UP, DIRECTIONS.DOWN];
  HORIZONTAL_DIRECTIONS = [DIRECTIONS.LEFT, DIRECTIONS.RIGHT];

  constructor() {
    console.log("reset");
    this.reset();
  }

  reset() {
    this.tiles = [];
    const startTiles: Tile[] = [
      this.getNewTile(),
      this.getNewTile(),
      // new Tile({ x: 0, y: 0 }, 2),
      // new Tile({ x: 1, y: 0 }, 4),
      // new Tile({ x: 2, y: 0 }, 2),
      // new Tile({ x: 3, y: 0 }, 4),
      // new Tile({ x: 0, y: 1 }, 4),
      // new Tile({ x: 1, y: 1 }, 2),
      // new Tile({ x: 2, y: 1 }, 4),
      // new Tile({ x: 3, y: 1 }, 2),
      // new Tile({ x: 0, y: 2 }, 2),
      // new Tile({ x: 1, y: 2 }, 4),
      // new Tile({ x: 2, y: 2 }, 2),
      // new Tile({ x: 3, y: 2 }, 4),
      // new Tile({ x: 0, y: 3 }, 4),
      // new Tile({ x: 1, y: 3 }, 2),
      // new Tile({ x: 2, y: 3 }, 4),
      // new Tile({ x: 3, y: 3 }, 2),
    ];
    this.gameOver = false;
    startTiles.forEach((t) => this.addTile(t));
    window.localStorage.removeItem("currentScore");
    const bestScore = localStorage.getItem("bestScore");
    this.score = 0;
    if (bestScore) {
      this.bestScore = Number(bestScore);
    }
  }

  randomInt() {
    return Math.round(Math.random() * 3);
  }

  addTile(tile: Tile) {
    this.tiles = [tile, ...this.tiles];
  }

  getNewTile() {
    return new Tile(this.randomCoords(), Math.random() > 0.6 ? 4 : 2);
  }

  randomCoords(): Coordinates {
    const coordinates: Coordinates = {
      x: this.randomInt(),
      y: this.randomInt(),
    };

    if (this.tiles) {
      if (!this.areCoordinatesFree(coordinates)) {
        return this.randomCoords();
      }
    }
    return coordinates;
  }

  areCoordinatesFree({ x, y }: Coordinates): Boolean {
    return this.tiles.length > 0
      ? !this.tiles.some((tile) => x == tile.x && y == tile.y)
      : true;
  }

  getUpdatedTiles(direction: DIRECTIONS): Tile[] {
    const sortedtiles = this.getSortedTiles(direction);
    let computedTiles: Tile[] = [];
    let isVerticalMove = this.VERTICAL_DIRECTIONS.includes(direction);
    let nextCoord = isVerticalMove ? "nextY" : "nextX";
    for (let c = 0; c <= this.ROW_SIZE; c++) {
      // traverse by column if UP or DOWN
      // traverse by row if LEFT or RIGHT
      let colunmsOrRows = sortedtiles.filter((t) =>
        isVerticalMove ? t.x == c : t.y == c
      );
      colunmsOrRows.forEach((tile, index, arr) => {
        let nextTile = arr[index + 1];
        let prevTile = arr[index - 1];
        if (index == 0) {
          // first tile in a row / column goes to 0 if going left or up
          // first tile in a row / column goes to the last position if going down or right
          tile[nextCoord] = [DIRECTIONS.UP, DIRECTIONS.LEFT].includes(direction)
            ? 0
            : this.ROW_SIZE;
          // merge cells if same values
          if (nextTile && nextTile.value == tile.value) {
            tile.nextValue = tile.value + tile.value;
          }
        }
        if (index > 0) {
          if (!prevTile.delete) {
            const updatedCoords = [DIRECTIONS.DOWN, DIRECTIONS.RIGHT].includes(
              direction
            )
              ? prevTile[nextCoord] - 1
              : prevTile[nextCoord] + 1;
            tile[nextCoord] = updatedCoords;

            if (prevTile.value == tile.value) {
              tile.delete = true;
            }
          }
          if (tile.delete) {
            this.addToScore(tile.value * 2);
            tile[nextCoord] = prevTile[nextCoord];
          }
          // if the previous tile is deleted,
          // the next tile slides into the deleted tile's position
          if (prevTile.delete) {
            if ([DIRECTIONS.DOWN, DIRECTIONS.RIGHT].includes(direction)) {
              tile[nextCoord] = prevTile[nextCoord] - 1;
            } else {
              tile[nextCoord] = prevTile[nextCoord] + 1;
            }
          }
        }
        computedTiles = [...computedTiles, tile];
      });
    }
    return computedTiles;
  }

  move(direction: DIRECTIONS) {
    this.tiles = this.getUpdatedTiles(direction);
  }

  updateValues() {
    this.tiles.forEach((t) => t.update());
  }

  spawnTile() {
    if (this.tiles.length < 16) {
      this.addTile(new Tile(this.randomCoords()));
    }
  }

  addToScore(number) {
    const updatedScore = this.score + number;
    this.score = updatedScore;
    localStorage.setItem("currentScore", updatedScore);
    if (this.score > this.bestScore) {
      this.bestScore = this.score;
      localStorage.setItem("bestScore", updatedScore);
    }
  }

  // delete tiles that must disappear
  deleteMergedTiles() {
    this.tiles = this.tiles.filter((t) => !t.delete);
  }

  resume() {
    this.gameOver = false;
    this.isPastWin = true;
  }

  get sortFns(): SORT_FNS {
    return {
      xAsc: (a, b) => {
        if (a.x == b.x) return 0;
        return a.x > b.x ? 1 : -1;
      },
      xDesc: (a, b) => {
        if (a.x == b.x) return 0;
        return a.x < b.x ? 1 : -1;
      },
      yAsc: (a, b) => {
        if (a.y == b.y) return 0;
        return a.y > b.y ? 1 : -1;
      },
      yDesc: (a, b) => {
        if (a.y == b.y) return 0;
        return a.y < b.y ? 1 : -1;
      },
    };
  }

  getSortedTiles(direction: DIRECTIONS | null): Tile[] {
    switch (direction) {
      case DIRECTIONS.UP:
        return [...this.tiles].sort((a, b) => {
          // sort by Y ASC then by X ASC
          const yAsc = this.sortFns.yAsc(a, b);
          return yAsc == 0 ? this.sortFns.xAsc(a, b) : yAsc;
        });
      case DIRECTIONS.DOWN:
        return [...this.tiles].sort((a, b) => {
          // sort by Y DESC then by X ASC
          const yDesc = this.sortFns.yDesc(a, b);
          return yDesc == 0 ? this.sortFns.xAsc(a, b) : yDesc;
        });
      case DIRECTIONS.LEFT:
      case null:
        return [...this.tiles].sort((a, b) => {
          // sort by X ASC then by Y ASC
          const xAsc = this.sortFns.xAsc(a, b);
          return xAsc == 0 ? this.sortFns.yAsc(a, b) : xAsc;
        });
      case DIRECTIONS.RIGHT:
        return [...this.tiles].sort((a, b) => {
          // sort by X DESC then by Y ASC
          const xDesc = this.sortFns.xDesc(a, b);
          return xDesc == 0 ? this.sortFns.yAsc(a, b) : xDesc;
        });
    }
  }

  handleAnimationEnd() {
    this.deleteMergedTiles();
    this.spawnTile();
    this.calculateWinStatus();
    this.updateValues();
  }

  calculateWinStatus() {
    if (this.isPastWin && this.gameOver) {
      console.log("this.isPastWin", this.isPastWin);
      console.log("this.gameOver", this.gameOver);
      this.gameOver = false;
    }
    let hasVerticalMove = true;
    let hasHorizontalMove = true;

    const sortedTiles = this.getSortedTiles(null);
    // check if 16 tiles
    if (sortedTiles.length === 16) {
      const rows = new Array(4)
        .fill(null)
        .map((_, index) => sortedTiles.filter((tile) => tile.y == index))
        .filter((arr) => arr.length);
      const columns = new Array(4)
        .fill(null)
        .map((_, index) => sortedTiles.filter((tile) => tile.x == index))
        .filter((arr) => arr.length);

      console.log("---------------------------------");
      console.log("ROWS", rows);
      console.log("COLUMNS", columns);

      rows.forEach((row) => {
        console.log("row is", row);
        console.log("row playbale ? ", this.hasPlayableMove(row));
        if (this.hasPlayableMove(row)) {
          hasHorizontalMove = true;
          return;
        }
        hasHorizontalMove = false;
      });
      if (!hasHorizontalMove) {
        columns.forEach((column) => {
          console.log("column", column);
          console.log("column playbale ? ", this.hasPlayableMove(column));
          if (this.hasPlayableMove(column)) {
            console.log("column hasPlayableMove");
            return;
          }
          hasVerticalMove = false;
        });
      }
    }
    console.log("HasHorizontalMove", hasHorizontalMove);
    console.log("HasVerticalMove", hasVerticalMove);
    if (!(hasHorizontalMove || hasVerticalMove)) {
      this.gameOver = true;
    }
  }

  // calculate if a row or line has a playable move
  hasPlayableMove(tiles: Tile[]): boolean {
    return tiles.some(
      (tile, index, tiles) => index > 0 && tile.value == tiles[index - 1].value
    );
  }
}

type TILE_SORT = (a: Tile, b: Tile) => 1 | 0 | -1;
type SORT_FNS = {
  xAsc: TILE_SORT;
  xDesc: TILE_SORT;
  yAsc: TILE_SORT;
  yDesc: TILE_SORT;
};
