import React, { useState, useLayoutEffect } from 'react';
import { SafeAreaView, StyleSheet, StatusBar, View, Platform, TouchableOpacity, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from './app/(tabs)/index';
import SetupScreen from './src/SetupScreen';
import SquadSelectionScreen from './src/SquadSelectionScreen';
import OpeningPlayersScreen from './src/OpeningPlayersScreen';
import ScoringScreen from './src/ScoringScreen';
import TeamsScreen from './src/TeamsScreen';
import HistoryScreen from './src/HistoryScreen';
import MyStatsScreen from './src/MyStatsScreen';
import PlayerProfileScreen from './src/PlayerProfileScreen';
import MyProfileScreen from './src/MyProfileScreen';
import TeamPlayersScreen from './src/TeamPlayersScreen';
import PlayerInformationScreen from './src/PlayerInformationScreen';
import TeamPlayerProfileScreen from './src/TeamPlayerProfileScreen';

import { AppSettings, ViewState } from './src/types';
import { ThemeProvider, useTheme } from './src/ThemeContext';

function ProfileFlow({ navigation }: any) {
  const { colors } = useTheme();
  const [currentView, setCurrentView] = useState<'view-profile' | 'view-stats'>('view-profile');
  const [profileData, setProfileData] = useState<any>(null);

  const handleSaveProfile = (data: any) => {
    setProfileData(data);
    setCurrentView('view-stats');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {currentView === 'view-profile' ? (
        <PlayerProfileScreen
          initialData={profileData}
          onSaveProfile={handleSaveProfile}
          navigation={navigation}
        />
      ) : (
        <MyProfileScreen
          profileData={profileData}
          onEditProfile={() => setCurrentView('view-profile')}
          navigation={navigation}
        />
      )}
    </SafeAreaView>
  );
}

function ScoringFlow({ navigation }: any) {
  const { colors } = useTheme();
  const [currentView, setCurrentView] = useState<ViewState>('view-home');
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);
  const [activePlayers, setActivePlayers] = useState<any>(null);

  useLayoutEffect(() => {
    if (currentView !== 'view-home') {
      navigation?.setOptions({ tabBarStyle: { display: 'none' } });
    } else {
      navigation?.setOptions({
        tabBarStyle: {
          display: 'flex',
        },
      });
    }
  }, [navigation, currentView]);

  const handleStartMatch = (settings: AppSettings) => {
    setAppSettings(settings);
    if (settings.testState) {
        setActivePlayers({
            striker: settings.testState.striker,
            nonStriker: settings.testState.nonStriker,
            bowler: settings.testState.bowler
        });
        setCurrentView('view-scoring');
    } else if (settings.includeSquadSelection !== false) {
        setCurrentView('view-squad-selection');
    } else {
        setCurrentView('view-opening-players');
    }
  };

  const handleStartScoring = (players: { striker: string; nonStriker: string; bowler: string }) => {
    setActivePlayers(players);
    setCurrentView('view-scoring');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.background} />

      {currentView === 'view-home' && (
        <HomeScreen
          onStartNewMatch={() => setCurrentView('view-setup')}
          navigation={navigation}
        />
      )}

      {currentView === 'view-setup' && (
        <SetupScreen onStartMatch={handleStartMatch} onBack={() => setCurrentView('view-home')} />
      )}

      {currentView === 'view-squad-selection' && appSettings && (
        <SquadSelectionScreen
          battingTeam={appSettings.battingTeam}
          bowlingTeam={appSettings.bowlingTeam}
          playersPerTeam={appSettings.playersPerTeam}
          onContinue={(squads) => {
            setAppSettings(prev => prev ? {
              ...prev,
              battingSquad: squads.battingSquad,
              bowlingSquad: squads.bowlingSquad,
            } : null);
            setCurrentView('view-opening-players');
          }}
          onSkip={() => {
            setAppSettings(prev => prev ? {
              ...prev,
              battingSquad: [],
              bowlingSquad: [],
            } : null);
            setCurrentView('view-opening-players');
          }}
          onBack={() => setCurrentView('view-setup')}
        />
      )}

      {currentView === 'view-opening-players' && appSettings && (
        <OpeningPlayersScreen
          battingTeam={appSettings.battingTeam}
          bowlingTeam={appSettings.bowlingTeam}
          battingSquad={appSettings.battingSquad}
          bowlingSquad={appSettings.bowlingSquad}
          onStartScoring={handleStartScoring}
          onBack={() => setCurrentView(appSettings.includeSquadSelection !== false ? 'view-squad-selection' : 'view-setup')}
        />
      )}

      {currentView === 'view-scoring' && activePlayers && (
        <ScoringScreen
          players={activePlayers}
          settings={appSettings}
          onBack={() => setCurrentView('view-opening-players')}
          onResetToHome={() => setCurrentView('view-home')}
          navigation={navigation}
        />
      )}
    </SafeAreaView>
  );
}

type TabKey = 'Home' | 'Teams' | 'History' | 'Stats';

function AppContent() {
  const { colors } = useTheme();
  const isWeb = Platform.OS === 'web';
  const [activeTab, setActiveTab] = useState<TabKey>('Home');
  const [isTabBarHidden, setIsTabBarHidden] = useState(false);

  const navigation = {
    navigate: (tabName: string) => {
      if (tabName === 'Home') setActiveTab('Home');
      else if (tabName === 'Teams' || tabName === 'Teams & Tournaments') setActiveTab('Teams');
      else if (tabName === 'History') setActiveTab('History');
      else if (tabName === 'My Stats' || tabName === 'Stats') setActiveTab('Stats');
    },
    reset: () => {
      setActiveTab('Home');
    },
    goBack: () => {
      // safe fallback
    },
    setOptions: (opts: any) => {
      if (opts?.tabBarStyle?.display === 'none') {
        setIsTabBarHidden(true);
      } else {
        setIsTabBarHidden(false);
      }
    },
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Home':
        return <ScoringFlow navigation={navigation} />;
      case 'Teams':
        return <TeamsScreen navigation={navigation} />;
      case 'History':
        return <HistoryScreen navigation={navigation} />;
      case 'Stats':
        return <ProfileFlow navigation={navigation} />;
      default:
        return <ScoringFlow navigation={navigation} />;
    }
  };

  const tabItems = [
    { key: 'Home' as TabKey, label: 'Home', activeIcon: 'home', inactiveIcon: 'home-outline' },
    { key: 'Teams' as TabKey, label: 'Teams & Tournaments', activeIcon: 'people', inactiveIcon: 'people-outline' },
    { key: 'History' as TabKey, label: 'History', activeIcon: 'time', inactiveIcon: 'time-outline' },
    { key: 'Stats' as TabKey, label: 'My Stats', activeIcon: 'person', inactiveIcon: 'person-outline' },
  ];

  const mainContent = (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flex: 1 }}>
        {renderTabContent()}
      </View>
      {!isTabBarHidden && (
        <View
          style={{
            flexDirection: 'row',
            height: 70,
            paddingBottom: 10,
            paddingTop: 8,
            backgroundColor: colors.tabBarBg,
            borderTopWidth: 1,
            borderTopColor: colors.tabBarBorder,
          }}
        >
          {tabItems.map((tab) => {
            const isFocused = activeTab === tab.key;
            const color = isFocused ? colors.accent : colors.tabBarInactive;
            return (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={isFocused ? (tab.activeIcon as any) : (tab.inactiveIcon as any)}
                  size={22}
                  color={color}
                />
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: '600',
                    letterSpacing: 0.3,
                    color: color,
                    marginTop: 3,
                  }}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaProvider>
      {isWeb ? (
        <View style={{ flex: 1, height: '100%' as any, backgroundColor: colors.background, alignItems: 'center', width: '100%' }}>
          <View style={{ width: '100%', maxWidth: 480, flex: 1, height: '100%', backgroundColor: colors.background, overflow: 'hidden', borderWidth: 0 }}>
            {mainContent}
          </View>
        </View>
      ) : (
        mainContent
      )}
    </SafeAreaProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}