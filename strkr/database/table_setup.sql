USE streaks;

DROP TABLE IF EXISTS friends;
DROP TABLE IF EXISTS streakLog;
DROP TABLE IF EXISTS usersByStreak;
DROP TABLE IF EXISTS streaks;
DROP TABLE IF EXISTS users;

-- tables setup

CREATE TABLE users (
    userID varchar(50) NOT NULL UNIQUE,
    password char(82),
    firstName varchar(50),
    lastName varchar(50),
    createDate date,
    PRIMARY KEY (userID)
) engine = innodb;

CREATE TABLE streaks (
    streakID int NOT NULL UNIQUE AUTO_INCREMENT, 
    streakName varchar(50),
	createDate date,
    frequencySetting int,
    primaryColor varchar(50),
	secondaryColor varchar(50),
    isGroupStreak int,
    PRIMARY KEY (streakID)
) engine = innodb;

CREATE TABLE usersByStreak (
    userID varchar(50) NOT NULL,
    streakID int NOT NULL, 
    completionCount int,
    dateLastCompleted date,
    PRIMARY KEY (userID, streakID),
    FOREIGN KEY (userID) REFERENCES users (userID),
	FOREIGN KEY (streakID) REFERENCES streaks (streakID) 
  	ON DELETE CASCADE
  	ON UPDATE CASCADE
) engine = innodb;

CREATE TABLE streakLog(
    userID varchar(50) NOT NULL,
    streakID int NOT NULL, 
    dateCompleted date,
    PRIMARY KEY (userID, streakID, dateCompleted),
	FOREIGN KEY (userID) REFERENCES users (userID),
	FOREIGN KEY (streakID) REFERENCES streaks (streakID) 
  	ON DELETE CASCADE
  	ON UPDATE CASCADE
) engine = innodb;


CREATE TABLE friends(
    userID varchar(50) NOT NULL,
    friendID varchar(50) NOT NULL, 
    PRIMARY KEY (userID, friendID),
	FOREIGN KEY (userID) REFERENCES users (userID),
	FOREIGN KEY (friendID) REFERENCES users (userID) 
  	ON UPDATE CASCADE
  	ON DELETE CASCADE
) engine = innodb;

-- set table dummy data

-- users
INSERT INTO users VALUES
("test@test.com", "password", "Alice", "Alison", DATE("2022-03-07")),
("fake@test.com", "password", "Fake", "Name", DATE("2022-03-07"));


-- streaks
INSERT INTO streaks 
(streakName, createDate, frequencySetting, primaryColor, secondaryColor, isGroupStreak) 
VALUES
("Read for 1 hour", DATE("2022-03-01"), 1, "#0000FF", "#FF0000", 0),
("Jog",             DATE("2022-03-01"), 1, "#0000FF", "#FF0000", 1),
("Jog",             DATE("2022-03-01"), 1, "#0000FF", "#FF0000", 1);


-- usersByStreak
INSERT INTO usersByStreak VALUES
("test@test.com", 1, 1, DATE("2022-03-06")),
("test@test.com", 2, 4, DATE("2022-03-07")),
("fake@test.com", 3, 1, DATE("2022-03-07"));

-- streakLog
INSERT INTO streakLog VALUES 
("test@test.com", 1, DATE("2022-03-06")),
("test@test.com", 2, DATE("2022-03-04")),
("test@test.com", 2, DATE("2022-03-03")),
("test@test.com", 2, DATE("2022-03-05")),
("test@test.com", 2, DATE("2022-03-07")),
("fake@test.com", 3, DATE("2022-03-07"));

-- friends
INSERT INTO friends VALUES
("test@test.com", "fake@test.com"),
("fake@test.com", "test@test.com");

