import LoginScreen from './components/Login';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import CalendarScreen from './components/Calendar';
import RegistrationScreen from './components/Register';
import AdminScreen from './components/Admin';
import { UserProvider } from './userContext/UserContext';
import LogoutButton from './components/LogoutButton';
import { initializeApp } from "firebase/compat/app";
import firebase from 'firebase/compat/app';

const firebaseConfig = {
  apiKey: process.env.apiKey,
  authDomain: process.env.authDomain,
  projectId: process.env.projectId,
  storageBucket: process.env.storageBucket,
  messagingSenderId: process.env.messagingSenderId,
  appId: process.env.appId,
  measurementId: process.env.measurementId
};


if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
  } else {
  firebase.app(); 
}

const Stack = createStackNavigator();

export default function App() {
  return (
    <UserProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen 
            name="Login" 
            component={LoginScreen} 
            options={{ title: 'Login' }} 
          />
          <Stack.Screen 
            name="Admin" 
            component={AdminScreen} 
            options={({ navigation }) => ({
              title: 'Admin',
              headerRight: () => <LogoutButton navigation={navigation} />,
            })} 
          />
          <Stack.Screen 
            name="Calendar" 
            component={CalendarScreen} 
            options={({ navigation }) => ({
              title: 'Calendar',
              headerRight: () => <LogoutButton navigation={navigation} />,
            })} 
          />
          <Stack.Screen 
            name="Register" 
            component={RegistrationScreen} 
            options={{ title: 'Register' }} 
          />
        </Stack.Navigator>
     </NavigationContainer>
    </UserProvider>
  );
}
