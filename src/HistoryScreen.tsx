import React, { useState, useMemo } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    StatusBar,
    Modal,
    Alert,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScoreboardView, { InningsScorecard } from '../components/ScoreboardView';
import { useTheme, ThemeColors } from './ThemeContext';

interface MatchItem {
    id: string;
    team1: string;
    team2: string;
    score1Runs: string;
    score1Overs: string;
    score2Runs: string;
    score2Overs: string;
    statusInfo: string;
    date: string;
    type: string;
    isInProgress?: boolean;
    isPersonal?: boolean;
    inningsList?: InningsScorecard[];
}

interface StandingItem {
    rank: number;
    teamName: string;
    played: number;
    won: number;
    lost: number;
    points: number;
    nrr: string;
}

interface TopPerformer {
    name: string;
    team: string;
    value: string;
}

interface TournamentHistoryItem {
    id: string;
    name: string;
    winner: string;
    runnerUp: string;
    teamsCount: number;
    matchesCount: number;
    category: string;
    date: string;
    status: 'Completed' | 'Ongoing';
    topScorer?: TopPerformer;
    topBowler?: TopPerformer;
    mvp?: TopPerformer;
    standings?: StandingItem[];
    fixtures?: MatchItem[];
}

const PALETTE = [
    '#4F46E5', // Indigo
    '#E11D48', // Rose / Red
    '#059669', // Emerald Green
    '#D97706', // Amber
    '#2563EB', // Blue
    '#7C3AED', // Purple
    '#0891B2', // Cyan
    '#DB2777', // Pink
];

const getTeamInitials = (name: string): string => {
    if (!name) return 'TM';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
};

const getTeamColor = (name: string): string => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % PALETTE.length;
    return PALETTE[index];
};

export default function HistoryScreen({ navigation }: any) {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
    const [activeTab, setActiveTab] = useState<'Matches' | 'Tournaments' | 'My Matches'>('Matches');
    const [selectedScorecardMatch, setSelectedScorecardMatch] = useState<MatchItem | null>(null);
    const [selectedTournament, setSelectedTournament] = useState<TournamentHistoryItem | null>(null);
    const [tournamentHubTab, setTournamentHubTab] = useState<'Overview' | 'Points Table' | 'Fixtures'>('Overview');

    // Cleared Matches State
    const [matches, setMatches] = useState<MatchItem[]>([]);

    // Cleared Tournaments State
    const [tournaments, setTournaments] = useState<TournamentHistoryItem[]>([]);

    // Cleared My Personal Matches State
    const [myMatches, setMyMatches] = useState<MatchItem[]>([]);

    const allMatches = Array.from(
        new Map([...matches, ...myMatches].map(m => [m.id, m])).values()
    );

    const handleDeleteMatch = (id: string) => {
        Alert.alert(
            'Delete Match Record',
            'Are you sure you want to delete this match record?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        setMatches(prev => prev.filter(m => m.id !== id));
                        setMyMatches(prev => prev.filter(m => m.id !== id));
                    },
                },
            ]
        );
    };

    const handleDeleteTournament = (id: string) => {
        Alert.alert(
            'Delete Tournament',
            'Are you sure you want to delete this tournament record?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        setTournaments(prev => prev.filter(t => t.id !== id));
                    },
                },
            ]
        );
    };

    const handleResumeMatch = (item: MatchItem) => {
        if (navigation?.navigate) {
            navigation.navigate('Home');
        }
    };

    const handleResumeTournament = (item: TournamentHistoryItem) => {
        if (navigation?.navigate) {
            navigation.navigate('Teams & Tournaments');
        }
    };

    const renderEmptyState = (title: string, subtitle: string, iconName: any) => (
        <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
                <Ionicons name={iconName} size={42} color={colors.textSecondary} />
            </View>
            <Text style={styles.emptyTitle}>{title}</Text>
            <Text style={styles.emptySubtitle}>{subtitle}</Text>
        </View>
    );

    const renderMatchItem = ({ item }: { item: MatchItem }) => {
        const initials1 = getTeamInitials(item.team1);
        const initials2 = getTeamInitials(item.team2);
        const color1 = getTeamColor(item.team1);
        const color2 = getTeamColor(item.team2);

        return (
            <View style={styles.card}>
                {/* Top Status & Date Bar */}
                <View style={styles.cardTopHeader}>
                    {item.isInProgress ? (
                        <View style={styles.liveBadgeContainer}>
                            <View style={styles.livePulseDot} />
                            <Text style={styles.liveBadgeText}>IN PROGRESS</Text>
                        </View>
                    ) : (
                        <View style={styles.completedBadgeContainer}>
                            <Ionicons name="checkmark-circle-sharp" size={13} color="#10B981" />
                            <Text style={styles.completedBadgeText}>COMPLETED</Text>
                        </View>
                    )}

                    <View style={styles.dateContainer}>
                        <Ionicons name="calendar-outline" size={13} color={colors.textSecondary} style={{ marginRight: 4 }} />
                        <Text style={styles.dateText}>{item.date}</Text>
                    </View>
                </View>

                {/* Team Battle Card Box */}
                <View style={styles.teamsBox}>
                    {/* Team 1 */}
                    <View style={styles.teamRow}>
                        <View style={[styles.avatarCircle, { backgroundColor: color1 }]}>
                            <Text style={styles.avatarText}>{initials1}</Text>
                        </View>
                        <Text style={styles.teamNameText} numberOfLines={1}>{item.team1}</Text>

                        <View style={styles.scorePillGroup}>
                            <Text style={styles.runsText}>{item.score1Runs}</Text>
                            <View style={styles.oversBadge}>
                                <Text style={styles.oversText}>{item.score1Overs}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Subtle Micro Separator */}
                    <View style={styles.vsSeparatorRow}>
                        <View style={styles.vsLine} />
                        <View style={styles.vsBadge}>
                            <Text style={styles.vsText}>VS</Text>
                        </View>
                        <View style={styles.vsLine} />
                    </View>

                    {/* Team 2 */}
                    <View style={styles.teamRow}>
                        <View style={[styles.avatarCircle, { backgroundColor: color2 }]}>
                            <Text style={styles.avatarText}>{initials2}</Text>
                        </View>
                        <Text style={styles.teamNameText} numberOfLines={1}>{item.team2}</Text>

                        <View style={styles.scorePillGroup}>
                            <Text style={styles.runsText}>{item.score2Runs}</Text>
                            <View style={styles.oversBadge}>
                                <Text style={styles.oversText}>{item.score2Overs}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Match Summary / Outcome Tinted Banner */}
                <View style={[styles.statusBanner, item.isInProgress ? styles.statusBannerLive : styles.statusBannerCompleted]}>
                    <Ionicons
                        name={item.isInProgress ? "disc-outline" : "trophy-outline"}
                        size={15}
                        color={item.isInProgress ? "#2563EB" : "#10B981"}
                    />
                    <Text style={[styles.statusBannerText, item.isInProgress ? styles.statusTextLive : styles.statusTextCompleted]} numberOfLines={1}>
                        {item.statusInfo}
                    </Text>
                </View>

                {/* Bottom Interactive Action Buttons */}
                <View style={styles.actionRow}>
                    <View style={styles.primaryActionsGroup}>
                        {item.isInProgress && (
                            <TouchableOpacity
                                style={styles.resumeBtn}
                                onPress={() => handleResumeMatch(item)}
                            >
                                <Ionicons name="play-circle" size={16} color="white" />
                                <Text style={styles.resumeBtnText}>Resume Match</Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            style={item.isInProgress ? styles.scorecardOutlineBtn : styles.scorecardPrimaryBtn}
                            onPress={() => setSelectedScorecardMatch(item)}
                        >
                            <Ionicons
                                name="stats-chart"
                                size={15}
                                color={item.isInProgress ? "#334155" : "white"}
                            />
                            <Text style={item.isInProgress ? styles.scorecardOutlineBtnText : styles.scorecardPrimaryBtnText}>
                                Scorecard
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={styles.deleteIconButton}
                        onPress={() => handleDeleteMatch(item.id)}
                    >
                        <Ionicons name="trash-outline" size={17} color="#EF4444" />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const renderTournamentItem = ({ item }: { item: TournamentHistoryItem }) => {
        const isCompleted = item.status === 'Completed';
        const winnerInitials = getTeamInitials(item.winner);
        const runnerInitials = getTeamInitials(item.runnerUp);
        const winnerColor = getTeamColor(item.winner);
        const runnerColor = getTeamColor(item.runnerUp);

        return (
            <View style={styles.card}>
                {/* Top Header Row */}
                <View style={styles.cardTopHeader}>
                    <View style={styles.tournamentTagContainer}>
                        <Ionicons name="trophy" size={13} color="#D97706" />
                        <Text style={styles.tournamentTagText}>{item.category} TOURNAMENT</Text>
                    </View>

                    {isCompleted ? (
                        <View style={styles.completedBadgeContainer}>
                            <Ionicons name="checkmark-circle-sharp" size={13} color="#10B981" />
                            <Text style={styles.completedBadgeText}>COMPLETED</Text>
                        </View>
                    ) : (
                        <View style={styles.liveBadgeContainer}>
                            <View style={styles.livePulseDot} />
                            <Text style={styles.liveBadgeText}>ONGOING</Text>
                        </View>
                    )}
                </View>

                {/* Title & Date */}
                <Text style={styles.tournamentTitle}>{item.name}</Text>
                <Text style={[styles.dateText, { marginBottom: 12 }]}>{item.date}</Text>

                {/* Champion & Runner Details Box */}
                <View style={styles.tournamentDetailsBox}>
                    <View style={styles.winnerRow}>
                        <View style={[styles.avatarCircleSmall, { backgroundColor: winnerColor }]}>
                            <Text style={styles.avatarTextSmall}>{winnerInitials}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.winnerLabel}>CHAMPION</Text>
                            <Text style={styles.winnerValue}>{item.winner}</Text>
                        </View>
                        <Ionicons name="ribbon-sharp" size={22} color="#F59E0B" />
                    </View>

                    {item.runnerUp !== 'Pending' && (
                        <View style={[styles.runnerRow, { marginTop: 8 }]}>
                            <View style={[styles.avatarCircleSmall, { backgroundColor: runnerColor }]}>
                                <Text style={styles.avatarTextSmall}>{runnerInitials}</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.runnerLabel}>RUNNER-UP</Text>
                                <Text style={styles.runnerValue}>{item.runnerUp}</Text>
                            </View>
                        </View>
                    )}
                </View>

                {/* Bottom Action Row */}
                <View style={styles.actionRow}>
                    <View style={styles.primaryActionsGroup}>
                        {!isCompleted && (
                            <TouchableOpacity
                                style={styles.resumeBtn}
                                onPress={() => handleResumeTournament(item)}
                            >
                                <Ionicons name="play-circle" size={16} color="white" />
                                <Text style={styles.resumeBtnText}>Resume</Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            style={!isCompleted ? styles.scorecardOutlineBtn : styles.scorecardPrimaryBtn}
                            onPress={() => {
                                setSelectedTournament(item);
                                setTournamentHubTab('Overview');
                            }}
                        >
                            <Ionicons name="eye-outline" size={15} color={!isCompleted ? "#334155" : "white"} />
                            <Text style={!isCompleted ? styles.scorecardOutlineBtnText : styles.scorecardPrimaryBtnText}>
                                View Details
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={styles.deleteIconButton}
                        onPress={() => handleDeleteTournament(item.id)}
                    >
                        <Ionicons name="trash-outline" size={17} color="#EF4444" />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle={colors.statusBar} backgroundColor={colors.background} />

            {/* Header Banner */}
            <View style={styles.header}>
                <View style={styles.headerTitleRow}>
                    <Ionicons name="time" size={24} color="#10B981" style={{ marginRight: 8 }} />
                    <Text style={styles.headerTitle}>Match History</Text>
                </View>

                {/* 3 Segmented Top Tabs */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tabButton, activeTab === 'Matches' && styles.activeTabButton]}
                        onPress={() => setActiveTab('Matches')}
                    >
                        <Ionicons name="baseball" size={15} color={activeTab === 'Matches' ? '#10B981' : colors.textSecondary} style={{ marginRight: 4 }} />
                        <Text style={[styles.tabText, activeTab === 'Matches' && styles.activeTabText]}>
                            Matches ({allMatches.length})
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.tabButton, activeTab === 'Tournaments' && styles.activeTabButton]}
                        onPress={() => setActiveTab('Tournaments')}
                    >
                        <Ionicons name="trophy" size={15} color={activeTab === 'Tournaments' ? '#F59E0B' : colors.textSecondary} style={{ marginRight: 4 }} />
                        <Text style={[styles.tabText, activeTab === 'Tournaments' && styles.activeTabText]}>
                            Tournaments ({tournaments.length})
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.tabButton, activeTab === 'My Matches' && styles.activeTabButton]}
                        onPress={() => setActiveTab('My Matches')}
                    >
                        <Ionicons name="person" size={15} color={activeTab === 'My Matches' ? '#3B82F6' : colors.textSecondary} style={{ marginRight: 4 }} />
                        <Text style={[styles.tabText, activeTab === 'My Matches' && styles.activeTabText]}>
                            My Matches ({myMatches.length})
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Main Content List */}
            <View style={styles.content}>
                {activeTab === 'Matches' && (
                    <FlatList
                        data={allMatches}
                        keyExtractor={(item) => item.id}
                        renderItem={renderMatchItem}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={renderEmptyState(
                            'No Matches Found',
                            'Start a new match from the Home screen to view your match history here.',
                            'baseball-outline'
                        )}
                    />
                )}

                {activeTab === 'Tournaments' && (
                    <FlatList
                        data={tournaments}
                        keyExtractor={(item) => item.id}
                        renderItem={renderTournamentItem}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={renderEmptyState(
                            'No Tournaments Found',
                            'Create or join a tournament to see tournament standings and match schedules.',
                            'trophy-outline'
                        )}
                    />
                )}

                {activeTab === 'My Matches' && (
                    <FlatList
                        data={myMatches}
                        keyExtractor={(item) => item.id}
                        renderItem={renderMatchItem}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={renderEmptyState(
                            'No Personal Matches',
                            'Matches played by your personal squads will appear here.',
                            'person-outline'
                        )}
                    />
                )}
            </View>

            {/* MATCH SCOREBOARD MODAL */}
            {selectedScorecardMatch && (
                <Modal visible={true} animationType="slide">
                    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
                        <View style={{ backgroundColor: colors.background, padding: 16, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.divider }}>
                            <TouchableOpacity
                                onPress={() => setSelectedScorecardMatch(null)}
                                style={{ paddingVertical: 4, paddingRight: 12 }}
                            >
                                <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
                            </TouchableOpacity>
                            <View style={{ flex: 1 }}>
                                <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: 'bold' }}>Match Scorecard</Text>
                                <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                                    {selectedScorecardMatch.team1} vs {selectedScorecardMatch.team2}
                                </Text>
                            </View>
                        </View>

                        <View style={{ flex: 1 }}>
                            <ScoreboardView
                                matchResultText={selectedScorecardMatch.statusInfo}
                                inningsList={selectedScorecardMatch.inningsList}
                                teamName={selectedScorecardMatch.team1}
                                totalScore={selectedScorecardMatch.score1Runs}
                                overs={selectedScorecardMatch.score1Overs}
                            />
                        </View>
                    </SafeAreaView>
                </Modal>
            )}

            {/* TOURNAMENT HUB MODAL */}
            {selectedTournament && (
                <Modal visible={true} animationType="slide">
                    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
                        {/* Header Banner */}
                        <View style={{ backgroundColor: colors.background, paddingTop: 16, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: colors.divider }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                                <TouchableOpacity
                                    onPress={() => setSelectedTournament(null)}
                                    style={{ paddingVertical: 4, paddingRight: 12 }}
                                >
                                    <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
                                </TouchableOpacity>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: 'bold' }}>{selectedTournament.name}</Text>
                                    <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{selectedTournament.category} Format  •  {selectedTournament.date}</Text>
                                </View>
                            </View>

                            {/* Segmented Hub Tabs */}
                            <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.divider }}>
                                {['Overview', 'Points Table', 'Fixtures'].map((tab) => {
                                    const isSelected = tournamentHubTab === tab;
                                    return (
                                        <TouchableOpacity
                                            key={tab}
                                            style={{
                                                flex: 1,
                                                paddingVertical: 10,
                                                alignItems: 'center',
                                                borderBottomWidth: isSelected ? 3 : 0,
                                                borderBottomColor: 'white',
                                            }}
                                            onPress={() => setTournamentHubTab(tab as any)}
                                        >
                                            <Text style={{ color: isSelected ? 'white' : colors.textSecondary, fontWeight: isSelected ? 'bold' : '600', fontSize: 14 }}>
                                                {tab}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>

                        {/* Content ScrollView */}
                        <ScrollView style={{ flex: 1, padding: 16 }} showsVerticalScrollIndicator={false}>
                            {/* Overview Tab */}
                            {tournamentHubTab === 'Overview' && (
                                <View style={{ gap: 14, paddingBottom: 40 }}>
                                    {/* Champion Card */}
                                    <View style={styles.hubCard}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                            <Ionicons name="trophy" size={22} color="#F59E0B" />
                                            <Text style={styles.hubCardTitle}>Tournament Champion</Text>
                                        </View>
                                        <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#10B981' }}>
                                            {selectedTournament.winner}
                                        </Text>
                                        {selectedTournament.runnerUp !== 'Pending' && (
                                            <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 4 }}>
                                                Runner-Up: <Text style={{ fontWeight: 'bold', color: colors.inputPlaceholder }}>{selectedTournament.runnerUp}</Text>
                                            </Text>
                                        )}
                                    </View>

                                    {/* Top Performers Grid */}
                                    {selectedTournament.topScorer && (
                                        <View style={styles.hubCard}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                                <Ionicons name="baseball-outline" size={20} color="#2563EB" />
                                                <Text style={styles.hubCardTitle}>Top Run Scorer (Orange Cap)</Text>
                                            </View>
                                            <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.tabBarBorder }}>
                                                {selectedTournament.topScorer.name}
                                            </Text>
                                            <Text style={{ fontSize: 13, color: '#2563EB', fontWeight: '600', marginTop: 2 }}>
                                                {selectedTournament.topScorer.value} ({selectedTournament.topScorer.team})
                                            </Text>
                                        </View>
                                    )}

                                    {selectedTournament.topBowler && (
                                        <View style={styles.hubCard}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                                <Ionicons name="shield-outline" size={20} color="#9333EA" />
                                                <Text style={styles.hubCardTitle}>Top Wicket Taker (Purple Cap)</Text>
                                            </View>
                                            <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.tabBarBorder }}>
                                                {selectedTournament.topBowler.name}
                                            </Text>
                                            <Text style={{ fontSize: 13, color: '#9333EA', fontWeight: '600', marginTop: 2 }}>
                                                {selectedTournament.topBowler.value} ({selectedTournament.topBowler.team})
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            )}

                            {/* Points Table Tab */}
                            {tournamentHubTab === 'Points Table' && (
                                <View style={[styles.hubCard, { padding: 0, overflow: 'hidden', marginBottom: 40 }]}>
                                    {/* Table Header */}
                                    <View style={{ flexDirection: 'row', backgroundColor: '#EFF6FF', paddingVertical: 10, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: '#BFDBFE' }}>
                                        <Text style={{ width: 30, fontWeight: 'bold', fontSize: 12, color: '#1E3A8A' }}>#</Text>
                                        <Text style={{ flex: 1, fontWeight: 'bold', fontSize: 12, color: '#1E3A8A' }}>Team</Text>
                                        <Text style={{ width: 28, textAlign: 'center', fontWeight: 'bold', fontSize: 12, color: '#1E3A8A' }}>P</Text>
                                        <Text style={{ width: 28, textAlign: 'center', fontWeight: 'bold', fontSize: 12, color: '#1E3A8A' }}>W</Text>
                                        <Text style={{ width: 28, textAlign: 'center', fontWeight: 'bold', fontSize: 12, color: '#1E3A8A' }}>L</Text>
                                        <Text style={{ width: 36, textAlign: 'center', fontWeight: 'bold', fontSize: 12, color: '#1E3A8A' }}>PTS</Text>
                                        <Text style={{ width: 55, textAlign: 'right', fontWeight: 'bold', fontSize: 12, color: '#1E3A8A' }}>NRR</Text>
                                    </View>

                                    {/* Table Rows */}
                                    {selectedTournament.standings?.map((st) => (
                                        <View key={st.rank} style={{ flexDirection: 'row', paddingVertical: 12, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: colors.textPrimary, alignItems: 'center' }}>
                                            <Text style={{ width: 30, fontWeight: 'bold', fontSize: 13, color: colors.textMuted }}>{st.rank}</Text>
                                            <Text style={{ flex: 1, fontWeight: 'bold', fontSize: 14, color: colors.tabBarBorder }} numberOfLines={1}>{st.teamName}</Text>
                                            <Text style={{ width: 28, textAlign: 'center', fontSize: 13, color: colors.inputPlaceholder }}>{st.played}</Text>
                                            <Text style={{ width: 28, textAlign: 'center', fontSize: 13, color: '#10B981', fontWeight: 'bold' }}>{st.won}</Text>
                                            <Text style={{ width: 28, textAlign: 'center', fontSize: 13, color: '#EF4444' }}>{st.lost}</Text>
                                            <Text style={{ width: 36, textAlign: 'center', fontSize: 14, fontWeight: 'bold', color: '#2563EB' }}>{st.points}</Text>
                                            <Text style={{ width: 55, textAlign: 'right', fontSize: 12, color: colors.textMuted }}>{st.nrr}</Text>
                                        </View>
                                    ))}
                                </View>
                            )}

                            {/* Fixtures Tab */}
                            {tournamentHubTab === 'Fixtures' && (
                                <View style={{ gap: 12, paddingBottom: 40 }}>
                                    {selectedTournament.fixtures && selectedTournament.fixtures.length > 0 ? (
                                        selectedTournament.fixtures.map((fx) => (
                                            <View key={fx.id} style={styles.hubCard}>
                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                                                    <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#2563EB' }}>{fx.type}</Text>
                                                    <Text style={{ fontSize: 12, color: colors.textSecondary }}>{fx.date}</Text>
                                                </View>
                                                <Text style={{ fontSize: 15, fontWeight: 'bold', color: colors.tabBarBorder }}>{fx.team1} vs {fx.team2}</Text>
                                                <Text style={{ fontSize: 13, color: colors.inputPlaceholder, marginTop: 4 }}>{fx.score1Runs} vs {fx.score2Runs}</Text>
                                                <Text style={{ fontSize: 12.5, fontWeight: '600', color: '#10B981', marginTop: 6 }}>{fx.statusInfo}</Text>
                                            </View>
                                        ))
                                    ) : (
                                        <View style={{ padding: 40, alignItems: 'center' }}>
                                            <Ionicons name="trophy-outline" size={48} color={colors.textSecondary} style={{ marginBottom: 12 }} />
                                            <Text style={{ fontSize: 15, color: colors.textMuted, fontWeight: '600' }}>No match fixtures available</Text>
                                        </View>
                                    )}
                                </View>
                            )}
                        </ScrollView>
                    </SafeAreaView>
                </Modal>
            )}
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
        paddingTop: 16,
        paddingHorizontal: 16,
        paddingBottom: 14,
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
    },
    headerTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 14,
    },
    headerTitle: {
        color: colors.textPrimary,
        fontSize: 22,
        fontWeight: '700',
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 4,
        borderWidth: 1,
        borderColor: colors.cardBorder,
    },
    tabButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 9,
        borderRadius: 10,
    },
    activeTabButton: {
        backgroundColor: colors.buttonBg,
    },
    tabText: {
        color: colors.textMuted,
        fontSize: 12,
        fontWeight: '600',
    },
    activeTabText: {
        color: colors.textPrimary,
        fontWeight: '700',
    },
    content: {
        flex: 1,
    },
    listContent: {
        padding: 16,
        paddingBottom: 30,
        flexGrow: 1,
    },

    // Empty State Styling
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
        paddingHorizontal: 24,
    },
    emptyIconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.card,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.cardBorder,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: 6,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 13,
        color: colors.textMuted,
        textAlign: 'center',
        lineHeight: 20,
    },

    // Card Styling
    card: {
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.cardBorder,
    },
    cardTopHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    liveBadgeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.accentAmberBg,
        borderWidth: 1,
        borderColor: colors.accentAmberBorder,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        gap: 6,
    },
    livePulseDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#F59E0B',
    },
    liveBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#F59E0B',
        letterSpacing: 0.8,
    },
    completedBadgeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.accentBg,
        borderWidth: 1,
        borderColor: colors.accentBorder,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        gap: 4,
    },
    completedBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#10B981',
        letterSpacing: 0.8,
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dateText: {
        fontSize: 12,
        color: colors.textMuted,
        fontWeight: '500',
    },
    teamsBox: {
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: colors.card,
    },
    teamRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    avatarText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 13,
    },
    teamNameText: {
        fontSize: 15,
        fontWeight: '700',
        color: colors.textPrimary,
        flex: 1,
    },
    scorePillGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    runsText: {
        fontSize: 16,
        fontWeight: '800',
        color: '#10B981',
    },
    oversBadge: {
        backgroundColor: colors.card,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: colors.cardBorder,
    },
    oversText: {
        fontSize: 11,
        color: colors.textSecondary,
        fontWeight: '600',
    },
    vsSeparatorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 6,
    },
    vsLine: {
        flex: 1,
        height: 1,
        backgroundColor: colors.card,
    },
    vsBadge: {
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.cardBorder,
        paddingHorizontal: 6,
        paddingVertical: 1,
        borderRadius: 8,
        marginHorizontal: 8,
    },
    vsText: {
        fontSize: 9.5,
        fontWeight: '800',
        color: colors.inputPlaceholder,
    },

    statusBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginTop: 12,
        gap: 8,
        borderWidth: 1,
    },
    statusBannerLive: {
        backgroundColor: 'rgba(16,185,129,0.08)',
        borderColor: colors.accentBorder,
    },
    statusBannerCompleted: {
        backgroundColor: colors.card,
        borderColor: colors.cardBorder,
    },
    statusBannerText: {
        fontSize: 12,
        fontWeight: '600',
        flex: 1,
    },
    statusTextLive: {
        color: '#10B981',
    },
    statusTextCompleted: {
        color: colors.textSecondary,
    },

    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 14,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: colors.card,
    },
    primaryActionsGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    resumeBtn: {
        backgroundColor: '#10B981',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        elevation: 2,
    },
    resumeBtnText: {
        color: colors.background,
        fontWeight: '800',
        fontSize: 13,
    },
    scorecardOutlineBtn: {
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.cardBorder,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    scorecardOutlineBtnText: {
        color: colors.textSecondary,
        fontWeight: '700',
        fontSize: 13,
    },
    scorecardPrimaryBtn: {
        backgroundColor: '#3B82F6',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    scorecardPrimaryBtnText: {
        color: 'white',
        fontWeight: '700',
        fontSize: 13,
    },
    deleteIconButton: {
        backgroundColor: colors.accentRedBg,
        borderWidth: 1,
        borderColor: colors.accentRedBg,
        padding: 8,
        borderRadius: 10,
    },

    // Tournament Card Styles
    tournamentTagContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.accentAmberBg,
        borderWidth: 1,
        borderColor: colors.accentAmberBorder,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        gap: 4,
    },
    tournamentTagText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#F59E0B',
        letterSpacing: 0.8,
    },
    tournamentTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: 2,
    },
    tournamentDetailsBox: {
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: colors.card,
        marginBottom: 12,
    },
    avatarCircleSmall: {
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    avatarTextSmall: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 11,
    },
    winnerRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    winnerLabel: {
        fontSize: 10,
        fontWeight: '800',
        color: '#F59E0B',
        letterSpacing: 0.5,
    },
    winnerValue: {
        fontSize: 14,
        fontWeight: '700',
        color: '#10B981',
    },
    runnerRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    runnerLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: colors.textMuted,
        letterSpacing: 0.5,
    },
    runnerValue: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.textSecondary,
    },

    // Tournament Modal Hub Styles
    hubCard: {
        backgroundColor: colors.card,
        borderRadius: 14,
        padding: 14,
        borderWidth: 1,
        borderColor: colors.cardBorder,
    },
    hubCardTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.textPrimary,
    },
});
