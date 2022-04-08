import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import React, {useCallback, useState} from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  SafeAreaView,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import {navigationRef} from './App';
import {faCheck, faX} from '@fortawesome/free-solid-svg-icons';
import {useNavigation} from '@react-navigation/native';

export const colors = [
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
        alignContent: 'center',
        alignItems: 'center',
      }}>
      {index == selectedIndex ? (
        <FontAwesomeIcon
          size={10}
          style={{
            color: 'white',
          }}
          icon={faCheck}></FontAwesomeIcon>
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
    tappedHabit == null ? '' : tappedHabit.streakName,
  );

  const [habitColor, setHabitColor] = useState(
    tappedHabit == null ? colors[0] : tappedHabit.primaryColor,
  );
  const [friends, setFriends] = useState(
    tappedHabit == null ? [] : tappedHabit.friends,
  );

  const onChangeColor = color => {
    setHabitColor(color);
  };

  navigation.setOptions({
    title:
      tappedHabit == null ? 'New Streak' : 'Edit ' + tappedHabit.streakName,
    headerRight: () => (
      <TouchableOpacity
        onPress={() => {
          navigationRef.current.goBack();

          updateHabit();
        }}>
        <Text>Save</Text>
      </TouchableOpacity>
    ),
  });

  const updateHabit = () => {
    const streak = tappedHabit == null ? 7 : tappedHabit.completionCount;
    const ownerName = tappedHabit == null ? null : tappedHabit.firstName;
    if (tappedHabit == null) {
      const newHabit = {
        completionCount: 1,
        streakName: habitName,
        primaryColor: habitColor,
        frequencySetting: 1,
        secondaryColor: habitColor,
      };
      onHabitChange(-1, newHabit);
    } else {
      const clone = JSON.parse(JSON.stringify(tappedHabit));
      clone.streakName = habitName;
      clone.completionCount = streak;
      clone.friends = friends;
      clone.primaryColor = habitColor;
      if (ownerName != null) {
        clone.firstName = ownerName;
      }
      onHabitChange(index, clone);
    }
  };

  const updateFriend = (friend, isAdd) => {
    if (tappedHabit) {
      let newFriends = friends != null ? friends.slice() : [];
      let clone = {...tappedHabit};

      if (isAdd) {
        const friendColor = colors[Math.floor(Math.random() * colors.length)];
        clone.primaryColor = friendColor;
        clone.secondaryColor = friendColor;
        clone.completionCount = 1;
        clone.firstName = friend.split('@')[0];
        clone.userID = friend;
        newFriends.push(clone);
      } else {
        newFriends = newFriends.filter(f => {
          const trimmedOwnerName = f.userID.trim();
          return trimmedOwnerName != friend.trim();
        });
      }

      setFriends(newFriends);
      updateHabit();
    }
  };

  const selectedInviteFriends = () => {
    Alert.prompt(
      "Friend's Email",
      "Enter a friend's email to form a group habit with them.",
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: text => {
            console.log('called');
            updateFriend(text, true);
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      <View style={{flex: 0.9}}>
        <TextInput
          onChangeText={setHabitName}
          placeholder={'Streak Name'}
          style={styles.input}
          value={habitName}></TextInput>
        <HabitColorPicker
          onChangeColor={onChangeColor}
          colors={colors}
          color={habitColor}></HabitColorPicker>
        <View
          style={{
            marginTop: 10,
            alignItems: 'center',
          }}>
          <TouchableOpacity
            onPress={selectedInviteFriends}
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
          <View style={{marginTop: 15}}>
            {friends == null || friends.length == 0
              ? null
              : friends.map(friend => (
                  <View style={{flexDirection: 'row'}}>
                    <Text>
                      {friend.firstName == null
                        ? friend.userID
                        : friend.firstName}
                    </Text>
                    <TouchableOpacity
                      onPress={() => updateFriend(friend.userID, false)}>
                      <FontAwesomeIcon
                        color={'#d00000'}
                        icon={faX}></FontAwesomeIcon>
                    </TouchableOpacity>
                  </View>
                ))}
          </View>
        </View>
      </View>

      <View
        style={{
          flex: 0.1,
        }}>
        {tappedHabit != null ? (
          <TouchableOpacity
            onPress={() => {
              Alert.alert(
                'Delete Streak',
                'Are you sure you want to delete this streak?',
                [
                  {
                    text: 'Cancel',
                    style: 'cancel',
                  },
                  {
                    text: 'OK',
                    onPress: text => {
                      onHabitChange(index, tappedHabit, 'delete');
                      navigation.popToTop();
                    },
                  },
                ],
              );
            }}
            style={{
              backgroundColor: '#AE2012',
              color: 'white',
              padding: 12,
              alignItems: 'center',
            }}>
            <Text style={{color: 'white'}}>Delete Streak</Text>
          </TouchableOpacity>
        ) : null}
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
