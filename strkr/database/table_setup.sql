USE strkr;

DROP TABLE IF EXISTS invites;
DROP TABLE IF EXISTS friends;
DROP TABLE IF EXISTS streakLog;
DROP TABLE IF EXISTS usersByStreak;
DROP TABLE IF EXISTS streaks;
DROP TABLE IF EXISTS users;

-- tables setup

CREATE TABLE users (
    userID varchar(50) NOT NULL UNIQUE,
    password varchar(82),
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
    isBreakingHabit int,
    reminderTime time,
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
    completionCount int,
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
    streakID int NOT NULL, 
    friendStreakID int NOT NULL, 
    PRIMARY KEY (userID, friendID, friendStreakID),
	FOREIGN KEY (userID) REFERENCES users (userID),
	FOREIGN KEY (friendID) REFERENCES users (userID), 
    FOREIGN KEY (streakID) REFERENCES streaks (streakID),
    FOREIGN KEY (friendStreakID) REFERENCES streaks (streakID) 
  	ON UPDATE CASCADE
  	ON DELETE CASCADE
) engine = innodb;


CREATE TABLE invites(
    userID varchar(50) NOT NULL,
    friendID varchar(50) NOT NULL, 
    streakID int NOT NULL, 
    PRIMARY KEY (userID, friendID, streakID),
	FOREIGN KEY (userID) REFERENCES users (userID),
    FOREIGN KEY (streakID) REFERENCES streaks (streakID)
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
(streakName, createDate, frequencySetting, primaryColor, secondaryColor, isGroupStreak, isBreakingHabit, reminderTime) 
VALUES
("Read",           DATE("2022-03-01"), 1, "#AE2012", "#FFFFFF", 0, 0, TIME("12:00:00")), -- 1
("Study",          DATE("2022-03-01"), 1, "#0A9396", "#FFFFFF", 0, 0, TIME("12:00:00")), -- 2 
("Meditate",       DATE("2022-03-01"), 1, "#CA6702", "#FFFFFF", 0, 0, TIME("12:00:00")), -- 3
("Workout",        DATE("2022-03-01"), 1, "#005F73", "#FFFFFF", 1, 0, TIME("12:00:00")), -- 4
("Workout",        DATE("2022-03-01"), 1, "#005F73", "#FFFFFF", 1, 0, TIME("12:00:00")), -- 5
("Quit smoking",   DATE("2022-03-01"), 1, "#001219", "#FFFFFF", 0, 1, TIME("12:00:00")), -- 6
("Wakeup Early",   DATE("2022-03-01"), 1, "#BB3E03", "#FFFFFF", 0, 0, TIME("12:00:00")); -- 7


-- usersByStreak
INSERT INTO usersByStreak VALUES
("test@test.com", 1, 4, DATE("2022-03-06")),
("test@test.com", 2, 5, DATE("2022-03-07")),
("test@test.com", 3, 1, DATE("2022-03-07")),
("test@test.com", 4, 8, DATE("2022-03-07")),
("fake@test.com", 5, 1, DATE("2022-03-07")),
("test@test.com", 6, 21, DATE("2022-03-07")),
("test@test.com", 7, 11, DATE("2022-03-07"));

-- streakLog
INSERT INTO streakLog VALUES 
("test@test.com", 1, 1, DATE("2022-03-06")),
("test@test.com", 1, 2, DATE("2022-03-07")),
("test@test.com", 1, 3, DATE("2022-03-08")),
("test@test.com", 1, 4, DATE("2022-03-09")),
("test@test.com", 2, 1, DATE("2022-03-13")),
("test@test.com", 2, 2, DATE("2022-03-14")),
("test@test.com", 2, 3, DATE("2022-03-15")),
("test@test.com", 2, 4, DATE("2022-03-16")),
("test@test.com", 2, 5, DATE("2022-03-17")),
("test@test.com", 3, 1, DATE("2022-03-05")),
("test@test.com", 4, 1, DATE("2022-03-06")),
("test@test.com", 4, 2, DATE("2022-03-07")),
("test@test.com", 4, 3, DATE("2022-03-08")),
("test@test.com", 4, 4, DATE("2022-03-09")),
("test@test.com", 4, 5, DATE("2022-03-10")),
("test@test.com", 4, 6, DATE("2022-03-11")),
("test@test.com", 4, 7, DATE("2022-03-12")),
("test@test.com", 4, 8, DATE("2022-03-13")),
("fake@test.com", 5, 1, DATE("2022-03-07")),
("test@test.com", 7, 1, DATE("2022-03-06")),
("test@test.com", 7, 2, DATE("2022-03-07")),
("test@test.com", 7, 3, DATE("2022-03-08")),
("test@test.com", 7, 4, DATE("2022-03-09")),
("test@test.com", 7, 5, DATE("2022-03-10")),
("test@test.com", 7, 6, DATE("2022-03-11")),
("test@test.com", 7, 7, DATE("2022-03-12")),
("test@test.com", 7, 8, DATE("2022-03-13")),
("test@test.com", 7, 9, DATE("2022-03-14")),
("test@test.com", 7, 10, DATE("2022-03-15")),
("test@test.com", 7, 11, DATE("2022-03-16"));

-- friends
INSERT INTO friends VALUES
("test@test.com", "fake@test.com", 4, 5),
("fake@test.com", "test@test.com", 5, 4);