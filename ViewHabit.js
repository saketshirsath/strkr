import React, {useCallback, useState} from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  SafeAreaView,
} from 'react-native';
import {BarChart, LineChart} from 'react-native-chart-kit';

export const HabitGraph = ({habit}) => {
  const [graphHabit, setGraphHabit] = useState(habit);

  const data = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: [
      {
        data: [20, 45, 28, 80, 99],
        strokeWidth: 2,
      },
    ],
  };

  return (
    <BarChart
      data={data}
      width={350}
      height={250}
      chartConfig={{
        backgroundGradientFrom: graphHabit.color,
        backgroundGradientTo: graphHabit.color,
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

  return (
    <SafeAreaView style={{flex: 1}}>
      <View
        style={{
          alignItems: 'center',
          flex: 1,
          justifyContent: 'space-between',
        }}>
        <View>
          <Text style={{marginTop: 25, textAlign: 'center'}}>
            Streak: {habit.streak}
          </Text>
          <Text style={{textAlign: 'center', marginBottom: 10}}>
            Last Time Completed: Yesterday
          </Text>
          <HabitGraph habit={habit}></HabitGraph>
        </View>

        <TouchableOpacity
          style={{
            justifyContent: 'flex-end',
            marginBottom: 36,
            backgroundColor: habit.color,
            color: 'white',
            padding: 12,
            borderRadius: 20,
          }}>
          <Text style={{color: 'white'}}>Complete for Today</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};
