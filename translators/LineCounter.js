import {LineListener} from '../parsers/LineListener';
import chalk from 'chalk';

const color = chalk.green.bind(chalk);

export class LineCounter extends LineListener {
  constructor (...args) {
    super(...args);

    this.counter = 0;
  }

  enterLine (ctx) {
    this.counter++;

    console.log(`${color(this.counter + ')')} ${ctx.getText()}`);
  }

  enterLastline (ctx) {
    this.counter++;

    process.stdout.write(`${color(this.counter + ')')} ${ctx.getText()}`);
  }
}
