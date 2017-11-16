import {LineListener} from '../parsers/LineListener';

export class LineCounter extends LineListener {
  constructor (...args) {
    super(...args);

    this.counter = 0;
  }

  enterLine (ctx) {
    this.counter++;

    console.log(`${this.counter}) ${ctx.getText()}`);
  }
}
