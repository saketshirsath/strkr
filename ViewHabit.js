import React, {useCallback, useState} from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  SafeAreaView,
} from 'react-native';
import {useGravityAnimation} from './useGravityAnimation';
import Animated from 'react-native-reanimated';

export const ViewHabit = ({route, navigation}) => {
  const [habit, setHabit] = useState(
    route.params.tappedHabit == null ? undefined : route.params.tappedHabit,
  );
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
            Total Times Completed: {habit.streak}
          </Text>
          <Text style={{textAlign: 'center'}}>
            Last Time Completed: Yesterday
          </Text>
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
