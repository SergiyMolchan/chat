module.exports = {
  apps : [{
    script: './index.js',
    watch: true,
    instances : 1,
    exec_mode : "cluster",
  }]
};
