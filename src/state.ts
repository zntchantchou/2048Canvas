import Tile from "./Tile";
import { DIRECTIONS } from "./enums";
import { Coordinates } from "./interfaces";
export default class GameState {
  tiles: Tile[] = [];
  nextTiles: Tile[] = [];
  ROW_SIZE = 3;
  VERTICAL_DIRECTIONS = [DIRECTIONS.UP, DIRECTIONS.DOWN];
  HORIZONTAL_DIRECTIONS = [DIRECTIONS.LEFT, DIRECTIONS.RIGHT];
  // we can create a unique field that is 'x+y' for all tiles
  constructor() {
    Array(6)
    .fill(null)
    .map(() => this.addTile(new Tile(this.randomCoords())));
  }

  randomInt() {
    return Math.round(Math.random() * 3);
  }

  addTile(tile: Tile) {
    this.tiles = [tile, ...this.tiles];
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
    const tiles = this.sort(direction);
    let computedTiles: Tile[] = [];
    let isVerticalMove = this.VERTICAL_DIRECTIONS.includes(direction);
    let nextCoord = isVerticalMove ? 'nextY' : 'nextX';
    for (let c = 0; c <= this.ROW_SIZE; c++) {
      // traverse by column if UP or DOWN
      // traverse by row if LEFT or RIGHT
      let colunmsOrRows = tiles.filter((t) => isVerticalMove ? t.x == c : t.y == c);
      colunmsOrRows.forEach((tile, index, arr) => {
        let nextTile = arr[index + 1];
        if (index == 0) {
          // first tile in a row / colunm goes to 0 if going left or up
          // first tile in a row / column goes to the last position if going down or right 
          tile[nextCoord] = [DIRECTIONS.UP, DIRECTIONS.LEFT].includes(direction) ? 0 : this.ROW_SIZE;
          if (nextTile && nextTile.value == tile.value) {
            tile.nextValue = tile.value + tile.value;
          }
        }
        if (index > 0) {
          let prevTile = arr[index - 1];
          if(!prevTile.delete) {
            const nextValue = [DIRECTIONS.DOWN, DIRECTIONS.RIGHT].includes(direction) ? prevTile[nextCoord] -1 : prevTile[nextCoord] + 1;
            tile[nextCoord] = nextValue;
          } else {
            tile[nextCoord] = prevTile[nextCoord];
          }

          if (!prevTile.delete && prevTile.value == tile.value) {
            tile.delete = true;
          }
        }
        computedTiles = [...computedTiles, tile];
      });
    }
    console.log('computed tiles', computedTiles);
    return computedTiles.filter(t => !t.delete);
  }

  move(direction: DIRECTIONS) {
    this.tiles = this.getUpdatedTiles(direction)
    this.tiles.forEach(t => this.VERTICAL_DIRECTIONS.includes(direction) ? t.moveY() : t.moveX());
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

  sort(direction: DIRECTIONS): Tile[] {
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

