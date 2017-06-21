import { axisBottom } from 'd3-axis';
import CSS from '../../helpers/css';
import formatters from '../../helpers/formatters';

class XAxis {
  constructor(categories, x, dimensions, options) {
    this.categories = categories;
    this.x = x;
    this.dimensions = dimensions;
    this.options = options;
  }

  estimateTickValueWidth(values, formatter) {
    // This scale parameter is used for the best-fit algorithm to determine the
    // average length. It's best to over-correct, so it's purposfully slightly
    // large.
    //
    // Note that users can still fuck this up if they have weird CSS conditions.
    const scale = 6;

    // Padding is the number of pixels between visualizations that we can put.
    // We'll always assume that padding is to the right for our purposes.
    const padding = 15;

    // We will start by determining the width of all the values.
    const arr = [];
    const len = values.length;
    let acc = 0;

    values.forEach((value, i) => {
      let n = 0;
      const formattedValue = formatter(value).toString();

      if (i === (len - 1)) {
        n = (formattedValue.length * scale);
      } else {
        n = (formattedValue.length * scale) + padding;
      }

      acc += n;
      arr.push(n);
    });

    return [acc, arr];
  }

  // Given all the values along the x-axis, this function will pull out the ones
  // that we care most about for display. We'll do a best-fit algorithm to figure
  // out how many we can actually put on the page reliably.
  getTickValues(values, formatter, width) {
    let vals = this.estimateTickValueWidth(values, formatter);
    let acc = vals[0];
    let stride = 2;
    let i;

    if (acc < width) {
      return values;
    }

    // Let's find the optimal one based on different strides.
    let pick = [];

    while (acc >= width) {
      pick = [];

      for (i = 0; i < values.length; i += stride) {
        pick.push(values[i]);
      }

      // We can't display ANY ticks?!
      if (pick.length === 1) {
        break;
      }

      stride += 2;

      vals = this.estimateTickValueWidth(pick, formatter);
      acc = vals[0];
    }

    return pick;
  }

  getAxisFormatter() {
    const options = this.options;
    const optionFormatter = options.labels && options.labels.formatter;
    let formatter = d => (d);

    if (optionFormatter && Object.keys(formatters).indexOf(optionFormatter) >= 0) {
      // Only on the y axis do we want to convert numeric to the summary formatter.
      // For examples: this provides more spacing to the chart by converting 1,000,000 to 1M
      formatter = formatters[optionFormatter];
    } else if (typeof optionFormatter === 'function') {
      formatter = optionFormatter;
    }

    return formatter;
  }

  getAxisFunction(x, options) {
    const { categories, dimensions } = this;
    const axis = axisBottom(x)
      .tickSizeOuter(0)
      .tickFormat(this.getAxisFormatter());

    const ticks = this.getTickValues(categories, this.getAxisFormatter(), dimensions.width);

    if (options.ticks) {
      axis.ticks(options.ticks);
    } else if (ticks) {
      axis.ticks(ticks.length);
    }

    return axis;
  }

  render(elem) {
    const { height, width } = this.dimensions;
    const options = this.options;

    if (options.enabled !== false) {
      const axis = this.getAxisFunction(this.x, options);

      this.axis = elem.append('g')
        .attr('class', CSS.getClassName('axis', 'axis-x'))
        .attr('transform', `translate(0,${height})`)
        .call(axis);

      if (options.title) {
        this.axis.append('text')
          .attr('y', 0)
          .attr('dy', 40)
          .attr('x', width / 2)
          .style('text-anchor', 'middle')
          .attr('class', CSS.getClassName('axis-title'))
          .text(options.title);
      }
    }

    return this.axis;
  }

  update(categories, x, dimensions, options) {
    if (!this.axis) return;

    this.categories = categories;
    this.x = x;
    this.dimensions = dimensions;
    this.options = options;

    const axis = this.getAxisFunction(x, options);

    this.axis
      .attr('transform', `translate(0, ${dimensions.height})`)
      .call(axis);

    this.axis.select(CSS.getClassSelector('axis-title'))
      .attr('x', dimensions.width / 2);
  }
}

export default XAxis;
