module.exports = {
  apps : [{
    script: './index.js',
    watch: true,
    instances : 1,
    exec_mode : "cluster",
  },
  {
    script: './apptest1.js',
    watch: true,
    instances : 1,
    exec_mode : "cluster",
  }
  ]
};
