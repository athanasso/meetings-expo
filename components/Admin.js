import React, { useState, useEffect } from "react";
import { View, Button, StyleSheet, TextInput, Alert, Text, ScrollView, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import firebase from 'firebase/compat/app';
import { Calendar } from "react-native-calendars";
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AdminScreen = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [meetingName, setMeetingName] = useState('');
  const [numUsers, setNumUsers] = useState('');
  const [meetings, setMeetings] = useState({});
  const [selectedMeetings, setSelectedMeetings] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');

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

      // Fetch meetings from Firestore again to refresh the calendar
      fetchMeetings();

      // Inform the admin that the meeting is scheduled
      Alert.alert('Meeting Scheduled', 'The meeting has been scheduled successfully.');
    } catch (error) {
      console.error('Error scheduling meeting:', error);
      Alert.alert('Error', 'Failed to schedule meeting');
    }
  };

  useEffect(() => {
    const checkUserToken = async () => {
        try {
            const userToken = await AsyncStorage.getItem('userToken'); // Ensure AsyncStorage operation is awaited
            console.log('User token:', userToken);
            if (!userToken) {
                navigation.navigate('Login');
            } else {
                // Fetch data and perform other actions if user token exists
                fetchMeetings();
                fetchUsers();
            }
        } catch (error) {
            console.error('Error retrieving user token: ', error);
        }
    };

    checkUserToken();
  }, []);

  const fetchUsers = async () => {
    try {
      const usersSnapshot = await firebase
        .firestore()
        .collection("users")
        .where("userType", "==", "user") 
        .get();
      const fetchedUsers = [];
      usersSnapshot.forEach((doc) => {
        fetchedUsers.push({
          id: doc.id,
          name: doc.data().name,
          surname: doc.data().surname,
          email: doc.data().email,
        });
      });
      setUsers(fetchedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

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
      console.log("Selected Meetings:", selectedMeetings);
    } catch (error) {
      console.error("Error fetching meeting details:", error);
      Alert.alert("Error", "Failed to fetch meeting details");
    }
  };  

  const handleDeleteMeeting = async (meetingId) => {
    try {
      // Delete the meeting from Firestore
      await firebase.firestore().collection('meetings').doc(meetingId).delete();

      // Fetch meetings from Firestore again to refresh the calendar
      fetchMeetings();

      setSelectedMeetings([]); // Clear the selected meetings

      // Inform the admin that the meeting has been deleted
      Alert.alert('Meeting Deleted', 'The meeting has been deleted successfully.');
    } catch (error) {
      console.error('Error deleting meeting:', error);
      Alert.alert('Error', 'Failed to delete meeting');
    }
  };

  const handleAddUserToMeeting = async (meetingId, availableSeats, index) => {
    try {
      // Check if a user and meeting are selected
      const selectedUserEmail = selectedUser[`meeting_${index}`];
      if (!selectedUserEmail || meetingId.length === 0) {
        Alert.alert('Error', 'Please select a user and a meeting.');
        return;
      }

      // Check if the user's email is already in the meeting attendees list
      const meeting = selectedMeetings.find(meeting => meeting.id === meetingId);
      if (meeting && meeting.attendees.includes(selectedUserEmail)) {
        Alert.alert('Error', 'User is already in the meeting.');
        return;
      }

      if (availableSeats > 0) {
        // Update availableSeats and add user to the meeting
        await firebase.firestore().collection('meetings').doc(meetingId).update({
          availableSeats: availableSeats - 1,
          // Add user's email to an array of attendees
          attendees: firebase.firestore.FieldValue.arrayUnion(selectedUserEmail),
        });
      }

      // Fetch meetings again to refresh the list
      fetchMeetings();

      // Inform the admin that the user has been added to the meeting
      Alert.alert('User Added', 'The user has been successfully added to the meeting.');
    } catch (error) {
      console.error('Error adding user to meeting:', error);
      Alert.alert('Error', 'Failed to add user to meeting');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
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
            <TouchableOpacity onPress={() => handleDeleteMeeting(meeting.id)} style={styles.deleteButton}>
              <Text style={styles.buttonText}>Delete Meeting</Text>
            </TouchableOpacity>

            <Text style={styles.label}>Select User to Add to Meeting:</Text>
            <Picker
              selectedValue={selectedUser[`meeting_${index}`]}
              onValueChange={(itemValue) => setSelectedUser(prevState => ({ ...prevState, [`meeting_${index}`]: itemValue }))}
              style={styles.picker}
            >
              <Picker.Item label="Select User" value="" />
              {users
                .filter(user => !meeting.attendees.includes(user.email))
                .map((user) => (
                  <Picker.Item key={user.id} label={`${user.name} ${user.surname}`} value={user.email} />
                ))}
            </Picker>
            <Button title="Add User to Meeting" onPress={() => handleAddUserToMeeting(meeting.id, meeting.availableSeats, index)} />
            {index !== selectedMeetings.length - 1 && <View style={styles.divider} />}
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
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
  deleteButton: {
    backgroundColor: '#dc143c',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});
  
  export default AdminScreen;