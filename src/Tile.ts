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
    this.value = !value || isNaN(value) ? (Math.random() < 0.7 ? 2 : 4) : value;
  }

  update() {
    console.log("Tile.update()", this);
    this.value = this.nextValue ? this.nextValue : this.value;
  }
}
