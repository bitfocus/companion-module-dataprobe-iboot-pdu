module.exports = {
	setPresets: function (i) {
		let self = i
		let presets = []

		const foregroundColor = self.rgb(255, 255, 255) // White
		const backgroundColorRed = self.rgb(255, 0, 0) // Red
		const backgroundColorGreen = self.rgb(0, 255, 0) // Green
		const backgroundColorOrange = self.rgb(255, 102, 0) // Orange

		// ########################
		// #### System Presets ####
		// ########################

		for (let i = 0; i < self.CHOICES_OUTLETS.length; i++) {
			presets.push({
				category: 'Outlet Control',
				label: 'Turn On ' + self.CHOICES_OUTLETS[i].id,
				bank: {
					style: 'text',
					text: 'OUTLET ON\\n' + self.CHOICES_OUTLETS[i].id,
					size: '14',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0)
				},
				actions: [
					{
						action: 'outletOn',
						options: {
							outlet: self.CHOICES_OUTLETS[i].id
						},
					}
				],
				feedbacks: [
					{
						type: 'outletStatus',
						options: {
							outlet: self.CHOICES_OUTLETS[i].id,
							option: 'On'
						},
						style: {
							color: foregroundColor,
							bgcolor: backgroundColorRed,
						}
					}
				]
			});

			presets.push({
				category: 'Outlet Control',
				label: 'Turn Off ' + self.CHOICES_OUTLETS[i].id,
				bank: {
					style: 'text',
					text: 'OUTLET OFF\\n' + self.CHOICES_OUTLETS[i].id,
					size: '14',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0)
				},
				actions: [
					{
						action: 'outletOff',
						options: {
							outlet: self.CHOICES_OUTLETS[i].id
						},
					}
				],
				feedbacks: [
					{
						type: 'outletStatus',
						options: {
							outlet: self.CHOICES_OUTLETS[i].id,
							option: 'Off'
						},
						style: {
							color: foregroundColor,
							bgcolor: backgroundColorRed,
						}
					}
				]
			});

			presets.push({
				category: 'Outlet Control',
				label: 'Cycle ' + self.CHOICES_OUTLETS[i].id,
				bank: {
					style: 'text',
					text: 'OUTLET CYCLE\\n' + self.CHOICES_OUTLETS[i].id,
					size: '14',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0)
				},
				actions: [
					{
						action: 'outletCycle',
						options: {
							outlet: self.CHOICES_OUTLETS[i].id
						},
					}
				],
				feedbacks: [
					{
						type: 'outletStatus',
						options: {
							outlet: self.CHOICES_OUTLETS[i].id,
							option: 'On'
						},
						style: {
							color: foregroundColor,
							bgcolor: backgroundColorRed,
						}
					}
				]
			});
		}

		presets.push({
			category: 'Outlet Control',
			label: 'Turn All On',
			bank: {
				style: 'text',
				text: 'ALL OUTLETS\\nON',
				size: '14',
				color: '16777215',
				bgcolor: self.rgb(0, 0, 0)
			},
			actions: [
				{
					action: 'outletOnAll'
				}
			]
		});

		presets.push({
			category: 'Outlet Control',
			label: 'Turn All Off',
			bank: {
				style: 'text',
				text: 'ALL OUTLETS\\nOFF',
				size: '14',
				color: '16777215',
				bgcolor: self.rgb(0, 0, 0)
			},
			actions: [
				{
					action: 'outletOffAll'
				}
			]
		});

		for (let i = 0; i < self.CHOICES_GROUPS.length; i++) {
			presets.push({
				category: 'Group Control',
				label: 'Turn On ' + (i+1),
				bank: {
					style: 'text',
					text: '$(iboot-pdu:group_' + (i+1) + '_name)\\nON',
					size: '14',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0)
				},
				actions: [
					{
						action: 'groupOn',
						options: {
							group: self.CHOICES_GROUPS[i].id
						},
					}
				]
			});

			presets.push({
				category: 'Group Control',
				label: 'Turn Off ' + (i+1),
				bank: {
					style: 'text',
					text: '$(iboot-pdu:group_' + (i+1) + '_name)\\nOFF',
					size: '14',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0)
				},
				actions: [
					{
						action: 'groupOff',
						options: {
							group: self.CHOICES_GROUPS[i].id
						},
					}
				]
			});

			presets.push({
				category: 'Group Control',
				label: 'Cycle ' + (i+1),
				bank: {
					style: 'text',
					text: '$(iboot-pdu:group_' + (i+1) + '_name)\\nCYCLE',
					size: '14',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0)
				},
				actions: [
					{
						action: 'groupCycle',
						options: {
							group: self.CHOICES_GROUPS[i].id
						},
					}
				]
			});
		}

		for (let i = 0; i < self.CHOICES_SEQUENCES.length; i++) {
			presets.push({
				category: 'Sequence Control',
				label: 'Run\\n' + self.CHOICES_SEQUENCES[i].label,
				bank: {
					style: 'text',
					text: '$(iboot-pdu:sequence_' + (i+1) + '_name)\\nRUN',
					size: '14',
					color: '16777215',
					bgcolor: self.rgb(0, 0, 0)
				},
				actions: [
					{
						action: 'sequence',
						options: {
							sequence: self.CHOICES_SEQUENCES[i].id
						},
					}
				]
			});
		}

		return presets
	}
}
