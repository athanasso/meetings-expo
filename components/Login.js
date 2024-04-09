import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import firebase from 'firebase/compat/app';
import { initializeApp } from "firebase/compat/app";
import 'firebase/compat/auth'; 
import 'firebase/compat/firestore';
import { useUser } from '../UserContext';

const firebaseConfig = {
    apiKey: "AIzaSyB14p1BBCXK2Fk3dX07gIKY8rLXrgIzDrY",
    authDomain: "expo-demo-ab1fe.firebaseapp.com",
    projectId: "expo-demo-ab1fe",
    storageBucket: "expo-demo-ab1fe.appspot.com",
    messagingSenderId: "885327824422",
    appId: "1:885327824422:web:f80305674eb6d9ddde48e7",
    measurementId: "G-BSMPTN6ZZZ"
};

if (!firebase.apps.length) {
firebase.initializeApp(firebaseConfig);
} else {
firebase.app(); 
}

const LoginScreen = ({ navigation }) => {
   const { setUserEmail } = useUser();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
  
    const handleLogin = () => {
        firebase
        .auth()
        .signInWithEmailAndPassword(email, password)
        .then(async () => {
          const user = firebase.auth().currentUser;
          if (user) {
            // Retrieve user profile from Firestore
            const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
            if (userDoc.exists) {
              const userType = userDoc.data().userType;
              // Check user type
              if (userType === 'admin') {
                // Navigate to admin screen
                navigation.navigate('Admin');
              } 
              if (userType === 'user'){
                // Navigate to regular user screen
                navigation.navigate('Calendar');
              }
              setUserEmail(email);
            } else {
              Alert.alert('Error', 'User profile not found');
            }
          } else {
            Alert.alert('Error', 'User not found');
          }
        })
        .catch(error => {
          Alert.alert('Error', error.message);
        });
    };
    //   firebase
    //     .auth()
    //     .signInWithEmailAndPassword(email, password)
    //     .then(() => {
    //       // Handle successful login
    //       Alert.alert('Login successful!');
          
    //     })
    //     .catch(error => {
    //       Alert.alert('Error', error.message);
    //     });

    return (
        <View style={styles.container}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            onChangeText={text => setEmail(text)}
            value={email}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            onChangeText={text => setPassword(text)}
            value={password}
            secureTextEntry
          />
          <Button title="Login" onPress={handleLogin} />
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.switchButton}>Don't have an Account? Register</Text>
          </TouchableOpacity>
        </View>
      );
    };

    const styles = StyleSheet.create({
        container: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#fff',
        },
        title: {
          fontSize: 24,
          fontWeight: 'bold',
          marginBottom: 20,
        },
        input: {
          width: '80%',
          height: 40,
          borderColor: '#ccc',
          borderWidth: 1,
          marginBottom: 20,
          paddingHorizontal: 10,
          borderRadius: 5,
        },
        button: {
          backgroundColor: '#007bff',
          paddingVertical: 10,
          paddingHorizontal: 20,
          borderRadius: 5,
        },
        buttonText: {
          color: '#fff',
          fontSize: 16,
          fontWeight: 'bold',
        },
        switchButton: {
            marginTop: 10,
            color: 'blue',
          },
      });

export default LoginScreen;
