Ext.define('AM.controller.Users', {
	extend: 'Ext.app.Controller',
	stores: [
		'Users',
	],
	models: [
		'User',
	],
	views: [
		'user.List',
	],
});
