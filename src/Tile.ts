import { Coordinates } from "./interfaces";

export default class Tile {
    x: number;
    y: number;
    nextX: number;
    nextY: number;
    value: number;
    nextValue: number;
    delete: Boolean;

    constructor(coordinates: Coordinates) {
        this.x = coordinates.x;
        this.y = coordinates.y;
        this.value = Math.random() < 0.7 ? 2 : 4;
        // this.value = 2;
    }

    moveX() {
      console.log('MOVE X');
      this.x = this.nextX;
      this.value = this.nextValue ? this.nextValue : this.value;
    }
    moveY() {
      console.log('MOVE Y');
      this.y = this.nextY;
      this.value = this.nextValue ? this.nextValue : this.value;
    }
  }
  