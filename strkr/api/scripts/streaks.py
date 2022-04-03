import boto3
import json

header = {
    "Content-Type": "application-json",
    "Access-Control-Allow-Origin": '*'
}

def addStreak(event, context):
    body = unwrap(event['body'])
    mismatched_input = set(body.keys()) - (set(streaksTable['table_fields']) | {'userID'})
    if mismatched_input:
       status_code = 404
       response = f"missing/invalid inputs: {mismatched_input}"
    else:
        execute_statement(format_query(insertStreaksTableQuery, streaksTable,  {i : body[i] for i in streaksTable['primary_keys']}))
        execute_statement(format_query(insertStreaksbyUserTableQuery, 
                                        usersByStreakTable, 
                                        {i : body[i] for i in usersByStreakTable['table_fields'] - {'streakID'}}))
        status_code = 200
        response = "Streak was added"
    return {
        "statusCode": status_code,  
        'headers': header,
        "body": response
    }

def getStreakByID(event, context):
    streakID = event['pathParameters']['id'] 
    response = execute_statement(format_query(getStreaksbyIDQuery\
        .replace("-streakID-", streakID), streaksTable))
    if len(response['records']) != 0:
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
    if len(response['records']) != 0:
        status_code = 200
        response = parse_reponse(response, userReturn)
        for r in response:
            if r['isGroupStreak']:
                friends = execute_statement(format_query(getFriendStreaksQuery\
                    .replace("-streakID-", str(r['streakID'])), usersByStreakTable))
                r['friends'] = json.dumps(parse_reponse(friends, friendStreak))
            streakLog = execute_statement(format_query(getStreakLogQuery\
                .replace("-streakID-", str(r['streakID'])), streakLogTable))
            r['streakLog'] = json.dumps(parse_reponse(streakLog, streakLogTable))
        response = json.dumps(response)
    else:
        status_code = 404
        response = f"{userID} has no streaks"
    return {
        "statusCode": status_code, 
        'headers': header,
        "body": response
        } 

def incrementStreak(event, context):
    body = unwrap(event['body'])
    mismatched_input = set(body.keys()) - set(streakLogTable['table_fields'])
    if mismatched_input:
       status_code = 404
       response = f"missing/invalid inputs: {mismatched_input}"
    else:
        execute_statement(format_query(incrementStreakQuery\
            .replace("-userID-", body['userID'])\
            .replace("-streakID-", body['streakID'])\
            .replace("-dateLastCompleted-", body['dateCompleted']), usersByStreakTable))
        body['completionCount'] = execute_statement(format_query(getCurrentCompletionCountQuery\
                    .replace("-streakID-", body['streakID']), usersByStreakTable))['records'][0][0]["longValue"]
        execute_statement(format_query(logStreakQuery, streakLogTable, body))
        status_code = 200
        response = f"{body['streakID']} incrementated"
    return {
        "statusCode": status_code, 
        'headers': header,
        "body": response
        }  



def unwrap(body):
    from re import compile
    pattern = compile(r'([A-Za-z_]+)" *: *"?([0-9A-Za-z@\._/ \-#]+)')    
    body_dict = dict()
    for var, val in pattern.findall(body):
        body_dict[var] = val
    return body_dict


# DB ACCESSS

rds_client = boto3.client('rds-data')

database_name = 'strkr'
db_cluster_arn = 'arn:aws:rds:us-east-1:279499514840:cluster:stkr-1'
db_crendentials_secrets_store_arn = 'arn:aws:secretsmanager:us-east-1:279499514840:secret:strk-access-LZpcd5'
streaksTable = {'table_name' : 'streaks', 
                'table_fields' : {
                                    'streakID', 
                                    'streakName',
	                                'createDate',
                                    'frequencySetting',
                                    'primaryColor',
	                                'secondaryColor',
                                    'isGroupStreak'
                                },
                'int_fields' : { 
                                    'streakID',
                                    'frequencySetting',
                                    'isGroupStreak'
                                },
                'primary_keys' : {
                                    'streakID'
                                }
                }
usersByStreakTable = { 'table_name'   : 'usersByStreak', 
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
streakLogTable = { 'table_name'   : 'streakLog', 
                   'table_fields' : {
                                     'userID',
                                     'streakID', 
                                     'completionCount',
	                                 'dateCompleted'
                                    },
                    'int_fields'  : { 
                                      'streakID'
                                    },
                    'primary_keys' : {
                                       'streakID', 
                                       'userID',
                                       'dateCompleted'
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
                            FROM -DB-NAME-.friends 
                            INNER JOIN -DB-NAME-.streaks 
                            ON friends.friendStreakID = streaks.streakID
                            INNER JOIN -DB-NAME-.users 
                            ON friends.friendID = users.userID
                            INNER JOIN -DB-NAME-.usersByStreak
                            ON friends.friendStreakID = usersByStreak.streakID
                            WHERE friends.streakID = -streakID-'''
incrementStreakQuery = "UPDATE -DB-NAME-.-TABLE-NAME- SET completionCount = IFNULL(completionCount, 0) + 1, dateLastCompleted = '-dateLastCompleted-' WHERE streakID = -streakID- AND userID = '-userID-'"
logStreakQuery = "INSERT INTO -DB-NAME-.-TABLE-NAME- (-VALUE-NAMES-) VALUES (-UPDATE-VALUES-)"
getCurrentCompletionCountQuery = "SELECT completionCount FROM -DB-NAME-.-TABLE-NAME- WHERE streakID = -streakID-"

def execute_statement(sql):
    reponse = rds_client.execute_statement(
        secretArn = db_crendentials_secrets_store_arn,
        database = database_name,
        resourceArn = db_cluster_arn,
        sql = sql
    )
    return reponse

def format_query(query, table, body={}):
    f_query = query.replace('-DB-NAME-', database_name).replace('-TABLE-NAME-', table['table_name'])
    update_statement = ""
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
    return [{f: list(v.values())[0] for f, v in zip(table['table_fields'], i)} for i in response['records']]