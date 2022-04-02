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
import {log} from 'react-native-reanimated';

const baseUrl = 'https://elibe420n8.execute-api.us-east-1.amazonaws.com/dev';
export const navigationRef = createRef();

const dummyData = [
  {
    streakID: 1,
    completionCount: 1,
    dateLastCompleted: '2022-03-10',
    streakName: 'Read',
    primaryColor: '#001219',
    frequencySetting: 1,
    secondaryColor: '#001219',
    isGroupStreak: 0,
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
    completionCount: 7,
    dateLastCompleted: '2022-03-10',
    streakName: 'Workout',
    primaryColor: '#005F73',
    frequencySetting: 1,
    secondaryColor: '#005F73',
    isGroupStreak: 1,
    friends: [
      {
        userID: 'bob@gmail.com',
        firstName: 'Nick',
        lastName: 'Grana',
        primaryColor: '#0A9396',
        secondaryColor: '#0A9396',
        completionCount: 15,
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

// https://elibe420n8.execute-api.us-east-1.amazonaws.com/dev/get-streak-by-user/{user}
const fetchStreaksForUser = async userid => {
  await axios({
    method: 'get',
    url: `${baseUrl}/get-streak-by-user/${userid}`,
  }).then(response => {
    console.log(response.data);
  });
};

const App: () => Node = () => {
  const updateHabit = (index, newHabit) => {
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
    fetchStreaksForUser('test@test.com');
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
