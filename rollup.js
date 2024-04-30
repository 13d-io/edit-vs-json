const { visualizer } = require("rollup-plugin-visualizer");

function getRollupOptions(options) {
  options.plugins.push(visualizer({
    emitFile: true,
    filename: 'stats.html'
  }))
  return options;
}

module.exports = getRollupOptions;
