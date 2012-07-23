Ext.define('AM.store.Users', {
	extend: 'Ext.data.TreeStore',
	model: 'AM.model.User',

	autoLoad: true,
	autoSync: true,
	proxy: {
		type: 'rest',
		url: '/ajax/users',
		reader: {
			type: 'json',
			root: 'data'
		},
		writer: {
			type: 'json'
		}
    },
	root: {
		username: 'LDAP Base',
		expanded: true,
	},

	folderSort: true
});


/*
    root: {
		username: "LDAP Base",
		expanded: true,
		children: [
			{
			username: 'Members',
			expanded: true,
			children: [
				{username: 'ed', displayname: 'Ed Deline', first: 'Ed', last: 'Deline', email: 'ed@sencha.com', uidNumber: '1000', gidNumber: '50', homeDirectory: '/home/ed', leaf: true },
				{username: 'tommy', displayname: 'Tommy Emmanuel', first: 'Tommy', last: 'Emmanuel', email: 'tommy@sencha.com', uidNumber: '1001', gidNumber: '50', homeDirectory: '/home/tommy', leaf: true }
			]},
			{
			username: 'Board',
			expanded: true,
			children: [
				{username: 'wilco', displayname: 'Wilco Baan Hofman', first: 'Wilco', last: 'Baan Hofman', email: 'ed@sencha.com', uidNumber: '1002', gidNumber: '50', homeDirectory: '/home/wilco', leaf: true },
				{username: 'diggie', displayname: 'Tjeerd Visser', first: 'Tjeerd', last: 'Visser', email: 'tommy@sencha.com', uidNumber: '1003', gidNumber: '50', homeDirectory: '/home/diggie', leaf: true },
				{username: 'gmc', displayname: 'Koen Martens', first: 'Koen', last: 'Martens', email: 'tommy@sencha.com', uidNumber: '1006', gidNumber: '50', homeDirectory: '/home/gmc', leaf: true },
				{username: 'bine', displayname: 'Sabine Hengeveld-Auer', first: 'Sabine', last: 'Hengeveld-Auer', email: 'tommy@sencha.com', uidNumber: '1007', gidNumber: '50', homeDirectory: '/home/bine', leaf: true },
				{username: 'eelco', displayname: 'Eelco Hotting', first: 'Eelco', last: 'Hotting', email: 'tommy@sencha.com', uidNumber: '1008', gidNumber: '50', homeDirectory: '/home/eelco', leaf: true }
			]},
		]
	},
});
*/
