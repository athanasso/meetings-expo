import LoginScreen from './components/Login';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import CalendarScreen from './components/Calendar';
import RegistrationScreen from './components/Register';
import AdminScreen from './components/Admin';

const Stack = createStackNavigator();

export default function App() {
  return (
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Admin" component={AdminScreen} />
          <Stack.Screen name="Calendar" component={CalendarScreen} />
          <Stack.Screen name="Register" component={RegistrationScreen} />
        </Stack.Navigator>
     </NavigationContainer>
  );
}

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     // backgroundColor: '#25292e',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
// });
