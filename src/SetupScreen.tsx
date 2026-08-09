import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AdvancedSettingsScreen from './AdvancedSettingsScreen';
import { AppSettings } from './types';
import { loadFinalOverThriller } from './mockData';
import { useTheme } from './ThemeContext';

export default function SetupScreen({ onStartMatch, onBack }: { onStartMatch: (settings: AppSettings) => void; onBack?: () => void }) {
    const { colors, isDark } = useTheme();
    // Basic Settings
    const [hostTeam, setHostTeam] = useState('');
    const [visitorTeam, setVisitorTeam] = useState('');
    const [toss, setToss] = useState('host');
    const [opted, setOpted] = useState('bat');
    const [overs, setOvers] = useState('20');

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

    const handleLoadTest = () => {
        const scenario = loadFinalOverThriller();
        
        const firstInningsScorecard = {
            id: 'inn-1',
            teamName: scenario.firstInnings.battingTeam,
            totalScore: `${scenario.firstInnings.currentScore}/${scenario.firstInnings.wickets}`,
            overs: `(${scenario.firstInnings.oversCompleted.toFixed(1)})`,
            extras: `${scenario.firstInnings.extras.total} (b ${scenario.firstInnings.extras.byes}, lb ${scenario.firstInnings.extras.legByes}, w ${scenario.firstInnings.extras.wides}, nb ${scenario.firstInnings.extras.noBalls})`,
            batters: scenario.firstInnings.batters.map(b => ({
                id: `b1-${b.id}`,
                name: b.name,
                dismissal: b.status,
                runs: b.runs,
                balls: b.balls,
                fours: b.fours,
                sixes: b.sixes,
                strikeRate: b.sr.toFixed(2),
                isNotOut: b.status === 'not out',
                didNotBat: false,
            })),
            bowlers: scenario.firstInnings.bowlers.map(bw => ({
                id: `bw1-${bw.id}`,
                name: bw.name,
                overs: bw.overs.toFixed(1),
                maidens: bw.maidens,
                runs: bw.runs,
                wickets: bw.wickets,
                economy: bw.econ.toFixed(2),
            })),
            fow: scenario.firstInnings.fow.map(f => ({
                id: `fw1-${f.wicket}`,
                wicketNumber: f.wicket,
                player: f.player,
                score: `${f.score}/${f.wicket}`,
                overs: f.over,
            })),
        };

        const parseHistoricalBall = (bStr: string, bowlerName: string, strikerName: string) => {
            let circleText = bStr;
            let subText: string | undefined = undefined;
            let isWicket = bStr === 'W';
            let runs = 0;

            const upper = bStr.toUpperCase();
            if (bStr === 'W') {
                circleText = 'W';
                runs = 0;
            } else if (upper.startsWith('WD') || upper === 'WD') {
                circleText = '0';
                subText = 'WD';
                runs = 1;
            } else if (upper.includes('NB')) {
                const num = upper.replace(/[^0-9]/g, '');
                circleText = num ? num : '1';
                subText = 'NB';
                runs = (parseInt(num) || 1) + 1;
            } else if (upper.startsWith('LB')) {
                const num = upper.replace(/[^0-9]/g, '');
                circleText = num ? num : '1';
                subText = 'LB';
                runs = parseInt(num) || 1;
            } else if (upper.startsWith('BYE')) {
                const num = upper.replace(/[^0-9]/g, '');
                circleText = num ? num : '1';
                subText = 'BYE';
                runs = parseInt(num) || 1;
            } else {
                const r = parseInt(bStr);
                runs = !isNaN(r) ? r : 0;
                circleText = `${runs}`;
            }

            return { circleText, subText, runs, isWicket, bowlerName, strikerName };
        };

        const overs1History = scenario.firstInnings.overByOver.map(o => {
            const bBowler = scenario.firstInnings.bowlers[(o.overNumber - 1) % scenario.firstInnings.bowlers.length].name;
            const bStriker = scenario.firstInnings.batters[(o.overNumber - 1) % scenario.firstInnings.batters.length].name;
            const balls = o.balls.map(b => parseHistoricalBall(b, bBowler, bStriker));
            return {
                overNumber: o.overNumber,
                innings: 1,
                bowlerName: bBowler,
                battersText: `${bBowler.split(' ')[0]} to ${bStriker.split(' ')[0]}`,
                totalRuns: o.runs,
                balls: balls,
            };
        });

        const overs2History = scenario.secondInnings.overByOver.map(o => {
            const bBowler = scenario.secondInnings.bowlers[(o.overNumber - 1) % scenario.secondInnings.bowlers.length].name;
            const bStriker = o.overNumber >= 15 ? 'Dasun Shanaka' : scenario.secondInnings.batters[(o.overNumber - 1) % 6].name;
            const balls = o.balls.map(b => parseHistoricalBall(b, bBowler, bStriker));
            return {
                overNumber: o.overNumber,
                innings: 2,
                bowlerName: bBowler,
                battersText: `${bBowler.split(' ')[0]} to ${bStriker.split(' ')[0]}`,
                totalRuns: o.runs,
                balls: balls,
            };
        });

        const strikerBatter = scenario.secondInnings.batters.find(b => b.isStriker) || { name: 'Dasun Shanaka', runs: 45, balls: 20, fours: 3, sixes: 3 };
        const nonStrikerBatter = scenario.secondInnings.batters.find(b => b.isStriker === false && b.status === 'not out') || { name: 'Chamika Karunaratne', runs: 12, balls: 9, fours: 1, sixes: 0 };
        const currentBowler = scenario.secondInnings.bowlers.find(bw => bw.isCurrentBowler) || { name: 'Glenn Maxwell', overs: 3.0, maidens: 0, runs: 28, wickets: 0 };

        onStartMatch({
            battingTeam: scenario.firstInnings.battingTeam,
            bowlingTeam: scenario.firstInnings.bowlingTeam,
            tossWinner: 'host',
            optedTo: 'bat',
            overs: '20',
            ballsPerOver: 6,
            nbReball: true,
            nbRuns: 1,
            wdReball: true,
            wdRuns: 1,
            battingSquad: scenario.firstInnings.batters.map(b => b.name),
            bowlingSquad: scenario.secondInnings.batters.map(b => b.name),
            testState: {
                currentInnings: scenario.matchInfo.currentInnings,
                targetScore: scenario.matchInfo.target,
                runs: scenario.secondInnings.currentScore,
                wickets: scenario.secondInnings.wickets,
                totalBalls: Math.round(scenario.secondInnings.oversCompleted * 6),
                currentOverBalls: [],
                striker: strikerBatter.name,
                nonStriker: nonStrikerBatter.name,
                bowler: currentBowler.name,
                strikerStats: { name: strikerBatter.name, runs: strikerBatter.runs, balls: strikerBatter.balls, fours: strikerBatter.fours, sixes: strikerBatter.sixes },
                nonStrikerStats: { name: nonStrikerBatter.name, runs: nonStrikerBatter.runs, balls: nonStrikerBatter.balls, fours: nonStrikerBatter.fours, sixes: nonStrikerBatter.sixes },
                bowlerStats: { name: currentBowler.name, runs: currentBowler.runs, wickets: currentBowler.wickets, balls: Math.round(currentBowler.overs * 6), maidens: currentBowler.maidens },
                dismissedBatters: scenario.secondInnings.batters
                    .filter(b => b.status !== 'not out')
                    .map(b => ({
                        name: b.name,
                        dismissal: b.status,
                        runs: b.runs,
                        balls: b.balls,
                        fours: b.fours,
                        sixes: b.sixes,
                        innings: 2,
                    })),
                bowlersHistory: scenario.secondInnings.bowlers.map(bw => ({
                    name: bw.name,
                    runs: bw.runs,
                    wickets: bw.wickets,
                    balls: Math.round(bw.overs * 6),
                    maidens: bw.maidens,
                    innings: 2,
                })),
                fowList: scenario.secondInnings.fow.map(f => ({
                    id: `fow-2-${f.wicket}`,
                    wicketNumber: f.wicket,
                    player: f.player,
                    score: `${f.score}/${f.wicket}`,
                    overs: f.over,
                    innings: 2,
                })),
                allOversHistory: [...overs1History, ...overs2History],
                firstInningsScorecard,
                extrasStats: scenario.secondInnings.extras,
            }
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
                <View style={{ backgroundColor: colors.card, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6, marginBottom: 10, borderWidth: 1, borderColor: colors.cardBorder }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 2 }}>
                        <Ionicons name="flag-outline" size={16} color={colors.accent} style={{ marginRight: 8 }} />
                        <TextInput style={{ flex: 1, fontSize: 14, color: colors.textPrimary, paddingVertical: 4 }} placeholder="Host Team" value={hostTeam} onChangeText={setHostTeam} placeholderTextColor={colors.inputPlaceholder} />
                    </View>
                    <View style={{ height: 1, backgroundColor: colors.divider, marginVertical: 2 }} />
                    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 2 }}>
                        <Ionicons name="airplane-outline" size={16} color={colors.accentBlue} style={{ marginRight: 8 }} />
                        <TextInput style={{ flex: 1, fontSize: 14, color: colors.textPrimary, paddingVertical: 4 }} placeholder="Visitor Team" value={visitorTeam} onChangeText={setVisitorTeam} placeholderTextColor={colors.inputPlaceholder} />
                    </View>
                </View>

                {/* Toss Won By Section */}
                <Text style={{ color: colors.textMuted, fontWeight: '700', fontSize: 10, letterSpacing: 1, marginBottom: 4, marginTop: 2 }}>TOSS WON BY</Text>
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
                    <TouchableOpacity
                        style={[{ flex: 1, flexDirection: 'row', paddingVertical: 9, paddingHorizontal: 10, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }, toss === 'host' ? { backgroundColor: colors.accent, borderWidth: 1, borderColor: colors.accent } : { backgroundColor: colors.chipUnselectedBg, borderWidth: 1, borderColor: colors.chipUnselectedBorder }]}
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
                        style={[{ flex: 1, flexDirection: 'row', paddingVertical: 9, paddingHorizontal: 10, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }, toss === 'visitor' ? { backgroundColor: colors.accent, borderWidth: 1, borderColor: colors.accent } : { backgroundColor: colors.chipUnselectedBg, borderWidth: 1, borderColor: colors.chipUnselectedBorder }]}
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
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
                    <TouchableOpacity
                        style={[{ flex: 1, flexDirection: 'row', paddingVertical: 9, paddingHorizontal: 10, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }, opted === 'bat' ? { backgroundColor: colors.accent, borderWidth: 1, borderColor: colors.accent } : { backgroundColor: colors.chipUnselectedBg, borderWidth: 1, borderColor: colors.chipUnselectedBorder }]}
                        onPress={() => setOpted('bat')}
                    >
                        <Ionicons name="baseball-outline" size={15} color={opted === 'bat' ? colors.chipSelectedTextOnAccent : colors.chipUnselectedText} style={{ marginRight: 5 }} />
                        <Text style={[{ fontSize: 13 }, opted === 'bat' ? { color: colors.chipSelectedTextOnAccent, fontWeight: '700' } : { color: colors.chipUnselectedText, fontWeight: '500' }]}>
                            Bat
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[{ flex: 1, flexDirection: 'row', paddingVertical: 9, paddingHorizontal: 10, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }, opted === 'bowl' ? { backgroundColor: colors.accent, borderWidth: 1, borderColor: colors.accent } : { backgroundColor: colors.chipUnselectedBg, borderWidth: 1, borderColor: colors.chipUnselectedBorder }]}
                        onPress={() => setOpted('bowl')}
                    >
                        <Ionicons name="ellipse-outline" size={15} color={opted === 'bowl' ? colors.chipSelectedTextOnAccent : colors.chipUnselectedText} style={{ marginRight: 5 }} />
                        <Text style={[{ fontSize: 13 }, opted === 'bowl' ? { color: colors.chipSelectedTextOnAccent, fontWeight: '700' } : { color: colors.chipUnselectedText, fontWeight: '500' }]}>
                            Bowl
                        </Text>
                    </TouchableOpacity>
                </View>

                <Text style={{ color: colors.textMuted, fontWeight: '700', fontSize: 10, letterSpacing: 1, marginBottom: 4, marginTop: 2 }}>TOTAL OVERS</Text>
                <View style={{ backgroundColor: colors.card, borderRadius: 12, padding: 10, marginBottom: 10, borderWidth: 1, borderColor: colors.cardBorder }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 14, paddingVertical: 2 }}>
                        <TouchableOpacity style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.buttonBg, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.cardBorder }} onPress={handleDecrementOvers}>
                            <Ionicons name="remove" size={16} color={colors.textPrimary} />
                        </TouchableOpacity>

                        <TextInput
                            style={{ fontSize: 22, fontWeight: '800', color: colors.textPrimary, minWidth: 50, textAlign: 'center' }}
                            value={overs}
                            onChangeText={handleOversChangeText}
                            keyboardType="numeric"
                            maxLength={3}
                            textAlign="center"
                            selectTextOnFocus
                        />

                        <TouchableOpacity style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.buttonBg, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.cardBorder }} onPress={handleIncrementOvers}>
                            <Ionicons name="add" size={16} color={colors.textPrimary} />
                        </TouchableOpacity>
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 8 }}>
                        {[5, 10, 20, 50].map((num) => {
                            const isSelected = (parseInt(overs) || 0) === num;
                            return (
                                <TouchableOpacity
                                    key={num}
                                    style={[{ paddingVertical: 5, paddingHorizontal: 14, borderRadius: 16, borderWidth: 1 }, isSelected ? { backgroundColor: colors.accent, borderColor: colors.accent } : { backgroundColor: colors.chipUnselectedBg, borderColor: colors.chipUnselectedBorder }]}
                                    onPress={() => setOvers(num.toString())}
                                >
                                    <Text style={[{ fontSize: 12, fontWeight: '600' }, isSelected ? { color: colors.chipSelectedTextOnAccent, fontWeight: '700' } : { color: colors.chipUnselectedText }]}>
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

                {/* Load Test Scenario */}
                <TouchableOpacity style={{ backgroundColor: colors.accentPurpleBg, borderWidth: 1, borderColor: colors.accentPurpleBorder, padding: 10, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }} onPress={handleLoadTest}>
                    <Ionicons name="flask-outline" size={16} color={colors.accentPurple} style={{ marginRight: 6 }} />
                    <Text style={{ color: '#A78BFA', fontWeight: '600', fontSize: 13 }}>Load Test Scenario (Last Over)</Text>
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