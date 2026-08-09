import React, { useState, useMemo } from 'react';
import {
    SafeAreaView,
    KeyboardAvoidingView,
    ScrollView,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Platform,
    StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, ThemeColors } from './ThemeContext';

interface PlayerProfileScreenProps {
    initialData?: any;
    onSaveProfile?: (data: any) => void;
    navigation?: any;
}

export default function PlayerProfileScreen({
    initialData,
    onSaveProfile,
    navigation,
}: PlayerProfileScreenProps) {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
    const [fullName, setFullName] = useState(initialData?.fullName || '');
    const [displayName, setDisplayName] = useState(initialData?.displayName || '');
    
    const [playingRole, setPlayingRole] = useState(initialData?.playingRole || 'Batter');
    const [battingHand, setBattingHand] = useState(initialData?.battingHand || 'Right Handed');
    const [bowlingStyle, setBowlingStyle] = useState(initialData?.bowlingStyle || 'None');
    const [bowlingArm, setBowlingArm] = useState(initialData?.bowlingArm || '');
    const [spinType, setSpinType] = useState(initialData?.spinType || '');

    const handleSave = () => {
        const data = {
            fullName: fullName.trim() || 'Player',
            displayName: displayName.trim() || fullName.trim() || 'Player',
            playingRole,
            battingHand,
            bowlingStyle,
            bowlingArm: (bowlingStyle === 'Fast' || bowlingStyle === 'Medium Fast') ? bowlingArm : '',
            spinType: bowlingStyle === 'Spin' ? spinType : '',
        };

        if (onSaveProfile) {
            onSaveProfile(data);
        }
        if (navigation?.navigate) {
            navigation.navigate('MyStatsScreen');
        }
    };

    const roleOptions = ['Batter', 'Bowler', 'All-Rounder', 'Wicket Keeper'];
    const battingHandOptions = ['Right Handed', 'Left Handed'];
    const bowlingStyleOptions = ['None', 'Fast', 'Medium Fast', 'Spin'];
    const bowlingArmOptions = ['Right Arm', 'Left Arm'];
    const spinTypeOptions = [
        'Right Arm Off Break',
        'Left Arm Orthodox',
        'Right Arm Leg Spin',
        'Left Arm Chinaman',
    ];

    const handleBowlingStyleSelect = (style: string) => {
        setBowlingStyle(style);
        if (style === 'Fast' || style === 'Medium Fast') {
            if (!bowlingArm) setBowlingArm('Right Arm');
        } else if (style === 'Spin') {
            if (!spinType) setSpinType('Right Arm Off Break');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle={colors.statusBar} backgroundColor={colors.background} />
            
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerTitleRow}>
                    <Ionicons name="person-circle-outline" size={24} color="#10B981" style={{ marginRight: 8 }} />
                    <Text style={styles.headerTitle}>Set Up Profile</Text>
                </View>
                <Text style={styles.headerSubtitle}>CricV Player Identity</Text>
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Main Card Container */}
                    <View style={styles.card}>
                        <Text style={styles.cardHeaderTitle}>Personal Information</Text>

                        {/* Full Name */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Full Name</Text>
                            <TextInput
                                style={styles.textInput}
                                value={fullName}
                                onChangeText={setFullName}
                                placeholder="Enter your full name"
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>

                        {/* Display Name */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Display Name</Text>
                            <TextInput
                                style={styles.textInput}
                                value={displayName}
                                onChangeText={setDisplayName}
                                placeholder="Enter display name (e.g. Sunny)"
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>

                        <Text style={[styles.cardHeaderTitle, { marginTop: 12 }]}>Cricket Playing Profile</Text>

                        {/* Playing Role Chips */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Playing Role</Text>
                            <View style={styles.chipRow}>
                                {roleOptions.map((role) => (
                                    <TouchableOpacity
                                        key={role}
                                        style={[
                                            styles.chip,
                                            playingRole === role ? styles.chipSelected : styles.chipUnselected,
                                        ]}
                                        onPress={() => setPlayingRole(role)}
                                    >
                                        <Text
                                            style={[
                                                styles.chipText,
                                                playingRole === role ? styles.chipTextSelected : styles.chipTextUnselected,
                                            ]}
                                        >
                                            {role}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Batting Hand Chips */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Batting Hand</Text>
                            <View style={styles.chipRow}>
                                {battingHandOptions.map((hand) => (
                                    <TouchableOpacity
                                        key={hand}
                                        style={[
                                            styles.chip,
                                            battingHand === hand ? styles.chipSelected : styles.chipUnselected,
                                        ]}
                                        onPress={() => setBattingHand(hand)}
                                    >
                                        <Text
                                            style={[
                                                styles.chipText,
                                                battingHand === hand ? styles.chipTextSelected : styles.chipTextUnselected,
                                            ]}
                                        >
                                            {hand}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Bowling Style Chips */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Bowling Style</Text>
                            <View style={styles.chipRow}>
                                {bowlingStyleOptions.map((style) => (
                                    <TouchableOpacity
                                        key={style}
                                        style={[
                                            styles.chip,
                                            bowlingStyle === style ? styles.chipSelected : styles.chipUnselected,
                                        ]}
                                        onPress={() => handleBowlingStyleSelect(style)}
                                    >
                                        <Text
                                            style={[
                                                styles.chipText,
                                                bowlingStyle === style ? styles.chipTextSelected : styles.chipTextUnselected,
                                            ]}
                                        >
                                            {style}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Conditional Logic: Fast or Medium Fast -> Bowling Arm */}
                        {(bowlingStyle === 'Fast' || bowlingStyle === 'Medium Fast') && (
                            <View style={styles.conditionalBox}>
                                <Text style={styles.conditionalTitle}>Bowling Arm</Text>
                                <View style={styles.chipRow}>
                                    {bowlingArmOptions.map((arm) => (
                                        <TouchableOpacity
                                            key={arm}
                                            style={[
                                                styles.chip,
                                                bowlingArm === arm ? styles.chipSelected : styles.chipUnselected,
                                            ]}
                                            onPress={() => setBowlingArm(arm)}
                                        >
                                            <Text
                                                style={[
                                                    styles.chipText,
                                                    bowlingArm === arm ? styles.chipTextSelected : styles.chipTextUnselected,
                                                ]}
                                            >
                                                {arm}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* Conditional Logic: Spin -> Spin Type */}
                        {bowlingStyle === 'Spin' && (
                            <View style={styles.conditionalBox}>
                                <Text style={styles.conditionalTitle}>Spin Type</Text>
                                <View style={styles.chipRow}>
                                    {spinTypeOptions.map((type) => (
                                        <TouchableOpacity
                                            key={type}
                                            style={[
                                                styles.chip,
                                                spinType === type ? styles.chipSelected : styles.chipUnselected,
                                            ]}
                                            onPress={() => setSpinType(type)}
                                        >
                                            <Text
                                                style={[
                                                    styles.chipText,
                                                    spinType === type ? styles.chipTextSelected : styles.chipTextUnselected,
                                                ]}
                                            >
                                                {type}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* Save Profile Button */}
                        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                            <Text style={styles.saveBtnText}>Save Profile</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        backgroundColor: colors.background,
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
    },
    headerTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitle: {
        color: colors.textPrimary,
        fontSize: 20,
        fontWeight: '700',
    },
    headerSubtitle: {
        color: colors.textMuted,
        fontSize: 12,
        marginTop: 2,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
    card: {
        backgroundColor: colors.card,
        borderRadius: 14,
        padding: 20,
        borderWidth: 1,
        borderColor: colors.cardBorder,
        marginBottom: 20,
    },
    cardHeaderTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: 16,
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: colors.textMuted,
        marginBottom: 6,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    textInput: {
        backgroundColor: colors.card,
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 10,
        fontSize: 14,
        color: colors.textPrimary,
        borderWidth: 1,
        borderColor: colors.cardBorder,
    },
    chipRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    chip: {
        paddingVertical: 9,
        paddingHorizontal: 14,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    chipUnselected: {
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.cardBorder,
    },
    chipSelected: {
        backgroundColor: '#10B981',
        borderWidth: 1,
        borderColor: '#10B981',
    },
    chipText: {
        fontSize: 13,
    },
    chipTextUnselected: {
        color: colors.textSecondary,
        fontWeight: '500',
    },
    chipTextSelected: {
        color: colors.background,
        fontWeight: '800',
    },
    conditionalBox: {
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 14,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.card,
    },
    conditionalTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#10B981',
        marginBottom: 10,
    },
    saveBtn: {
        backgroundColor: '#10B981',
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        elevation: 4,
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    saveBtnText: {
        color: colors.background,
        fontSize: 16,
        fontWeight: '800',
    },
});
