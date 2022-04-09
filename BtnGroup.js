import React, {useState} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

// https://stackoverflow.com/questions/62621522/create-button-group-in-react-native-using-react-components
export const BtnGroup = ({onChangeDate}) => {
  const [selection, setSelection] = useState(1);
  const [date, setDate] = useState(new Date());

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate;
    setDate(currentDate);
    if (onChangeDate) {
      onChangeDate(currentDate);
    }
  };

  const betweenRange = (start, end) => {
    return date.getHours() >= start && date.getHours() <= end;
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={{fontSize: 20, fontWeight: 'bold', paddingBottom: 8}}>
        Reminders
      </Text>
      <View style={styles.btnGroup}>
        <TouchableOpacity
          style={[
            styles.btn,
            selection === 1 ? {backgroundColor: 'gray'} : null,
          ]}
          onPress={() => {
            setSelection(1);
            onChangeDate(null);
          }}>
          <Text
            style={[styles.btnText, selection === 1 ? {color: 'white'} : null]}>
            None
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.btn,
            selection !== 1 && betweenRange(0, 11)
              ? {backgroundColor: 'gray'}
              : null,
          ]}
          onPress={() => {
            setSelection(2);
            const newDate = new Date();
            newDate.setHours(9, 0, 0);
            setDate(newDate);
            onChangeDate(newDate);
          }}>
          <Text
            style={[
              styles.btnText,
              selection !== 1 && betweenRange(0, 11) ? {color: 'white'} : null,
            ]}>
            Morning
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.btn,
            selection !== 1 && betweenRange(12, 17)
              ? {backgroundColor: 'gray'}
              : null,
          ]}
          onPress={() => {
            setSelection(3);
            const newDate = new Date();
            newDate.setHours(12, 0, 0);
            setDate(newDate);
            onChangeDate(newDate);
          }}>
          <Text
            style={[
              styles.btnText,
              selection != 1 && betweenRange(12, 17) ? {color: 'white'} : null,
            ]}>
            Afternoon
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.btn,
            selection != 1 && betweenRange(18, 23)
              ? {backgroundColor: 'gray'}
              : null,
          ]}
          onPress={() => {
            setSelection(4);
            const newDate = new Date();
            newDate.setHours(18, 0, 0);
            setDate(newDate);
            onChangeDate(newDate);
          }}>
          <Text
            style={[
              styles.btnText,
              selection != 1 && betweenRange(18, 23) ? {color: 'white'} : null,
            ]}>
            Evening
          </Text>
        </TouchableOpacity>
      </View>
      {selection == 1 ? null : (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          <DateTimePicker
            testID="dateTimePicker"
            value={date}
            mode={'time'}
            onChange={onChange}
            style={{width: 100, height: 50}}
          />
          <Text style={{padding: 5}}>Everyday</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  btnGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 0.25,
    borderColor: 'gray',
    height: 30,
  },
  btn: {
    flex: 1,
    borderRightWidth: 0.25,
    borderLeftWidth: 0.25,
    borderColor: 'gray',
    height: 30,
  },
  btnText: {
    textAlign: 'center',
    paddingVertical: 6,
    fontSize: 14,
    // backgroundColor: 'red',
    height: 30,
  },
});
