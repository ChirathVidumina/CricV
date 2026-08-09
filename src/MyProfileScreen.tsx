import React, { useState, useMemo } from 'react';
import {
    SafeAreaView,
    ScrollView,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, ThemeColors } from './ThemeContext';

interface MyProfileScreenProps {
    profileData?: any;
    onEditProfile?: () => void;
    navigation?: any;
}

export default function MyProfileScreen({
    profileData,
    onEditProfile,
    navigation,
}: MyProfileScreenProps) {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const StatCard = ({ label, value }: { label: string; value: string | number }) => (
    <View style={styles.statCard}>
        <Text style={styles.statLabel} numberOfLines={1}>{label}</Text>
        <Text style={styles.statValue}>{value}</Text>
    </View>
  );

    const [activeTab, setActiveTab] = useState<'Overview' | 'Stats' | 'Matches'>('Overview');
    const [statsCategory, setStatsCategory] = useState<'Batting' | 'Bowling' | 'Fielding'>('Batting');

    const handleEdit = () => {
        if (onEditProfile) {
            onEditProfile();
        } else if (navigation?.navigate) {
            navigation.navigate('PlayerProfileScreen');
        }
    };

    // Helper to format concise role subtitle e.g. "Batter • RHB • RAOB"
    const getRoleSubtitle = () => {
        const role = profileData?.playingRole || 'Batter';
        
        let batAbbr = 'RHB';
        if (profileData?.battingHand === 'Left Handed' || profileData?.battingStyle === 'Left Handed') {
            batAbbr = 'LHB';
        }

        let bowlAbbr = 'None';
        const category = profileData?.bowlingCategory || profileData?.bowlingStyle;
        if (category === 'Fast' || category === 'Medium Fast') {
            const arm = profileData?.bowlingArm === 'Left Arm' ? 'LAF' : 'RAF';
            bowlAbbr = category === 'Fast' ? arm : `${arm}M`;
        } else if (category === 'Spin' || category === 'Spinner') {
            if (profileData?.spinType?.includes('Leg')) bowlAbbr = 'RALB';
            else if (profileData?.spinType?.includes('Chinaman')) bowlAbbr = 'LACB';
            else if (profileData?.spinType?.includes('Orthodox')) bowlAbbr = 'SLA';
            else bowlAbbr = 'RAOB';
        }

        return `${role} • ${batAbbr} • ${bowlAbbr}`;
    };

    const displayName = profileData?.displayName || profileData?.fullName || 'CricV Player';

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle={colors.statusBar} backgroundColor={colors.background} />

            {/* Top Header Section (CricV Blue Theme) */}
            <View style={styles.topHeaderCard}>
                {/* Header Edit Action */}
                <View style={styles.topActionRow}>
                    <TouchableOpacity onPress={handleEdit} style={styles.editBadgeBtn}>
                        <Ionicons name="create-outline" size={18} color="white" />
                        <Text style={styles.editBadgeText}>Edit Profile</Text>
                    </TouchableOpacity>
                </View>

                {/* Avatar */}
                <View style={styles.avatarWrapper}>
                    <View style={styles.avatar}>
                        <Ionicons name="person" size={44} color="#2563EB" />
                    </View>
                </View>

                {/* Name and Role Subtitle */}
                <Text style={styles.displayNameText}>{displayName}</Text>
                <Text style={styles.roleSubtitleText}>{getRoleSubtitle()}</Text>

                {/* Custom Horizontal Tab Bar */}
                <View style={styles.tabBar}>
                    {(['Overview', 'Stats', 'Matches'] as const).map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            style={[
                                styles.tabItem,
                                activeTab === tab && styles.tabItemActive,
                            ]}
                            onPress={() => setActiveTab(tab)}
                        >
                            <Text
                                style={[
                                    styles.tabText,
                                    activeTab === tab ? styles.tabTextActive : styles.tabTextInactive,
                                ]}
                            >
                                {tab}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Body Content Area */}
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {activeTab === 'Overview' && (
                    <View style={styles.overviewCard}>
                        {/* Row 1: Full Width Full Name */}
                        <View style={styles.gridRowFull}>
                            <View style={styles.labelHeader}>
                                <Ionicons name="person-outline" size={16} color="#2563EB" style={{ marginRight: 6 }} />
                                <Text style={styles.labelText}>Full Name</Text>
                            </View>
                            <Text style={styles.valueText}>{profileData?.fullName || 'Not specified'}</Text>
                        </View>

                        <View style={styles.divider} />

                        {/* Row 2: 2 Equal Columns (Batting Style & Bowling Style) */}
                        <View style={styles.gridRowTwoCol}>
                            <View style={styles.gridCol}>
                                <View style={styles.labelHeader}>
                                    <Ionicons name="fitness-outline" size={16} color="#2563EB" style={{ marginRight: 6 }} />
                                    <Text style={styles.labelText}>Batting Style</Text>
                                </View>
                                <Text style={styles.valueText}>
                                    {profileData?.battingHand || profileData?.battingStyle || 'Right Handed'}
                                </Text>
                            </View>

                            <View style={styles.gridCol}>
                                <View style={styles.labelHeader}>
                                    <Ionicons name="sparkles-outline" size={16} color="#2563EB" style={{ marginRight: 6 }} />
                                    <Text style={styles.labelText}>Bowling Style</Text>
                                </View>
                                <Text style={styles.valueText}>
                                    {profileData?.bowlingCategory || profileData?.bowlingStyle || 'None'}
                                    {profileData?.bowlingArm ? ` (${profileData.bowlingArm})` : ''}
                                    {profileData?.spinType ? ` (${profileData.spinType})` : ''}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        {/* Row 3: 2 Equal Columns (Player Role & Current Team) */}
                        <View style={styles.gridRowTwoCol}>
                            <View style={styles.gridCol}>
                                <View style={styles.labelHeader}>
                                    <Ionicons name="ribbon-outline" size={16} color="#2563EB" style={{ marginRight: 6 }} />
                                    <Text style={styles.labelText}>Player Role</Text>
                                </View>
                                <Text style={styles.valueText}>{profileData?.playingRole || 'Batter'}</Text>
                            </View>

                            <View style={styles.gridCol}>
                                <View style={styles.labelHeader}>
                                    <Ionicons name="shirt-outline" size={16} color="#2563EB" style={{ marginRight: 6 }} />
                                    <Text style={styles.labelText}>Current Team</Text>
                                </View>
                                <Text style={styles.valueText}>{profileData?.currentTeam || 'None'}</Text>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        {/* Row 4: Full Width Previous Teams */}
                        <View style={styles.gridRowFull}>
                            <View style={styles.labelHeader}>
                                <Ionicons name="time-outline" size={16} color="#2563EB" style={{ marginRight: 6 }} />
                                <Text style={styles.labelText}>Previous Teams</Text>
                            </View>
                            <Text style={styles.valueText}>{profileData?.previousTeams || 'None'}</Text>
                        </View>
                    </View>
                )}

                {/* Stats Tab Content */}
                {activeTab === 'Stats' && (
                    <View style={styles.statsContainer}>
                        {/* Sub-Tab Navigation Bar */}
                        <View style={styles.subTabBar}>
                            {(['Batting', 'Bowling', 'Fielding'] as const).map((cat) => (
                                <TouchableOpacity
                                    key={cat}
                                    style={[
                                        styles.subTabBtn,
                                        statsCategory === cat && styles.subTabBtnActive,
                                    ]}
                                    onPress={() => setStatsCategory(cat)}
                                >
                                    <Text
                                        style={[
                                            styles.subTabText,
                                            statsCategory === cat && styles.subTabTextActive,
                                        ]}
                                    >
                                        {cat}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Data Grids */}
                        <View style={styles.statsGrid}>
                            {statsCategory === 'Batting' && (
                                <>
                                    <StatCard label="Matches" value="0" />
                                    <StatCard label="Innings" value="0" />
                                    <StatCard label="Runs" value="0" />
                                    <StatCard label="Not Outs" value="0" />
                                    <StatCard label="Best Score" value="0" />
                                    <StatCard label="Strike Rate" value="0.00" />
                                    <StatCard label="Average" value="0.00" />
                                    <StatCard label="Fours" value="0" />
                                    <StatCard label="Sixes" value="0" />
                                    <StatCard label="Thirties" value="0" />
                                    <StatCard label="Fifties" value="0" />
                                    <StatCard label="Hundreds" value="0" />
                                    <StatCard label="Ducks" value="0" />
                                </>
                            )}

                            {statsCategory === 'Bowling' && (
                                <>
                                    <StatCard label="Matches" value="0" />
                                    <StatCard label="Innings" value="0" />
                                    <StatCard label="Overs" value="0.0" />
                                    <StatCard label="Maidens" value="0" />
                                    <StatCard label="Wickets" value="0" />
                                    <StatCard label="Runs" value="0" />
                                    <StatCard label="B. Bowling" value="-" />
                                    <StatCard label="Eco. Rate" value="0.00" />
                                    <StatCard label="Strike Rate" value="0.00" />
                                    <StatCard label="Average" value="0.00" />
                                    <StatCard label="Wides" value="0" />
                                    <StatCard label="No Balls" value="0" />
                                    <StatCard label="Dot balls" value="0" />
                                    <StatCard label="4 Wickets" value="0" />
                                    <StatCard label="5 Wickets" value="0" />
                                </>
                            )}

                            {statsCategory === 'Fielding' && (
                                <>
                                    <StatCard label="Matches" value="0" />
                                    <StatCard label="Catches" value="0" />
                                    <StatCard label="Stumpings" value="0" />
                                    <StatCard label="Run Outs" value="0" />
                                </>
                            )}
                        </View>
                    </View>
                )}

                {/* Empty State for Matches Tab */}
                {activeTab === 'Matches' && (
                    <View style={styles.emptyStateCard}>
                        <Ionicons name="baseball-outline" size={64} color={colors.textSecondary} style={{ marginBottom: 16 }} />
                        <Text style={styles.emptyTitle}>Matches Coming Soon...</Text>
                        <Text style={styles.emptySubtitle}>
                            Your match logs, scorecard summaries, and past game performances will be listed here.
                        </Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    topHeaderCard: {
        backgroundColor: colors.background,
        paddingTop: 14,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
    },
    topActionRow: {
        width: '100%',
        paddingHorizontal: 16,
        alignItems: 'flex-end',
    },
    editBadgeBtn: {
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
    editBadgeText: {
        color: '#10B981',
        fontSize: 12,
        fontWeight: '700',
    },
    avatarWrapper: {
        marginTop: 4,
        marginBottom: 10,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.accentBg,
        borderWidth: 2,
        borderColor: '#10B981',
        alignItems: 'center',
        justifyContent: 'center',
    },
    displayNameText: {
        color: colors.textPrimary,
        fontSize: 22,
        fontWeight: '700',
        textAlign: 'center',
    },
    roleSubtitleText: {
        color: colors.textSecondary,
        fontSize: 13,
        marginTop: 4,
        marginBottom: 16,
        textAlign: 'center',
    },
    tabBar: {
        flexDirection: 'row',
        width: '100%',
        paddingHorizontal: 12,
        borderTopWidth: 1,
        borderTopColor: colors.card,
    },
    tabItem: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabItemActive: {
        borderBottomWidth: 2,
        borderBottomColor: '#10B981',
    },
    tabText: {
        fontSize: 14,
    },
    tabTextActive: {
        color: '#10B981',
        fontWeight: '700',
    },
    tabTextInactive: {
        color: colors.textMuted,
        fontWeight: '500',
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
    overviewCard: {
        backgroundColor: colors.card,
        borderRadius: 14,
        padding: 18,
        borderWidth: 1,
        borderColor: colors.cardBorder,
    },
    gridRowFull: {
        width: '100%',
    },
    gridRowTwoCol: {
        flexDirection: 'row',
        width: '100%',
        gap: 12,
    },
    gridCol: {
        flex: 1,
    },
    labelHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    labelText: {
        fontSize: 11,
        fontWeight: '700',
        color: colors.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    valueText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textPrimary,
        lineHeight: 18,
    },
    divider: {
        height: 1,
        backgroundColor: colors.card,
        marginVertical: 14,
    },
    emptyStateCard: {
        backgroundColor: colors.card,
        borderRadius: 14,
        padding: 32,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.cardBorder,
        marginTop: 10,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: 8,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 13,
        color: colors.textMuted,
        textAlign: 'center',
        lineHeight: 18,
        maxWidth: 280,
    },
    statsContainer: {
        width: '100%',
    },
    subTabBar: {
        flexDirection: 'row',
        backgroundColor: colors.card,
        borderRadius: 20,
        padding: 4,
        marginBottom: 16,
        gap: 6,
        borderWidth: 1,
        borderColor: colors.cardBorder,
    },
    subTabBtn: {
        flex: 1,
        paddingVertical: 8,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    subTabBtnActive: {
        backgroundColor: '#10B981',
    },
    subTabText: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.textMuted,
    },
    subTabTextActive: {
        color: colors.background,
        fontWeight: '800',
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        justifyContent: 'flex-start',
    },
    statCard: {
        width: '31%',
        backgroundColor: colors.card,
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 4,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.cardBorder,
    },
    statLabel: {
        fontSize: 10,
        color: colors.textMuted,
        fontWeight: '600',
        marginBottom: 4,
        textAlign: 'center',
        textTransform: 'uppercase',
    },
    statValue: {
        fontSize: 16,
        fontWeight: '800',
        color: '#10B981',
        textAlign: 'center',
    },
});
