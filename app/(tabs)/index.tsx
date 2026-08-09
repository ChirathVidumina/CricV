import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/ThemeContext';

// Safe router helper object for router.push compatibility
export const router = {
  push: (path: string) => {
    console.log(`Navigating to ${path}`);
  },
  replace: (path: string) => {
    console.log(`Replacing path ${path}`);
  },
  back: () => {
    console.log('Navigating back');
  },
};

interface HomeScreenProps {
  onStartNewMatch?: () => void;
  navigation?: any;
}

export default function HomeScreen({ onStartNewMatch, navigation }: HomeScreenProps) {
  const { colors, isDark, toggleTheme } = useTheme();

  const handleStartMatch = () => {
    console.log('Starting match');
    if (onStartNewMatch) {
      onStartNewMatch();
    }
  };

  const handleStartTournament = () => {
    Alert.alert(
      'Coming Soon',
      'This feature will be available in a future update!'
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.background} />

      {/* Header Banner */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            backgroundColor: colors.accentBg,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: colors.accentBorder,
          }}>
            <Ionicons name="baseball" size={18} color={colors.accent} />
          </View>
          <View>
            <Text style={{ fontSize: 18, fontWeight: '800', color: colors.textPrimary, letterSpacing: 0.5 }}>CricV</Text>
            <Text style={{ fontSize: 10, color: colors.textMuted, fontWeight: '500', letterSpacing: 0.3 }}>Cricket Scoring</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          {/* Theme Toggle */}
          <TouchableOpacity
            onPress={toggleTheme}
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              backgroundColor: colors.card,
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: colors.cardBorder,
            }}
          >
            <Ionicons name={isDark ? 'sunny-outline' : 'moon-outline'} size={18} color={isDark ? colors.accentAmber : colors.accentPurple} />
          </TouchableOpacity>
          <TouchableOpacity style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            backgroundColor: colors.card,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: colors.cardBorder,
          }}>
            <Ionicons name="notifications-outline" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 10, paddingBottom: 16 }} showsVerticalScrollIndicator={false}>
        {/* Welcome Section */}
        <View style={{ marginBottom: 10 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginBottom: 2 }}>Welcome Back! 👋</Text>
          <Text style={{ fontSize: 12, color: colors.textMuted }}>Ready to score your next match?</Text>
        </View>

        {/* Quick Stats Row */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
          <View style={{
            flex: 1,
            backgroundColor: colors.card,
            borderRadius: 12,
            paddingVertical: 8,
            paddingHorizontal: 6,
            alignItems: 'center',
            gap: 4,
            borderWidth: 1,
            borderColor: colors.cardBorder,
          }}>
            <Ionicons name="baseball-outline" size={15} color={colors.accent} />
            <Text style={{ fontSize: 16, fontWeight: '800', color: colors.textPrimary }}>0</Text>
            <Text style={{ fontSize: 10, color: colors.textMuted, fontWeight: '500', letterSpacing: 0.3 }}>Matches</Text>
          </View>
          <View style={{
            flex: 1,
            backgroundColor: colors.card,
            borderRadius: 12,
            paddingVertical: 8,
            paddingHorizontal: 6,
            alignItems: 'center',
            gap: 4,
            borderWidth: 1,
            borderColor: colors.cardBorder,
          }}>
            <Ionicons name="trophy-outline" size={15} color={colors.accentAmber} />
            <Text style={{ fontSize: 16, fontWeight: '800', color: colors.textPrimary }}>0</Text>
            <Text style={{ fontSize: 10, color: colors.textMuted, fontWeight: '500', letterSpacing: 0.3 }}>Wins</Text>
          </View>
          <View style={{
            flex: 1,
            backgroundColor: colors.card,
            borderRadius: 12,
            paddingVertical: 8,
            paddingHorizontal: 6,
            alignItems: 'center',
            gap: 4,
            borderWidth: 1,
            borderColor: colors.cardBorder,
          }}>
            <Ionicons name="ribbon-outline" size={15} color={colors.accentPurple} />
            <Text style={{ fontSize: 16, fontWeight: '800', color: colors.textPrimary }}>—</Text>
            <Text style={{ fontSize: 10, color: colors.textMuted, fontWeight: '500', letterSpacing: 0.3 }}>Highest</Text>
          </View>
        </View>

        {/* Action Cards */}
        <View style={{ gap: 10 }}>
          {/* Card 1: Start New Match */}
          <TouchableOpacity
            style={{
              borderRadius: 14,
              backgroundColor: colors.card,
              overflow: 'hidden',
              borderWidth: 1,
              borderColor: colors.accentBorder,
            }}
            activeOpacity={0.85}
            onPress={handleStartMatch}
          >
            <View style={{ height: 3, backgroundColor: colors.accent, opacity: 0.8 }} />
            <View style={{ padding: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <View style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  backgroundColor: colors.accentBg,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: colors.accentBorder,
                }}>
                  <Ionicons name="baseball-outline" size={20} color={colors.accent} />
                </View>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: colors.accentBg,
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 16,
                  gap: 4,
                }}>
                  <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: colors.accent }} />
                  <Text style={{ color: colors.accent, fontSize: 9, fontWeight: '700', letterSpacing: 0.8 }}>NEW MATCH</Text>
                </View>
              </View>

              <View style={{ marginBottom: 10 }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 }}>Start New Match</Text>
                <Text style={{ fontSize: 12, color: colors.textSecondary, lineHeight: 16 }}>
                  Set up teams, overs, custom rules and start live ball-by-ball scoring.
                </Text>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.divider }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: colors.accent }}>Get Started</Text>
                <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: colors.accent, justifyContent: 'center', alignItems: 'center' }}>
                  <Ionicons name="arrow-forward" size={14} color={isDark ? '#0A0E1A' : '#FFFFFF'} />
                </View>
              </View>
            </View>
          </TouchableOpacity>

          {/* Card 2: Start New Tournament */}
          <TouchableOpacity
            style={{
              borderRadius: 14,
              backgroundColor: colors.card,
              overflow: 'hidden',
              borderWidth: 1,
              borderColor: colors.cardBorder,
            }}
            activeOpacity={0.85}
            onPress={handleStartTournament}
          >
            <View style={{ padding: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <View style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  backgroundColor: colors.accentAmberBg,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: colors.accentAmberBorder,
                }}>
                  <Ionicons name="trophy-outline" size={20} color={colors.accentAmber} />
                </View>
                <View style={{
                  backgroundColor: colors.accentAmberBg,
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 16,
                }}>
                  <Text style={{ color: colors.accentAmber, fontSize: 9, fontWeight: '700', letterSpacing: 0.8 }}>COMING SOON</Text>
                </View>
              </View>

              <View style={{ marginBottom: 10 }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 }}>Start Tournament</Text>
                <Text style={{ fontSize: 12, color: colors.textSecondary, lineHeight: 16 }}>
                  Organize leagues, knockouts, track points table and player leaderboards.
                </Text>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.divider }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: colors.accentAmber }}>Explore</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.accentAmber} />
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
