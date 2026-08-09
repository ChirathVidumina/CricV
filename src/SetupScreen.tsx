import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AdvancedSettingsScreen from './AdvancedSettingsScreen';
import { AppSettings } from './types';
import { useTheme } from './ThemeContext';

export default function SetupScreen({ onStartMatch, onBack }: { onStartMatch: (settings: AppSettings) => void; onBack?: () => void }) {
    const { colors, isDark } = useTheme();
    // Basic Settings
    const [hostTeam, setHostTeam] = useState('');
    const [visitorTeam, setVisitorTeam] = useState('');
    const [toss, setToss] = useState('host');
    const [opted, setOpted] = useState('bat');
    const [overs, setOvers] = useState('20');
    const [isOversFocused, setIsOversFocused] = useState(false);

    // Advanced Settings State
    const [isAdvancedExpanded, setIsAdvancedExpanded] = useState(false);
    const [playersPerTeam, setPlayersPerTeam] = useState('11');
    const [ballsPerOver, setBallsPerOver] = useState('6');
    const [nbReball, setNbReball] = useState(true);
    const [nbRuns, setNbRuns] = useState('1');
    const [wdReball, setWdReball] = useState(true);
    const [wdRuns, setWdRuns] = useState('1');

    const handleDecrementOvers = () => {
        const current = parseInt(overs) || 20;
        if (current > 1) {
            setOvers((current - 1).toString());
        }
    };

    const handleIncrementOvers = () => {
        const current = parseInt(overs) || 0;
        setOvers((current + 1).toString());
    };

    const handleOversChangeText = (text: string) => {
        const cleaned = text.replace(/[^0-9]/g, '');
        if (cleaned === '') {
            setOvers('');
        } else {
            const num = parseInt(cleaned, 10);
            setOvers(isNaN(num) ? '' : num.toString());
        }
    };

    const handleStart = () => {
        if (!hostTeam.trim() || !visitorTeam.trim() || !overs.trim()) {
            Alert.alert("Missing Details", "Please ensure the Host Team, Visitor Team, and Overs are filled out before starting the match.");
            return;
        }

        onStartMatch({
            battingTeam: (toss === 'host' && opted === 'bat') || (toss === 'visitor' && opted === 'bowl') ? hostTeam.trim() : visitorTeam.trim(),
            bowlingTeam: (toss === 'host' && opted === 'bat') || (toss === 'visitor' && opted === 'bowl') ? visitorTeam.trim() : hostTeam.trim(),
            tossWinner: toss,
            optedTo: opted,
            overs: overs,
            ballsPerOver: parseInt(ballsPerOver) || 6,
            nbReball: nbReball,
            nbRuns: parseInt(nbRuns) || 1,
            wdReball: wdReball,
            wdRuns: parseInt(wdRuns) || 1,
            playersPerTeam: parseInt(playersPerTeam) || 11,
        });
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>

            {/* Header */}
            <View style={{ paddingHorizontal: 16, paddingTop: 10, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: colors.divider }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {onBack && (
                        <TouchableOpacity onPress={onBack} style={{ paddingVertical: 4, paddingRight: 10 }}>
                            <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
                        </TouchableOpacity>
                    )}
                    <View>
                        <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: '800' }}>Match Setup</Text>
                        <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 1 }}>Configure your match settings</Text>
                    </View>
                </View>
            </View>

            <ScrollView style={{ paddingHorizontal: 16, paddingTop: 8 }} showsVerticalScrollIndicator={false}>
                <Text style={{ color: colors.textMuted, fontWeight: '700', fontSize: 10, letterSpacing: 1, marginBottom: 4, marginTop: 2 }}>TEAMS</Text>
                <View style={{ backgroundColor: colors.card, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8, marginBottom: 12, borderWidth: 1, borderColor: colors.cardBorder }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8, minHeight: 44 }}>
                        <Ionicons name="flag-outline" size={18} color={colors.accent} style={{ marginRight: 10 }} />
                        <TextInput style={{ flex: 1, fontSize: 15, color: colors.textPrimary, paddingVertical: 6 }} placeholder="Host Team" value={hostTeam} onChangeText={setHostTeam} placeholderTextColor={colors.inputPlaceholder} />
                    </View>
                    <View style={{ height: 1, backgroundColor: colors.divider, marginVertical: 2 }} />
                    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8, minHeight: 44 }}>
                        <Ionicons name="airplane-outline" size={18} color={colors.accentBlue} style={{ marginRight: 10 }} />
                        <TextInput style={{ flex: 1, fontSize: 15, color: colors.textPrimary, paddingVertical: 6 }} placeholder="Visitor Team" value={visitorTeam} onChangeText={setVisitorTeam} placeholderTextColor={colors.inputPlaceholder} />
                    </View>
                </View>

                {/* Toss Won By Section */}
                <Text style={{ color: colors.textMuted, fontWeight: '700', fontSize: 10, letterSpacing: 1, marginBottom: 4, marginTop: 2 }}>TOSS WON BY</Text>
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                    <TouchableOpacity
                        style={[{ flex: 1, flexDirection: 'row', paddingVertical: 10, paddingHorizontal: 10, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }, toss === 'host' ? { backgroundColor: colors.accent, borderWidth: 1, borderColor: colors.accent } : { backgroundColor: colors.chipUnselectedBg, borderWidth: 1, borderColor: colors.chipUnselectedBorder }]}
                        onPress={() => setToss('host')}
                    >
                        <Text
                            style={[{ fontSize: 13 }, toss === 'host' ? { color: colors.chipSelectedTextOnAccent, fontWeight: '700' } : { color: colors.chipUnselectedText, fontWeight: '500' }]}
                            numberOfLines={1}
                        >
                            {hostTeam.trim() ? hostTeam.trim() : 'Host Team'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[{ flex: 1, flexDirection: 'row', paddingVertical: 10, paddingHorizontal: 10, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }, toss === 'visitor' ? { backgroundColor: colors.accent, borderWidth: 1, borderColor: colors.accent } : { backgroundColor: colors.chipUnselectedBg, borderWidth: 1, borderColor: colors.chipUnselectedBorder }]}
                        onPress={() => setToss('visitor')}
                    >
                        <Text
                            style={[{ fontSize: 13 }, toss === 'visitor' ? { color: colors.chipSelectedTextOnAccent, fontWeight: '700' } : { color: colors.chipUnselectedText, fontWeight: '500' }]}
                            numberOfLines={1}
                        >
                            {visitorTeam.trim() ? visitorTeam.trim() : 'Visitor Team'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Opted To */}
                <Text style={{ color: colors.textMuted, fontWeight: '700', fontSize: 10, letterSpacing: 1, marginBottom: 4, marginTop: 2 }}>OPTED TO</Text>
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                    <TouchableOpacity
                        style={[{ flex: 1, flexDirection: 'row', paddingVertical: 10, paddingHorizontal: 10, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }, opted === 'bat' ? { backgroundColor: colors.accent, borderWidth: 1, borderColor: colors.accent } : { backgroundColor: colors.chipUnselectedBg, borderWidth: 1, borderColor: colors.chipUnselectedBorder }]}
                        onPress={() => setOpted('bat')}
                    >
                        <Ionicons name="baseball-outline" size={15} color={opted === 'bat' ? colors.chipSelectedTextOnAccent : colors.chipUnselectedText} style={{ marginRight: 5 }} />
                        <Text style={[{ fontSize: 13 }, opted === 'bat' ? { color: colors.chipSelectedTextOnAccent, fontWeight: '700' } : { color: colors.chipUnselectedText, fontWeight: '500' }]}>
                            Bat
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[{ flex: 1, flexDirection: 'row', paddingVertical: 10, paddingHorizontal: 10, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }, opted === 'bowl' ? { backgroundColor: colors.accent, borderWidth: 1, borderColor: colors.accent } : { backgroundColor: colors.chipUnselectedBg, borderWidth: 1, borderColor: colors.chipUnselectedBorder }]}
                        onPress={() => setOpted('bowl')}
                    >
                        <Ionicons name="ellipse-outline" size={15} color={opted === 'bowl' ? colors.chipSelectedTextOnAccent : colors.chipUnselectedText} style={{ marginRight: 5 }} />
                        <Text style={[{ fontSize: 13 }, opted === 'bowl' ? { color: colors.chipSelectedTextOnAccent, fontWeight: '700' } : { color: colors.chipUnselectedText, fontWeight: '500' }]}>
                            Bowl
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Total Overs Section */}
                <Text style={{ color: colors.textMuted, fontWeight: '700', fontSize: 10, letterSpacing: 1, marginBottom: 4, marginTop: 2 }}>TOTAL OVERS</Text>
                <View style={{ backgroundColor: colors.card, borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: colors.cardBorder }}>
                    {/* Centered Modern Stepper Control Row */}
                    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12, paddingVertical: 4 }}>
                        <TouchableOpacity
                            style={{
                                width: 38,
                                height: 38,
                                borderRadius: 19,
                                backgroundColor: colors.buttonBg,
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderWidth: 1,
                                borderColor: colors.cardBorder,
                            }}
                            onPress={handleDecrementOvers}
                        >
                            <Ionicons name="remove" size={18} color={colors.textPrimary} />
                        </TouchableOpacity>

                        {/* Interactive Focused Box for TextInput */}
                        <View
                            style={{
                                width: 64,
                                height: 48,
                                borderRadius: 10,
                                backgroundColor: colors.background,
                                borderWidth: 1.5,
                                borderColor: isOversFocused ? colors.accent : colors.cardBorder,
                                justifyContent: 'center',
                                alignItems: 'center',
                                elevation: isOversFocused ? 2 : 0,
                                shadowColor: colors.accent,
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: isOversFocused ? 0.25 : 0,
                                shadowRadius: 4,
                            }}
                        >
                            <TextInput
                                style={{
                                    fontSize: 24,
                                    fontWeight: '800',
                                    color: isOversFocused ? colors.accent : colors.textPrimary,
                                    width: '100%',
                                    textAlign: 'center',
                                    paddingVertical: 0,
                                    paddingHorizontal: 0,
                                }}
                                value={overs}
                                onChangeText={handleOversChangeText}
                                onFocus={() => setIsOversFocused(true)}
                                onBlur={() => setIsOversFocused(false)}
                                keyboardType="numeric"
                                maxLength={3}
                                textAlign="center"
                                selectTextOnFocus
                            />
                        </View>

                        <TouchableOpacity
                            style={{
                                width: 38,
                                height: 38,
                                borderRadius: 19,
                                backgroundColor: colors.buttonBg,
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderWidth: 1,
                                borderColor: colors.cardBorder,
                            }}
                            onPress={handleIncrementOvers}
                        >
                            <Ionicons name="add" size={18} color={colors.textPrimary} />
                        </TouchableOpacity>
                    </View>

                    {/* Spaced-Out Quick Select Buttons */}
                    <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 14, marginTop: 10 }}>
                        {[5, 10, 20, 50].map((num) => {
                            const isSelected = (parseInt(overs) || 0) === num;
                            return (
                                <TouchableOpacity
                                    key={num}
                                    style={[{ paddingVertical: 6, paddingHorizontal: 16, borderRadius: 16, borderWidth: 1 }, isSelected ? { backgroundColor: colors.accent, borderColor: colors.accent } : { backgroundColor: colors.chipUnselectedBg, borderColor: colors.chipUnselectedBorder }]}
                                    onPress={() => setOvers(num.toString())}
                                >
                                    <Text style={[{ fontSize: 13, fontWeight: '600' }, isSelected ? { color: colors.chipSelectedTextOnAccent, fontWeight: '700' } : { color: colors.chipUnselectedText }]}>
                                        {num}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* Advanced Settings */}
                <TouchableOpacity style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.cardBorder, padding: 10, borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }} onPress={() => setIsAdvancedExpanded(true)}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Ionicons name="settings-outline" size={16} color={colors.textSecondary} />
                        <Text style={{ color: colors.textSecondary, fontWeight: '600', fontSize: 13 }}>Advanced Settings</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                </TouchableOpacity>

                {/* Start Match */}
                <TouchableOpacity style={{ backgroundColor: colors.accent, padding: 12, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 12, elevation: 3 }} onPress={handleStart}>
                    <Ionicons name="play" size={16} color={colors.chipSelectedTextOnAccent} style={{ marginRight: 6 }} />
                    <Text style={{ color: colors.chipSelectedTextOnAccent, fontWeight: '800', fontSize: 15 }}>Start Match</Text>
                </TouchableOpacity>
            </ScrollView>

            {/* ADVANCED SETTINGS OVERLAY */}
            {isAdvancedExpanded && (
                <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100, elevation: 5, backgroundColor: colors.overlayBg }}>
                    <AdvancedSettingsScreen
                        initialValues={{
                            playersPerTeam,
                            ballsPerOver: parseInt(ballsPerOver) || 6,
                            noBallReball: nbReball,
                            noBallPenalty: nbRuns,
                            wideReball: wdReball,
                            widePenalty: wdRuns,
                        }}
                        onSaveSettings={(newSettings) => {
                            setPlayersPerTeam(newSettings.playersPerTeam);
                            setBallsPerOver(newSettings.ballsPerOver.toString());
                            setNbReball(newSettings.noBallReball);
                            setNbRuns(newSettings.noBallPenalty);
                            setWdReball(newSettings.wideReball);
                            setWdRuns(newSettings.widePenalty);
                            setIsAdvancedExpanded(false);
                        }}
                        onClose={() => setIsAdvancedExpanded(false)}
                    />
                </View>
            )}

        </SafeAreaView>
    );
}

// Styles removed - now using inline styles with theme colors