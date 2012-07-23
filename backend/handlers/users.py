import ldap
import ldap.modlist as modlist
from ldap.dn import escape_dn_chars as escape_dn
from ldap.filter import escape_filter_chars as escape_filter
import shlex
from config import Config

#
# TODO: This code needs to be cleaned up as it doesn't need to serve a full tree, ExtJS reads one level at a time. The *tree functions should go away
#


def add_to_indexed_tree(tree, items, dn, attrs):
    if len(items) == 0:
        return

    item = items[0][items[0].index('=')+1:]

    if not item in tree:
        tree[item] = {}

    if len(items) > 1:
        if not 'children' in tree[item]:
            tree[item]['children'] = {}

        add_to_indexed_tree(tree[item]['children'], items[1:], dn, attrs)
    else:
        tree[item].update(attrs)
        tree[item]['dn'] = dn

def parse_subtree(tree, path):
    """ Parse indexed tree and returns output for crazy """
    output_tree = {}
    for key in tree.iterkeys():
        if key == 'children':
            output_tree[key] = []
            for value in tree[key].itervalues():
                output_tree[key].append(parse_subtree(value, path))
            output_tree[key] = sorted(output_tree[key], key=lambda k: k['username'])
            continue

        cur_path = "%s/%s" % (path, tree[key][0])
        if isinstance(tree[key], dict):
            output_tree[key] = parse_subtree(tree[key], cur_path)
        else:
            if key == 'uid':
                output_tree['username'] = tree[key][0]
                output_tree['leaf'] = True
            elif key == 'ou':
                output_tree['username'] = tree[key][0]
                output_tree['id'] = cur_path
                output_tree['expanded'] = True
            elif key == 'displayName':
                output_tree['displayname'] = tree[key][0]
            elif key == 'givenName':
                output_tree['first'] = tree[key][0]
            elif key == 'sn':
                output_tree['last'] = tree[key][0]
            elif key == 'mail':
                output_tree['email'] = tree[key][0]
            elif key == 'uidNumber':
                output_tree['uidNumber'] = tree[key][0]
            elif key == 'gidNumber':
                output_tree['gidNumber'] = tree[key][0]
            elif key == 'homeDirectory':
                output_tree['homeDirectory'] = tree[key][0]
            elif key == 'accountStatus':
                output_tree['accountStatus'] = tree[key][0]
            elif key == 'loginShell':
                output_tree['loginShell'] = tree[key][0]
            elif key == 'entryUUID' and not 'id' in output_tree:
                output_tree['id'] = tree[key][0]

    return output_tree

def users(request):

    # Connect to LDAP
    try:
        conn = ldap.initialize(Config.ldap_uri)
        conn.bind_s(Config.ldap_bind_dn, Config.ldap_bind_password)
    except Exception as e:
        return request.response_json({'success': False, 
                                      'msg': "Can't bind to LDAP: %s" % e.message['desc']})
    if request.method == "GET":
        # GET requests a user tree, but only one level deep

        # Determine the DN for the current depth
        dn_prepend = ""
        for url_part in request.url_parts[-1:0:-1]:
            dn_prepend += "ou=%s," % escape_dn(url_part)
        search_dn = "%s%s" % (dn_prepend, Config.ldap_base_dn)

        # Perform LDAP search
        try:
            res = conn.search_s(search_dn, ldap.SCOPE_ONELEVEL, "(|(objectclass=sambaSamAccount)(objectClass=organizationalUnit))", attrlist=[ '*', 'entryUUID' ])
        except Exception as e:
            return request.response_json({'success': False, 'msg': 'Search failed: %s' % e.message['desc']}, status='404 Not Found')

        # Determine the depth for the search dn, needed for reference when building the tree
        # This also works with DNs with escaped characters
        mysplit = shlex.shlex(search_dn, posix=True)
        mysplit.escape = '\\'
        mysplit.quotes = ''
        mysplit.whitespace = ','
        mysplit.whitespace_split = True
        search_dn_length = len(list(mysplit))

        # Build an attribute tree
        tree = {}
        for dn, attrs in res:
            mysplit = shlex.shlex(dn, posix=True)
            mysplit.escape = '\\'
            mysplit.quotes = ''
            mysplit.whitespace = ','
            mysplit.whitespace_split = True
            add_to_indexed_tree(tree, list(mysplit)[-search_dn_length-1::-1], dn, attrs)

        # Parse the attribute tree to convert it to something ExtJS can parse
        output_tree = parse_subtree({'children': tree }, "root")

        return request.response_json({'success': True, 
                                      'data': output_tree['children'] })
    else:
        if request.method == 'PUT':
            try:
                existing_attrs = conn.search_s(Config.ldap_base_dn, ldap.SCOPE_SUBTREE, "(entryUUID=%s)" % escape_filter(request.url_parts[0]))
            except:
                return request.response_json({'success': False, 'message': 'Failed to locate object in LDAP directory'})


            # TODO: Handle 'sambaAcctFlags': '[U          ]', (samba Disabled, workstation, user, etc)
            # TODO: Handle password changes

            attrs = {}
            if 'first' in request.put:
                attrs['givenName'] = request.put['first']
            if 'last' in request.put:
                attrs['sn'] = request.put['last']
            if 'first' in request.put and 'last' in request.put:
                attrs['cn'] = "%s %s" % (request.put['first'], request.put['last'])
                attrs['displayName'] = attrs['cn']
                attrs['description'] = attrs['cn']
                attrs['gecos'] = "%s %s,,," % (request.put['first'], request.put['last'])
                request.put['displayname'] = attrs['cn']
            if 'email' in request.put:
                attrs['mail'] = request.put['email']
            if 'uidNumber' in request.put:
                attrs['uidNumber'] = request.put['uidNumber']
            if 'gidNumber' in request.put:
                attrs['gidNumber'] = request.put['gidNumber']
            if 'sambaSID' in request.put:
                attrs['sambaSID'] = request.put['sambaSID']
            if 'homeDirectory' in request.put:
                attrs['homeDirectory'] = request.put['homeDirectory']
            if 'loginShell' in request.put:
                attrs['loginShell'] = request.put['loginShell']
            if 'accountStatus' in request.put:
                attrs['accountStatus'] = request.put['accountStatus']
            ldif = modlist.modifyModlist(existing_attrs[0][1], attrs, ignore_oldexistent=True)

            if len(ldif):
                conn.modify_s(existing_attrs[0][0], ldif)

            if 'username' in request.put and existing_attrs[0][1]['uid'][0] != request.put['username'].lower():
                conn.rename_s(existing_attrs[0][0], "uid=%s" % escape_dn(request.put['username'].lower()))


            return request.response_json({'success': True,
                                          'message': "User info has been saved.",
                                          'data': request.put })
        else:
            return request.response_json({'success': False,
                                          'msg': 'Feature not implemented', 'more': request.url_parts})
