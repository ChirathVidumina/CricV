import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme, ThemeColors } from './ThemeContext';
import AutocompleteInput from './AutocompleteInput';
import { PLAYER_PROFILE_STORAGE_KEY } from './PlayerProfileScreen';

interface OpeningPlayersScreenProps {
    battingTeam: string;
    bowlingTeam: string;
    battingSquad?: string[];
    bowlingSquad?: string[];
    onStartScoring: (players: { striker: string; nonStriker: string; bowler: string }) => void;
    onBack: () => void;
}

export default function OpeningPlayersScreen({
    battingTeam,
    bowlingTeam,
    battingSquad = [],
    bowlingSquad = [],
    onStartScoring,
    onBack
}: OpeningPlayersScreenProps) {
    const { colors, isDark } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    const [strikerName, setStrikerName] = useState(battingSquad[0] || '');
    const [nonStrikerName, setNonStrikerName] = useState(battingSquad[1] || '');
    const [bowlerName, setBowlerName] = useState(bowlingSquad[0] || '');
    const [userProfile, setUserProfile] = useState<{ fullName: string; displayName?: string } | null>(null);

    // Fetch saved personal profile from AsyncStorage to add to Autocomplete suggestions
    useEffect(() => {
        const loadUserProfile = async () => {
            try {
                const raw = await AsyncStorage.getItem(PLAYER_PROFILE_STORAGE_KEY);
                if (raw) {
                    const parsed = JSON.parse(raw);
                    if (parsed.fullName || parsed.displayName) {
                        setUserProfile({
                            fullName: parsed.fullName || 'Player',
                            displayName: parsed.displayName,
                        });
                    }
                }
            } catch (err) {
                console.error('Failed to load user profile for suggestions:', err);
            }
        };
        loadUserProfile();
    }, []);

    const battingSuggestions = useMemo(() => {
        const list: Array<string | { fullName: string; displayName?: string }> = [...battingSquad];
        if (userProfile) {
            list.unshift(userProfile);
        }
        return list;
    }, [battingSquad, userProfile]);

    const bowlingSuggestions = useMemo(() => {
        const list: Array<string | { fullName: string; displayName?: string }> = [...bowlingSquad];
        if (userProfile) {
            list.unshift(userProfile);
        }
        return list;
    }, [bowlingSquad, userProfile]);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle={colors.statusBar} backgroundColor={colors.background} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={{ paddingVertical: 4, paddingRight: 12 }}>
                    <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>Opening Players</Text>
                    <Text style={styles.headerSubtitle}>{battingTeam} vs {bowlingTeam}</Text>
                </View>
            </View>

            <ScrollView style={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

                {/* Batting Section */}
                <View style={styles.sectionHeader}>
                    <Ionicons name="baseball-outline" size={16} color="#10B981" />
                    <Text style={styles.sectionTitle}>{battingTeam} — Batting</Text>
                </View>
                <View style={[styles.card, { zIndex: 10 }]}>
                    <AutocompleteInput
                        inputLabel="Striker"
                        placeholder="Enter striker name"
                        value={strikerName}
                        onChangeText={setStrikerName}
                        suggestions={battingSuggestions}
                        excludeNames={[nonStrikerName].filter(n => n && n.trim() !== '')}
                    />

                    {battingSquad.length > 0 && (
                        <View style={styles.chipContainer}>
                            <Text style={styles.chipLabel}>SELECT FROM SQUAD</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
                                {battingSquad.map((player, idx) => (
                                    <TouchableOpacity
                                        key={idx}
                                        style={[styles.chip, strikerName === player && styles.chipActive]}
                                        onPress={() => setStrikerName(player)}
                                    >
                                        <Text style={[styles.chipText, strikerName === player && styles.chipTextActive]}>{player}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    )}

                    <View style={styles.fieldDivider} />

                    <AutocompleteInput
                        inputLabel="Non-Striker"
                        placeholder="Enter non-striker name"
                        value={nonStrikerName}
                        onChangeText={setNonStrikerName}
                        suggestions={battingSuggestions}
                        excludeNames={[strikerName].filter(n => n && n.trim() !== '')}
                    />

                    {battingSquad.length > 0 && (
                        <View style={styles.chipContainer}>
                            <Text style={styles.chipLabel}>SELECT FROM SQUAD</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
                                {battingSquad.map((player, idx) => (
                                    <TouchableOpacity
                                        key={idx}
                                        style={[styles.chip, nonStrikerName === player && styles.chipActive]}
                                        onPress={() => setNonStrikerName(player)}
                                    >
                                        <Text style={[styles.chipText, nonStrikerName === player && styles.chipTextActive]}>{player}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    )}
                </View>

                {/* Bowling Section */}
                <View style={styles.sectionHeader}>
                    <Ionicons name="ellipse-outline" size={16} color="#3B82F6" />
                    <Text style={styles.sectionTitle}>{bowlingTeam} — Bowling</Text>
                </View>
                <View style={[styles.card, { zIndex: 5 }]}>
                    <AutocompleteInput
                        inputLabel="Opening Bowler"
                        placeholder="Enter bowler name"
                        value={bowlerName}
                        onChangeText={setBowlerName}
                        suggestions={bowlingSuggestions}
                    />

                    {bowlingSquad.length > 0 && (
                        <View style={styles.chipContainer}>
                            <Text style={styles.chipLabel}>SELECT FROM SQUAD</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
                                {bowlingSquad.map((player, idx) => (
                                    <TouchableOpacity
                                        key={idx}
                                        style={[styles.chip, bowlerName === player && styles.chipActive]}
                                        onPress={() => setBowlerName(player)}
                                    >
                                        <Text style={[styles.chipText, bowlerName === player && styles.chipTextActive]}>{player}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    )}
                </View>

                <TouchableOpacity
                    style={styles.startBtn}
                    onPress={() => onStartScoring({ striker: strikerName || 'Striker', nonStriker: nonStrikerName || 'Non-Striker', bowler: bowlerName || 'Bowler' })}
                >
                    <Ionicons name="play" size={18} color={colors.background} style={{ marginRight: 8 }} />
                    <Text style={styles.startBtnText}>Start Scoring</Text>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },

    header: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 14,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
    },
    headerTitle: { color: colors.textPrimary, fontSize: 20, fontWeight: '700' },
    headerSubtitle: { color: colors.textMuted, fontSize: 12, marginTop: 2 },

    content: { padding: 20 },

    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 10,
        marginTop: 4,
    },
    sectionTitle: {
        color: colors.textPrimary,
        fontWeight: '600',
        fontSize: 14,
    },

    card: {
        backgroundColor: colors.card,
        borderRadius: 14,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: colors.cardBorder,
    },
    fieldDivider: {
        height: 1,
        backgroundColor: colors.card,
        marginVertical: 12,
    },

    chipContainer: { marginTop: 10, marginBottom: 4 },
    chipLabel: {
        fontSize: 10,
        color: colors.inputPlaceholder,
        marginBottom: 6,
        fontWeight: '700',
        letterSpacing: 0.8,
    },
    chip: {
        backgroundColor: colors.card,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.cardBorder,
    },
    chipActive: {
        backgroundColor: '#10B981',
        borderColor: '#10B981',
    },
    chipText: {
        fontSize: 12,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    chipTextActive: {
        color: colors.background,
        fontWeight: '700',
    },

    startBtn: {
        backgroundColor: '#10B981',
        padding: 16,
        borderRadius: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
        marginBottom: 40,
        elevation: 4,
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    startBtnText: {
        color: colors.background,
        fontWeight: '800',
        fontSize: 16,
    },
});