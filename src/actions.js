var axios = require('axios');

module.exports = {
	// ######################
	// #### Send Actions ####
	// ######################

	controlOutlet: function (i, outletNumber, state) {
		let self = i

		let url = `http://${self.config.host}/php/dashboard.php`;

		let outletMasks = [1, 2, 4, 8, 16, 32, 64, 128];
		let outletMask = outletMasks[outletNumber -1].toString();

		const params = new URLSearchParams();
		params.append('action', 'local-outlet-control');
		params.append('outlet-mask', outletMask);
		params.append('outlet-control', state);
		params.append('readData', 'false');

		self.log('info', `Outlet ${outletNumber}: ${state}`);

		axios
		.post(url, params.toString(), { headers: {Cookie: 'PHPSESSID=' + self.cookieId} })
		.then(res => {
			try {
				//do something if there was an error
			}
			catch (error) {
				self.status(self.STATUS_ERROR, error)
			}
		});
	},

	controlGroup: function (i, group, state) {
		let self = i

		let url = `http://${self.config.host}/php/dashboard.php`;

		const params = new URLSearchParams();
		params.append('action', 'group-outlet-control');
		params.append('outlet-control', state);
		params.append('group-id', group);
		params.append('readData', 'false');

		let groupName = self.CHOICES_GROUPS.find((GRP) => GRP.id == group).label;
		self.log('info', `Group ${groupName}: ${state}`);

		axios
		.post(url, params.toString(), { headers: {Cookie: 'PHPSESSID=' + self.cookieId} })
		.then(res => {
			try {
				//do something if there was an error
			}
			catch (error) {
				self.status(self.STATUS_ERROR, error)
			}
		});
	},

	runSequence: function (i, sequence) {
		let self = i

		let url = `http://${self.config.host}/php/dashboard.php`;

		const params = new URLSearchParams();
		params.append('action', 'sequence-run');
		params.append('sequence-id', sequence);
		params.append('sequence-mode', 'run');
		params.append('readData', 'false');

		let sequenceName = self.CHOICES_SEQUENCES.find((SEQ) => SEQ.id == sequence).label;

		self.log('info', `Running Sequence: ${sequenceName}`);

		axios
		.post(url, params.toString(), { headers: {Cookie: 'PHPSESSID=' + self.cookieId} })
		.then(res => {
			try {
				//do something if there was an error
			}
			catch (error) {
				self.status(self.STATUS_ERROR, error)
			}
		});
	},

	// ##########################
	// #### Instance Actions ####
	// ##########################
	setActions: function (i) {
		let self = i
		let actions = {}
		let cmd = ''

		actions.outletOn = {
			label: 'Turn Outlet On',
			options: [
				{
					type: 'dropdown',
					label: 'Outlet',
					id: 'outlet',
					default: self.CHOICES_OUTLETS[0].id,
					choices: self.CHOICES_OUTLETS
				}
			],
			callback: function (action, bank) {
				let outlet = parseInt(action.options.outlet);
				self.controlOutlet(outlet, 'On');
				self.updateOutletState(outlet, 'On');
			}
		}

		actions.outletOff = {
			label: 'Turn Outlet Off',
			options: [
				{
					type: 'dropdown',
					label: 'Outlet',
					id: 'outlet',
					default: self.CHOICES_OUTLETS[0].id,
					choices: self.CHOICES_OUTLETS
				}
			],
			callback: function (action, bank) {
				let outlet = parseInt(action.options.outlet);
				self.controlOutlet(outlet, 'Off');
				self.updateOutletState(outlet, 'Off');
			}
		}

		actions.outletCycle = {
			label: 'Cycle Outlet',
			options: [
				{
					type: 'dropdown',
					label: 'Outlet',
					id: 'outlet',
					default: self.CHOICES_OUTLETS[0].id,
					choices: self.CHOICES_OUTLETS
				}
			],
			callback: function (action, bank) {
				let outlet = parseInt(action.options.outlet);
				self.controlOutlet(outlet, 'Cycle');
			}
		}

		actions.outletOnAll = {
			label: 'Turn All Outlets On',
			callback: function (action, bank) {
				for (let i = 0; i < self.CHOICES_OUTLETS.length; i++) {
					let outlet = (i+1);
					self.controlOutlet(outlet, 'On');
					self.updateOutletState(outlet, 'On');
				}
			}
		}

		actions.outletOffAll = {
			label: 'Turn All Outlets Off',
			callback: function (action, bank) {
				for (let i = 0; i < self.CHOICES_OUTLETS.length; i++) {
					let outlet = (i+1);
					self.controlOutlet(outlet, 'Off');
					self.updateOutletState(outlet, 'Off');
				}
			}
		}

		if (self.CHOICES_GROUPS.length > 0) {
			actions.groupOn = {
				label: 'Turn Group On',
				options: [
					{
						type: 'dropdown',
						label: 'Group',
						id: 'group',
						default: self.CHOICES_GROUPS[0].id,
						choices: self.CHOICES_GROUPS
					}
				],
				callback: function (action, bank) {
					self.controlGroup(action.options.group, 'On');
				}
			}

			actions.groupOff = {
				label: 'Turn Group Off',
				options: [
					{
						type: 'dropdown',
						label: 'Group',
						id: 'group',
						default: self.CHOICES_GROUPS[0].id,
						choices: self.CHOICES_GROUPS
					}
				],
				callback: function (action, bank) {
					self.controlGroup(action.options.group, 'Off');
				}
			}

			actions.groupCycle = {
				label: 'Cycle Group',
				options: [
					{
						type: 'dropdown',
						label: 'Group',
						id: 'group',
						default: self.CHOICES_GROUPS[0].id,
						choices: self.CHOICES_GROUPS
					}
				],
				callback: function (action, bank) {
					self.controlGroup(action.options.group, 'Cycle');
				}
			}
		}

		if (self.CHOICES_SEQUENCES.length > 0) {
			actions.sequence = {
				label: 'Run Sequence',
				options: [
					{
						type: 'dropdown',
						label: 'Sequence',
						id: 'sequence',
						default: self.CHOICES_SEQUENCES[0].id,
						choices: self.CHOICES_SEQUENCES
					}
				],
				callback: function (action, bank) {
					let sequence = action.options.sequence;
					self.runSequence(sequence);
				}
			}
		}

		return actions
	}
}
