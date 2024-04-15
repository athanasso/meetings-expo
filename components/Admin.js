import React, { useState, useEffect } from "react";
import { View, Button, StyleSheet, TextInput, Alert, Text } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import firebase from 'firebase/compat/app';
import { Calendar } from "react-native-calendars";

const AdminScreen = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [meetingName, setMeetingName] = useState('');
  const [numUsers, setNumUsers] = useState('');
  const [meetings, setMeetings] = useState({});
  const [selectedMeeting, setSelectedMeeting] = useState(null);

  const handleScheduleMeeting = async () => {
    try {
      if (!selectedDate || !meetingName || !numUsers) {
        Alert.alert('Error', 'Please fill in all fields.');
        return;
      }

      // Convert selectedDate to Firestore Timestamp
      const timestamp = firebase.firestore.Timestamp.fromDate(selectedDate);

      // Update meeting details in Firestore
      await firebase.firestore().collection('meetings').add({
        name: meetingName,
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

  useEffect(() => {
    // Fetch meetings from Firestore
    const fetchMeetings = async () => {
      try {
        const meetingsSnapshot = await firebase
          .firestore()
          .collection("meetings")
          .get();
        const fetchedMeetings = {};
        meetingsSnapshot.forEach((doc) => {
          const meetingData = doc.data();
          const meetingDate = new Date(meetingData.date.toDate());
          const markedDate = meetingDate.toISOString().split("T")[0];
          fetchedMeetings[markedDate] = { marked: true, dotColor: "blue" };
        });
        setMeetings(fetchedMeetings);
      } catch (error) {
        console.error("Error fetching meetings:", error);
      }
    };

    fetchMeetings();
  }, []);

  const handleMeetingPress = async (date) => {
    try {
      const meetingDoc = await firebase
        .firestore()
        .collection("meetings")
        .get();
        meetingDoc.forEach((doc) => {
          if (doc.data().date.toDate().toISOString().split("T")[0] === date) {
            setSelectedMeeting({
              id: doc.id, // Save document ID for updating later
              date: doc.data().date.toDate().toLocaleDateString(), // Format date
              availableSeats: doc.data().availableSeats,
              attendees: doc.data().attendees || [],
            });
          }
        });
    } catch (error) {
      console.error("Error fetching meeting details:", error);
      Alert.alert("Error", "Failed to fetch meeting details");
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
        placeholder="Meeting Name"
        value={meetingName}
        onChangeText={text => setMeetingName(text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Number of Users"
        value={numUsers}
        onChangeText={text => setNumUsers(text)}
        keyboardType="numeric"
      />
      <Button title="Schedule Meeting" onPress={handleScheduleMeeting} />

      <Calendar
        markedDates={meetings}
        onDayPress={(day) => handleMeetingPress(day.dateString)}
        />
        <View style={styles.meetingDetailsContainer}>
        {selectedMeeting && (
          <>
            <Text style={styles.meetingDetails}>
              Meeting Date: {selectedMeeting.date}
            </Text>
            <Text style={styles.meetingDetails}>
              Available Seats: {selectedMeeting.availableSeats}
            </Text>
          </>
        )}
      </View>
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
  meetingDetailsContainer: {
    padding: 20,
    backgroundColor: "#f0f0f0",
  },
  meetingDetails: {
    fontSize: 16,
    marginBottom: 10,
  },
});
  
  export default AdminScreen;