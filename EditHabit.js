import React, {useCallback, useState} from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  SafeAreaView,
  TextInput,
  ScrollView,
} from 'react-native';
import {navigationRef} from './App';
import {Habit} from './Model/Habit';

export const HabitColorPicker = ({colors, color, onChangeColor}) => {
  const [selectedIndex, setSelectedIndex] = useState(
    colors.indexOf(color) == -1 ? 0 : colors.indexOf(color),
  );
  const [colorPalette, setColorPalette] = useState(colors);

  const colorViews = colorPalette.map((color, index) => (
    <TouchableOpacity
      key={index}
      onPress={() => {
        setSelectedIndex(index);
        onChangeColor(colors[index]);
      }}
      style={{
        width: 25,
        height: 25,
        backgroundColor: color,
        borderRadius: 20,
        justifyContent: 'center',
        margin: 8,
      }}>
      {index == selectedIndex ? (
        <Text
          style={{
            textAlign: 'center',
            textAlignVertical: 'center',
            color: 'white',
          }}>
          ✓
        </Text>
      ) : null}
    </TouchableOpacity>
  ));

  return (
    <View>
      <ScrollView
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
        }}
        showsHorizontalScrollIndicator={false}
        horizontal={true}>
        {colorViews}
      </ScrollView>
    </View>
  );
};

export const EditHabit = ({route, navigation}) => {
  const tappedHabit = route.params.tappedHabit;
  const index = route.params.index;
  console.log(route.params);
  const onHabitChange = route.params.onHabitChange;
  const [habitName, setHabitName] = useState(
    tappedHabit == null ? '' : tappedHabit.name,
  );

  const colors = [
    '#001219',
    '#005F73',
    '#0A9396',
    '#94D2BD',
    '#E9D8A6',
    '#EE9B00',
    '#CA6702',
    '#BB3E03',
    '#AE2012',
  ];

  const [habitColor, setHabitColor] = useState(
    tappedHabit == null ? colors[0] : tappedHabit.color,
  );

  const onChangeColor = color => {
    setHabitColor(color);
  };

  navigation.setOptions({
    title: tappedHabit == null ? 'New Streak' : 'Edit ' + tappedHabit.name,
    headerRight: () => (
      <TouchableOpacity
        onPress={() => {
          navigationRef.current.goBack();

          const streak = tappedHabit == null ? 7 : tappedHabit.streak;
          const ownerName = tappedHabit == null ? null : tappedHabit.ownerName;
          const groupIds = tappedHabit == null ? [] : tappedHabit.groupUserIds;
          onHabitChange(
            index,
            new Habit(habitName, habitColor, streak, ownerName, groupIds),
          );
        }}>
        <Text>Save</Text>
      </TouchableOpacity>
    ),
  });

  return (
    <SafeAreaView style={{flex: 1}}>
      <TextInput
        onChangeText={setHabitName}
        placeholder={'Streak Name'}
        style={styles.input}
        value={habitName}></TextInput>
      <HabitColorPicker
        onChangeColor={onChangeColor}
        colors={colors}
        color={habitColor}></HabitColorPicker>
      <View style={{marginTop: 10, alignItems: 'center'}}>
        <TouchableOpacity
          style={{
            backgroundColor: 'gray',
            color: 'white',
            padding: 12,
            borderRadius: 20,
            width: 150,
          }}>
          <Text
            style={{
              textAlign: 'center',
              color: 'white',
            }}>
            Invite Friends
          </Text>
        </TouchableOpacity>
      </View>
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
    borderColor: 'gray',
  },
});
