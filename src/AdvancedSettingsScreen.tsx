import React, { useState, useMemo } from 'react';
import {
    SafeAreaView,
    ScrollView,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Switch,
    StyleSheet,
    StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, ThemeColors } from './ThemeContext';

export interface AdvancedSettingsValues {
    playersPerTeam: string;
    wicketsPerInnings: number;
    ballsPerOver: number;
    noBallReball: boolean;
    noBallPenalty: string;
    wideReball: boolean;
    widePenalty: string;
}

interface AdvancedSettingsScreenProps {
    initialValues?: Partial<AdvancedSettingsValues>;
    onSaveSettings?: (values: AdvancedSettingsValues) => void;
    onClose?: () => void;
    navigation?: any;
}

export default function AdvancedSettingsScreen({
    initialValues,
    onSaveSettings,
    onClose,
    navigation,
}: AdvancedSettingsScreenProps) {
    const { colors, isDark } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const [playersPerTeam, setPlayersPerTeam] = useState(initialValues?.playersPerTeam ?? '11');
    
    const initialPlayersNum = parseInt(initialValues?.playersPerTeam ?? '11', 10);
    const defaultWickets = initialValues?.wicketsPerInnings ?? (isNaN(initialPlayersNum) ? 10 : Math.max(1, initialPlayersNum - 1));
    const [wicketsPerInnings, setWicketsPerInnings] = useState<number>(defaultWickets);

    const [ballsPerOver, setBallsPerOver] = useState<number>(initialValues?.ballsPerOver ?? 6);
    const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

    const [noBallReball, setNoBallReball] = useState<boolean>(initialValues?.noBallReball ?? true);
    const [noBallPenalty, setNoBallPenalty] = useState(initialValues?.noBallPenalty ?? '1');
    const [wideReball, setWideReball] = useState<boolean>(initialValues?.wideReball ?? true);
    const [widePenalty, setWidePenalty] = useState(initialValues?.widePenalty ?? '1');

    const handlePlayersChangeText = (text: string) => {
        setPlayersPerTeam(text);
        const num = parseInt(text.replace(/[^0-9]/g, ''), 10);
        if (!isNaN(num) && num > 0) {
            setWicketsPerInnings(Math.max(1, num - 1));
        }
    };

    const handleSave = () => {
        const settings: AdvancedSettingsValues = {
            playersPerTeam: playersPerTeam.trim() || '11',
            wicketsPerInnings,
            ballsPerOver,
            noBallReball,
            noBallPenalty: noBallPenalty.trim() || '1',
            wideReball,
            widePenalty: widePenalty.trim() || '1',
        };

        if (onSaveSettings) {
            onSaveSettings(settings);
        }
        if (onClose) {
            onClose();
        } else if (navigation?.goBack) {
            navigation.goBack();
        }
    };

    const ballOptions = [4, 5, 6, 7, 8];

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle={colors.statusBar} backgroundColor={colors.background} />

            {/* Top Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onClose || (() => navigation?.goBack?.())} style={{ paddingVertical: 4, paddingRight: 12 }}>
                    <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Advanced Settings</Text>
                <View style={{ width: 32 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Main Card Container */}
                <View style={styles.card}>
                    {/* Row 1: Players per team */}
                    <View style={styles.row}>
                        <Text style={styles.label}>Players per team?</Text>
                        <TextInput
                            style={styles.numericInput}
                            value={playersPerTeam}
                            onChangeText={handlePlayersChangeText}
                            keyboardType="numeric"
                            placeholder="11"
                            placeholderTextColor={colors.inputPlaceholder}
                        />
                    </View>

                    {/* Row 2: Wickets per innings (Calculated & Read-only) */}
                    <View style={styles.row}>
                        <Text style={styles.subLabel}>Wickets per innings</Text>
                        <Text style={styles.readOnlyValueText}>{wicketsPerInnings}</Text>
                    </View>

                    {/* Row 3: Balls per over (Anchored Dropdown) */}
                    <View style={[styles.row, { zIndex: 1000 }]}>
                        <Text style={styles.label}>Balls per over?</Text>

                        <View style={{ position: 'relative', zIndex: 1000 }}>
                            <TouchableOpacity
                                style={styles.dropdownTrigger}
                                onPress={() => setIsDropdownOpen(prev => !prev)}
                            >
                                <Text style={styles.dropdownTriggerText}>{ballsPerOver}</Text>
                                <Ionicons name="chevron-down" size={16} color="#10B981" style={{ marginLeft: 8 }} />
                            </TouchableOpacity>

                            {/* Anchored Dropdown List */}
                            {isDropdownOpen && (
                                <View style={styles.anchoredDropdownList}>
                                    {ballOptions.map((num, idx) => {
                                        const isSelected = ballsPerOver === num;
                                        const isLast = idx === ballOptions.length - 1;
                                        return (
                                            <TouchableOpacity
                                                key={num}
                                                style={[
                                                    styles.anchoredOptionItem,
                                                    isSelected ? styles.anchoredOptionSelected : styles.anchoredOptionUnselected,
                                                    !isLast && styles.anchoredOptionBorder,
                                                ]}
                                                onPress={() => {
                                                    setBallsPerOver(num);
                                                    setIsDropdownOpen(false);
                                                }}
                                            >
                                                <Text
                                                    style={[
                                                        styles.anchoredOptionText,
                                                        isSelected ? styles.anchoredOptionTextSelected : styles.anchoredOptionTextUnselected,
                                                    ]}
                                                >
                                                    {num}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            )}
                        </View>
                    </View>

                    <View style={styles.divider} />

                    {/* No Ball Rules Section */}
                    <Text style={styles.sectionTitle}>No Ball Rules</Text>

                    {/* Row 1: Re-ball delivery */}
                    <View style={styles.row}>
                        <Text style={styles.subLabel}>Re-ball delivery</Text>
                        <Switch
                            value={noBallReball}
                            onValueChange={setNoBallReball}
                            trackColor={{ true: '#10B981', false: colors.tabBarBorder }}
                            thumbColor="#FFFFFF"
                        />
                    </View>

                    {/* Row 2: Penalty run(s) */}
                    <View style={styles.row}>
                        <Text style={styles.subLabel}>Penalty run(s)</Text>
                        <TextInput
                            style={styles.numericInput}
                            value={noBallPenalty}
                            onChangeText={setNoBallPenalty}
                            keyboardType="numeric"
                            placeholder="1"
                            placeholderTextColor={colors.inputPlaceholder}
                        />
                    </View>

                    <View style={styles.divider} />

                    {/* Wide Ball Rules Section */}
                    <Text style={styles.sectionTitle}>Wide Ball Rules</Text>

                    {/* Row 1: Re-ball delivery */}
                    <View style={styles.row}>
                        <Text style={styles.subLabel}>Re-ball delivery</Text>
                        <Switch
                            value={wideReball}
                            onValueChange={setWideReball}
                            trackColor={{ true: '#10B981', false: colors.tabBarBorder }}
                            thumbColor="#FFFFFF"
                        />
                    </View>

                    {/* Row 2: Penalty run(s) */}
                    <View style={styles.row}>
                        <Text style={styles.subLabel}>Penalty run(s)</Text>
                        <TextInput
                            style={styles.numericInput}
                            value={widePenalty}
                            onChangeText={setWidePenalty}
                            keyboardType="numeric"
                            placeholder="1"
                            placeholderTextColor={colors.inputPlaceholder}
                        />
                    </View>
                </View>

                {/* Save & Close Button */}
                <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                    <Text style={styles.saveBtnText}>Save & Close</Text>
                </TouchableOpacity>
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
        backgroundColor: colors.card,
        paddingVertical: 14,
        paddingHorizontal: 16,
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
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
    card: {
        backgroundColor: colors.card,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.cardBorder,
        padding: 16,
        marginBottom: 16,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
    },
    label: {
        fontSize: 14,
        color: colors.textPrimary,
        fontWeight: '600',
    },
    subLabel: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    numericInput: {
        borderBottomWidth: 1.5,
        borderBottomColor: '#10B981',
        width: 50,
        textAlign: 'right',
        fontSize: 15,
        color: '#10B981',
        fontWeight: '700',
        paddingVertical: 2,
    },
    readOnlyValueText: {
        fontSize: 15,
        color: '#10B981',
        fontWeight: '800',
        paddingRight: 4,
    },
    dropdownTrigger: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.cardBorder,
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 8,
    },
    dropdownTriggerText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#10B981',
    },
    anchoredDropdownList: {
        position: 'absolute',
        top: 42,
        right: 0,
        width: 76,
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.cardBorder,
        borderRadius: 10,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        zIndex: 1000,
        overflow: 'hidden',
    },
    anchoredOptionItem: {
        paddingVertical: 10,
        paddingHorizontal: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    anchoredOptionSelected: {
        backgroundColor: '#10B981',
    },
    anchoredOptionUnselected: {
        backgroundColor: colors.card,
    },
    anchoredOptionBorder: {
        borderBottomWidth: 1,
        borderColor: colors.divider,
    },
    anchoredOptionText: {
        fontSize: 14,
        textAlign: 'center',
    },
    anchoredOptionTextSelected: {
        color: '#FFFFFF',
        fontWeight: '800',
    },
    anchoredOptionTextUnselected: {
        color: colors.textPrimary,
        fontWeight: '600',
    },
    divider: {
        height: 1,
        backgroundColor: colors.divider,
        marginVertical: 12,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#10B981',
        marginTop: 4,
        marginBottom: 6,
        letterSpacing: 0.5,
    },
    saveBtn: {
        backgroundColor: '#10B981',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 3,
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
    },
    saveBtnText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '800',
    },
});
