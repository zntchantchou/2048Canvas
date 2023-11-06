import Tile from "./Tile";
import { DIRECTIONS } from "./enums";
import { Coordinates } from "./interfaces";

export default class GameState {
  score: number = 0;
  bestScore: number = 0;
  tiles: Tile[] = [];
  nextTiles: Tile[] = [];
  ROW_SIZE = 3;
  VERTICAL_DIRECTIONS = [DIRECTIONS.UP, DIRECTIONS.DOWN];
  HORIZONTAL_DIRECTIONS = [DIRECTIONS.LEFT, DIRECTIONS.RIGHT];

  constructor() {
    this.reset();
  }

  reset() {
    this.tiles = [];
    const startTiles: Tile[] = [this.getNewTile(), this.getNewTile()];
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
    const tiles = this.getSortedTiles(direction);
    let computedTiles: Tile[] = [];
    let isVerticalMove = this.VERTICAL_DIRECTIONS.includes(direction);
    let nextCoord = isVerticalMove ? "nextY" : "nextX";
    for (let c = 0; c <= this.ROW_SIZE; c++) {
      // traverse by column if UP or DOWN
      // traverse by row if LEFT or RIGHT
      let colunmsOrRows = tiles.filter((t) =>
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
          if (prevTile.delete) {
            if ([DIRECTIONS.DOWN, DIRECTIONS.RIGHT].includes(direction)) {
              tile[nextCoord] = prevTile[nextCoord] - 1;
            }
            if ([DIRECTIONS.LEFT, DIRECTIONS.UP].includes(direction)) {
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
    this.tiles.forEach((t) => t.updateValue());
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

  getSortedTiles(direction: DIRECTIONS): Tile[] {
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
}

type TILE_SORT = (a: Tile, b: Tile) => 1 | 0 | -1;
type SORT_FNS = {
  xAsc: TILE_SORT;
  xDesc: TILE_SORT;
  yAsc: TILE_SORT;
  yDesc: TILE_SORT;
};
