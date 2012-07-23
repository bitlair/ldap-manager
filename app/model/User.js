Ext.define('AM.model.User', {
	extend: 'Ext.data.Model',
	fields: [ 'username', 'displayname', 'first', 'last', 'email', 'uidNumber', 'gidNumber', 'homeDirectory', 'loginShell', 'sambaAcctFlags', 'accountStatus' ]
});
