import React, { useState, useMemo } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    Modal,
    StyleSheet,
    StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import TeamPlayersScreen from './TeamPlayersScreen';
import { API_ENDPOINTS } from './apiConfig';
import { useTheme, ThemeColors } from './ThemeContext';

interface Team {
    id: string;
    name: string;
    matches: number;
    won: number;
    lost: number;
    isPersonal?: boolean;
}

interface Tournament {
    id: string;
    name: string;
    teamsCount: number;
    matchesCount: number;
    status: 'Ongoing' | 'Upcoming' | 'Completed';
    category: string;
}

export default function TeamsScreen({ navigation }: any) {
    const { colors, isDark } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const [activeTab, setActiveTab] = useState<'Teams' | 'Tournament' | 'My Teams'>('Teams');

    const TEAMS_KEY = '@cricv_teams_list';
    const MY_TEAMS_KEY = '@cricv_my_teams_list';
    const DELETED_KEY = '@cricv_deleted_team_ids';

    // General Teams State with persistence
    const [deletedIds, setDeletedIds] = useState<string[]>(() => {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                const saved = window.localStorage.getItem(DELETED_KEY);
                if (saved) return JSON.parse(saved);
            }
        } catch (e) {}
        return [];
    });

    const [teams, setTeams] = useState<Team[]>(() => {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                const saved = window.localStorage.getItem(TEAMS_KEY);
                if (saved) {
                    const parsed = JSON.parse(saved);
                    if (Array.isArray(parsed)) return parsed;
                }
            }
        } catch (e) {}
        return [];
    });

    // My Personal Teams State with persistence
    const [myTeams, setMyTeams] = useState<Team[]>(() => {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                const saved = window.localStorage.getItem(MY_TEAMS_KEY);
                if (saved) {
                    const parsed = JSON.parse(saved);
                    if (Array.isArray(parsed)) return parsed;
                }
            }
        } catch (e) {}
        return [];
    });

    // Selected Team for details
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

    // Modals & Inputs State
    const [isTeamModalVisible, setIsTeamModalVisible] = useState<boolean>(false);
    const [isMyTeamModalVisible, setIsMyTeamModalVisible] = useState<boolean>(false);
    const [isTournamentModalVisible, setIsTournamentModalVisible] = useState<boolean>(false);

    const [newTeamName, setNewTeamName] = useState<string>('');
    const [newMyTeamName, setNewMyTeamName] = useState<string>('');
    const [newTournamentName, setNewTournamentName] = useState<string>('');
    const [newTournamentCategory, setNewTournamentCategory] = useState<string>('T20');

    // Tournaments State
    const [tournaments, setTournaments] = useState<Tournament[]>([]);

    // Save Teams to localStorage whenever updated
    React.useEffect(() => {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                window.localStorage.setItem(TEAMS_KEY, JSON.stringify(teams));
                window.localStorage.setItem(MY_TEAMS_KEY, JSON.stringify(myTeams));
                window.localStorage.setItem(DELETED_KEY, JSON.stringify(deletedIds));
            }
        } catch (e) {}
    }, [teams, myTeams, deletedIds]);

    // Re-usable team list fetch function to stay in sync with database
    const fetchTeams = React.useCallback(async () => {
        try {
            const res = await fetch(API_ENDPOINTS.TEAMS);
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) {
                    const fetchedTeams: Team[] = data
                        .filter((t: any) => !deletedIds.includes(String(t.id)))
                        .map((t: any) => ({
                            id: String(t.id || Date.now()),
                            name: t.name,
                            matches: 0,
                            won: 0,
                            lost: 0,
                        }));
                    
                    setTeams(prev => {
                        const map = new Map<string, Team>();
                        prev.forEach(t => {
                            if (!deletedIds.includes(String(t.id))) {
                                map.set(t.id, t);
                            }
                        });
                        fetchedTeams.forEach(t => {
                            if (!map.has(t.id) && !deletedIds.includes(String(t.id))) {
                                map.set(t.id, t);
                            }
                        });
                        return Array.from(map.values());
                    });
                }
            }
        } catch (err) {
            console.log('Backend sync offline/fallback mode:', err);
        }
    }, [deletedIds]);

    // Fetch teams on mount
    React.useEffect(() => {
        fetchTeams();
    }, [fetchTeams]);

    // Conditional view return AFTER all hooks
    if (selectedTeam) {
        return (
            <TeamPlayersScreen
                teamName={selectedTeam.name}
                teamId={selectedTeam.id}
                onBack={() => setSelectedTeam(null)}
                navigation={navigation}
            />
        );
    }

    // Helper function to build a valid shortName matching CreateTeamDto
    const generateShortName = (name: string): string => {
        const words = name.trim().split(/\s+/);
        if (words.length >= 2) {
            return (words[0][0] + words[1][0]).toUpperCase();
        }
        return name.trim().substring(0, 4).toUpperCase();
    };

    // Centralized team creation function matching backend CreateTeamDto (name, shortName, players)
    const createTeam = async (name: string, isPersonal = false) => {
        const teamName = name.trim();
        if (!teamName) return;

        // Prevent duplicate team creation (case-insensitive)
        const isDuplicate = teams.some(t => t.name.toLowerCase() === teamName.toLowerCase()) ||
                            myTeams.some(t => t.name.toLowerCase() === teamName.toLowerCase());
        if (isDuplicate) {
            alert(`A team named "${teamName}" already exists!`);
            return;
        }

        // Payload matching backend CreateTeamDto
        const payload = {
            name: teamName,
            shortName: generateShortName(teamName),
            players: [],
        };

        try {
            // Send POST request and WAIT for successful response (200/201)
            const response = await fetch(API_ENDPOINTS.TEAMS, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (response.ok || response.status === 200 || response.status === 201) {
                const createdData = await response.json();
                
                const createdTeam: Team = {
                    id: createdData.id ? String(createdData.id) : Date.now().toString(),
                    name: createdData.name || teamName,
                    matches: 0,
                    won: 0,
                    lost: 0,
                    isPersonal: isPersonal,
                };

                // Update local state ONLY AFTER successful backend response
                setTeams(prev => [...prev.filter(t => t.id !== createdTeam.id), createdTeam]);
                if (isPersonal) {
                    setMyTeams(prev => [...prev.filter(t => t.id !== createdTeam.id), createdTeam]);
                }

                // Re-sync team list with database
                await fetchTeams();
            } else {
                const errText = await response.text();
                console.error(`Backend failed to create team. Status: ${response.status}`, errText);
                alert(`Failed to create team "${teamName}" on backend. Status: ${response.status}`);
            }
        } catch (err: any) {
            console.error('Network error creating team on backend:', err);
            const fallbackTeam: Team = {
                id: Date.now().toString(),
                name: teamName,
                matches: 0,
                won: 0,
                lost: 0,
                isPersonal: isPersonal,
            };
            setTeams(prev => [...prev, fallbackTeam]);
            if (isPersonal) setMyTeams(prev => [...prev, fallbackTeam]);
        }
    };

    // General Team Handlers
    const handleCreateTeam = async () => {
        const name = newTeamName;
        setNewTeamName('');
        setIsTeamModalVisible(false);
        await createTeam(name, false);
    };

    // deleteTeam function that calls Render DELETE endpoint, handles response, and triggers re-fetch
    const deleteTeam = async (id: string) => {
        // Optimistic UI update
        setTeams(prev => prev.filter(team => team.id !== id));
        setMyTeams(prev => prev.filter(team => team.id !== id));
        
        // Track only specific ID in deletedIds
        setDeletedIds(prev => Array.from(new Set([...prev, String(id)])));

        // Call DELETE API endpoint on backend
        const deleteUrl = API_ENDPOINTS.DELETE_TEAM ? API_ENDPOINTS.DELETE_TEAM(id) : `${API_ENDPOINTS.TEAMS}/${id}`;
        
        try {
            const res = await fetch(deleteUrl, { method: 'DELETE' });
            if (res.ok) {
                console.log(`Successfully deleted team ${id} from database`);
            } else {
                console.log(`Backend delete response status: ${res.status}`);
            }
        } catch (err) {
            console.log('Error deleting team from backend:', err);
        } finally {
            fetchTeams();
        }
    };

    const handleDeleteTeam = (id: string) => {
        deleteTeam(id);
    };

    // My Personal Team Handlers
    const handleCreateMyTeam = async () => {
        const name = newMyTeamName;
        setNewMyTeamName('');
        setIsMyTeamModalVisible(false);
        await createTeam(name, true);
    };

    const handleDeleteMyTeam = (id: string) => {
        setMyTeams(prev => prev.filter(team => team.id !== id));
        setTeams(prev => prev.filter(team => team.id !== id));
    };

    const handleSelectTeam = (team: Team) => {
        if (navigation?.navigate) {
            try {
                navigation.navigate('TeamPlayersScreen', { teamName: team.name, teamId: team.id });
            } catch (e) {
                console.log('Navigation navigate error:', e);
            }
        }
        setSelectedTeam(team);
    };

    // Tournament Handlers
    const handleCreateTournament = () => {
        if (newTournamentName.trim()) {
            const newTourney: Tournament = {
                id: Date.now().toString(),
                name: newTournamentName.trim(),
                teamsCount: 4,
                matchesCount: 0,
                status: 'Upcoming',
                category: newTournamentCategory || 'T20',
            };
            setTournaments(prev => [...prev, newTourney]);
        }
        setNewTournamentName('');
        setIsTournamentModalVisible(false);
    };

    const handleDeleteTournament = (id: string) => {
        setTournaments(prev => prev.filter(t => t.id !== id));
    };

    const renderTeamItem = ({ item }: { item: Team }, isPersonal = false) => {
        const isMyTeamItem = item.isPersonal || isPersonal;
        return (
            <View style={styles.card}>
                <TouchableOpacity
                    style={styles.cardPressableArea}
                    activeOpacity={0.7}
                    onPress={() => handleSelectTeam(item)}
                >
                    <View style={[styles.avatarCircle, isMyTeamItem && { backgroundColor: '#7C3AED' }]}>
                        <Text style={styles.avatarText}>
                            {item.name.charAt(0).toUpperCase()}
                        </Text>
                    </View>
                    
                    <View style={styles.cardInfo}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Text style={styles.cardTitle}>{item.name}</Text>
                            {isMyTeamItem && (
                                <View style={styles.personalBadge}>
                                    <Text style={styles.personalBadgeText}>MY TEAM</Text>
                                </View>
                            )}
                        </View>
                        <Text style={styles.cardSubtitle}>
                            Matches: {item.matches}  •  Won: {item.won}  •  Lost: {item.lost}
                        </Text>
                    </View>

                    <Ionicons name="chevron-forward" size={18} color={colors.textMuted} style={{ marginRight: 6 }} />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={(e) => {
                        e.stopPropagation?.();
                        handleDeleteTeam(item.id);
                    }}
                    style={styles.deleteBtn}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                </TouchableOpacity>
            </View>
        );
    };

    const renderTournamentItem = ({ item }: { item: Tournament }) => {
        const badgeColor = item.status === 'Ongoing' ? '#10B981' : item.status === 'Upcoming' ? '#2563EB' : colors.textMuted;
        return (
            <View style={styles.card}>
                <View style={[styles.avatarCircle, { backgroundColor: '#1E3A8A' }]}>
                    <Ionicons name="trophy" size={22} color="#F59E0B" />
                </View>
                
                <View style={styles.cardInfo}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text style={styles.cardTitle}>{item.name}</Text>
                    </View>
                    <Text style={styles.cardSubtitle}>
                        {item.category}  •  {item.teamsCount} Teams  •  {item.matchesCount} Matches
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                        <View style={[styles.statusBadge, { backgroundColor: badgeColor }]}>
                            <Text style={styles.statusBadgeText}>{item.status}</Text>
                        </View>
                    </View>
                </View>

                <TouchableOpacity onPress={() => handleDeleteTournament(item.id)} style={styles.deleteBtn}>
                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={colors.background} />

            {/* Header Banner */}
            <View style={styles.header}>
                <View style={styles.headerTitleRow}>
                    <Ionicons name="shield-checkmark" size={24} color="#10B981" style={{ marginRight: 8 }} />
                    <Text style={styles.headerTitle}>Teams & Tournaments</Text>
                </View>

                {/* 3 Segmented Top Tabs: Teams | Tournament | My Teams */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tabButton, activeTab === 'Teams' && styles.activeTabButton]}
                        onPress={() => setActiveTab('Teams')}
                    >
                        <Ionicons name="people" size={15} color={activeTab === 'Teams' ? '#10B981' : colors.textSecondary} style={{ marginRight: 4 }} />
                        <Text style={[styles.tabText, activeTab === 'Teams' && styles.activeTabText]}>
                            Teams ({teams.length})
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.tabButton, activeTab === 'Tournament' && styles.activeTabButton]}
                        onPress={() => setActiveTab('Tournament')}
                    >
                        <Ionicons name="trophy" size={15} color={activeTab === 'Tournament' ? '#F59E0B' : colors.textSecondary} style={{ marginRight: 4 }} />
                        <Text style={[styles.tabText, activeTab === 'Tournament' && styles.activeTabText]}>
                            Tournament ({tournaments.length})
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.tabButton, activeTab === 'My Teams' && styles.activeTabButton]}
                        onPress={() => setActiveTab('My Teams')}
                    >
                        <Ionicons name="star" size={15} color={activeTab === 'My Teams' ? '#3B82F6' : colors.textSecondary} style={{ marginRight: 4 }} />
                        <Text style={[styles.tabText, activeTab === 'My Teams' && styles.activeTabText]}>
                            My Teams ({myTeams.length})
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Main Content Area */}
            <View style={styles.content}>
                {activeTab === 'Teams' && (
                    teams.length === 0 ? (
                        <View style={styles.emptyStateContainer}>
                            <Ionicons name="people-outline" size={64} color={colors.textSecondary} style={{ marginBottom: 16 }} />
                            <Text style={styles.emptyText}>
                                No general teams found. Tap '+' to add a team!
                            </Text>
                        </View>
                    ) : (
                        <FlatList
                            data={teams}
                            keyExtractor={(item) => item.id}
                            renderItem={(props) => renderTeamItem(props, false)}
                            contentContainerStyle={styles.listContent}
                            showsVerticalScrollIndicator={false}
                        />
                    )
                )}

                {activeTab === 'Tournament' && (
                    tournaments.length === 0 ? (
                        <View style={styles.emptyStateContainer}>
                            <Ionicons name="trophy-outline" size={64} color={colors.textSecondary} style={{ marginBottom: 16 }} />
                            <Text style={styles.emptyText}>
                                No tournaments found. Tap '+' to create a new tournament!
                            </Text>
                        </View>
                    ) : (
                        <FlatList
                            data={tournaments}
                            keyExtractor={(item) => item.id}
                            renderItem={renderTournamentItem}
                            contentContainerStyle={styles.listContent}
                            showsVerticalScrollIndicator={false}
                        />
                    )
                )}

                {activeTab === 'My Teams' && (
                    myTeams.length === 0 ? (
                        <View style={styles.emptyStateContainer}>
                            <Ionicons name="star-outline" size={64} color={colors.textSecondary} style={{ marginBottom: 16 }} />
                            <Text style={styles.emptyText}>
                                No personal teams created. Tap '+' to create your team!
                            </Text>
                        </View>
                    ) : (
                        <FlatList
                            data={myTeams}
                            keyExtractor={(item) => item.id}
                            renderItem={(props) => renderTeamItem(props, true)}
                            contentContainerStyle={styles.listContent}
                            showsVerticalScrollIndicator={false}
                        />
                    )
                )}
            </View>

            {/* Floating Action Button (FAB) */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => {
                    if (activeTab === 'Teams') setIsTeamModalVisible(true);
                    else if (activeTab === 'Tournament') setIsTournamentModalVisible(true);
                    else setIsMyTeamModalVisible(true);
                }}
                activeOpacity={0.85}
            >
                <Ionicons name="add" size={32} color="white" />
            </TouchableOpacity>

            {/* "Create Team" Modal */}
            <Modal
                transparent={true}
                visible={isTeamModalVisible}
                animationType="fade"
                onRequestClose={() => setIsTeamModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>Create Team</Text>
                        
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Enter team name"
                            placeholderTextColor={colors.inputPlaceholder}
                            selectionColor="#10B981"
                            value={newTeamName}
                            onChangeText={setNewTeamName}
                            autoFocus
                        />

                        <View style={styles.modalActionRow}>
                            <TouchableOpacity onPress={() => setIsTeamModalVisible(false)}>
                                <Text style={styles.actionTextCancel}>CANCEL</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={handleCreateTeam}>
                                <Text style={styles.actionText}>CREATE</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* "Create My Team" Modal */}
            <Modal
                transparent={true}
                visible={isMyTeamModalVisible}
                animationType="fade"
                onRequestClose={() => setIsMyTeamModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>Create My Team</Text>
                        
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Enter my team name (e.g. My XI)"
                            placeholderTextColor={colors.inputPlaceholder}
                            selectionColor="#10B981"
                            value={newMyTeamName}
                            onChangeText={setNewMyTeamName}
                            autoFocus
                        />

                        <View style={styles.modalActionRow}>
                            <TouchableOpacity onPress={() => setIsMyTeamModalVisible(false)}>
                                <Text style={styles.actionTextCancel}>CANCEL</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={handleCreateMyTeam}>
                                <Text style={styles.actionText}>CREATE</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* "Create Tournament" Modal */}
            <Modal
                transparent={true}
                visible={isTournamentModalVisible}
                animationType="fade"
                onRequestClose={() => setIsTournamentModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>Create Tournament</Text>
                        
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Enter tournament name"
                            placeholderTextColor={colors.inputPlaceholder}
                            selectionColor="#10B981"
                            value={newTournamentName}
                            onChangeText={setNewTournamentName}
                            autoFocus
                        />

                        <View style={{ marginTop: 14 }}>
                            <Text style={{ fontSize: 13, color: colors.textMuted, marginBottom: 8, fontWeight: '600' }}>Format / Type:</Text>
                            <View style={{ flexDirection: 'row', gap: 8 }}>
                                {['T20', 'ODI', 'Test'].map(type => (
                                    <TouchableOpacity
                                        key={type}
                                        style={[
                                            styles.categoryChip,
                                            newTournamentCategory === type && styles.categoryChipActive
                                        ]}
                                        onPress={() => setNewTournamentCategory(type)}
                                    >
                                        <Text style={[
                                            styles.categoryChipText,
                                            newTournamentCategory === type && styles.categoryChipTextActive
                                        ]}>{type}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View style={styles.modalActionRow}>
                            <TouchableOpacity onPress={() => setIsTournamentModalVisible(false)}>
                                <Text style={styles.actionTextCancel}>CANCEL</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={handleCreateTournament}>
                                <Text style={styles.actionText}>CREATE</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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
    emptyStateContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    emptyText: {
        fontSize: 14,
        color: colors.textMuted,
        textAlign: 'center',
        lineHeight: 22,
    },
    listContent: {
        padding: 16,
        paddingBottom: 90,
    },
    card: {
        backgroundColor: colors.card,
        borderRadius: 14,
        padding: 14,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.cardBorder,
    },
    cardPressableArea: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#10B981',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    avatarText: {
        color: colors.background,
        fontSize: 18,
        fontWeight: '800',
    },
    cardInfo: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: 2,
    },
    cardSubtitle: {
        fontSize: 12,
        color: colors.textMuted,
    },
    personalBadge: {
        backgroundColor: colors.accentPurpleBg,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.accentPurpleBorder,
    },
    personalBadgeText: {
        color: '#A78BFA',
        fontSize: 10,
        fontWeight: '700',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 12,
    },
    statusBadgeText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '700',
    },
    deleteBtn: {
        padding: 8,
    },
    fab: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#10B981',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 6,
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: colors.modalOverlay,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalCard: {
        width: '85%',
        maxWidth: 340,
        backgroundColor: colors.card === '#FFFFFF' ? '#FFFFFF' : '#0F172A',
        borderRadius: 16,
        padding: 20,
        elevation: 10,
        borderWidth: 1,
        borderColor: colors.cardBorder,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: 16,
    },
    modalInput: {
        backgroundColor: colors.chipUnselectedBg,
        borderWidth: 1,
        borderColor: colors.cardBorder,
        borderRadius: 10,
        fontSize: 15,
        color: colors.textPrimary,
        paddingVertical: 10,
        paddingHorizontal: 14,
    },
    categoryChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.cardBorder,
    },
    categoryChipActive: {
        backgroundColor: '#10B981',
        borderColor: '#10B981',
    },
    categoryChipText: {
        fontSize: 12,
        color: colors.textSecondary,
        fontWeight: '600',
    },
    categoryChipTextActive: {
        color: colors.background,
        fontWeight: '700',
    },
    modalActionRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 24,
        gap: 20,
    },
    actionText: {
        color: '#10B981',
        fontSize: 14,
        fontWeight: '700',
    },
    actionTextCancel: {
        color: '#94A3B8',
        fontSize: 14,
        fontWeight: '600',
    },
});
