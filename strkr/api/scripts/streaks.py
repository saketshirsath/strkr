import boto3
import json

header = {
    "Content-Type": "application-json",
    "Access-Control-Allow-Origin": '*'
}

num_label = "longValue"
str_label = "stringValue"
responses_label = "records"

def addStreak(event, context):
    body = unwrap(event['body'])
    mismatched_input = set(body.keys()) - (set(streaksTable['table_fields']) | {'userID'})
    if mismatched_input:
       status_code = 404
       response = f"missing/invalid inputs: {mismatched_input}"
    else:
        execute_statement(format_query(insertStreaksTableQuery, 
                                       streaksTable,  
                                       {i : body[i] for i in streaksTable['table_fields'] - {'streakID'}}))
        body['streakID'] = execute_statement(format_query(getIDQuery, streaksTable))[responses_label][0][0][num_label]
        body['completionCount'] = 21 if int(body['isBreakingHabit']) else 0
        execute_statement(format_query(insertStreaksbyUserTableQuery, 
                                        usersByStreakTable, 
                                        {i : body[i] for i in usersByStreakTable['primary_keys'] | {'completionCount'}}))
        status_code = 200
        response = json.dumps({'streakID' : body['streakID']})
    return {
        "statusCode": status_code,  
        'headers': header,
        "body": response
    }

def getStreakByID(event, context):
    streakID = event['pathParameters']['id'] 
    response = execute_statement(format_query(getStreaksbyIDQuery\
                                .replace("-streakID-", streakID), streaksTable))
    if len(response[responses_label]) != 0:
        status_code = 200
        response = json.dumps(parse_reponse(response, streaksTable))
    else:
        status_code = 404
        response = f"{streakID} not found"
    return {
        "statusCode": status_code, 
        'headers': header,
        "body": response
        }

def getStreakByUser(event, context):
    userID = event['pathParameters']['id'] 
    response = execute_statement(format_query(getStreaksbyUserQuery\
                                .replace("-userID-", userID), usersByStreakTable))
    if len(response[responses_label]) != 0:
        status_code = 200
        response = parse_reponse(response, userReturn)
        for r in response:
            if r['isGroupStreak']:
                friends = execute_statement(format_query(getFriendStreaksQuery\
                                            .replace("-streakID-", str(r['streakID'])), usersByStreakTable))
                r['friends'] = parse_reponse(friends, friendStreak)
            streakLog = execute_statement(format_query(getStreakLogQuery\
                                            .replace("-streakID-", str(r['streakID'])), streakLogTable))
            r['streakLog'] = parse_reponse(streakLog, streakLogTable)
        response = json.dumps(response)
    else:
        status_code = 404
        response = f"{userID} has no streaks"
    return {
        "statusCode": status_code, 
        'headers': header,
        "body": response
        } 

def undoLastUpdate(event, context):
    body = unwrap(event['body'])
    mismatched_input = set(body.keys()) - set(streakLogTable['primary_keys'])
    if mismatched_input != set():
       status_code = 404
       response = f"missing/invalid inputs: {mismatched_input}"
    else:
        isBreakingHabit =  execute_statement(format_query(checkIfBreakingQuery\
                            .replace("-streakID-", body['streakID']), streaksTable))
        chosenQuery = incrementStreakQuery if len(isBreakingHabit[responses_label]) != 0 else decrementStreakQuery
        execute_statement(format_query(chosenQuery\
                .replace("-userID-", body['userID'])\
                .replace("-streakID-", body['streakID'])\
                .replace("-dateLastCompleted-", body['dateCompleted']), usersByStreakTable))
        execute_statement(format_query(deleteQuery, streakLogTable, body, delete=True))
        dateLastCompleted = execute_statement(format_query(getLastDateCompletedQuery\
                                            .replace("-userID-", body['userID'])\
                                            .replace("-streakID-", body['streakID']), streakLogTable))[responses_label][0][0]
        body['dateLastCompleted'] = dateLastCompleted[str_label] if str_label in dateLastCompleted.keys() else "NULL"
        execute_statement(format_query(updateQuery, usersByStreakTable, body, update=True))
        status_code = 200
        response = f"{body['streakID']} incrementated" if len(isBreakingHabit[responses_label]) != 0 else f"{body['streakID']} decrementated" 
    return {
        "statusCode": status_code, 
        'headers': header,
        "body": response
        }  


def deleteStreak(event, context):
    streakID = event['pathParameters']['id'] 
    newfriendsTable = friendsTable.copy()
    newfriendsTable['delete_keys'] = {'streakID', 'friendStreakID'}
    execute_statement(format_query(deleteQuery, 
                                   newfriendsTable, 
                                   {'streakID' : streakID, 
                                    'friendStreakID' : streakID}, 
                                    delete=True).replace(" AND ", " OR "))
    execute_statement(format_query(deleteQuery, 
                                   streaksTable, 
                                   {'streakID' : streakID}, 
                                   delete=True))
    status_code = 200
    response = f"Streak#{streakID} was deleted"
    return {
        "statusCode": status_code, 
        'headers': header,
        "body": response
        } 


def incrementStreak(event, context):
    body = unwrap(event['body'])
    mismatched_input = set(body.keys()) - set(streakLogTable['table_fields'])
    if mismatched_input != set():
       status_code = 404
       response = f"missing/invalid inputs: {mismatched_input}"
    else:
        checkForExistingLog = execute_statement(format_query(checkStreakLogQuery.replace("-userID-", body['userID'])\
                .replace("-streakID-", body['streakID'])\
                .replace("-dateCompleted-", body['dateCompleted']), streakLogTable))[responses_label]
        if len(checkForExistingLog) == 0:
            isBreakingHabit =  execute_statement(format_query(checkIfBreakingQuery\
                                .replace("-streakID-", body['streakID']), streaksTable))
            chosenQuery = decrementStreakQuery if len(isBreakingHabit[responses_label]) != 0 else incrementStreakQuery
            execute_statement(format_query(chosenQuery\
                    .replace("-userID-", body['userID'])\
                    .replace("-streakID-", body['streakID'])\
                    .replace("-dateLastCompleted-", body['dateCompleted']), usersByStreakTable))
            body['completionCount'] = execute_statement(format_query(getCurrentCompletionCountQuery\
                            .replace("-streakID-", body['streakID']), usersByStreakTable))[responses_label][0][0][num_label]
            execute_statement(format_query(insertQuery, streakLogTable, body))
            status_code = 200
            response = f"{body['streakID']} incrementated" if len(isBreakingHabit[responses_label]) == 0 else f"{body['streakID']} decrementated" 
        else:
            status_code = 400
            response = f"Streak#{body['streakID']} was not updated. Already logged for {body['dateCompleted']}." 
    return {
            "statusCode": status_code, 
            'headers': header,
            "body": response
            }  


def editStreak(event, context):
        body = unwrap(event['body'])
        primary_keys_check = (set(streaksTable['primary_keys']) | set(usersByStreakTable['primary_keys'])) - set(body.keys())
        if primary_keys_check != set():
            status_code = 404
            response = f"missing inputs: {primary_keys_check}"
        else:
            checkID = execute_statement(format_query(checkStreakQuery\
                                            .replace("-userID-", body['userID'])\
                                            .replace("-streakID-", body['streakID']), streaksTable))[responses_label]
            if len(checkID):
                if (set(body.keys()) - set(streaksTable['primary_keys']))&(set(streaksTable['table_fields']) ):
                    execute_statement(format_query(updateQuery, streaksTable, body, update=True))
                if 'completionCount' in body.keys() or 'dateLastCompleted' in body.keys():
                    execute_statement(format_query(updateQuery, usersByStreakTable, body, update=True))
                edited_fields = set(body.keys()) - {'removeFriends', 'inviteFriends'} - \
                                (set(streaksTable['primary_keys']) | set(usersByStreakTable['primary_keys']))
                response = f"{edited_fields} were updated"
                if 'removeFriends' in body.keys():
                    deleteFriends(body)
                    response += f" and users { body['removeFriends']} were removed"
                if 'inviteFriends' in body.keys():
                    inviteFriends(body)
                    response += f" and users { body['inviteFriends']} were invited"
                status_code = 200
            else:
                status_code = 404
                response = f"Streak#{body['streakID']} for User {body['userID']} does not exist"  
        return {
            "statusCode": status_code, 
            'headers': header,
            "body": response
             }  
            
def deleteFriends(body):
    for friend in body['removeFriends']:
        friendBody = {}
        friendBody["userID"] = body['userID']
        friendBody["friendID"] = friend.strip()
        friendBody["streakID"] = body['streakID']
        execute_statement(format_query(deleteQuery, friendsTable, friendBody, delete=True))

def inviteFriends(body):
    for friend in body['inviteFriends']:
        if len(execute_statement(format_query(checkUserQuery.replace("-userID-", body['userID']), usersTable))[responses_label]):
            friendBody = {}
            friendBody["friendID"] = body['userID']
            friendBody["userID"] = friend.strip()
            friendBody["streakID"] = body['streakID']
            execute_statement(format_query(insertQuery, invitesTable, friendBody))

def unwrap(body):
    from re import compile, X
    pattern = compile(r'''
                            (?P<key>[A-Za-z_]+)
                            "\s*:\s*"?
                            ((?P<value>
                                    [0-9A-Za-z@\._/\ \-#:']+
                            )|(\[
                                 (?P<list_values> (
                                    "?[0-9A-Za-z@\._/\ \-#']+
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
                'delete_keys' : {
                                    'streakID'
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
streakLogTable = { 'table-name'   : 'streakLog', 
                   'table_fields' : {
                                     'userID',
                                     'streakID', 
                                     'completionCount',
	                                 'dateCompleted'
                                    },
                    'int_fields'  : { 
                                      'streakID'
                                    },
                    'delete_keys'  : { 
                                      'streakID', 
                                       'userID',
                                       'dateCompleted'
                                    },
                    'primary_keys' : {
                                       'streakID', 
                                       'userID',
                                       'dateCompleted'
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
                                    }
                }

friendStreak = {
                'table_fields' : [
                                    "userID",
                                    "firstName",
                                    "lastName",
                                    "primaryColor",
                                    "secondaryColor",
                                    "completionCount"
                ]
                }
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
userReturn = {
             'table_fields' : usersByStreakTable['table_fields'] | streaksTable['table_fields']
}


insertStreaksTableQuery = "INSERT INTO -DB-NAME-.-TABLE-NAME- (-VALUE-NAMES-) VALUES (-UPDATE-VALUES-)"
insertStreaksbyUserTableQuery =  "INSERT INTO -DB-NAME-.-TABLE-NAME- (-VALUE-NAMES-) VALUES (-UPDATE-VALUES-)"
getStreaksbyIDQuery = "SELECT * FROM -DB-NAME-.-TABLE-NAME- WHERE streakID = -streakID-".replace('*', ', '.join(streaksTable['table_fields']))
getStreaksbyUserQuery = "SELECT * FROM -DB-NAME-.-TABLE-NAME- NATURAL JOIN -DB-NAME-.streaks WHERE userID = '-userID-'".replace('*', ', '.join(userReturn['table_fields']))
getStreakLogQuery = "SELECT * FROM -DB-NAME-.-TABLE-NAME- WHERE streakID = -streakID- LIMIT 7".replace('*', ', '.join(streakLogTable['table_fields']))
getFriendStreaksQuery = ''' 
                            SELECT 
                                friendID as userID, 
                                firstName, 
                                lastName, 
                                primaryColor, 
                                secondaryColor,
                                completionCount
                            FROM -DB-NAME-.-friends-table-
                            INNER JOIN -DB-NAME-.-streaks-table- 
                            ON -friends-table-.friendStreakID = -streaks-table- .streakID
                            INNER JOIN -DB-NAME-.-users-table-
                            ON -friends-table-.friendID = -users-table-.userID
                            INNER JOIN -DB-NAME-.-usersByStreak-table-
                            ON -friends-table-.friendStreakID = -usersByStreak-table-.streakID
                            WHERE -friends-table-.streakID = -streakID-'''\
                            .replace("-usersByStreak-table-", usersByStreakTable['table-name'])\
                            .replace("-streaks-table-", streaksTable['table-name'])\
                            .replace("-friends-table-", friendsTable['table-name'])\
                            .replace("-users-table-", usersTable['table-name'])
incrementStreakQuery = "UPDATE -DB-NAME-.-TABLE-NAME- SET completionCount = GREATEST(IFNULL(completionCount, 0) + 1, 0), dateLastCompleted = '-dateLastCompleted-' WHERE streakID = -streakID- AND userID = '-userID-'"
decrementStreakQuery = "UPDATE -DB-NAME-.-TABLE-NAME- SET completionCount = GREATEST(IFNULL(completionCount, 0) - 1, 0), dateLastCompleted = '-dateLastCompleted-' WHERE streakID = -streakID- AND userID = '-userID-'"
insertQuery = "INSERT INTO -DB-NAME-.-TABLE-NAME- (-VALUE-NAMES-) VALUES (-UPDATE-VALUES-)"
getCurrentCompletionCountQuery = "SELECT completionCount FROM -DB-NAME-.-TABLE-NAME- WHERE streakID = -streakID-"
updateQuery = "UPDATE -DB-NAME-.-TABLE-NAME- SET -NEW-VARS- WHERE -WHERE-"
deleteQuery = "DELETE FROM -DB-NAME-.-TABLE-NAME- WHERE -WHERE-"
checkIfBreakingQuery = "SELECT 1 FROM -DB-NAME-.-TABLE-NAME- WHERE streakID = -streakID- AND isBreakingHabit = 1"
getIDQuery = "SELECT MAX(streakID) FROM -DB-NAME-.-TABLE-NAME-"
getLastDateCompletedQuery = "SELECT MAX(dateCompleted) FROM -DB-NAME-.-TABLE-NAME- where userID ='-userID-' and streakID = -streakID-"
checkUserQuery = "SELECT 1 FROM -DB-NAME-.-TABLE-NAME- WHERE userID = '-userID-'"
checkStreakLogQuery = ''' SELECT 1 
                        FROM -DB-NAME-.-TABLE-NAME- 
                        WHERE streakID = -streakID- 
                        AND dateCompleted = '-dateCompleted-' 
                        AND userID = '-userID-' '''
checkStreakQuery = '''SELECT 
                                1 
                        FROM -DB-NAME-.-streaks-table-
                        INNER JOIN -DB-NAME-.-usersByStreak-table-
                        ON -streaks-table-.streakID = -usersByStreak-table-.streakID
                        WHERE 
                            -streaks-table-.streakID = -streakID-
                            AND
                            userID = "-userID-"'''\
                                .replace("-usersByStreak-table-", usersByStreakTable['table-name'])\
                                .replace("-streaks-table-", streaksTable['table-name'])

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
            elif k in table['int_fields'] or v == "NULL":
                update_statement += f"{k} = {v}, "
            elif k in table['table_fields']:
                update_statement += f'''{k} = "{v}", '''
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
            update_statement += f'''"{v}", '''
        values_statement += f"{k}, "
    f_query = f_query.replace('-UPDATE-VALUES-', update_statement[:-2])
    f_query = f_query.replace('-VALUE-NAMES-', values_statement[:-2])
    return f_query


def parse_reponse(response, table):
    return [{f: list(v.values())[0] for f, v in zip(table['table_fields'], i)} for i in response[responses_label]]