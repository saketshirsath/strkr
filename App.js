import React, {useState, createRef} from 'react';
import type {Node} from 'react';
import {
  StyleSheet,
  Text,
  useColorScheme,
  View,
  TouchableOpacity,
  ScrollView,
  Pressable,
} from 'react-native';
import {NavigationContainer, useNavigation} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import {AnimatedCircleGroup} from './Bubbles/Circle';
import {EditHabit} from './EditHabit';
import {ViewHabit} from './ViewHabit';
import {faPlus} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {GroupHabit} from './GroupHabit';
import LoginScreen from 'react-native-login-screen';
import axios from 'axios';

const baseUrl = 'https://elibe420n8.execute-api.us-east-1.amazonaws.com/dev';
const authBaseUrl =
  'https://elibe420n8.execute-api.us-east-1.amazonaws.com/dev';

export const navigationRef = createRef();

import PushNotificationIOS from '@react-native-community/push-notification-ios';
import PushNotification from 'react-native-push-notification';

// Must be outside of any component LifeCycle (such as `componentDidMount`).
PushNotification.configure({
  // (optional) Called when Token is generated (iOS and Android)
  onRegister: function (token) {
    console.log('TOKEN:', token);
  },

  // (required) Called when a remote is received or opened, or local notification is opened
  onNotification: function (notification) {
    console.log('NOTIFICATION:', notification);

    // process the notification

    // (required) Called when a remote is received or opened, or local notification is opened
    notification.finish(PushNotificationIOS.FetchResult.NoData);
  },

  // (optional) Called when Registered Action is pressed and invokeApp is false, if true onNotification will be called (Android)
  onAction: function (notification) {
    console.log('ACTION:', notification.action);
    console.log('NOTIFICATION:', notification);

    // process the action
  },

  // (optional) Called when the user fails to register for remote notifications. Typically occurs when APNS is having issues, or the device is a simulator. (iOS)
  onRegistrationError: function (err) {
    console.error(err.message, err);
  },

  // IOS ONLY (optional): default: all - Permissions to register.
  permissions: {
    alert: true,
    badge: true,
    sound: true,
  },

  // Should the initial notification be popped automatically
  // default: true
  popInitialNotification: true,

  /**
   * (optional) default: true
   * - Specified if permissions (ios) and token (android and ios) will requested or not,
   * - if not, you must call PushNotificationsHandler.requestPermissions() later
   * - if you are not using remote notification or do not have Firebase installed, use this:
   *     requestPermissions: Platform.OS === 'ios'
   */
  requestPermissions: true,
});

const dummyData = [
  {
    streakID: 1,
    completionCount: 5,
    dateLastCompleted: '2022-03-10',
    streakName: 'Study',
    primaryColor: '#0A9396',
    frequencySetting: 1,
    secondaryColor: '#0A9396',
    streakLog: [
      {
        dateCompleted: '2022-03-10',
        completionCount: 1,
      },
      {
        dateCompleted: '2022-03-11',
        completionCount: 1,
      },
    ],
  },
  {
    streakID: 3,
    completionCount: 2,
    dateLastCompleted: '2022-03-10',
    streakName: 'Meditate',
    primaryColor: '#CA6702',
    frequencySetting: 1,
    secondaryColor: '#CA6702',
    streakLog: [
      {
        dateCompleted: '2022-03-10',
        completionCount: 1,
      },
      {
        dateCompleted: '2022-03-11',
        completionCount: 1,
      },
    ],
  },
  {
    streakID: 4,
    completionCount: 11,
    dateLastCompleted: '2022-03-10',
    streakName: 'Wakeup Early',
    primaryColor: '#BB3E03',
    frequencySetting: 1,
    secondaryColor: '#BB3E03',
    streakLog: [
      {
        dateCompleted: '2022-03-10',
        completionCount: 1,
      },
      {
        dateCompleted: '2022-03-11',
        completionCount: 1,
      },
    ],
  },
  {
    streakID: 4,
    completionCount: 25,
    dateLastCompleted: '2022-03-10',
    streakName: 'Walk Dog',
    primaryColor: '#AE2012',
    frequencySetting: 1,
    secondaryColor: '#AE2012',
    streakLog: [
      {
        dateCompleted: '2022-03-10',
        completionCount: 1,
      },
      {
        dateCompleted: '2022-03-11',
        completionCount: 1,
      },
    ],
  },
  {
    streakID: 2,
    completionCount: 8,
    dateLastCompleted: '2022-03-10',
    streakName: 'Workout',
    primaryColor: '#005F73',
    frequencySetting: 1,
    secondaryColor: '#005F73',
    friends: [
      {
        userID: 'test@test.com',
        firstName: 'Nick',
        primaryColor: '#001219',
        secondaryColor: '#001219',
        completionCount: 2,
      },
      {
        userID: 'test@test.com',
        firstName: 'Ashley',
        primaryColor: '#94D2BD',
        secondaryColor: '#94D2BD',
        completionCount: 18,
      },
      {
        userID: 'test@test.com',
        firstName: 'Carlota',
        primaryColor: '#EE9B00',
        secondaryColor: '#EE9B00',
        completionCount: 13,
      },
    ],
  },
];

export const isToday = date => {
  const today = new Date();
  return (
    date.getDate() == today.getDate() &&
    date.getMonth() == today.getMonth() &&
    date.getFullYear() == today.getFullYear()
  );
};

const userid = 'test@test.com';

/*
Create a new streak:
https://elibe420n8.execute-api.us-east-1.amazonaws.com/dev/new-streak
	{
		"streakName": "Study",
		"createDate": "2022-04-19",
		"frequencySetting": 1,
		"primaryColor": "#0A9396",
		"secondaryColor": "#0A9396",
		"isGroupStreak": 0,
		"userID": "test@test.com",
		"isBreakingHabit": 0,
		"reminderTime": "16:40:00"
}

Edit Streak:
https://elibe420n8.execute-api.us-east-1.amazonaws.com/dev/edit-streak  
{
		"streakID": 1,
		"streakName": "Study 2",
		"createDate": "2022-04-19",
		"frequencySetting": 1,
		"primaryColor": "#0A9396",
		"secondaryColor": "#0A9396",
		"isGroupStreak": 0,
		"completionCount": 10,
		"userID": "test@test.com",
		"isBreakingHabit": 0,
		"reminderTime": "16:40:00"
}

Get Streaks:
https://elibe420n8.execute-api.us-east-1.amazonaws.com/dev/get-streak-by-user/test@test.com

Update streak:
https://elibe420n8.execute-api.us-east-1.amazonaws.com/dev/increment-streak  
{
	"streakID": 1,
	"dateCompleted": "2022-04-19",
	"userID": "test@test.com",
}

Delete Streak:

Undo Competion:

*/

const App: () => Node = () => {
  const updateHabit = (index, newHabit, updateType) => {
    const newHabits = habits.slice();
    for (let i = 0; i < habits.length; i++) {
      if (newHabits[i].streakID == newHabit.streakID) {
        index = i;
      }
    }

    if (updateType != null && updateType == 'create') {
      newHabits.push(newHabit);
      setHabits(newHabits);

      axios
        .post(baseUrl + '/new-streak', {
          streakName: newHabit.streakName,
          createDate: newHabit.createDate,
          frequencySetting: 1,
          primaryColor: newHabit.primaryColor,
          secondaryColor: newHabit.secondaryColor,
          isGroupStreak: newHabit.isGroupStreak,
          reminderTime: newHabit.reminderTime,
        })
        .then(response => {
          console.log(response);
        });

      // TODO: send new habit, like later

      return newHabit;
    } else if (updateType != null && updateType == 'delete') {
      let newHabits = habits.slice();
      newHabits = newHabits.filter(h => h.streakID != newHabit.streakID);
      PushNotification.cancelLocalNotification(newHabit.streakID);

      // TODO: send delete habit

      setHabits(newHabits);
    } else if (updateType != null && updateType == 'edit') {
      newHabits[index].streakName = newHabit.streakName;
      newHabits[index].primaryColor = newHabit.primaryColor;
      newHabits[index].friends = newHabit.friends;
      newHabits[index].dateLastCompleted = newHabit.dateLastCompleted;

      axios
        .post(baseUrl + '/edit-streak', {
          userID: 'test@test.com',
          streakID: '1',
          streakName: 'Study 101',
          dateLastCompleted: '2022-01-02',
          completionCount: 2,
          frequencySetting: 1,
          primaryColor: '#333333',
          secondaryColor: '#0A9396',
          isGroupStreak: 0,
          reminderTime: '16:40:00',
          isBreakingHabit: 0,
        })
        .then(response => {
          console.log(response);
        });

      setHabits(newHabits);
      return newHabit;
    } else if (updateType != null && updateType == 'increment') {
      newHabit.completionCount += newHabit.isBreakingHabit ? -1 : 1;
      newHabit.dateLastCompleted = new Date().toISOString();
      newHabits[index].completionCount = newHabit.completionCount;
      newHabits[index].dateLastCompleted = newHabit.dateLastCompleted;
      setHabits(newHabits);
      console.log('sending back after incrrement App.js');
      console.log('initial');
      console.log(newHabit);
      console.log('updated to');
      console.log(newHabit);

      return newHabit;
    } else if (updateType != null && updateType == 'undo') {
      newHabit.completionCount += newHabit.isBreakingHabit ? 1 : -1;
      newHabit.dateLastCompleted = null;
      newHabits[index].completionCount = newHabit.completionCount;
      newHabits[index].dateLastCompleted = newHabit.dateLastCompleted;
      setHabits(newHabits);
      return newHabit;
    }
  };

  const setNotificationCategories = () => {
    PushNotificationIOS.setNotificationCategories([
      {
        id: 'userAction',
        actions: [
          {id: 'complete', title: 'Mark Complete', options: {foreground: true}},
        ],
      },
    ]);
  };

  const onTapHabit = (index, tappedHabit) => {
    if (tappedHabit.friends == null || tappedHabit.friends.length == 0) {
      navigationRef.current.navigate('ViewHabit', {
        index,
        tappedHabit,
        onHabitChange: updateHabit,
      });
    } else {
      navigationRef.current.navigate('GroupHabit', {
        index,
        tappedHabit,
        onHabitChange: updateHabit,
        onLongPressHabit: onLongPressHabit,
        onTapHabit: onTapHabit,
      });
    }
  };

  const onLongPressHabit = (index, pressedHabit) => {
    // already completed do nothing
    if (
      pressedHabit.dateLastCompleted != null &&
      isToday(new Date(pressedHabit.dateLastCompleted))
    ) {
      return pressedHabit;
    }

    return updateHabit(index, pressedHabit, 'increment');
  };

  const [habits, setHabits] = useState([]);
  const [isLoggedIn, setLoggedIn] = useState(true);

  const HabitStack = createNativeStackNavigator();

  // Fetch all streaks for the user only once
  React.useEffect(() => {
    axios({
      method: 'get',
      url: `${baseUrl}/get-streak-by-user/${userid}`,
    }).then(response => {
      setHabits(response.data);
      console.log(response.data);
    });
  }, []);

  const type = 'localNotification';
  PushNotificationIOS.addEventListener(type, onRemoteNotification);

  function onRemoteNotification(notification) {
    const actionIdentifier = notification.getActionIdentifier();

    // TODO: mark as completed will increment everything
    console.log('Handling notification within app');
    console.log(notification);
    if (actionIdentifier == 'complete') {
      const notifStreakMessage = notification.getMessage();
      const newHabits = habits.slice();
      console.log(habits.count);

      for (let i = 0; i < habits.length; i++) {
        console.log(habits[i].streakName);
        if (notifStreakMessage.includes(habits[i].streakName)) {
          console.log('Incremented count');
          newHabits[i].completionCount += 1;
          updateHabit(i, newHabits[i], 'increment');
          navigationRef.current.goBack();
        }
      }
    }
  }

  const appComp = (
    <NavigationContainer ref={navigationRef}>
      <HabitStack.Navigator>
        <HabitStack.Screen
          name="Streaks"
          options={{
            headerRight: () => (
              <TouchableOpacity
                onPress={() =>
                  navigationRef.current.navigate('NewHabit', {
                    tappedHabit: null,
                    onHabitChange: updateHabit,
                    index: -1,
                  })
                }>
                <FontAwesomeIcon icon={faPlus} />
              </TouchableOpacity>
            ),
          }}>
          {props => (
            <AnimatedCircleGroup
              isGroup={false}
              habits={habits}
              onTapHabit={onTapHabit}
              onLongPressHabit={onLongPressHabit}
            />
          )}
        </HabitStack.Screen>
        <HabitStack.Screen
          options={({route}) => ({
            title: route.params.tappedHabit.name,
          })}
          name="ViewHabit"
          component={ViewHabit}
        />
        <HabitStack.Screen name="EditHabit" component={EditHabit} />
        <HabitStack.Screen name="NewHabit" component={EditHabit} />
        <HabitStack.Screen name="GroupHabit" component={GroupHabit} />
      </HabitStack.Navigator>
    </NavigationContainer>
  );

  const logInComp = (
    <LoginScreen
      onLoginPress={() => {
        setLoggedIn(true);
      }}
      onEmailChange={email => {}}
      onPasswordChange={password => {}}
      disableSocialButtons
      disableDivider
      haveAccountText={''}></LoginScreen>
  );

  setNotificationCategories();

  return isLoggedIn ? appComp : logInComp;
};

const styles = StyleSheet.create({});

export default App;
