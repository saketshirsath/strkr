import React, {useCallback, useState} from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  SafeAreaView,
  TextInput,
} from 'react-native';
import {useGravityAnimation} from './useGravityAnimation';
import Animated from 'react-native-reanimated';

export const EditHabit = ({route, navigation}) => {
  const [habit, setHabit] = useState(
    route.params.tappedHabit == null ? undefined : route.params.tappedHabit,
  );
  return (
    <SafeAreaView>
      <TextInput
        placeholder={'Streak Name'}
        style={styles.input}
        value={habit.name}></TextInput>
      <Text>{JSON.stringify(habit)}</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
  },
});
