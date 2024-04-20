import React from 'react';
import { TouchableOpacity, Text, Alert, StyleSheet } from 'react-native';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LogoutButton = ({ navigation }) => {
    const handleLogout = async () => {
        try {
            await firebase.auth().signOut();
            await AsyncStorage.removeItem('userToken');
            navigation.navigate('Login');
        } catch (error) {
            console.error('Error logging out:', error);
            Alert.alert('Error', 'Failed to log out. Please try again.');
        }
    };

    return (
        <TouchableOpacity style={styles.button} onPress={handleLogout}>
            <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        marginRight: 10,
        padding: 5,
        borderRadius: 5,
        backgroundColor: '#f00', 
    },
    buttonText: {
        color: '#fff', 
        fontWeight: 'bold',
    },
});

export default LogoutButton;