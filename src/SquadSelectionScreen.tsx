import React, { useState, useMemo } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, ThemeColors } from './ThemeContext';

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

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle={colors.statusBar} backgroundColor={colors.background} />

            {/* Header */}
            <View style={styles.header}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity onPress={onBack} style={{ paddingVertical: 4, paddingRight: 12 }}>
                        <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
                    </TouchableOpacity>
                    <View>
                        <Text style={styles.headerTitle}>Team Squads</Text>
                        <Text style={styles.headerSubtitle}>{targetSize} players per team</Text>
                    </View>
                </View>

                <TouchableOpacity onPress={onSkip} style={styles.skipHeaderBtn}>
                    <Text style={styles.skipHeaderText}>SKIP</Text>
                    <Ionicons name="chevron-forward" size={14} color={colors.textSecondary} />
                </TouchableOpacity>
            </View>

            {/* Team Tabs */}
            <View style={styles.tabBar}>
                <TouchableOpacity
                    style={[styles.tabBtn, activeTeamTab === 'batting' && styles.activeTabBtn]}
                    onPress={() => setActiveTeamTab('batting')}
                >
                    <Ionicons name="baseball" size={16} color={activeTeamTab === 'batting' ? '#10B981' : colors.textMuted} style={{ marginRight: 6 }} />
                    <Text style={[styles.tabText, activeTeamTab === 'batting' && styles.activeTabText]}>
                        {battingTeam} ({battingSquad.filter(p => p.trim()).length}/{battingSquad.length})
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tabBtn, activeTeamTab === 'bowling' && styles.activeTabBtn]}
                    onPress={() => setActiveTeamTab('bowling')}
                >
                    <Ionicons name="shield" size={16} color={activeTeamTab === 'bowling' ? '#3B82F6' : colors.textMuted} style={{ marginRight: 6 }} />
                    <Text style={[styles.tabText, activeTeamTab === 'bowling' && styles.activeTabText]}>
                        {bowlingTeam} ({bowlingSquad.filter(p => p.trim()).length}/{bowlingSquad.length})
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

                {/* Info Banner */}
                <View style={styles.infoBanner}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.infoTitle}>
                            {activeTeamTab === 'batting' ? battingTeam : bowlingTeam} Squad
                        </Text>
                        <Text style={styles.infoSubtitle}>
                            Add player names or auto-fill
                        </Text>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 6 }}>
                        <TouchableOpacity
                            style={styles.clearBtn}
                            onPress={() => handleClearSquad(activeTeamTab)}
                        >
                            <Ionicons name="trash-outline" size={14} color="#EF4444" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.autoFillBtn}
                            onPress={() => handleAutoFill(activeTeamTab)}
                        >
                            <Ionicons name="flash-outline" size={14} color="#10B981" />
                            <Text style={styles.autoFillText}>Auto-Fill</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Player Slots */}
                <View style={styles.squadCard}>
                    {currentSquad.map((player, idx) => (
                        <View key={idx} style={styles.playerRow}>
                            <View style={styles.playerNumBadge}>
                                <Text style={styles.playerNumText}>{idx + 1}</Text>
                            </View>
                            <TextInput
                                style={styles.playerInput}
                                placeholder={`Player ${idx + 1}`}
                                placeholderTextColor={colors.inputPlaceholder}
                                value={player}
                                onChangeText={(val) => handlePlayerChange(activeTeamTab, idx, val)}
                            />
                            {currentSquad.length > 2 && (
                                <TouchableOpacity
                                    style={styles.removeSlotBtn}
                                    onPress={() => handleRemoveSlot(activeTeamTab, idx)}
                                >
                                    <Ionicons name="close-circle" size={18} color={colors.inputPlaceholder} />
                                </TouchableOpacity>
                            )}
                        </View>
                    ))}

                    <TouchableOpacity
                        style={styles.addSlotBtn}
                        onPress={() => handleAddSlot(activeTeamTab)}
                    >
                        <Ionicons name="add-circle-outline" size={18} color="#10B981" />
                        <Text style={styles.addSlotText}>Add Player Slot</Text>
                    </TouchableOpacity>
                </View>

                {/* Bottom Actions */}
                <View style={styles.actionRow}>
                    <TouchableOpacity style={styles.skipBtn} onPress={onSkip}>
                        <Text style={styles.skipBtnText}>Skip</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.continueBtn} onPress={handleSaveAndContinue}>
                        <Text style={styles.continueBtnText}>Continue</Text>
                        <Ionicons name="arrow-forward" size={18} color={colors.background} />
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
    },
    headerTitle: {
        color: colors.textPrimary,
        fontSize: 20,
        fontWeight: '700',
    },
    headerSubtitle: {
        color: colors.textMuted,
        fontSize: 12,
    },
    skipHeaderBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.card,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.cardBorder,
        gap: 4,
    },
    skipHeaderText: {
        color: colors.textSecondary,
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    tabBar: {
        flexDirection: 'row',
        marginHorizontal: 16,
        marginTop: 12,
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 4,
        borderWidth: 1,
        borderColor: colors.cardBorder,
    },
    tabBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 10,
    },
    activeTabBtn: {
        backgroundColor: colors.buttonBg,
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
    content: {
        padding: 16,
    },
    infoBanner: {
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.cardBorder,
        borderRadius: 12,
        padding: 14,
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    infoTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: 2,
    },
    infoSubtitle: {
        fontSize: 11,
        color: colors.textMuted,
    },
    autoFillBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.accentBg,
        borderWidth: 1,
        borderColor: colors.accentBorder,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        gap: 4,
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
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
    },
    squadCard: {
        backgroundColor: colors.card,
        borderRadius: 14,
        padding: 12,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: colors.cardBorder,
    },
    playerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: colors.card,
    },
    playerNumBadge: {
        width: 28,
        height: 28,
        borderRadius: 8,
        backgroundColor: colors.card,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    playerNumText: {
        fontSize: 12,
        fontWeight: '700',
        color: colors.textMuted,
    },
    playerInput: {
        flex: 1,
        fontSize: 14,
        color: colors.textPrimary,
        paddingVertical: 4,
    },
    removeSlotBtn: {
        padding: 4,
        marginLeft: 6,
    },
    addSlotBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        marginTop: 8,
        backgroundColor: 'rgba(16,185,129,0.06)',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors.accentBorder,
        borderStyle: 'dashed',
        gap: 6,
    },
    addSlotText: {
        color: '#10B981',
        fontSize: 13,
        fontWeight: '600',
    },
    actionRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 40,
    },
    skipBtn: {
        flex: 1,
        backgroundColor: colors.card,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.cardBorder,
    },
    skipBtnText: {
        color: colors.textSecondary,
        fontSize: 14,
        fontWeight: '600',
    },
    continueBtn: {
        flex: 1.5,
        backgroundColor: '#10B981',
        paddingVertical: 14,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        elevation: 4,
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    continueBtnText: {
        color: colors.background,
        fontSize: 15,
        fontWeight: '800',
    },
});
