import React, {useCallback, useState} from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  SafeAreaView,
} from 'react-native';
import {BarChart, LineChart} from 'react-native-chart-kit';

export const HabitGraph = ({habit, width, height}) => {
  const [graphHabit, setGraphHabit] = useState(habit);

  const data = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    datasets: [
      {
        data: [20, 21, 22, 23, 24],
        strokeWidth: 2,
      },
    ],
  };

  return (
    <BarChart
      data={data}
      width={width}
      height={height}
      chartConfig={{
        backgroundGradientFrom: graphHabit.primaryColor,
        backgroundGradientTo: graphHabit.primaryColor,
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        style: {
          borderRadius: 16,
        },
        propsForDots: {
          r: '2',
          strokeWidth: '2',
        },
      }}
      style={{
        borderRadius: 16,
      }}
    />
  );
};

export const ViewHabit = ({route, navigation}) => {
  const [habit, setHabit] = useState(
    route.params.tappedHabit == null ? undefined : route.params.tappedHabit,
  );

  const onHabitChange = (index, habit) => {
    route.params.onHabitChange(index, habit);
    setHabit(habit);
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
  const handleLayout = useCallback(event => {
    const {width, height} = event.nativeEvent.layout;
    setViewDimensions({width, height});
  }, []);
  const isCanvasReady = viewDimensions !== undefined;

  return (
    <SafeAreaView style={{flex: 1}} onLayout={handleLayout}>
      {isCanvasReady && (
        <View
          style={{
            alignItems: 'center',
            flex: 1,
            justifyContent: 'space-between',
          }}>
          <View>
            <Text style={{marginTop: 25, textAlign: 'center'}}>
              Streak: {habit.completionCount}
            </Text>
            <Text style={{textAlign: 'center', marginBottom: 10}}>
              Last Time Completed: Yesterday
            </Text>
            <HabitGraph
              habit={habit}
              width={viewDimensions.width * 0.9}
              height={250}></HabitGraph>
          </View>

          <TouchableOpacity
            onPress={() => {
              console.log(isCanvasReady);
              let newHabit = {...habit};
              newHabit.completionCount += 1;

              onHabitChange(route.params.index, newHabit);
            }}
            style={{
              justifyContent: 'flex-end',
              marginBottom: 36,
              backgroundColor: habit.primaryColor,
              color: 'white',
              padding: 12,
              borderRadius: 20,
            }}>
            <Text style={{color: 'white'}}>Complete for Today</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};
