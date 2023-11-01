import { DIRECTIONS } from "./enums";
import { Coordinates } from "./interfaces";

export default class Tile {
  //  all useful ?
  x: number;
  y: number;
  nextX: number;
  nextY: number;
  prevY: number;
  prevX: number;
  value: number;
  nextValue: number;
  delete: Boolean;

  constructor(coordinates: Coordinates, value?: number) {
    this.x = coordinates.x;
    this.y = coordinates.y;
    console.log("value", value);
    this.value = !value || isNaN(value) ? (Math.random() < 0.7 ? 2 : 4) : value;
  }

  move(direction: DIRECTIONS) {
    console.log("[TILE] MOVE X");
    if ([DIRECTIONS.LEFT, DIRECTIONS.RIGHT].includes(direction)) {
      this.prevX = this.x;
    } else {
      this.prevY = this.y;
    }
    console.log("[Tile.move]", this.nextValue, this.value);
    this.value = this.nextValue ? this.nextValue : this.value;
  }
}
