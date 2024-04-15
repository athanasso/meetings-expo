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
  const [selectedMeetings, setSelectedMeetings] = useState([]);

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
       // Create a range of dates for the selected day
      const selectedDate = new Date(date);
      const startOfDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
      const endOfDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() + 1);

      // Query meetings within the selected day range
      const meetingsSnapshot = await firebase
        .firestore()
        .collection("meetings")
        .where("date", ">=", firebase.firestore.Timestamp.fromDate(startOfDay))
        .where("date", "<", firebase.firestore.Timestamp.fromDate(endOfDay))
        .get();
  
      const selectedMeetings = [];
      meetingsSnapshot.forEach((doc) => {
        selectedMeetings.push({
          id: doc.id,
          name: doc.data().name,
          date: doc.data().date.toDate().toLocaleString("en-US", { 
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            timeZoneName: 'short' 
          }),
          availableSeats: doc.data().availableSeats,
          attendees: doc.data().attendees || [],
        });
      });
  
      setSelectedMeetings(selectedMeetings);
      console.log("Selected Meetings:", selectedMeetings); // Add this line
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
        {selectedMeetings && selectedMeetings.map((meeting, index) => (
          <View key={index}>
            <Text style={styles.meetingDetails}>
              Meeting Name: {meeting.name}
            </Text>
            <Text style={styles.meetingDetails}>
              Meeting Date: {meeting.date}
            </Text>
            <Text style={styles.meetingDetails}>
              Available Seats: {meeting.availableSeats}
            </Text>
            {index !== selectedMeetings.length - 1 && <View style={styles.divider} />}
          </View>
        ))}
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
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginVertical: 10,
  },
});
  
  export default AdminScreen;