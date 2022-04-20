import React, {useCallback, useState} from 'react';
import {TouchableOpacity, Text} from 'react-native';
import {BarChart, LineChart} from 'react-native-chart-kit';
import {AnimatedCircleGroup} from './Bubbles/Circle';
import {navigationRef} from './App';

export const GroupHabit = ({route, navigation}) => {
  const [habit, setHabit] = useState(
    route.params.tappedHabit == null ? undefined : route.params.tappedHabit,
  );

  const onHabitChange = (index, habit, updateType) => {
    const returnedHabit = route.params.onHabitChange(index, habit, updateType);
    if (returnedHabit != null) {
      setHabit(returnedHabit);
    }
    return returnedHabit;
  };

  const onLongPressHabit = (index, pressedHabit) => {
    let newHabit = {...pressedHabit};
    const returnedHabit = route.params.onLongPressHabit(index, newHabit);
    console.log('returnedHabit in onLongPressHabit');
    console.log(returnedHabit);
    setHabit(returnedHabit);
  };

  const onTapHabit = (index, tappedHabit) => {
    navigationRef.current.navigate('ViewHabit', {
      index,
      tappedHabit,
      onHabitChange: onHabitChange,
    });
  };

  navigation.setOptions({
    title: habit != null && habit.streakName,
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
      habits={[habit.friends == null ? [] : habit.friends, habit].flat()}
      isGroup
      onTapHabit={onTapHabit}
      onLongPressHabit={onLongPressHabit}
      allowTapHabit={tapped => tapped.userID == habit.userID}
    />
  );
};
