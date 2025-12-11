import React, { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider, MD3LightTheme as DefaultTheme, BottomNavigation } from 'react-native-paper';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import MarketScreen from './src/screens/MarketScreen';

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#6200ee',
    secondary: '#03dac6',
  },
};

export default function App() {
  // BYPASS LOGIN: Default to a user
  const [user, setUser] = useState({ name: "Dev User", role: "admin" });

  // Tab State
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'saldo', title: 'Saldo', focusedIcon: 'wallet', unfocusedIcon: 'wallet-outline' },
    { key: 'cotizacion', title: 'Cotización', focusedIcon: 'chart-line', unfocusedIcon: 'chart-line-variant' },
  ]);

  const renderScene = BottomNavigation.SceneMap({
    saldo: () => <HomeScreen user={user} onLogout={() => setUser(null)} />,
    cotizacion: () => <MarketScreen onLogout={() => setUser(null)} />,
  });

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        {user ? (
          <BottomNavigation
            navigationState={{ index, routes }}
            onIndexChange={setIndex}
            renderScene={renderScene}
          />
        ) : (
          <LoginScreen onLoginSuccess={(userData) => setUser(userData.user)} />
        )}
      </PaperProvider>
    </SafeAreaProvider>
  );
}
