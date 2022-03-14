import React, {useState, createRef} from 'react';
import type {Node} from 'react';
import {Habit} from './Model/Habit';
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

export const navigationRef = createRef();

const App: () => Node = () => {
  const updateHabit = (index, newHabit) => {
    const newHabits = habits.slice();
    if (index == -1) {
      newHabits.push(newHabit);
    } else {
      newHabits[index].streak = newHabit.streak;
      newHabits[index].name = newHabit.name;
      newHabits[index].color = newHabit.color;
      newHabits[index].groupUserIds = newHabit.groupUserIds;
    }
    setHabits(newHabits);
  };

  const onTapHabit = (index, tappedHabit) => {
    if (tappedHabit.groupUserIds.length == 0) {
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
      });
    }
  };

  const onLongPressHabit = (index, pressedHabit) => {
    console.log('User long pressed ' + pressedHabit.name);
    pressedHabit.streak += 1;
    updateHabit(index, pressedHabit);
    console.log('Streak ' + habits[index].streak);
  };

  const nickRead = new Habit('Read', '#001219', 22, 'Nick', []);
  const ashleyRead = new Habit('Read', '#94D2BD', 8, 'Ashley', []);
  const carlotaRead = new Habit('Read', '#EE9B00', 15, 'Carlota', []);

  const hardcodedHabits = [
    new Habit('Read', '#005F73', 25, null, [nickRead, ashleyRead, carlotaRead]),
    new Habit('Study', '#0A9396', 5, null, []),
    new Habit('Meditate', '#CA6702', 8, null, []),
    new Habit('Wakeup Early', '#BB3E03', 15, null, []),
    new Habit('Walk Dog', '#AE2012', 30, null, []),
  ];

  const [habits, setHabits] = useState(hardcodedHabits);

  const HabitStack = createNativeStackNavigator();
  return (
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
};

const styles = StyleSheet.create({});

export default App;
