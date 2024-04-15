import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet, Button, Alert } from "react-native";
import { Calendar } from "react-native-calendars";
import firebase from "firebase/compat/app";
import { useUser } from "../UserContext";

const CalendarScreen = () => {
  const { userEmail } = useUser();

  const [meetings, setMeetings] = useState({});
  const [selectedMeeting, setSelectedMeeting] = useState(null);

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
          }
        });
    } catch (error) {
      console.error("Error fetching meeting details:", error);
      Alert.alert("Error", "Failed to fetch meeting details");
    }
  };

  const handleJoinMeeting = async () => {
    try {
      if (selectedMeeting.availableSeats > 0) {
        // Check if user's email is already in the attendees array
        selectedMeeting.attendees.forEach((attendee) => {
          if (attendee === userEmail) {
            isUserAlreadyJoined = true;
            return;
          }
        });

        if (isUserAlreadyJoined) {
          Alert.alert('Already Joined', 'You have already joined this meeting.');
          return; // Exit the function
        }
        // Update availableSeats and add user to the meeting
        await firebase.firestore().collection('meetings').doc(selectedMeeting.id).update({
          availableSeats: selectedMeeting.availableSeats - 1,
          // Add user's name to an array of attendees
          attendees: firebase.firestore.FieldValue.arrayUnion(userEmail), // Replace with actual user's name
        });
        
        // Fetch updated meeting details
        handleMeetingPress(selectedMeeting.date);
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
    <View style={styles.container}>
      <Calendar
        markedDates={meetings}
        onDayPress={(day) => handleMeetingPress(day.dateString)}
      />
      <View style={styles.meetingDetailsContainer}>
        {selectedMeeting && (
          <>
            <Text style={styles.meetingDetails}>
              Meeting Name: {selectedMeeting.name}
            </Text>
            <Text style={styles.meetingDetails}>
              Meeting Date: {selectedMeeting.date}
            </Text>
            <Text style={styles.meetingDetails}>
              Available Seats: {selectedMeeting.availableSeats}
            </Text>
            <Button title="Join Meeting" onPress={handleJoinMeeting} />
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
});

export default CalendarScreen;
