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
  sep;
  constructor(coordinates: Coordinates, value?: number) {
    this.x = coordinates.x;
    this.y = coordinates.y;
    this.value = !value || isNaN(value) ? (Math.random() < 0.7 ? 2 : 4) : value;
  }

  move(direction: DIRECTIONS) {
    if ([DIRECTIONS.LEFT, DIRECTIONS.RIGHT].includes(direction)) {
      this.prevX = this.x;
    } else {
      this.prevY = this.y;
    }
    this.value = this.nextValue ? this.nextValue : this.value;
  }
}
