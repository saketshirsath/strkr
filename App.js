import React, {useState, createRef} from 'react';
import type {Node} from 'react';
import {Habit} from './Model/Habit';
import {
  StyleSheet,
  Text,
  useColorScheme,
  View,
  TouchableOpacity,
} from 'react-native';
import {NavigationContainer, useNavigation} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import {AnimatedCircleGroup} from './Bubbles/Circle';
import {EditHabit} from './EditHabit';
import {ViewHabit} from './ViewHabit';

export const navigationRef = createRef();

const App: () => Node = () => {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    flex: 1,
  };

  const onTapHabit = (index, tappedHabit) => {
    navigationRef.current.navigate('View Habit', {tappedHabit});
  };

  const onLongPressHabit = (index, pressedHabit) => {
    console.log('User long pressed ' + pressedHabit.name);
    const newHabits = habits.slice();
    newHabits[index].streak += 1;
    setHabits(newHabits);
    console.log('Streak ' + habits[index].streak);
  };

  const hardcodedHabits = [
    new Habit('Read', '#005F73', 25, []),
    new Habit('Study', '#0A9396', 5, []),
    new Habit('Meditate', '#CA6702', 8, []),
    new Habit('Wakeup Early', '#BB3E03', 15, []),
    new Habit('Walk Dog', '#AE2012', 30, []),
  ];

  const [habits, setHabits] = useState(hardcodedHabits);

  // TODO: use options={({ route }) => ({ title: route.params.name })}

  const HabitStack = createNativeStackNavigator();
  return (
    <NavigationContainer ref={navigationRef}>
      <HabitStack.Navigator>
        <HabitStack.Screen
          name="Habits"
          options={{
            headerRight: () => (
              <TouchableOpacity
                onPress={() =>
                  navigationRef.current.navigate('New Habit', {
                    tappedHabit: null,
                  })
                }>
                <Text style={{fontSize: 30}}>+</Text>
              </TouchableOpacity>
            ),
          }}>
          {props => (
            <AnimatedCircleGroup
              habits={habits}
              onTapHabit={onTapHabit}
              onLongPressHabit={onLongPressHabit}
            />
          )}
        </HabitStack.Screen>
        <HabitStack.Screen
          options={{
            headerRight: () => (
              <TouchableOpacity
                onPress={() =>
                  navigationRef.current.navigate('Edit Habit', {
                    tappedHabit: null,
                  })
                }>
                <Text>Edit</Text>
              </TouchableOpacity>
            ),
          }}
          name="View Habit"
          component={ViewHabit}
        />
        <HabitStack.Screen
          options={{
            headerRight: () => (
              <TouchableOpacity
                onPress={() =>
                  navigationRef.current.navigate('Save', {
                    tappedHabit: null,
                  })
                }>
                <Text>Save</Text>
              </TouchableOpacity>
            ),
          }}
          name="Edit Habit"
          component={EditHabit}
        />
        <HabitStack.Screen name="New Habit" component={EditHabit} />
      </HabitStack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({});

export default App;
