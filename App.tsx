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
import LiveWeatherDashboard from './src/screens/LiveWeatherDashboard';
import CropPredictionScreen from './src/screens/CropPredictionScreen';
import Login from './src/screens/Login';
import CreateAccount from './src/screens/CreateAccount';
import PriceHistory from './src/screens/PriceHistory';

const Stack = createStackNavigator();

const App = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Login"
            screenOptions={{ headerShown: false }}
          >
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="CreateAccount" component={CreateAccount} />
            <Stack.Screen name="Home" component={HomeDashboard} />
            <Stack.Screen name="SensorDetails" component={SensorDetails} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="SensorHistory" component={SensorHistory} />
            <Stack.Screen name="DeviceManagement" component={DeviceManagement} />
            <Stack.Screen name="LiveWeather" component={LiveWeatherDashboard} />
            <Stack.Screen name="CropPrediction" component={CropPredictionScreen} />
            <Stack.Screen name="PriceHistory" component={PriceHistory} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
