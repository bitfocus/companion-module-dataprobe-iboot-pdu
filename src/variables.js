module.exports = {
	// ##########################
	// #### Define Variables ####
	// ##########################
	setVariables: function (i) {
		let self = i
		let variables = []

		variables.push( { name: 'device_name', label: 'Device Name'} );
		variables.push( { name: 'device_family', label: 'Device Family'} );
		variables.push( { name: 'device_outlets', label: 'Device Outlets'} );
		variables.push( { name: 'firmware_version', label: 'Firmware Version'} );
		variables.push( { name: 'model_name', label: 'Model Name'} );

		for (let i = 0; i < self.CHOICES_OUTLETS.length; i++) {
			variables.push({ name: 'outlet_' + (i+1) + '_name', label: 'Outlet ' + (i+1) + ' Name' });
			variables.push({ name: 'outlet_' + (i+1) + '_state', label: 'Outlet ' + (i+1) + ' State' });
		}

		for (let i = 0; i < self.CHOICES_GROUPS.length; i++) {
			variables.push({ name: 'group_' + (i+1) + '_name', label: 'Group ' + (i+1) + ' Name' });
		}

		for (let i = 0; i < self.CHOICES_SEQUENCES.length; i++) {
			variables.push({ name: 'sequence_' + (i+1) + '_name', label: 'Sequence ' + (i+1) + ' Name' });
		}

		return variables
	},

	// #########################
	// #### Check Variables ####
	// #########################
	checkVariables: function (i) {
		let self = i;
		try {
			if (self.deviceConf) {
				self.setVariable('device_name', self.deviceConf.deviceName);
				self.setVariable('device_family', self.deviceConf.deviceFamily);
				self.setVariable('device_outlets', self.deviceConf.deviceNumOutlets);
				self.setVariable('firmware_version', self.deviceConf.firmwareVersion);
				self.setVariable('model_name', self.deviceConf.modelName);
			}

			for (let i = 0; i < self.outlets.length; i++) {	
				self.setVariable('outlet_' + (i+1) + '_name', self.outlets[i].outletName);
				self.setVariable('outlet_' + (i+1) + '_state', self.outlets[i].outletState);
			}

			for (let i = 0; i < self.groups.length; i++) {	
				self.setVariable('group_' + (i+1) + '_name', self.groups[i].groupName);
			}

			for (let i = 0; i < self.sequences.length; i++) {	
				self.setVariable('sequence_' + (i+1) + '_name', self.sequences[i].sequenceName);
			}
		}
		catch(error) {
			self.log('error', 'Error parsing Variables: ' + String(error))
		}
	}
}
