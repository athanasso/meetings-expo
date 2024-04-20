import LoginScreen from './components/Login';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import CalendarScreen from './components/Calendar';
import RegistrationScreen from './components/Register';
import AdminScreen from './components/Admin';
import { UserProvider } from './UserContext';
import LogoutButton from './components/LogoutButton';

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
