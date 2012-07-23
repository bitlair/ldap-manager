var required = '<span style="color:red;font-weight:bold" data-qtip="Required">*</span>';
Ext.define('AM.view.user.List' ,{
	extend: 'Ext.form.Panel',
	alias: 'widget.userlist',

	url: '/ajax/users/update',

	frame: true,
	width: 750,
	bodyPadding: 5,

	layout: 'column',
	items: [{
		columnWidth: 0.40,
		xtype: 'treepanel',
		height: 400,
		id: 'usergrid',
		title: 'User list',
		store: 'Users',
		columns: [
			{xtype: 'treecolumn', header: 'Username',  dataIndex: 'username',  flex: 1},
			{header: 'Name', dataIndex: 'displayname', flex: 1 }
		],
		listeners: {
			selectionchange: function(model, records) {
				if (records[0] && records[0].get('leaf')) {
					this.up('form').getForm().loadRecord(records[0]);
				}
			},
		},
	}, {
		columnWidth: 0.60,
		margin: '0 0 0 10',
		height: 400,
		xtype: 'fieldset',
		title: 'User details',
		defaultType: 'textfield',
		items: [{
			fieldLabel: 'First Name',
			afterLabelTextTpl: required,
			name: 'first',
			allowBlank: false
		},{
			fieldLabel: 'Last Name',
			afterLabelTextTpl: required,
			name: 'last',
			allowBlank: false
		},{
			fieldLabel: 'Username',
			afterLabelTextTpl: required,
			name: 'username',
			allowBlank: false
		}, {
			fieldLabel: 'Email',
			afterLabelTextTpl: required,
			name: 'email',
			allowBlank: false,
			vtype:'email'
		}, {
			fieldLabel: 'POSIX UID',
			afterLabelTextTpl: required,
			name: 'uidNumber',
			allowBlank: false,
		}, {
			fieldLabel: 'POSIX GID',
			afterLabelTextTpl: required,
			name: 'gidNumber',
			allowBlank: false,
		}, {
			fieldLabel: 'POSIX Home Directory',
			afterLabelTextTpl: required,
			name: 'homeDirectory',
			allowBlank: false,
		}, {
			fieldLabel: 'POSIX Login Shell',
			afterLabelTextTpl: required,
			name: 'loginShell',
			allowBlank: false,
		}, {
			fieldLabel: 'Account Status',
			afterLabelTextTpl: required,
			name: 'accountStatus',
			allowBlank: false,
		}, {
			id: 'password',
			fieldLabel: 'Password',
			name: 'password',
			allowBlank: true,
			inputType:'password',
		}, {
			fieldLabel: 'Confirm',
			allowBlank: true,
			inputType: 'password',
			vtype: 'password',
			initialPassField: 'password'
		}, {
			xtype: 'button',
			text: 'Save',
			margin: '5',
			handler: function() {
				this.up('form').getForm().isValid();
				this.up('form').getForm().updateRecord(this.record);
				/*
				this.up('form').getForm().submit({
					waitMsg: "Please wait...",
					success: function (form, action) {
						Ext.Msg.alert("Success", action.result.msg);
						this.up('form').getForm().reset();
					},
					failure: function (form, action) {
						Ext.Msg.alert("Failure", "Check your form entries");
					}
				});*/
			}
		},{
			xtype: 'button',
			text: 'Reset',
			handler: function() {
				view = Ext.getCmp('usergrid').getView();
				node = view.getSelectedNodes()[0];
				record = view.getRecord(node);
				if (record.get('leaf')) {
					this.up('form').getForm().loadRecord(record);
				}
			}
		}]
	}],
});
