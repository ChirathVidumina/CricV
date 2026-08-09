import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    StatusBar,
    Animated,
    LayoutChangeEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme, ThemeColors } from './ThemeContext';
import AutocompleteInput from './AutocompleteInput';
import { PLAYER_PROFILE_STORAGE_KEY } from './PlayerProfileScreen';

interface SquadSelectionScreenProps {
    battingTeam: string;
    bowlingTeam: string;
    playersPerTeam?: number;
    onContinue: (squads: { battingSquad: string[]; bowlingSquad: string[] }) => void;
    onSkip: () => void;
    onBack: () => void;
}

const DEFAULT_BATTING_SQUAD = [
    'Rohit Sharma', 'Virat Kohli', 'Shubman Gill', 'KL Rahul',
    'Hardik Pandya', 'Ravindra Jadeja', 'Jasprit Bumrah', 'Mohammed Siraj',
    'Kuldeep Yadav', 'Axar Patel', 'Washington Sundar'
];

const DEFAULT_BOWLING_SQUAD = [
    'Pathum Nissanka', 'Kusal Perera', 'Avishka Fernando', 'Charith Asalanka',
    'Janith Liyanage', 'Dasun Shanaka', 'Dunith Wellalage', 'Maheesh Theekshana',
    'Dilshan Madushanka', 'Wanindu Hasaranga', 'Matheesha Pathirana'
];

export default function SquadSelectionScreen({
    battingTeam,
    bowlingTeam,
    playersPerTeam = 11,
    onContinue,
    onSkip,
    onBack,
}: SquadSelectionScreenProps) {
    const { colors, isDark } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const targetSize = playersPerTeam && playersPerTeam > 0 ? playersPerTeam : 11;
    const [activeTeamTab, setActiveTeamTab] = useState<'batting' | 'bowling'>('batting');

    const [battingSquad, setBattingSquad] = useState<string[]>(Array(targetSize).fill(''));
    const [bowlingSquad, setBowlingSquad] = useState<string[]>(Array(targetSize).fill(''));
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
        const list: Array<string | { fullName: string; displayName?: string }> = [...DEFAULT_BATTING_SQUAD];
        if (userProfile) {
            list.unshift(userProfile);
        }
        return list;
    }, [userProfile]);

    const bowlingSuggestions = useMemo(() => {
        const list: Array<string | { fullName: string; displayName?: string }> = [...DEFAULT_BOWLING_SQUAD];
        if (userProfile) {
            list.unshift(userProfile);
        }
        return list;
    }, [userProfile]);

    // Animated values for sliding tab background and list transitions
    const [tabBarWidth, setTabBarWidth] = useState<number>(0);
    const tabSlideAnim = useRef(new Animated.Value(0)).current; // 0 for batting, 1 for bowling
    const listTranslateX = useRef(new Animated.Value(0)).current;
    const listOpacity = useRef(new Animated.Value(1)).current;

    const handleTabChange = (targetTab: 'batting' | 'bowling') => {
        if (targetTab === activeTeamTab) return;
        const isGoingRight = targetTab === 'bowling';

        // 1. Animate active background pill
        Animated.spring(tabSlideAnim, {
            toValue: isGoingRight ? 1 : 0,
            tension: 65,
            friction: 11,
            useNativeDriver: true,
        }).start();

        // 2. Animate list out and in
        Animated.parallel([
            Animated.timing(listTranslateX, {
                toValue: isGoingRight ? -30 : 30,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(listOpacity, {
                toValue: 0,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setActiveTeamTab(targetTab);
            listTranslateX.setValue(isGoingRight ? 30 : -30);
            Animated.parallel([
                Animated.spring(listTranslateX, {
                    toValue: 0,
                    tension: 65,
                    friction: 11,
                    useNativeDriver: true,
                }),
                Animated.timing(listOpacity, {
                    toValue: 1,
                    duration: 120,
                    useNativeDriver: true,
                }),
            ]).start();
        });
    };

    const handlePlayerChange = (team: 'batting' | 'bowling', index: number, value: string) => {
        if (team === 'batting') {
            const updated = [...battingSquad];
            updated[index] = value;
            setBattingSquad(updated);
        } else {
            const updated = [...bowlingSquad];
            updated[index] = value;
            setBowlingSquad(updated);
        }
    };

    const handleAutoFill = (team: 'batting' | 'bowling') => {
        const sourceSquad = team === 'batting' ? DEFAULT_BATTING_SQUAD : DEFAULT_BOWLING_SQUAD;
        let filledSquad = [...sourceSquad];
        if (targetSize > filledSquad.length) {
            const extraCount = targetSize - filledSquad.length;
            for (let i = 1; i <= extraCount; i++) {
                filledSquad.push(`Player ${filledSquad.length + 1}`);
            }
        } else if (targetSize < filledSquad.length) {
            filledSquad = filledSquad.slice(0, targetSize);
        }

        if (team === 'batting') {
            setBattingSquad(filledSquad);
        } else {
            setBowlingSquad(filledSquad);
        }
    };

    const handleClearSquad = (team: 'batting' | 'bowling') => {
        if (team === 'batting') {
            setBattingSquad(Array(targetSize).fill(''));
        } else {
            setBowlingSquad(Array(targetSize).fill(''));
        }
    };

    const handleAddSlot = (team: 'batting' | 'bowling') => {
        if (team === 'batting') {
            setBattingSquad(prev => [...prev, '']);
        } else {
            setBowlingSquad(prev => [...prev, '']);
        }
    };

    const handleRemoveSlot = (team: 'batting' | 'bowling', index: number) => {
        if (team === 'batting') {
            setBattingSquad(prev => prev.filter((_, i) => i !== index));
        } else {
            setBowlingSquad(prev => prev.filter((_, i) => i !== index));
        }
    };

    const handleSaveAndContinue = () => {
        const cleanedBatting = battingSquad.filter(p => p.trim() !== '');
        const cleanedBowling = bowlingSquad.filter(p => p.trim() !== '');

        onContinue({
            battingSquad: cleanedBatting.length > 0 ? cleanedBatting : [],
            bowlingSquad: cleanedBowling.length > 0 ? cleanedBowling : [],
        });
    };

    const currentSquad = activeTeamTab === 'batting' ? battingSquad : bowlingSquad;

    const tabWidth = tabBarWidth > 0 ? (tabBarWidth - 8) / 2 : 0;
    const tabPillTranslateX = tabSlideAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, tabWidth],
    });

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle={colors.statusBar} backgroundColor={colors.background} />

            {/* Header Banner */}
            <View style={styles.header}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity onPress={onBack} style={{ paddingVertical: 4, paddingRight: 10 }}>
                        <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
                    </TouchableOpacity>
                    <View>
                        <Text style={styles.headerTitle}>Team Squads</Text>
                        <Text style={styles.headerSubtitle}>{targetSize} players per team</Text>
                    </View>
                </View>

                <TouchableOpacity onPress={onSkip} style={styles.skipHeaderBtn}>
                    <Text style={styles.skipHeaderText}>SKIP</Text>
                    <Ionicons name="chevron-forward" size={13} color={colors.textSecondary} />
                </TouchableOpacity>
            </View>

            {/* Animated Tab Switcher */}
            <View
                style={styles.tabBarContainer}
                onLayout={(e: LayoutChangeEvent) => setTabBarWidth(e.nativeEvent.layout.width)}
            >
                {tabWidth > 0 && (
                    <Animated.View
                        style={[
                            styles.animatedTabPill,
                            {
                                width: tabWidth,
                                transform: [{ translateX: tabPillTranslateX }],
                            },
                        ]}
                    />
                )}

                <TouchableOpacity
                    style={styles.tabBtn}
                    activeOpacity={0.8}
                    onPress={() => handleTabChange('batting')}
                >
                    <Ionicons
                        name="baseball"
                        size={15}
                        color={activeTeamTab === 'batting' ? '#10B981' : colors.textMuted}
                        style={{ marginRight: 5 }}
                    />
                    <Text style={[styles.tabText, activeTeamTab === 'batting' && styles.activeTabText]}>
                        {battingTeam} ({battingSquad.filter(p => p.trim()).length}/{battingSquad.length})
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.tabBtn}
                    activeOpacity={0.8}
                    onPress={() => handleTabChange('bowling')}
                >
                    <Ionicons
                        name="shield"
                        size={15}
                        color={activeTeamTab === 'bowling' ? '#3B82F6' : colors.textMuted}
                        style={{ marginRight: 5 }}
                    />
                    <Text style={[styles.tabText, activeTeamTab === 'bowling' && styles.activeTabText]}>
                        {bowlingTeam} ({bowlingSquad.filter(p => p.trim()).length}/{bowlingSquad.length})
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Compact Action Bar */}
            <View style={styles.infoBanner}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.infoTitle}>
                        {activeTeamTab === 'batting' ? battingTeam : bowlingTeam} Squad
                    </Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                    <TouchableOpacity
                        style={styles.clearBtn}
                        onPress={() => handleClearSquad(activeTeamTab)}
                    >
                        <Ionicons name="trash-outline" size={13} color="#EF4444" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.autoFillBtn}
                        onPress={() => handleAutoFill(activeTeamTab)}
                    >
                        <Ionicons name="flash-outline" size={13} color="#10B981" />
                        <Text style={styles.autoFillText}>Auto-Fill</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Main Animated List Container */}
            <Animated.View
                style={[
                    styles.listAnimatedContainer,
                    {
                        opacity: listOpacity,
                        transform: [{ translateX: listTranslateX }],
                    },
                ]}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                    {/* Compact Player Slots */}
                    <View style={styles.squadCard}>
                        {currentSquad.map((player, idx) => (
                            <View key={idx} style={styles.playerRow}>
                                <View style={styles.playerNumBadge}>
                                    <Text style={styles.playerNumText}>{idx + 1}</Text>
                                </View>
                                <AutocompleteInput
                                    containerStyle={{ flex: 1 }}
                                    inputStyle={styles.playerInput}
                                    placeholder={`Player ${idx + 1}`}
                                    value={player}
                                    onChangeText={(val) => handlePlayerChange(activeTeamTab, idx, val)}
                                    suggestions={activeTeamTab === 'batting' ? battingSuggestions : bowlingSuggestions}
                                />
                                {currentSquad.length > 2 && (
                                    <TouchableOpacity
                                        style={styles.removeSlotBtn}
                                        onPress={() => handleRemoveSlot(activeTeamTab, idx)}
                                    >
                                        <Ionicons name="close-circle" size={16} color={colors.inputPlaceholder} />
                                    </TouchableOpacity>
                                )}
                            </View>
                        ))}

                        <TouchableOpacity
                            style={styles.addSlotBtn}
                            onPress={() => handleAddSlot(activeTeamTab)}
                        >
                            <Ionicons name="add-circle-outline" size={16} color="#10B981" />
                            <Text style={styles.addSlotText}>Add Player Slot</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </Animated.View>

            {/* Bottom Actions Bar */}
            <View style={styles.actionRow}>
                <TouchableOpacity style={styles.skipBtn} onPress={onSkip}>
                    <Text style={styles.skipBtnText}>Skip</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.continueBtn} onPress={handleSaveAndContinue}>
                    <Text style={styles.continueBtnText}>Continue</Text>
                    <Ionicons name="arrow-forward" size={16} color={colors.background} />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
    },
    headerTitle: {
        color: colors.textPrimary,
        fontSize: 18,
        fontWeight: '700',
    },
    headerSubtitle: {
        color: colors.textMuted,
        fontSize: 11,
    },
    skipHeaderBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.card,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: colors.cardBorder,
        gap: 3,
    },
    skipHeaderText: {
        color: colors.textSecondary,
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.5,
    },

    /* Tab Switcher with Sliding Active Background Pill */
    tabBarContainer: {
        position: 'relative',
        flexDirection: 'row',
        marginHorizontal: 16,
        marginTop: 8,
        marginBottom: 4,
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 4,
        borderWidth: 1,
        borderColor: colors.cardBorder,
    },
    animatedTabPill: {
        position: 'absolute',
        top: 4,
        bottom: 4,
        left: 4,
        backgroundColor: colors.buttonBg,
        borderRadius: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 2,
    },
    tabBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        zIndex: 2,
    },
    tabText: {
        fontSize: 12,
        color: colors.textMuted,
        fontWeight: '600',
    },
    activeTabText: {
        color: colors.textPrimary,
        fontWeight: '700',
    },

    /* Compact Action Bar */
    infoBanner: {
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.cardBorder,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginHorizontal: 16,
        marginVertical: 4,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    infoTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: colors.textPrimary,
    },
    autoFillBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.accentBg,
        borderWidth: 1,
        borderColor: colors.accentBorder,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        gap: 3,
    },
    autoFillText: {
        color: '#10B981',
        fontSize: 11,
        fontWeight: '700',
    },
    clearBtn: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.accentRedBg,
        borderWidth: 1,
        borderColor: colors.accentRedBg,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },

    /* Main Animated List Container */
    listAnimatedContainer: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 4,
        paddingBottom: 10,
    },

    /* Ultra-Compact Player Rows (Readability Retained at 14px Font) */
    squadCard: {
        backgroundColor: colors.card,
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderWidth: 1,
        borderColor: colors.cardBorder,
    },
    playerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 38,
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
    },
    playerNumBadge: {
        width: 24,
        height: 24,
        borderRadius: 6,
        backgroundColor: colors.buttonBg,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    playerNumText: {
        fontSize: 11,
        fontWeight: '700',
        color: colors.textMuted,
    },
    playerInput: {
        flex: 1,
        fontSize: 14,
        color: colors.textPrimary,
        paddingVertical: 0,
        height: 36,
    },
    removeSlotBtn: {
        padding: 4,
        marginLeft: 4,
    },
    addSlotBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        marginTop: 6,
        marginBottom: 4,
        backgroundColor: 'rgba(16,185,129,0.06)',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.accentBorder,
        borderStyle: 'dashed',
        gap: 6,
    },
    addSlotText: {
        color: '#10B981',
        fontSize: 12,
        fontWeight: '600',
    },

    /* Bottom Action Row */
    actionRow: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingTop: 6,
        paddingBottom: 12,
        gap: 10,
        borderTopWidth: 1,
        borderTopColor: colors.divider,
        backgroundColor: colors.background,
    },
    skipBtn: {
        flex: 1,
        backgroundColor: colors.card,
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.cardBorder,
    },
    skipBtnText: {
        color: colors.textSecondary,
        fontSize: 13,
        fontWeight: '600',
    },
    continueBtn: {
        flex: 1.5,
        backgroundColor: '#10B981',
        paddingVertical: 10,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        elevation: 3,
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
    },
    continueBtnText: {
        color: colors.background,
        fontSize: 14,
        fontWeight: '800',
    },
});
