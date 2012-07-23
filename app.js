Ext.Loader.setConfig({ enabled: true });

Ext.application({
	requires: ['Ext.container.Viewport'],
	name: 'AM',

	appFolder: 'app',

	launch: function() {
		Ext.create('Ext.container.Viewport', {
			layout: 'border',
			items: [{
				xtype: 'box',
				region: 'north',
				height: 40,
				padding: 10,
				style: 'font-size: 20px',
				html: 'LDAP Manager',
			}, {
				xtype: 'tabpanel',
				region: 'center',
				items: [{
					xtype: 'userlist',
					title: 'Users'
				}, {
					title: 'Groups'
				}, {
					title: 'Mail aliases'
				}, {
					title: 'Workstations'
				}, {
					title: 'DHCP'
				}, {
					title: 'DNS Zones'
				}, {
					title: 'Asterisk extensions'
				}, {
					title: 'Mail domains'
				}, {
					title: 'Samba Domains'
				}, {
					title: 'Radius clients'
				}, {
					title: 'Radius proxies'
				}, {
					title: 'Settings'
				}],
			}],
		});
	},
	controllers: [
		'Users',
	],
});
