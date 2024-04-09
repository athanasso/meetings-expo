import React, { useState } from 'react';
import { View, Button, StyleSheet, TextInput, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import firebase from 'firebase/compat/app';

const AdminScreen = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [numUsers, setNumUsers] = useState('');

  const handleScheduleMeeting = async () => {
    try {
      // Convert selectedDate to Firestore Timestamp
      const timestamp = firebase.firestore.Timestamp.fromDate(selectedDate);

      // Update meeting details in Firestore
      await firebase.firestore().collection('meetings').add({
        date: timestamp,
        numUsers: parseInt(numUsers),
        availableSeats: parseInt(numUsers),
      });

      // Inform the admin that the meeting is scheduled
      Alert.alert('Meeting Scheduled', 'The meeting has been scheduled successfully.');
    } catch (error) {
      console.error('Error scheduling meeting:', error);
      Alert.alert('Error', 'Failed to schedule meeting');
    }
  };

  return (
    <View style={styles.container}>
     {!showDatePicker ? (
        <Button title="Select Date" onPress={() => setShowDatePicker(true)} />
      ) : (
        <DateTimePicker
          value={selectedDate}
          onChange={(event, date) => {
            setShowDatePicker(false); // Hide the date picker after selecting the date
            setSelectedDate(date);
          }}
          mode="date"
        />
      )}

    {!showTimePicker ? (
        <Button title="Select Time" onPress={() => setShowTimePicker(true)} />
      ) : (
        <DateTimePicker
          value={selectedDate}
          onChange={(event, date) => {
            setShowTimePicker(false); // Hide the time picker after selecting the date
            setSelectedDate(date);
          }}
          mode="time"
        />
      )}
      <TextInput
        style={styles.input}
        placeholder="Number of Users"
        value={numUsers}
        onChangeText={text => setNumUsers(text)}
        keyboardType="numeric"
      />
      <Button title="Schedule Meeting" onPress={handleScheduleMeeting} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    width: '80%',
    marginVertical: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
});
  
  export default AdminScreen;