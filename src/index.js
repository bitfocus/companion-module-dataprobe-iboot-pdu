var instance_skel = require('../../../instance_skel')
var actions = require('./actions.js')
var presets = require('./presets.js')
var feedbacks = require('./feedbacks.js')
var variables = require('./variables.js')

var axios = require('axios');

var debug

instance.prototype.CHOICES_OUTLETS = [
	{id: '1', label: 'Outlet 1'},
	{id: '2', label: 'Outlet 2'},
	{id: '3', label: 'Outlet 3'},
	{id: '4', label: 'Outlet 4'},
	{id: '5', label: 'Outlet 5'},
	{id: '6', label: 'Outlet 6'},
	{id: '7', label: 'Outlet 7'},
	{id: '8', label: 'Outlet 8'}
];

instance.prototype.CHOICES_GROUPS = [];
instance.prototype.CHOICES_SEQUENCES = [];

instance.prototype.deviceConf = {
	deviceName: '',
	deviceFamily: '',
	deviceNumOutlets: '',
	firmwareVersion: '',
	modelName: ''
};

instance.prototype.outlets = [];
instance.prototype.groups = [];
instance.prototype.sequences = [];

instance.prototype.cookieId = null;

instance.prototype.INTERVAL = null;

// ########################
// #### Instance setup ####
// ########################
function instance(system, id, config) {
	let self = this

	// super-constructor
	instance_skel.apply(this, arguments)

	return self
}

instance.GetUpgradeScripts = function () {
}

// When module gets deleted
instance.prototype.destroy = function () {
	let self = this;

	if (self.INTERVAL) {
		clearInterval(self.INTERVAL);
		self.INTERVAL = null;
	}

	debug('destroy', self.id)
}

// Initalize module
instance.prototype.init = function () {
	let self = this

	debug = self.debug
	log = self.log

	self.request = require('request')

	self.status(self.STATUS_WARNING, 'connecting')

	self.init_outlets(8);
	self.init_login();

	self.actions() // export actions
	self.init_presets()
	self.init_variables()
	self.checkVariables()
	self.init_feedbacks()
	self.checkFeedbacks()
};

// Update module after a config change
instance.prototype.updateConfig = function (config) {
	let self = this
	self.config = config
	self.status(self.STATUS_UNKNOWN)

	self.init_outlets(8);
	self.init_login();

	self.actions() // export actions
	self.init_presets()
	self.init_variables()
	self.checkVariables()
	self.init_feedbacks()
	self.checkFeedbacks()
};

instance.prototype.init_outlets = function(count) {
	let self = this;

	let outletCount = count;

	if ((outletCount <= 0) || (outletCount === 'NaN')) {
		outletCount = 8;
	}

	self.CHOICES_OUTLETS = [];

	for (let i = 0; i < outletCount; i++) {
		let outletObj = {};
		outletObj.id = i+1;
		outletObj.label = 'Outlet ' + (i+1);
		self.CHOICES_OUTLETS.push(outletObj);

		outletObj = {};
		outletObj.outletName = '';
		outletObj.outletState = '';
		self.outlets.push(outletObj);
	}
};

instance.prototype.init_login = async function () {
	let self = this;

	let url = `http://${self.config.host}/php/user-login.php`;

	let username = self.config.username;
	let password = Buffer.from('QcjEK7b7Sy' + self.config.password).toString('base64');

	const params = new URLSearchParams();
	params.append('action', 'login-submit');
	params.append('user-name', username);
	params.append('user-password', password);
	params.append('remember-me', 'false');

	self.log('info', `Initiating Login Sequence.`);

	axios
	.post(url, params.toString())
	.then(res => {
		let cookies = res.headers['set-cookie']
		try {
			let cookiesString = cookies.toString()
			let cookiesArray = cookiesString.split(';')

			for (let i = 0; i < cookiesArray.length; i++) {
				if (cookiesArray[i].indexOf('PHPSESSID=') > -1) {
					//this is the id we want
					let values = cookiesArray[i].split('=')
					self.cookieId = values[1]
				}
			}

			if (self.cookieId !== '') {
				self.status(self.STATUS_OK)
				self.log('info', `Session authenticated. Cookie ID: ${self.cookieId}`)
				self.processLoginData(res.data);
				self.getOutletData();
			}
		}
		catch (error) {
			self.status(self.STATUS_ERROR, error)
		}
	});
}

instance.prototype.processLoginData = function (data) {
	let self = this;

	if (data.deviceConf) {
		self.deviceConf = data.deviceConf;

		self.log('info', `Device: ${self.deviceConf.deviceName}  Outlets: ${self.deviceConf.deviceNumOutlets}`);

		let count = self.deviceConf.deviceNumOutlets;
		self.init_outlets(count);
		self.actions() // export actions
		self.init_variables();
		self.checkVariables();
	
		self.setupInterval(); //start the update process now that we are authenticated
	}
};

instance.prototype.getOutletData = function () {
	let self = this;

	if (self.cookieId !== null) {
		let url = `http://${self.config.host}/php/get-all-data.php`;

		axios
		.post(url, {}, { headers: {Cookie: 'PHPSESSID=' + self.cookieId} })
		.then(res => {
			if (res.data && res.data.deviceOutlets) {
				self.processOutletData(res.data.deviceOutlets);
			}

			if (res.data && res.data.groups) {
				self.processGroupData(res.data.groups);
			}

			if (res.data && res.data.sequences) {
				self.processSequenceData(res.data.sequences);
			}

			self.actions() // export actions
			self.init_presets();
			self.init_variables();
			self.init_feedbacks();
			self.checkVariables();
			self.checkFeedbacks();
		});
	}
};

instance.prototype.updateOutletState = function (outlet, state) {
	let self = this;

	if (self.outlets.length > 0) {
		self.outlets[(outlet-1)].outletState = state;
	}

	self.checkVariables();
	self.checkFeedbacks();
};

instance.prototype.processOutletData = function (data) {
	let self = this;

	self.outlets = [];

	Object.keys(data).forEach(function(key) {
		if (data[key].id) {
			self.outlets.push(data[key]);
		}
	});
};

instance.prototype.processGroupData = function (data) {
	let self = this;

	self.groups = [];
	self.CHOICES_GROUPS = [];

	Object.keys(data).forEach(function(key) {
		if (data[key].groupID) {
			self.groups.push(data[key]);
			let grpObj = {};
			grpObj.id = data[key].groupID;
			grpObj.label = data[key].groupName;
			self.CHOICES_GROUPS.push(grpObj);
		}
	});
};

instance.prototype.processSequenceData = function (data) {
	let self = this;

	self.sequences = [];
	self.CHOICES_SEQUENCES = [];

	Object.keys(data).forEach(function(key) {
		if (data[key].sequenceID) {
			self.sequences.push(data[key]);
			if (data[key].sequenceEnabled === true) {
				let seqObj = {};
				seqObj.id = data[key].sequenceID;
				seqObj.label = data[key].sequenceName;
				self.CHOICES_SEQUENCES.push(seqObj);
			}
		}
	});
};

// Return config fields for web config
instance.prototype.config_fields = function () {
	let self = this

	return [
		{
			type: 'text',
			id: 'info',
			width: 12,
			label: 'Information',
			value: 'This module controls Dataprobe iBoot PDU devices.',
		},
		{
			type: 'textinput',
			id: 'host',
			label: 'Host/IP of device',
			width: 4,
			regex: self.REGEX_IP
		},
		{
			type: 'textinput',
			id: 'username',
			label: 'Username',
			width: 6,
			default: 'admin'
		},
		{
			type: 'textinput',
			id: 'password',
			label: 'Password',
			width: 6,
			default: 'admin'
		},
		{
			type: 'text',
			id: 'intervalInfo',
			width: 12,
			label: 'Update Interval',
			value: 'Please enter the amount of time in milliseconds to request new information from the device. Set to 0 to disable.',
		},
		{
			type: 'textinput',
			id: 'interval',
			label: 'Update Interval',
			width: 3,
			default: 5000
		}
	]
}

instance.prototype.setupInterval = function() {
	let self = this;

	if (self.INTERVAL !== null) {
		clearInterval(self.INTERVAL);
		self.INTERVAL = null;
	}

	if (self.config.interval > 0) {
		self.INTERVAL = setInterval(self.getOutletData.bind(self), self.config.interval);
		self.log('info', 'Starting Update Interval: Every ' + self.config.interval + 'ms');
	}
};

// ##########################
// #### Instance Presets ####
// ##########################
instance.prototype.init_presets = function () {
	this.setPresetDefinitions(presets.setPresets(this));
}

// ############################
// #### Instance Variables ####
// ############################
instance.prototype.init_variables = function () {
	this.setVariableDefinitions(variables.setVariables(this));
}

// Setup Initial Values
instance.prototype.checkVariables = function () {
	variables.checkVariables(this);
}

// ############################
// #### Instance Feedbacks ####
// ############################
instance.prototype.init_feedbacks = function (system) {
	this.setFeedbackDefinitions(feedbacks.setFeedbacks(this));
}

// ##########################
// #### Instance Actions ####
// ##########################
instance.prototype.controlOutlet = function (outletNumber, state) {
	actions.controlOutlet(this, outletNumber, state);
}

instance.prototype.controlGroup = function (group, state) {
	actions.controlGroup(this, group, state);
}

instance.prototype.runSequence = function (sequence) {
	actions.runSequence(this, sequence);
}

instance.prototype.actions = function (system) {
	this.setActions(actions.setActions(this));
}

instance_skel.extendedBy(instance);
exports = module.exports = instance;