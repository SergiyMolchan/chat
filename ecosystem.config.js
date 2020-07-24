module.exports = {
  apps : [{
    script: './index.js',
    watch: true,
    instances : 2,
    exec_mode : "cluster",
  },
  // {
  //   script: './apptest.js',
  //   watch: true,
  //   instances : 1,
  //   exec_mode : "cluster",
  // }
  ]
};
