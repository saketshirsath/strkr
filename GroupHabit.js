import React, {useCallback, useState} from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  SafeAreaView,
} from 'react-native';
import {BarChart, LineChart} from 'react-native-chart-kit';
import {AnimatedCircleGroup} from './Bubbles/Circle';
import {navigationRef} from './App';

export const GroupHabit = ({route, navigation}) => {
  const [habit, setHabit] = useState(
    route.params.tappedHabit == null ? undefined : route.params.tappedHabit,
  );

  const onHabitChange = (index, habit) => {
    route.params.onHabitChange(index, habit);
    setHabit(habit);
  };

  const onLongPressHabit = (index, pressedHabit) => {
    route.params.onLongPressHabit(index, pressedHabit);
    pressedHabit.completionCount += 1;
    setHabit(pressedHabit);
  };

  const onTapHabit = (index, tappedHabit) => {
    navigationRef.current.navigate('ViewHabit', {
      index,
      tappedHabit,
      onHabitChange: onHabitChange,
    });
  };

  navigation.setOptions({
    title: habit.streakName,
    headerRight: () => (
      <TouchableOpacity
        onPress={() => {
          return navigation.navigate('EditHabit', {
            tappedHabit: habit,
            index: route.params.index,
            onHabitChange: onHabitChange,
          });
        }}>
        <Text>Edit</Text>
      </TouchableOpacity>
    ),
  });

  const habitStreak = habit != null ? habit.completionCount : 1;
  const [viewDimensions, setViewDimensions] = useState(undefined);

  return (
    <AnimatedCircleGroup
      habits={[habit.friends, habit].flat()}
      isGroup
      onTapHabit={onTapHabit}
      onLongPressHabit={onLongPressHabit}
      allowTapHabit={tapped => tapped.userID == habit.userID}
    />
  );
};
