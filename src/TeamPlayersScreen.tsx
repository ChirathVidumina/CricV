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
import PlayerInformationScreen from './PlayerInformationScreen';
import TeamPlayerProfileScreen from './TeamPlayerProfileScreen';
import { useTheme, ThemeColors } from './ThemeContext';

interface Player {
    id: string;
    name: string;
    displayName?: string;
    contact?: string;
    playingRole?: string;
    battingHand?: string;
    bowlingStyle?: string;
    bowlingArm?: string;
    spinType?: string;
}

interface TeamPlayersScreenProps {
    route?: any;
    navigation?: any;
    teamName?: string;
    teamId?: string;
    onBack?: () => void;
}

export default function TeamPlayersScreen({
    route,
    navigation,
    teamName: propTeamName,
    teamId: propTeamId,
    onBack,
}: TeamPlayersScreenProps) {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
    const titleName = route?.params?.teamName || propTeamName || 'Team Players';

    const getDefaultPlayersForTeam = (team: string): Player[] => {
        const lower = team.toLowerCase();
        if (lower.includes('india')) {
            return [
                { id: 'ind-1', name: 'Rohit Sharma', playingRole: 'Batter', battingHand: 'Right hand bat', bowlingStyle: 'Off break' },
                { id: 'ind-2', name: 'Virat Kohli', playingRole: 'Batter', battingHand: 'Right hand bat', bowlingStyle: 'Medium' },
                { id: 'ind-3', name: 'Suryakumar Yadav', playingRole: 'Batter', battingHand: 'Right hand bat', bowlingStyle: 'Medium' },
                { id: 'ind-4', name: 'Rishabh Pant', playingRole: 'Wicketkeeper', battingHand: 'Left hand bat', bowlingStyle: 'None' },
                { id: 'ind-5', name: 'Hardik Pandya', playingRole: 'All-Rounder', battingHand: 'Right hand bat', bowlingStyle: 'Fast medium' },
                { id: 'ind-6', name: 'Jasprit Bumrah', playingRole: 'Bowler', battingHand: 'Right hand bat', bowlingStyle: 'Fast' },
                { id: 'ind-7', name: 'Axar Patel', playingRole: 'All-Rounder', battingHand: 'Left hand bat', bowlingStyle: 'Slow left arm' },
                { id: 'ind-8', name: 'Kuldeep Yadav', playingRole: 'Bowler', battingHand: 'Left hand bat', bowlingStyle: 'Left arm chinaman' },
                { id: 'ind-9', name: 'Arshdeep Singh', playingRole: 'Bowler', battingHand: 'Left hand bat', bowlingStyle: 'Left arm fast medium' },
                { id: 'ind-10', name: 'Shubman Gill', playingRole: 'Batter', battingHand: 'Right hand bat', bowlingStyle: 'Off break' },
                { id: 'ind-11', name: 'Shivam Dube', playingRole: 'All-Rounder', battingHand: 'Left hand bat', bowlingStyle: 'Medium' },
            ];
        } else if (lower.includes('sri lanka')) {
            return [
                { id: 'sl-1', name: 'Pathum Nissanka', playingRole: 'Batter', battingHand: 'Right hand bat', bowlingStyle: 'None' },
                { id: 'sl-2', name: 'Kusal Mendis', playingRole: 'Wicketkeeper', battingHand: 'Right hand bat', bowlingStyle: 'None' },
                { id: 'sl-3', name: 'Charith Asalanka', playingRole: 'Batter', battingHand: 'Left hand bat', bowlingStyle: 'Off break' },
                { id: 'sl-4', name: 'Kusal Perera', playingRole: 'Batter', battingHand: 'Left hand bat', bowlingStyle: 'None' },
                { id: 'sl-5', name: 'Wanindu Hasaranga', playingRole: 'All-Rounder', battingHand: 'Right hand bat', bowlingStyle: 'Leg break' },
                { id: 'sl-6', name: 'Maheesh Theekshana', playingRole: 'Bowler', battingHand: 'Right hand bat', bowlingStyle: 'Off break' },
                { id: 'sl-7', name: 'Matheesha Pathirana', playingRole: 'Bowler', battingHand: 'Right hand bat', bowlingStyle: 'Fast' },
                { id: 'sl-8', name: 'Dasun Shanaka', playingRole: 'All-Rounder', battingHand: 'Right hand bat', bowlingStyle: 'Medium' },
                { id: 'sl-9', name: 'Dunith Wellalage', playingRole: 'All-Rounder', battingHand: 'Left hand bat', bowlingStyle: 'Slow left arm' },
                { id: 'sl-10', name: 'Dilshan Madushanka', playingRole: 'Bowler', battingHand: 'Right hand bat', bowlingStyle: 'Left arm fast' },
            ];
        } else if (lower.includes('australia')) {
            return [
                { id: 'aus-1', name: 'Travis Head', playingRole: 'Batter', battingHand: 'Left hand bat', bowlingStyle: 'Off break' },
                { id: 'aus-2', name: 'David Warner', playingRole: 'Batter', battingHand: 'Left hand bat', bowlingStyle: 'Leg break' },
                { id: 'aus-3', name: 'Mitchell Marsh', playingRole: 'All-Rounder', battingHand: 'Right hand bat', bowlingStyle: 'Medium fast' },
                { id: 'aus-4', name: 'Glenn Maxwell', playingRole: 'All-Rounder', battingHand: 'Right hand bat', bowlingStyle: 'Off break' },
                { id: 'aus-5', name: 'Pat Cummins', playingRole: 'Bowler', battingHand: 'Right hand bat', bowlingStyle: 'Fast' },
                { id: 'aus-6', name: 'Mitchell Starc', playingRole: 'Bowler', battingHand: 'Left hand bat', bowlingStyle: 'Left arm fast' },
                { id: 'aus-7', name: 'Adam Zampa', playingRole: 'Bowler', battingHand: 'Right hand bat', bowlingStyle: 'Leg break' },
            ];
        } else if (lower.includes('chennai') || lower.includes('csk')) {
            return [
                { id: 'csk-1', name: 'Ruturaj Gaikwad', playingRole: 'Batter', battingHand: 'Right hand bat', bowlingStyle: 'Off break' },
                { id: 'csk-2', name: 'MS Dhoni', playingRole: 'Wicketkeeper', battingHand: 'Right hand bat', bowlingStyle: 'Medium' },
                { id: 'csk-3', name: 'Ravindra Jadeja', playingRole: 'All-Rounder', battingHand: 'Left hand bat', bowlingStyle: 'Slow left arm' },
                { id: 'csk-4', name: 'Shivam Dube', playingRole: 'All-Rounder', battingHand: 'Left hand bat', bowlingStyle: 'Medium' },
                { id: 'csk-5', name: 'Matheesha Pathirana', playingRole: 'Bowler', battingHand: 'Right hand bat', bowlingStyle: 'Fast' },
            ];
        } else if (lower.includes('mumbai')) {
            return [
                { id: 'mi-1', name: 'Hardik Pandya', playingRole: 'All-Rounder', battingHand: 'Right hand bat', bowlingStyle: 'Fast medium' },
                { id: 'mi-2', name: 'Rohit Sharma', playingRole: 'Batter', battingHand: 'Right hand bat', bowlingStyle: 'Off break' },
                { id: 'mi-3', name: 'Suryakumar Yadav', playingRole: 'Batter', battingHand: 'Right hand bat', bowlingStyle: 'Medium' },
                { id: 'mi-4', name: 'Jasprit Bumrah', playingRole: 'Bowler', battingHand: 'Right hand bat', bowlingStyle: 'Fast' },
            ];
        } else {
            return [
                { id: 'def-1', name: 'Player 1', playingRole: 'Batter', battingHand: 'Right hand bat' },
                { id: 'def-2', name: 'Player 2', playingRole: 'Wicketkeeper', battingHand: 'Right hand bat' },
                { id: 'def-3', name: 'Player 3', playingRole: 'All-Rounder', battingHand: 'Left hand bat' },
                { id: 'def-4', name: 'Player 4', playingRole: 'Bowler', battingHand: 'Right hand bat', bowlingStyle: 'Fast' },
            ];
        }
    };
    const currentTeamId = route?.params?.teamId || titleName;
    const storageKey = `@cricv_players_${currentTeamId.toLowerCase().replace(/\s+/g, '_')}`;

    const [players, setPlayers] = useState<Player[]>(() => {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                const saved = window.localStorage.getItem(storageKey);
                if (saved) {
                    const parsed = JSON.parse(saved);
                    if (Array.isArray(parsed)) {
                        return parsed;
                    }
                }
            }
        } catch (e) {}
        return getDefaultPlayersForTeam(titleName);
    });

    React.useEffect(() => {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                window.localStorage.setItem(storageKey, JSON.stringify(players));
            }
        } catch (e) {}
    }, [players, storageKey]);
    const [isAddModalVisible, setIsAddModalVisible] = useState<boolean>(false);
    const [newPlayerName, setNewPlayerName] = useState<string>('');

    // Edit Player Name Modal State
    const [isEditModalVisible, setIsEditModalVisible] = useState<boolean>(false);
    const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
    const [editPlayerName, setEditPlayerName] = useState<string>('');

    // Player Information View State
    const [infoPlayer, setInfoPlayer] = useState<Player | null>(null);

    // Player Detailed Profile State
    const [profilePlayer, setProfilePlayer] = useState<Player | null>(null);

    if (profilePlayer) {
        return (
            <TeamPlayerProfileScreen
                player={profilePlayer}
                onBack={() => setProfilePlayer(null)}
                navigation={navigation}
            />
        );
    }

    if (infoPlayer) {
        return (
            <PlayerInformationScreen
                player={infoPlayer}
                onBack={() => setInfoPlayer(null)}
                onSaveDetails={(updatedPlayer) => {
                    setPlayers(prev => prev.map(p => p.id === updatedPlayer.id ? { ...p, ...updatedPlayer, name: updatedPlayer.fullName || p.name } : p));
                    setInfoPlayer(null);
                }}
                navigation={navigation}
            />
        );
    }

    const handleCancelAdd = () => {
        setNewPlayerName('');
        setIsAddModalVisible(false);
    };

    const handleAddPlayer = () => {
        if (newPlayerName.trim()) {
            const newPlayer: Player = {
                id: Date.now().toString(),
                name: newPlayerName.trim(),
            };
            setPlayers(prev => [...prev, newPlayer]);
        }
        setNewPlayerName('');
        setIsAddModalVisible(false);
    };

    const handleOpenEdit = (player: Player) => {
        setEditingPlayer(player);
        setEditPlayerName(player.name);
        setIsEditModalVisible(true);
    };

    const handleCancelEdit = () => {
        setEditingPlayer(null);
        setEditPlayerName('');
        setIsEditModalVisible(false);
    };

    const handleUpdatePlayerName = () => {
        if (editingPlayer && editPlayerName.trim()) {
            setPlayers(prev => prev.map(p => p.id === editingPlayer.id ? { ...p, name: editPlayerName.trim() } : p));
        }
        setEditingPlayer(null);
        setEditPlayerName('');
        setIsEditModalVisible(false);
    };

    const handleDeletePlayer = (id: string) => {
        setPlayers(prev => prev.filter(p => p.id !== id));
    };

    const handleOpenPlayerInfo = (player: Player) => {
        if (navigation?.navigate) {
            navigation.navigate('PlayerInformationScreen', { player });
        }
        setInfoPlayer(player);
    };

    const handleOpenPlayerProfile = (player: Player) => {
        if (navigation?.navigate) {
            navigation.navigate('TeamPlayerProfileScreen', { player });
        }
        setProfilePlayer(player);
    };

    const renderPlayerItem = ({ item }: { item: Player }) => {
        const subtitleParts = [item.playingRole, item.battingHand, item.bowlingStyle].filter(Boolean);
        const subtitleText = subtitleParts.join(' • ');

        return (
            <TouchableOpacity
                style={styles.playerCard}
                onPress={() => handleOpenPlayerProfile(item)}
                activeOpacity={0.7}
            >
                {/* Avatar */}
                <View style={styles.avatarCircle}>
                    <Ionicons name="person" size={20} color="white" />
                </View>

                {/* Player Name & Subtitle */}
                <View style={{ flex: 1, marginLeft: 15, justifyContent: 'center' }}>
                    <Text style={styles.playerName}>{item.name}</Text>
                    {subtitleText.length > 0 && (
                        <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
                            {subtitleText}
                        </Text>
                    )}
                </View>

                {/* Action Icons */}
                <View style={styles.actionIconsRow}>
                    {/* Edit Pencil Icon */}
                    <TouchableOpacity style={styles.iconBtn} onPress={(e) => { e?.stopPropagation?.(); handleOpenEdit(item); }}>
                        <Ionicons name="create-outline" size={20} color="#6B7280" />
                    </TouchableOpacity>

                    {/* Delete Trash Icon */}
                    <TouchableOpacity style={styles.iconBtn} onPress={(e) => { e?.stopPropagation?.(); handleDeletePlayer(item.id); }}>
                        <Ionicons name="trash-outline" size={20} color="#6B7280" />
                    </TouchableOpacity>

                    {/* Player Information Details Icon */}
                    <TouchableOpacity style={styles.iconBtn} onPress={(e) => { e?.stopPropagation?.(); handleOpenPlayerInfo(item); }}>
                        <Ionicons name="information-circle-outline" size={22} color="#6B7280" />
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        );
    };

    const handleGoBack = () => {
        if (onBack) {
            onBack();
        } else if (navigation?.goBack) {
            navigation.goBack();
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle={colors.statusBar} backgroundColor={colors.background} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleGoBack} style={{ paddingVertical: 4, paddingRight: 12 }}>
                    <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>
                    {titleName}
                </Text>
                <View style={{ width: 32 }} />
            </View>

            {/* Main Content */}
            <View style={styles.content}>
                {players.length === 0 ? (
                    /* Empty State UI */
                    <View style={styles.emptyStateContainer}>
                        <Text style={styles.emptyTextLine}>
                            You don't have any players added in the team yet.
                        </Text>
                        <Text style={styles.emptyTextLine}>
                            Please add players.
                        </Text>
                    </View>
                ) : (
                    /* Populated List UI */
                    <FlatList
                        data={players}
                        keyExtractor={(item) => item.id}
                        renderItem={renderPlayerItem}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>

            {/* Floating Action Button (FAB) */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => setIsAddModalVisible(true)}
                activeOpacity={0.8}
            >
                <Ionicons name="person-add" size={26} color="white" />
            </TouchableOpacity>

            {/* Add Player Modal */}
            <Modal
                transparent={true}
                visible={isAddModalVisible}
                animationType="fade"
                onRequestClose={handleCancelAdd}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>Add player</Text>

                        <TextInput
                            style={styles.modalInput}
                            placeholder="Enter player name"
                            placeholderTextColor={colors.textSecondary}
                            value={newPlayerName}
                            onChangeText={setNewPlayerName}
                            autoFocus
                        />

                        <View style={styles.modalActionRow}>
                            <TouchableOpacity onPress={handleCancelAdd}>
                                <Text style={styles.actionText}>CANCEL</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={handleAddPlayer}>
                                <Text style={styles.actionText}>OK</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Edit Player Name Modal */}
            <Modal
                transparent={true}
                visible={isEditModalVisible}
                animationType="fade"
                onRequestClose={handleCancelEdit}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>Update player</Text>

                        <TextInput
                            style={styles.modalInput}
                            placeholder="Enter player name"
                            placeholderTextColor={colors.textSecondary}
                            value={editPlayerName}
                            onChangeText={setEditPlayerName}
                            autoFocus
                        />

                        <View style={styles.modalActionRow}>
                            <TouchableOpacity onPress={handleCancelEdit}>
                                <Text style={styles.actionText}>CANCEL</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={handleUpdatePlayerName}>
                                <Text style={styles.actionText}>OK</Text>
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
        paddingVertical: 16,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
    },
    backBtn: {
        padding: 4,
    },
    headerTitle: {
        color: colors.textPrimary,
        fontSize: 18,
        fontWeight: '700',
        flex: 1,
        textAlign: 'center',
    },
    content: {
        flex: 1,
    },
    emptyStateContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    emptyTextLine: {
        fontSize: 14,
        color: colors.textMuted,
        textAlign: 'center',
        lineHeight: 22,
    },
    listContent: {
        paddingBottom: 90,
    },
    playerCard: {
        backgroundColor: colors.card,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: colors.cardBorder,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        marginHorizontal: 16,
        marginTop: 12,
    },
    avatarCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#10B981',
        alignItems: 'center',
        justifyContent: 'center',
    },
    playerName: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    actionIconsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconBtn: {
        padding: 4,
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
        width: '80%',
        maxWidth: 320,
        backgroundColor: '#111827',
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
        textAlign: 'left',
    },
    modalInput: {
        borderBottomWidth: 2,
        borderBottomColor: '#10B981',
        fontSize: 15,
        color: colors.textPrimary,
        paddingVertical: 8,
        paddingHorizontal: 0,
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
});
