import React, { useState } from 'react';
import { Text, View, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth'; 
import 'firebase/compat/firestore';

const RegistrationScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');

  const handleRegistration = async () => {
    try {
      // Create user in Firebase Authentication
      const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;

      // Create user document in Firestore
      await firebase.firestore().collection('users').doc(user.uid).set({
        email: email,
        name: name,
        surname: surname,
        userType: 'user' // Set default user type as 'user'
      });

      // Navigate to home screen or perform any other action
      navigation.navigate('Login');
    } catch (error) {
      console.error('Error registering user:', error);
      Alert.alert('Registration Error', 'Failed to register user');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={text => setName(text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Surname"
        value={surname}
        onChangeText={text => setSurname(text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={text => setEmail(text)}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={text => setPassword(text)}
        secureTextEntry
      />
      <Button title="Register" onPress={handleRegistration} />
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.switchButton}>Already have an account? Log in</Text>
      </TouchableOpacity>
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
  switchButton: {
    marginTop: 10,
    color: 'blue',
  },
});

export default RegistrationScreen;
