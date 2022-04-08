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
export const navigationRef = createRef();

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
// "streakID"
// "completionCount"
// "dateLastCompleted":
// "streakName"
// "primaryColor"
// "frequencySetting":
// "secondaryColor":
// "isGroupStreak":
// "friends" : [
// K
// "userID"
// "firstName"
// "lastName"
// "primaryColor"
// "secondaryColor"
// "completionCount":
// ] # optional if isGroupStreak
// == 1
// "streakLog" : [
// "dateCompleted"
// "completionCount"
// ] # max len == 7
// 7

export const isToday = date => {
  const today = new Date();
  return (
    date.getDate() == today.getDate() &&
    date.getMonth() == today.getMonth() &&
    date.getFullYear() == today.getFullYear()
  );
};

const App: () => Node = () => {
  const updateHabit = (index, newHabit, updateType) => {
    console.log(updateType);
    if (updateType != null && updateType == 'delete') {
      let newHabits = habits.slice();
      newHabits = newHabits.filter(h => h.streakID != newHabit.streakID);
      setHabits(newHabits);
    } else {
      const newHabits = habits.slice();
      if (index == -1) {
        newHabits.push(newHabit);
        setHabits(newHabits);
        return newHabit;
      } else {
        newHabits[index].streakName = newHabit.streakName;
        newHabits[index].primaryColor = newHabit.primaryColor;
        newHabits[index].friends = newHabit.friends;
        newHabits[index].dateLastCompleted = newHabit.dateLastCompleted;
        setHabits(newHabits);
        return newHabit[index];
      }
    }

    // TODO: send post with data
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

    pressedHabit.completionCount += 1;
    pressedHabit.dateLastCompleted = new Date().toISOString();
    updateHabit(index, pressedHabit);
    return pressedHabit;
  };

  const [habits, setHabits] = useState(dummyData);
  const [isLoggedIn, setLoggedIn] = useState(true);

  const HabitStack = createNativeStackNavigator();

  // Fetch all streaks for the user only once
  React.useEffect(() => {
    const userid = 'test@test.com';
    axios({
      method: 'get',
      url: `${baseUrl}/get-streak-by-user/${userid}`,
    }).then(response => {
      setHabits(response.data);
      console.log(response.data);
    });
  }, []);

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

  return isLoggedIn ? appComp : logInComp;
};

const styles = StyleSheet.create({});

export default App;
