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

export const GroupHabit = ({route, navigation}) => {
  const [habit, setHabit] = useState(
    route.params.tappedHabit == null ? undefined : route.params.tappedHabit,
  );

  const onHabitChange = (index, habit) => {
    route.params.onHabitChange(index, habit);
    setHabit(habit);
  };

  navigation.setOptions({
    title: habit.name,
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

  const habitStreak = habit != null ? habit.streak : 1;
  const [viewDimensions, setViewDimensions] = useState(undefined);

  return (
    <AnimatedCircleGroup
      habits={[habit.groupUserIds, habit].flat()}
      isGroup
      // TODO: do this
      onTapHabit={() => {}}
      onLongPressHabit={() => {}}
    />
  );
};
