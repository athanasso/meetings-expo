import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet, Button, Alert, ScrollView } from "react-native";
import { Calendar } from "react-native-calendars";
import firebase from "firebase/compat/app";
import { useUser } from "../userContext/UserContext";
import AsyncStorage from '@react-native-async-storage/async-storage';

const CalendarScreen = () => {
  const { userEmail } = useUser();

  const [meetings, setMeetings] = useState({});
  const [selectedMeetings, setSelectedMeetings] = useState([]);

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
            }
        } catch (error) {
            console.error('Error retrieving user token: ', error);
        }
    };

    checkUserToken();
  }, []);

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
      console.log("Selected Meetings:", selectedMeetings); // Add this line
    } catch (error) {
      console.error("Error fetching meeting details:", error);
      Alert.alert("Error", "Failed to fetch meeting details");
    }
  };  

  const handleJoinMeeting = async (meetingId, availableSeats, attendees) => {
    try {
      // Check if user's email is already in the attendees array
      const isUserAlreadyJoined = attendees.includes(userEmail);

      if (isUserAlreadyJoined) {
        Alert.alert('Already Joined', 'You have already joined this meeting.');
        return; // Exit the function
      }

      if (availableSeats > 0) {
        // Update availableSeats and add user to the meeting
        await firebase.firestore().collection('meetings').doc(meetingId).update({
          availableSeats: availableSeats - 1,
          // Add user's email to an array of attendees
          attendees: firebase.firestore.FieldValue.arrayUnion(userEmail),
        });

        // Fetch meetings from Firestore again to refresh the calendar
        fetchMeetings();

        Alert.alert('Success', 'You have joined the meeting.');
      } else {
        Alert.alert('Error', 'No available seats in the meeting.');
      }
    } catch (error) {
      console.error('Error joining meeting:', error);
      Alert.alert('Error', 'Failed to join the meeting.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
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
            <Button
              title={meeting.attendees.includes(userEmail) ? "Already Joined" : "Join Meeting"}
              onPress={() => handleJoinMeeting(meeting.id, meeting.availableSeats, meeting.attendees)}
              disabled={meeting.attendees.includes(userEmail)}
            />
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
    backgroundColor: "#fff",
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

export default CalendarScreen;
