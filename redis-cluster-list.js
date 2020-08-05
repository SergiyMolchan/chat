module.exports = [
	{ port: 7000, host: '127.0.0.1', flags: 'master' }, // master
	{ port: 7001, host: '127.0.0.1', flags: 'master' }, // master
	{ port: 7002, host: '127.0.0.1', flags: 'master' }, // master
	{ port: 7003, host: '127.0.0.1', flags: 'slave' }, // slave
	{ port: 7004, host: '127.0.0.1', flags: 'slave' }, // slave
	{ port: 7005, host: '127.0.0.1', flags: 'slave' }, // slave
];
