import boto3
import json

header = {
    "Content-Type": "application-json",
    "Access-Control-Allow-Origin": '*'
}

num_label = "longValue"
responses_label = "records"

def login(event, context):
    body = unwrap(event['body'])
    mismatched_input = set(body.keys()) - (set(usersTable['credentials']))
    if mismatched_input:
       status_code = 404
       response = f"missing/invalid inputs: {mismatched_input}"
    else:
        body['userID'] = body['userID'].lower()
        success = len (execute_statement(format_query(checkPasswordQuery\
                                        .replace("-userID-", body['userID'])\
                                        .replace("-password-",  body['password']) , usersTable))[responses_label])
        if success:
            status_code = 200
            response = "User was logged in"
        else:
            status_code = 403
            response = "Invalid Credentials"
    return {
        "statusCode": status_code,  
        'headers': header,
        "body": response
    }

def addUser(event, context):
    body = unwrap(event['body'])
    mismatched_input = set(body.keys()) - (set(usersTable['table_fields']))
    if mismatched_input:
       status_code = 404
       response = f"missing/invalid inputs: {mismatched_input}"
    else:
        body['userID'] = body['userID'].lower()
        execute_statement(format_query(insertQuery, usersTable, body))
        status_code = 200
        response = "User was added"
    return {
        "statusCode": status_code,  
        'headers': header,
        "body": response
    }


def getUserInvites(event, context):
    userID = event['pathParameters']['id']
    invites = execute_statement(format_query(getInvitesQuery.replace("-userID-", userID), usersTable))
    if len(invites[responses_label]):
        invites = parse_reponse(invites, inviteListing)
        status_code = 200
        response = json.dumps(invites)
    else:
        status_code = 200
        response = "User has no invites"
    return {
        "statusCode": status_code,  
        'headers': header,
        "body": response
    }

def processInvite(event, context):
    body = unwrap(event['body'])
    mismatched_input = set(body.keys()) - inviteListing['process_fields']
    if mismatched_input:
        status_code = 404
        response = f"missing/invalid inputs: {mismatched_input}"
    else:
        if body['approved']:
            status_code, response = approveInvite(body)
        else:
            status_code = 200
            response = "Invitation denied"
        execute_statement(format_query(deleteInvitesQuery, invitesTable, body, delete=True))
    return {
        "statusCode": status_code,  
        'headers': header,
        "body": response
    }
    
def approveInvite(body):
    execute_statement(format_query(getStreaksbyIDQuery\
        .replace("-streakID-", body['streakID']), streaksTable))
    if len(response[responses_label]) == 0:
        status_code = 404
        response = f"{body['streakID']} not found"
    else:
        execute_statement(format_query(makeGroupStreakQuery\
                .replace("-streakID-", body['streakID']), streaksTable))
        streak = parse_reponse(response)
        body['streakName'] = streak['streakName']
        body['reminderTime'] = streak['reminderTime']
        body['isBreakingHabit'] = streak['isBreakingHabit']
        body['isGroupStreak'] = 1
        body['friendStreakID'] = body['streakID']
        execute_statement(format_query(insertQuery, streaksTable,  {i : body[i] for i in streaksTable['table_fields'] - {'streakID'}}))
        if body['isBreakingHabit']:
            body['completionCount'] = 21
        body['streakID'] = execute_statement(format_query(getIDQuery, streaksTable))[responses_label][0][0][num_label]
        execute_statement(format_query(insertStreaksbyUserTableQuery, 
                                        usersByStreakTable, 
                                        {i : body[i] for i in usersByStreakTable['table_fields'] - {'dateLastCompleted'}}))
        execute_statement(format_query(insertQuery, friendsTable, body))
        friendBody = {
                        'friendStreakID' : body['streakID'],
                        'streakID' : body['friendStreakID'],
                        'friendID' : body['friendID'],
                        'userID' : body['userID']
                    }
        execute_statement(format_query(insertQuery, friendsTable, friendBody))
        status_code = 200
        response = "Invitation approved"
    return status_code, response

def unwrap(body):
    from re import compile, X
    pattern = compile(r'''
                            (?P<key>[A-Za-z_]+)
                            "\s*:\s*"?
                            ((?P<value>
                                    [0-9A-Za-z@\._/\ \-#:]+
                            )|(\[
                                 (?P<list_values> (
                                    "?[0-9A-Za-z@\._/\ \-#]+
                                "?(,\n\s*)?
                                 )+)))''', flags=X)    
    body_dict = dict()
    for match in pattern.finditer(body):
        match_dict = match.groupdict()
        if match_dict['list_values']:
            matches = []
            for m in match_dict['list_values'].split(',\n'):
                m = m.strip()
                m = m.replace('"', "")
                matches += [m]
            var, val = match_dict['key'],  matches
        else:
            var, val = match_dict['key'],  match_dict['value']
        body_dict[var] = val
    return body_dict

# DB ACCESSS

rds_client = boto3.client('rds-data')

database_name = 'strkr'
db_cluster_arn = 'arn:aws:rds:us-east-1:279499514840:cluster:stkr-1'
db_crendentials_secrets_store_arn = 'arn:aws:secretsmanager:us-east-1:279499514840:secret:strk-access-LZpcd5'

usersTable = { 
                'table-name' : 'users', 
                 'table_fields' : {
                                    "userID",
                                    "password",
                                    "firstName",
                                    "lastName",
                                    "createDate",
                                },
                'int_fields' : {},
                'credentials' : {
                                     "userID",
                                    "password"
                                },
                'primary_keys' : {
                                    "userID"
                                }
                } 

friendsTable = { 'table-name' : 'friends', 
                 'table_fields' : {
                                    "userID", 
                                    "friendID", 
                                    "streakID",
                                    'friendStreakID'
                                },
                'int_fields' : {
                                    "streakID", 
                                    "friendStreakID"
                                },
                 'delete_keys' : [
                                    "userID", 
                                    "friendID", 
                                    "streakID"
                                 ]
                } 


invitesTable = { 'table-name'   : 'invites', 
                   'table_fields' : {
                                     'userID',
                                     'friendID', 
                                     'streakID'
                                    },
                    'int_fields'  : { 
                                      'streakID' 
                                      },
                    'primary_keys' : {
                                        'userID',
                                        'friendID', 
                                        'streakID'
                                    },
                    'delete_keys' : {
                                        'userID',
                                        'friendID', 
                                        'streakID'
                                    }
                }

inviteListing = {
                    'table_fields' : {
                        'friendID', 
                        'streakName',
                        'streakID'
                    },
                    'process_fields' : {
                                        'userID', 
                                        'streakID', 
                                        'friendID', 
                                        'primaryColor',
                                        'secondaryColor', 
                                        'frequencySetting', 
                                        'reminderTime',
                                        ''}
                }
streaksTable = {'table-name' : 'streaks', 
                'table_fields' : {
                                    'streakID', 
                                    'streakName',
	                                'createDate',
                                    'frequencySetting',
                                    'primaryColor',
	                                'secondaryColor',
                                    'isGroupStreak', 
                                    'isBreakingHabit', 
                                    'reminderTime'
                                },
                'int_fields' : { 
                                    'streakID',
                                    'frequencySetting',
                                    'isGroupStreak', 
                                    'isBreakingHabit'
                                },
                'primary_keys' : {
                                    'streakID'
                                }
                }
usersByStreakTable = { 'table-name'   : 'usersByStreak', 
                       'table_fields' : {
                                         'userID',
                                         'streakID', 
	                                     'dateLastCompleted',
                                         'completionCount',
                                        },
                        'int_fields'  : { 
                                         'streakID',
                                         'completionCount'
                                        },
                        'primary_keys' : {
                                          'streakID', 
                                          'userID',
                                         }
                }

insertQuery = "INSERT INTO -DB-NAME-.-TABLE-NAME- (-VALUE-NAMES-) VALUES (-UPDATE-VALUES-)"
checkPasswordQuery = "SELECT 1 FROM -DB-NAME-.-TABLE-NAME- WHERE userID = '-userID-' AND password = '-password-'"
getInvitesQuery = '''
                SELECT 
		                friendID,
                        streakName,
                        streakID
		                from -DB-NAME-.-invites-table-
                NATURAL JOIN -DB-NAME-.streaks
                WHERE userID = "-userID-"'''.replace("-invites-table-", invitesTable['table-name'])\
                                            .replace("-streaks-table-", streaksTable['table-name'])
deleteInvitesQuery = "DELETE FROM -DB-NAME-.-TABLE-NAME- WHERE -WHERE-"
insertQuery = "INSERT INTO -DB-NAME-.-TABLE-NAME- (-VALUE-NAMES-) VALUES (-UPDATE-VALUES-)"
insertStreaksbyUserTableQuery =  "INSERT INTO -DB-NAME-.-TABLE-NAME- (-VALUE-NAMES-) VALUES (-UPDATE-VALUES-)"
getIDQuery = "SELECT COUNT(*) FROM -DB-NAME-.-TABLE-NAME-"
getStreaksbyIDQuery = "SELECT * FROM -DB-NAME-.-TABLE-NAME- WHERE streakID = -streakID-".replace('*', ', '.join(streaksTable['table_fields']))
makeGroupStreakQuery = "UPDATE -DB-NAME-.-TABLE-NAME- SET isGroupStreak = 1 WHERE streakID = -streakID-"

def execute_statement(sql):
    reponse = rds_client.execute_statement(
        secretArn = db_crendentials_secrets_store_arn,
        database = database_name,
        resourceArn = db_cluster_arn,
        sql = sql
    )
    return reponse

def format_query(query, table, body={}, update=False, delete=False):
    f_query = query.replace('-DB-NAME-', database_name).replace('-TABLE-NAME-', table['table-name'])
    update_statement = ""
    if update:
        where_statement = ""
        for k, v in body.items():
            if k in table['primary_keys']:
                where_statement += f"{k} = {v} AND " if k in table['int_fields'] else f"{k} = '{v}' AND "
            elif k in table['int_fields']:
                update_statement += f"{k} = {v}, "
            elif k in table['table_fields']:
                update_statement += f"{k} = '{v}', "
        f_query = f_query.replace('-WHERE-', where_statement[:-4])
        f_query = f_query.replace('-NEW-VARS-', update_statement[:-2])
        return f_query
    if delete:
        where_statement = ""
        for k, v in body.items():
            if k in table['delete_keys']:
                where_statement += f"{k} = {v} AND " if k in table['int_fields'] else f"{k} = '{v}' AND "
        f_query = f_query.replace('-WHERE-', where_statement[:-4])
        return f_query
    values_statement = ""
    for k, v in body.items():
        if k in table['int_fields']:
                update_statement += f"{v}, "
        else:
            update_statement += f"'{v}', "
        values_statement += f"{k}, "
    f_query = f_query.replace('-UPDATE-VALUES-', update_statement[:-2])
    f_query = f_query.replace('-VALUE-NAMES-', values_statement[:-2])
    return f_query


def parse_reponse(response, table):
    return [{f: list(v.values())[0] for f, v in zip(table['table_fields'], i)} for i in response[responses_label]]