import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import SplashScreen from './src/screens/SplashScreen';
import HomeDashboard from './src/screens/HomeDashboard';
import SensorDetails from './src/screens/SensorDetails';
import SettingsScreen from './src/screens/SettingsScreen';
import SensorHistory from './src/screens/SensorHistory';
import DeviceManagement from './src/screens/DeviceManagement';

const Stack = createStackNavigator();

const App = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Splash"
            screenOptions={{ headerShown: false }}
          >
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Home" component={HomeDashboard} />
            <Stack.Screen name="SensorDetails" component={SensorDetails} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="SensorHistory" component={SensorHistory} />
            <Stack.Screen name="DeviceManagement" component={DeviceManagement} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
