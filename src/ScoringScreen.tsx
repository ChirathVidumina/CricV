import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, Modal, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScoreboardView, { Batter, Bowler, FallOfWicket, InningsScorecard } from '../components/ScoreboardView';
import { useTheme, ThemeColors } from './ThemeContext';

const parseBallData = (ballStr: string) => {
    if (!ballStr) return { circleText: '•', runs: 0, extraType: null, isWicket: false };
    const str = ballStr.trim();
    if (str === 'W' || str.toLowerCase().includes('wicket') || str === 'OUT') {
        return { circleText: 'W', runs: 0, extraType: null, isWicket: true };
    }

    const upper = str.toUpperCase();
    if (upper.includes('WD')) {
        const num = upper.replace(/[^0-9]/g, '');
        const extraRuns = num ? parseInt(num, 10) : 1;
        return { circleText: '0', runs: extraRuns, extraType: 'WD', isWicket: false };
    }
    if (upper.includes('NB')) {
        const num = upper.replace(/[^0-9]/g, '');
        const extraRuns = num ? parseInt(num, 10) : 1;
        return { circleText: `${Math.max(0, extraRuns - 1)}`, runs: extraRuns, extraType: 'NB', isWicket: false };
    }
    if (upper.includes('LB')) {
        const num = upper.replace(/[^0-9]/g, '');
        const runs = num ? parseInt(num, 10) : 1;
        return { circleText: `${runs}`, runs, extraType: 'LB', isWicket: false };
    }
    if (upper.includes('BYE')) {
        const num = upper.replace(/[^0-9]/g, '');
        const runs = num ? parseInt(num, 10) : 1;
        return { circleText: `${runs}`, runs, extraType: 'BYE', isWicket: false };
    }

    const cleanNum = parseInt(upper.replace(/[^0-9]/g, ''), 10);
    if (!isNaN(cleanNum)) {
        return { circleText: cleanNum === 0 ? '•' : `${cleanNum}`, runs: cleanNum, extraType: null, isWicket: false };
    }

    return { circleText: str, runs: 0, extraType: null, isWicket: false };
};

const getExtraLabelColor = (type: string, colors: ThemeColors) => {
    if (!type) return colors.textMuted;
    const upper = type.toUpperCase();
    if (upper.includes('NB')) {
        return '#EF4444';
    }
    if (upper.includes('WD')) {
        return '#F59E0B';
    }
    if (upper === 'B' || upper === 'BYE') {
        return '#8B5CF6';
    }
    if (upper === 'LB') {
        return '#EC4899';
    }
    return colors.textMuted;
};

export default function ScoringScreen({ players, settings, onBack, navigation, onResetToHome }: any) {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
    const testState = settings?.testState;

    const [teamRuns, setTeamRuns] = useState(testState?.runs ?? 0);
    const [wickets, setWickets] = useState(testState?.wickets ?? 0);
    const [totalBalls, setTotalBalls] = useState(testState?.totalBalls ?? 0);
    const [extras, setExtras] = useState(0);
    const [extrasStats, setExtrasStats] = useState<{ total: number; WD: number; NB: number; BYE: number; LB: number }>(testState?.extrasStats ?? { total: 0, WD: 0, NB: 0, BYE: 0, LB: 0 });

    const [isNewBowlerModalVisible, setIsNewBowlerModalVisible] = useState(false);
    const [isNewBatsmanModalVisible, setIsNewBatsmanModalVisible] = useState(false);
    const [isRetireModalVisible, setIsRetireModalVisible] = useState(false);
    const [isPenaltyModalVisible, setIsPenaltyModalVisible] = useState(false);
    const [bowlingPenaltyRuns, setBowlingPenaltyRuns] = useState(0);
    const [tempInputName, setTempInputName] = useState('');
    const [showSquadDropdown, setShowSquadDropdown] = useState(false);

    const matchPlayerName = (nameA: string, nameB: string) => {
        if (!nameA || !nameB) return false;
        const cleanA = nameA.toLowerCase().replace(/\(c\)|\(wk\)/g, '').trim();
        const cleanB = nameB.toLowerCase().replace(/\(c\)|\(wk\)/g, '').trim();
        if (cleanA === cleanB) return true;
        const partsA = cleanA.split(' ').filter(x => x.length > 2);
        const partsB = cleanB.split(' ').filter(x => x.length > 2);
        if (partsA.length > 0 && partsB.length > 0) {
            const lastA = partsA[partsA.length - 1];
            const lastB = partsB[partsB.length - 1];
            if (lastA === lastB && partsA[0] === partsB[0]) return true;
        }
        return false;
    };
    const [isInningsComplete, setIsInningsComplete] = useState(false);
    const [showInningsModal, setShowInningsModal] = useState(false);
    const [activeExtras, setActiveExtras] = useState<{ WD: boolean; NB: boolean; BYE: boolean; LB: boolean }>({ WD: false, NB: false, BYE: false, LB: false });
    
    const [currentInnings, setCurrentInnings] = useState(testState?.currentInnings ?? 1);
    const [targetScore, setTargetScore] = useState<number | null>(testState?.targetScore ?? null);
    const [isMatchOver, setIsMatchOver] = useState(false);
    const [isMatchComplete, setIsMatchComplete] = useState(false);
    const [showMatchResultCard, setShowMatchResultCard] = useState(false);
    const [matchResult, setMatchResult] = useState('');
    const [battingTeamName, setBattingTeamName] = useState(testState ? 'Sri Lanka' : (settings?.battingTeam || 'Host Team'));
    const [bowlingTeamName, setBowlingTeamName] = useState(testState ? 'India' : (settings?.bowlingTeam || 'Visitor Team'));
    const [isScorecardVisible, setIsScorecardVisible] = useState(false);
    const [activeScorecardTab, setActiveScorecardTab] = useState<'Scoreboard' | 'Overs'>('Scoreboard');
    const [selectedOversInnings, setSelectedOversInnings] = useState<number>(testState?.currentInnings ?? 1);
    const [history, setHistory] = useState<any[]>([]);

    const currentBattingSquad = React.useMemo(() => {
        if (currentInnings === 2) {
            return (settings?.bowlingSquad && settings.bowlingSquad.length > 0)
                ? settings.bowlingSquad
                : [];
        }
        return (settings?.battingSquad && settings.battingSquad.length > 0)
            ? settings.battingSquad
            : [];
    }, [currentInnings, settings]);

    const currentBowlingSquad = React.useMemo(() => {
        if (currentInnings === 2) {
            return (settings?.battingSquad && settings.battingSquad.length > 0)
                ? settings.battingSquad
                : [];
        }
        return (settings?.bowlingSquad && settings.bowlingSquad.length > 0)
            ? settings.bowlingSquad
            : [];
    }, [currentInnings, settings]);

    const [strikerStats, setStrikerStats] = useState(() => {
        if (testState?.strikerStats) return testState.strikerStats;
        return { name: players?.striker || (testState ? testState.striker : 'Striker'), runs: 0, balls: 0, fours: 0, sixes: 0 };
    });
    const [nonStrikerStats, setNonStrikerStats] = useState(() => {
        if (testState?.nonStrikerStats) return testState.nonStrikerStats;
        return { name: players?.nonStriker || (testState ? testState.nonStriker : 'Non-Striker'), runs: 0, balls: 0, fours: 0, sixes: 0 };
    });
    const [bowlerStats, setBowlerStats] = useState(() => {
        if (testState?.bowlerStats) return testState.bowlerStats;
        return { name: players?.bowler || (testState ? testState.bowler : 'Bowler'), runs: 0, wickets: 0, balls: 0, maidens: 0 };
    });
    const [currentOverBalls, setCurrentOverBalls] = useState<string[]>([]);

    const [dismissedBatters, setDismissedBatters] = useState<Array<{ name: string; dismissal: string; runs: number; balls: number; fours: number; sixes: number; innings: number }>>(testState?.dismissedBatters ?? []);
    const [bowlersHistory, setBowlersHistory] = useState<Array<{ name: string; runs: number; wickets: number; balls: number; maidens: number; innings: number }>>(testState?.bowlersHistory ?? []);
    const [fowList, setFowList] = useState<Array<{ id: string; wicketNumber: number; player: string; score: string; overs: string; innings: number }>>(testState?.fowList ?? []);
    const [firstInningsScorecard, setFirstInningsScorecard] = useState<InningsScorecard | null>(testState?.firstInningsScorecard ?? null);
    const [allOversHistory, setAllOversHistory] = useState<any[]>(testState?.allOversHistory ?? []);
    const [expandedOvers, setExpandedOvers] = useState<Record<string, boolean>>({});

    const toggleOverExpand = (overKey: string) => {
        setExpandedOvers(prev => ({
            ...prev,
            [overKey]: !prev[overKey],
        }));
    };

    const toggleExpandAllOvers = (overs: any[]) => {
        const allExpanded = overs.every(o => !!expandedOvers[`${o.innings}-${o.overNumber}`]);
        const newState: Record<string, boolean> = {};
        if (!allExpanded) {
            overs.forEach(o => {
                newState[`${o.innings}-${o.overNumber}`] = true;
            });
        }
        setExpandedOvers(newState);
    };

    // Real-World Wicket Dismissal Modal States
    const [isRealWicketModalVisible, setIsRealWicketModalVisible] = useState<boolean>(false);
    const [wicketDismissalType, setWicketDismissalType] = useState<
        'Bowled' | 'Caught' | 'LBW' | 'Run Out' | 'Stumped' | 'Hit Wicket' |
        'Hit Ball Twice' | 'Obstructing Field' | 'Timed Out' | 'Retired Out' | 'Handled Ball'
    >('Bowled');
    const [showAdvancedDismissals, setShowAdvancedDismissals] = useState<boolean>(false);
    const [wicketOutPlayer, setWicketOutPlayer] = useState<'striker' | 'nonStriker'>('striker');
    const [wicketFielderName, setWicketFielderName] = useState<string>('');
    const [wicketFielder2Name, setWicketFielder2Name] = useState<string>('');
    const [wicketRunsScored, setWicketRunsScored] = useState<number>(0);

    const updateBowlerHistory = (updatedBowler: { name: string; runs: number; wickets: number; balls: number; maidens: number }, inn: number = currentInnings) => {
        setBowlersHistory(prev => {
            const idx = prev.findIndex(b => b.name === updatedBowler.name && b.innings === inn);
            if (idx >= 0) {
                const copy = [...prev];
                copy[idx] = { ...updatedBowler, innings: inn };
                return copy;
            } else {
                return [...prev, { ...updatedBowler, innings: inn }];
            }
        });
    };

    const bpo = settings?.ballsPerOver || 6;

    const parseBallBadge = (ballStr: string) => {
        let circleText = ballStr;
        let subText: string | undefined = undefined;
        let isWicket = false;
        let runs = 0;

        const upper = ballStr.toUpperCase();
        if (ballStr === 'W' || ballStr.toLowerCase().includes('wicket') || ballStr === 'OUT') {
            circleText = 'W';
            isWicket = true;
        } else if (upper.includes('LB')) {
            const num = upper.replace(/[^0-9]/g, '');
            circleText = num ? num : '1';
            subText = 'LB';
            runs = parseInt(num) || 1;
        } else if (upper.includes('WD')) {
            const num = upper.replace(/[^0-9]/g, '');
            if (!num || num === '1') {
                circleText = '0';
                subText = 'WD';
            } else {
                circleText = '0';
                subText = `${num}WD`;
            }
            runs = (parseInt(num) || 0) + 1;
        } else if (upper.includes('NB')) {
            const num = upper.replace(/[^0-9]/g, '');
            circleText = num ? num : '1';
            subText = 'NB';
            runs = (parseInt(num) || 0) + 1;
        } else if (upper.includes('BYE')) {
            const num = upper.replace(/[^0-9]/g, '');
            circleText = num ? num : '1';
            subText = 'BYE';
            runs = parseInt(num) || 1;
        } else if (ballStr.includes('+')) {
            const match = ballStr.match(/^(\d+)(.*)$/);
            if (match) {
                circleText = match[1];
                subText = match[2];
                runs = parseInt(match[1]) || 0;
            } else {
                circleText = '1';
                subText = ballStr;
                runs = 1;
            }
        } else {
            const r = parseInt(ballStr);
            if (!isNaN(r)) {
                circleText = `${r}`;
                runs = r;
            } else {
                circleText = ballStr;
            }
        }

        return { circleText, subText, isWicket, runs };
    };

    const recordBallToOversHistory = (ballTag: string, ballRuns: number, isWicketBall: boolean = false) => {
        const overNum = Math.floor(totalBalls / bpo) + 1;
        const parsedBadge = parseBallBadge(ballTag);
        if (isWicketBall) {
            parsedBadge.isWicket = true;
            parsedBadge.circleText = 'W';
        }

        const bName = bowlerStats?.name || 'Bowler';
        const sName = strikerStats?.name || 'Batter';

        const ballObject = {
            ...parsedBadge,
            bowlerName: bName,
            strikerName: sName,
        };

        setAllOversHistory(prev => {
            const copy = JSON.parse(JSON.stringify(prev));
            const existingIdx = copy.findIndex((o: any) => o.innings === currentInnings && o.overNumber === overNum);

            const bowlerAbbrev = bName.split(' ')[0];
            const strikerAbbrev = sName.split(' ')[0];
            const battersText = `${bowlerAbbrev} to ${strikerAbbrev}`;

            if (existingIdx >= 0) {
                const existing = copy[existingIdx];
                existing.balls.push(ballObject);
                existing.totalRuns += ballRuns;
                existing.bowlerName = bName;
                existing.battersText = battersText;
                copy[existingIdx] = existing;
            } else {
                copy.push({
                    overNumber: overNum,
                    innings: currentInnings,
                    bowlerName: bName,
                    battersText: battersText,
                    totalRuns: ballRuns,
                    balls: [ballObject]
                });
            }
            return copy;
        });
    };

    const handleExtraToggle = (type: 'WD' | 'NB' | 'BYE' | 'LB') => {
        setActiveExtras(prev => {
            const isTurningOn = !prev[type];
            const nextState = { ...prev };

            if (isTurningOn) {
                nextState[type] = true;
                if (type === 'WD') {
                    nextState.NB = false;
                    nextState.LB = false;
                } else if (type === 'NB') {
                    nextState.WD = false;
                } else if (type === 'BYE') {
                    nextState.LB = false;
                } else if (type === 'LB') {
                    nextState.BYE = false;
                    nextState.WD = false;
                }
            } else {
                nextState[type] = false;
            }

            return nextState;
        });
    };

    const handlePressRun = (run: number) => {
        if (isMatchComplete || isInningsComplete) return;

        const hasExtra = activeExtras.WD || activeExtras.NB || activeExtras.BYE || activeExtras.LB;
        if (hasExtra) {
            processCombinedExtras(activeExtras, run);
            setActiveExtras({ WD: false, NB: false, BYE: false, LB: false });
        } else {
            handleRun(run);
        }
    };

    const handleFinishMatch = () => {
        setShowMatchResultCard(true);
    };

    // Overs Math
    const overs = Math.floor(totalBalls / bpo);
    const currentBalls = totalBalls % bpo;
    const crr = totalBalls > 0 ? (teamRuns / (totalBalls / bpo)).toFixed(2) : '0.00';

    const handleNavigateHome = () => {
        if (navigation?.reset) {
            navigation.reset({
                index: 0,
                routes: [{ name: 'Home' }],
            });
        } else if (navigation?.navigate) {
            navigation.navigate('Home');
        }
        if (onResetToHome) {
            onResetToHome();
        } else if (onBack) {
            onBack();
        }
    };

    useEffect(() => {
        const totalTargetBalls = parseInt(settings?.overs || '20') * bpo;
        const isAllOut = wickets >= 10;
        const isOversFinished = totalBalls > 0 && totalBalls >= totalTargetBalls;

        if (currentInnings === 1) {
            if (isAllOut || isOversFinished) {
                setIsInningsComplete(true);
                setShowInningsModal(true);
                setIsNewBowlerModalVisible(false);
                setIsNewBatsmanModalVisible(false);
            }
        } else if (currentInnings === 2 && targetScore) {
            const hasWon = teamRuns >= targetScore;
            const hasLost = (isAllOut || isOversFinished) && teamRuns < targetScore;
            const hasTied = (isAllOut || isOversFinished) && teamRuns === targetScore - 1;

            if ((hasWon || hasLost || hasTied) && !isMatchComplete) {
                let result = '';
                if (hasWon) {
                    result = `${battingTeamName} won by ${10 - wickets} wickets!`;
                } else if (hasLost) {
                    result = `${bowlingTeamName} won by ${targetScore - teamRuns - 1} runs!`;
                } else if (hasTied) {
                    result = 'Match Tied!';
                }

                setMatchResult(result);
                setIsInningsComplete(true);
                setIsMatchOver(true);
                setIsMatchComplete(true);
                setIsNewBowlerModalVisible(false);
                setIsNewBatsmanModalVisible(false);
            }
        }
    }, [totalBalls, wickets, teamRuns, currentInnings, targetScore, battingTeamName, bowlingTeamName, settings, bpo, isMatchComplete]);

    const saveStateToHistory = () => {
        setHistory(prev => [...prev, {
            teamRuns, wickets, totalBalls, extras, extrasStats: { ...extrasStats }, bowlingPenaltyRuns,
            isInningsComplete, showInningsModal, currentInnings, targetScore,
            isMatchOver, isMatchComplete, showMatchResultCard, matchResult, battingTeamName, bowlingTeamName,
            strikerStats: { ...strikerStats },
            nonStrikerStats: { ...nonStrikerStats },
            bowlerStats: { ...bowlerStats },
            currentOverBalls: [...currentOverBalls],
            allOversHistory: JSON.parse(JSON.stringify(allOversHistory)),
            dismissedBatters: JSON.parse(JSON.stringify(dismissedBatters)),
            bowlersHistory: JSON.parse(JSON.stringify(bowlersHistory)),
            fowList: JSON.parse(JSON.stringify(fowList)),
            firstInningsScorecard: firstInningsScorecard ? JSON.parse(JSON.stringify(firstInningsScorecard)) : null,
            activeExtras: { ...activeExtras },
            isScorecardVisible, activeScorecardTab,
            isNewBowlerModalVisible, isNewBatsmanModalVisible, isRetireModalVisible, isPenaltyModalVisible
        }]);
    };

    const handleUndo = () => {
        if (history.length === 0) return;
        
        const previousState = history[history.length - 1];
        
        setTeamRuns(previousState.teamRuns);
        setWickets(previousState.wickets);
        setTotalBalls(previousState.totalBalls);
        setExtras(previousState.extras);
        setExtrasStats(previousState.extrasStats || { total: 0, WD: 0, NB: 0, BYE: 0, LB: 0 });
        setBowlingPenaltyRuns(previousState.bowlingPenaltyRuns);
        setIsInningsComplete(previousState.isInningsComplete);
        setShowInningsModal(previousState.showInningsModal);
        setCurrentInnings(previousState.currentInnings);
        setTargetScore(previousState.targetScore);
        setIsMatchOver(previousState.isMatchOver);
        setIsMatchComplete(previousState.isMatchComplete || false);
        setShowMatchResultCard(previousState.showMatchResultCard || false);
        setMatchResult(previousState.matchResult);
        setBattingTeamName(previousState.battingTeamName);
        setBowlingTeamName(previousState.bowlingTeamName);
        setStrikerStats(previousState.strikerStats);
        setNonStrikerStats(previousState.nonStrikerStats);
        setBowlerStats(previousState.bowlerStats);
        setCurrentOverBalls(previousState.currentOverBalls || []);
        setAllOversHistory(previousState.allOversHistory || []);
        if (previousState.dismissedBatters) setDismissedBatters(previousState.dismissedBatters);
        if (previousState.bowlersHistory) setBowlersHistory(previousState.bowlersHistory);
        if (previousState.fowList) setFowList(previousState.fowList);
        if (previousState.firstInningsScorecard !== undefined) setFirstInningsScorecard(previousState.firstInningsScorecard);
        setActiveExtras(previousState.activeExtras || { WD: false, NB: false, BYE: false, LB: false });
        
        setIsScorecardVisible(previousState.isScorecardVisible);
        setActiveScorecardTab(previousState.activeScorecardTab);
        setIsNewBowlerModalVisible(previousState.isNewBowlerModalVisible);
        setIsNewBatsmanModalVisible(previousState.isNewBatsmanModalVisible);
        setIsRetireModalVisible(previousState.isRetireModalVisible);
        setIsPenaltyModalVisible(previousState.isPenaltyModalVisible);
        setActiveExtras({ WD: false, NB: false, BYE: false, LB: false });
        
        setHistory(prev => prev.slice(0, -1));
    };

    const startSecondInnings = () => {
        saveStateToHistory();

        // Lock 1st Innings Scorecard
        const firstInningsBatters: Batter[] = [];
        dismissedBatters.filter(b => b.innings === 1).forEach((b, idx) => {
            firstInningsBatters.push({
                id: `inn1-d-${idx}`,
                name: b.name,
                dismissal: b.dismissal,
                runs: b.runs,
                balls: b.balls,
                fours: b.fours,
                sixes: b.sixes,
                strikeRate: b.balls > 0 ? ((b.runs / b.balls) * 100).toFixed(2) : '0.00',
            });
        });
        if (strikerStats?.name && !firstInningsBatters.some(b => b.name === strikerStats.name)) {
            firstInningsBatters.push({
                id: 'inn1-striker',
                name: strikerStats.name,
                dismissal: 'not out',
                runs: strikerStats.runs,
                balls: strikerStats.balls,
                fours: strikerStats.fours,
                sixes: strikerStats.sixes,
                strikeRate: strikerStats.balls > 0 ? ((strikerStats.runs / strikerStats.balls) * 100).toFixed(2) : '0.00',
                isNotOut: true,
            });
        }
        if (nonStrikerStats?.name && !firstInningsBatters.some(b => b.name === nonStrikerStats.name)) {
            firstInningsBatters.push({
                id: 'inn1-nonstriker',
                name: nonStrikerStats.name,
                dismissal: 'not out',
                runs: nonStrikerStats.runs,
                balls: nonStrikerStats.balls,
                fours: nonStrikerStats.fours,
                sixes: nonStrikerStats.sixes,
                strikeRate: nonStrikerStats.balls > 0 ? ((nonStrikerStats.runs / nonStrikerStats.balls) * 100).toFixed(2) : '0.00',
                isNotOut: true,
            });
        }
        const inn1Squad = settings?.battingSquad || [];
        inn1Squad.forEach((p: string, idx: number) => {
            if (!firstInningsBatters.some(b => b.name === p)) {
                firstInningsBatters.push({
                    id: `inn1-dnb-${idx}`,
                    name: p,
                    dismissal: 'did not bat',
                    runs: 0,
                    balls: 0,
                    fours: 0,
                    sixes: 0,
                    strikeRate: '0.00',
                    didNotBat: true,
                });
            }
        });

        const firstInningsBowlers: Bowler[] = [];
        bowlersHistory.filter(b => b.innings === 1).forEach((b, idx) => {
            const isActive = b.name === bowlerStats.name;
            const statsToUse = isActive ? bowlerStats : b;
            firstInningsBowlers.push({
                id: `inn1-bw-${idx}`,
                name: statsToUse.name,
                overs: `${Math.floor(statsToUse.balls / bpo)}.${statsToUse.balls % bpo}`,
                maidens: statsToUse.maidens,
                runs: statsToUse.runs,
                wickets: statsToUse.wickets,
                economy: statsToUse.balls > 0 ? (statsToUse.runs / (statsToUse.balls / bpo)).toFixed(2) : '0.00',
            });
        });
        if (bowlerStats?.name && !firstInningsBowlers.some(b => b.name === bowlerStats.name)) {
            firstInningsBowlers.push({
                id: 'inn1-active-bw',
                name: bowlerStats.name,
                overs: `${Math.floor(bowlerStats.balls / bpo)}.${bowlerStats.balls % bpo}`,
                maidens: bowlerStats.maidens,
                runs: bowlerStats.runs,
                wickets: bowlerStats.wickets,
                economy: bowlerStats.balls > 0 ? (bowlerStats.runs / (bowlerStats.balls / bpo)).toFixed(2) : '0.00',
            });
        }
        const inn1BowlingSquad = settings?.bowlingSquad || [];
        inn1BowlingSquad.forEach((p: string, idx: number) => {
            if (!firstInningsBowlers.some(b => b.name === p)) {
                firstInningsBowlers.push({
                    id: `inn1-bwdnb-${idx}`,
                    name: p,
                    overs: '0.0',
                    maidens: 0,
                    runs: 0,
                    wickets: 0,
                    economy: '0.00',
                });
            }
        });

        const firstInningsFOW = fowList.filter(f => f.innings === 1);

        setFirstInningsScorecard({
            id: 'inn-1',
            teamName: battingTeamName,
            totalScore: `${teamRuns}-${wickets}`,
            overs: `(${Math.floor(totalBalls / bpo)}.${totalBalls % bpo})`,
            extras: `${extras} (b ${extrasStats.BYE || 0}, lb ${extrasStats.LB || 0}, w ${extrasStats.WD || 0}, nb ${extrasStats.NB || 0})`,
            batters: firstInningsBatters,
            bowlers: firstInningsBowlers,
            fow: firstInningsFOW,
        });

        setTargetScore(teamRuns + 1 + bowlingPenaltyRuns);
        setCurrentInnings(2);
        setSelectedOversInnings(2);
        
        setBattingTeamName(settings?.bowlingTeam || 'Visitor Team');
        setBowlingTeamName(settings?.battingTeam || 'Host Team');
        
        setTeamRuns(0);
        setWickets(0);
        setTotalBalls(0);
        setExtras(0);
        setExtrasStats({ total: 0, WD: 0, NB: 0, BYE: 0, LB: 0 });
        setStrikerStats({ name: 'Striker', runs: 0, balls: 0, fours: 0, sixes: 0 });
        setNonStrikerStats({ name: 'Non-Striker', runs: 0, balls: 0, fours: 0, sixes: 0 });
        setBowlerStats({ name: 'Bowler', runs: 0, wickets: 0, balls: 0, maidens: 0 });
        setCurrentOverBalls([]);

        setIsInningsComplete(false);
        setIsMatchComplete(false);
        setShowInningsModal(false);
        setIsNewBatsmanModalVisible(true);
    };

    const isMatchOrInningsEnding = (nextBalls: number, nextRuns: number, nextWickets: number) => {
        const totalTargetBalls = parseInt(settings?.overs || '20') * bpo;
        const isAllOut = nextWickets >= 10;
        const isOversFinished = nextBalls > 0 && nextBalls >= totalTargetBalls;

        if (currentInnings === 1) {
            return isAllOut || isOversFinished;
        } else if (currentInnings === 2 && targetScore) {
            const hasWon = nextRuns >= targetScore;
            const hasLost = (isAllOut || isOversFinished) && nextRuns < targetScore;
            const hasTied = (isAllOut || isOversFinished) && nextRuns === targetScore - 1;
            return hasWon || hasLost || hasTied;
        }
        return false;
    };

    const handleRun = (run: number) => {
        saveStateToHistory();
        recordBallToOversHistory(`${run}`, run, false);
        const nextRuns = teamRuns + run;
        const nextBalls = totalBalls + 1;
        setTeamRuns(nextRuns);
        setTotalBalls(nextBalls);
        setCurrentOverBalls(prev => [...prev, `${run}`]);

        let newStriker = { ...strikerStats, runs: strikerStats.runs + run, balls: strikerStats.balls + 1 };
        let newNonStriker = { ...nonStrikerStats };

        if (run === 4) newStriker.fours += 1;
        if (run === 6) newStriker.sixes += 1;

        const updatedBowler = { ...bowlerStats, runs: bowlerStats.runs + run, balls: bowlerStats.balls + 1 };
        setBowlerStats(updatedBowler);
        updateBowlerHistory(updatedBowler);

        let swap = false;
        if (run === 1 || run === 3 || run === 5) {
            swap = !swap;
        }
        if (nextBalls % bpo === 0) {
            swap = !swap;
        }

        if (swap) {
            setStrikerStats(newNonStriker);
            setNonStrikerStats(newStriker);
        } else {
            setStrikerStats(newStriker);
            setNonStrikerStats(newNonStriker);
        }

        if (nextBalls % bpo === 0 && !isMatchOrInningsEnding(nextBalls, nextRuns, wickets)) {
            setIsNewBowlerModalVisible(true);
        }
    };

    const openWicketModal = () => {
        if (wickets >= 10 || isMatchComplete || isInningsComplete) return;
        setWicketDismissalType('Bowled');
        setShowAdvancedDismissals(false);
        setWicketOutPlayer('striker');
        setWicketFielderName('');
        setWicketFielder2Name('');
        setWicketRunsScored(0);
        setIsRealWicketModalVisible(true);
    };

    const confirmRealWicket = () => {
        if (wickets >= 10) return;
        saveStateToHistory();

        const f1 = wicketFielderName.trim();
        const f2 = wicketFielder2Name.trim();
        let dismissalString = '';

        if (wicketDismissalType === 'Bowled') {
            dismissalString = `b ${bowlerStats.name}`;
        } else if (wicketDismissalType === 'Caught') {
            dismissalString = f1 ? `c ${f1} b ${bowlerStats.name}` : `c & b ${bowlerStats.name}`;
        } else if (wicketDismissalType === 'LBW') {
            dismissalString = `lbw b ${bowlerStats.name}`;
        } else if (wicketDismissalType === 'Run Out') {
            if (f1 && f2) {
                dismissalString = `run out (${f1} / ${f2})`;
            } else if (f1) {
                dismissalString = `run out (${f1})`;
            } else if (f2) {
                dismissalString = `run out (${f2})`;
            } else {
                dismissalString = `run out`;
            }
        } else if (wicketDismissalType === 'Stumped') {
            dismissalString = f1 ? `st ${f1} b ${bowlerStats.name}` : `st b ${bowlerStats.name}`;
        } else if (wicketDismissalType === 'Hit Wicket') {
            dismissalString = `hit wicket b ${bowlerStats.name}`;
        } else if (wicketDismissalType === 'Hit Ball Twice') {
            dismissalString = `hit ball twice`;
        } else if (wicketDismissalType === 'Obstructing Field') {
            dismissalString = `obstructing field`;
        } else if (wicketDismissalType === 'Timed Out') {
            dismissalString = `timed out`;
        } else if (wicketDismissalType === 'Retired Out') {
            dismissalString = `retired out`;
        } else if (wicketDismissalType === 'Handled Ball') {
            dismissalString = `handled ball`;
        }

        const nextWickets = wickets + 1;
        const nextBalls = totalBalls + 1;
        const runsScored = wicketRunsScored;
        const nextRuns = teamRuns + runsScored;

        setWickets(nextWickets);
        setTotalBalls(nextBalls);
        setTeamRuns(nextRuns);

        const ballTag = runsScored > 0 ? `${runsScored}+W` : 'W';
        recordBallToOversHistory(ballTag, runsScored, true);
        setCurrentOverBalls(prev => [...prev, ballTag]);

        // Bowler gets wicket credit ONLY for official bowler dismissals
        const bowlerWicketTypes = ['Bowled', 'Caught', 'LBW', 'Stumped', 'Hit Wicket'];
        const getsBowlerWicket = bowlerWicketTypes.includes(wicketDismissalType);
        const updatedBowler = {
            ...bowlerStats,
            runs: bowlerStats.runs + runsScored,
            wickets: bowlerStats.wickets + (getsBowlerWicket ? 1 : 0),
            balls: bowlerStats.balls + 1,
        };
        setBowlerStats(updatedBowler);
        updateBowlerHistory(updatedBowler);

        const outBatter = wicketOutPlayer === 'striker' ? strikerStats : nonStrikerStats;

        // Record dismissed batter with real-world dismissal string
        setDismissedBatters(prev => [...prev, {
            name: outBatter.name,
            dismissal: dismissalString,
            runs: outBatter.runs + (wicketOutPlayer === 'striker' ? runsScored : 0),
            balls: outBatter.balls + 1,
            fours: outBatter.fours + (runsScored === 4 ? 1 : 0),
            sixes: outBatter.sixes + (runsScored === 6 ? 1 : 0),
            innings: currentInnings,
        }]);

        // Record Fall of Wicket (FOW)
        const ovText = `${Math.floor(nextBalls / bpo)}.${nextBalls % bpo}`;
        setFowList(prev => [...prev, {
            id: `fow-${currentInnings}-${nextWickets}`,
            wicketNumber: nextWickets,
            player: outBatter.name,
            score: `${nextRuns}/${nextWickets}`,
            overs: ovText,
            innings: currentInnings,
        }]);

        // Clear out batter slot so incoming batter fills the correct slot
        if (wicketOutPlayer === 'striker') {
            setStrikerStats({ name: '', runs: 0, balls: 0, fours: 0, sixes: 0 });
        } else {
            setNonStrikerStats({ name: '', runs: 0, balls: 0, fours: 0, sixes: 0 });
        }

        setIsRealWicketModalVisible(false);

        if (!isMatchOrInningsEnding(nextBalls, nextRuns, nextWickets)) {
            setIsNewBatsmanModalVisible(true);
        }
    };

    const processCombinedExtras = (extrasObj: { WD: boolean; NB: boolean; BYE: boolean; LB: boolean }, additionalRuns: number = 0) => {
        saveStateToHistory();

        const isWD = extrasObj.WD;
        const isNB = extrasObj.NB;
        const isBYE = extrasObj.BYE;
        const isLB = extrasObj.LB;

        let runsToAdd = 0;
        let reball = true;
        let ballTag = '';

        let addedWD = 0;
        let addedNB = 0;
        let addedBYE = 0;
        let addedLB = 0;

        if (isWD && isBYE) {
            const wdRuns = settings?.wdRuns ?? 1;
            addedWD = wdRuns;
            addedBYE = additionalRuns;
            runsToAdd = wdRuns + additionalRuns;
            reball = settings?.wdReball ?? true;
            ballTag = `${runsToAdd}WD+B`;
        } else if (isNB && isBYE) {
            const nbRuns = settings?.nbRuns ?? 1;
            addedNB = nbRuns;
            addedBYE = additionalRuns;
            runsToAdd = nbRuns + additionalRuns;
            reball = settings?.nbReball ?? true;
            ballTag = `${runsToAdd}NB+B`;
        } else if (isNB && isLB) {
            const nbRuns = settings?.nbRuns ?? 1;
            addedNB = nbRuns;
            addedLB = additionalRuns;
            runsToAdd = nbRuns + additionalRuns;
            reball = settings?.nbReball ?? true;
            ballTag = `${runsToAdd}NB+LB`;
        } else if (isWD) {
            const wdRuns = settings?.wdRuns ?? 1;
            addedWD = wdRuns + additionalRuns;
            runsToAdd = wdRuns + additionalRuns;
            reball = settings?.wdReball ?? true;
            ballTag = additionalRuns > 0 ? `${additionalRuns}WD` : 'WD';
        } else if (isNB) {
            const nbRuns = settings?.nbRuns ?? 1;
            addedNB = nbRuns;
            runsToAdd = nbRuns + additionalRuns;
            reball = settings?.nbReball ?? true;
            ballTag = additionalRuns > 0 ? `${additionalRuns}NB` : 'NB';
        } else if (isBYE) {
            addedBYE = additionalRuns;
            runsToAdd = additionalRuns;
            reball = false;
            ballTag = additionalRuns > 0 ? `${additionalRuns}B` : 'B';
        } else if (isLB) {
            addedLB = additionalRuns;
            runsToAdd = additionalRuns;
            reball = false;
            ballTag = additionalRuns > 0 ? `${additionalRuns}LB` : 'LB';
        }

        const ballTotalExtras = addedWD + addedNB + addedBYE + addedLB;

        const nextRuns = teamRuns + runsToAdd;
        setTeamRuns(nextRuns);
        setExtras(extras + runsToAdd);
        setExtrasStats((prev: { total: number; WD: number; NB: number; BYE: number; LB: number }) => ({
            total: prev.total + ballTotalExtras,
            WD: prev.WD + addedWD,
            NB: prev.NB + addedNB,
            BYE: prev.BYE + addedBYE,
            LB: prev.LB + addedLB,
        }));
        setCurrentOverBalls(prev => [...prev, ballTag]);
        recordBallToOversHistory(ballTag, runsToAdd, false);

        let bowlerConceded = (isBYE || isLB) ? (isNB ? 1 : 0) : runsToAdd;
        let newBowler = { ...bowlerStats, runs: bowlerStats.runs + bowlerConceded };
        let newStriker = { ...strikerStats };
        let newNonStriker = { ...nonStrikerStats };

        if (isNB && !isBYE && !isLB) {
            newStriker.runs += additionalRuns;
            newStriker.balls += 1;
            if (additionalRuns === 4) newStriker.fours += 1;
            if (additionalRuns === 6) newStriker.sixes += 1;
        } else if (isNB && (isBYE || isLB)) {
            newStriker.balls += 1;
        } else if (isBYE || isLB) {
            newStriker.balls += 1;
        }

        let swap = false;
        if (additionalRuns === 1 || additionalRuns === 3 || additionalRuns === 5) {
            swap = !swap;
        }

        if (!reball) {
            const nextBalls = totalBalls + 1;
            setTotalBalls(nextBalls);
            newBowler.balls += 1;

            if (nextBalls % bpo === 0) {
                swap = !swap;
                if (!isMatchOrInningsEnding(nextBalls, nextRuns, wickets)) {
                    setIsNewBowlerModalVisible(true);
                }
            }
        }

        if (swap) {
            setStrikerStats(newNonStriker);
            setNonStrikerStats(newStriker);
        } else {
            setStrikerStats(newStriker);
            setNonStrikerStats(newStriker);
        }

        setBowlerStats(newBowler);
        updateBowlerHistory(newBowler);
    };

    const submitNewBowler = () => {
        if (!tempInputName.trim()) return;
        const name = tempInputName.trim();
        const existing = bowlersHistory.find(b => b.name === name && b.innings === currentInnings);
        if (existing) {
            setBowlerStats({ name: existing.name, runs: existing.runs, wickets: existing.wickets, balls: existing.balls, maidens: existing.maidens });
        } else {
            const newB = { name, runs: 0, wickets: 0, balls: 0, maidens: 0 };
            setBowlerStats(newB);
            updateBowlerHistory(newB);
        }
        setTempInputName('');
        setIsNewBowlerModalVisible(false);
        setCurrentOverBalls([]);
    };

    const cancelNewBowler = () => {
        setTempInputName('');
        setIsNewBowlerModalVisible(false);
        handleUndo();
    };

    const submitNewBatsman = () => {
        if (!tempInputName.trim()) return;
        if (!strikerStats.name) {
            setStrikerStats({ name: tempInputName, runs: 0, balls: 0, fours: 0, sixes: 0 });
        } else {
            setNonStrikerStats({ name: tempInputName, runs: 0, balls: 0, fours: 0, sixes: 0 });
        }
        setTempInputName('');
        setIsNewBatsmanModalVisible(false);

        if (totalBalls > 0 && totalBalls % bpo === 0 && !isMatchOrInningsEnding(totalBalls, teamRuns, wickets)) {
            setIsNewBowlerModalVisible(true);
        }
    };

    const cancelNewBatsman = () => {
        setTempInputName('');
        setIsNewBatsmanModalVisible(false);
        handleUndo();
    };

    const handleSwap = () => {
        saveStateToHistory();
        setStrikerStats(nonStrikerStats);
        setNonStrikerStats(strikerStats);
    };

    const submitRetireBatsman = () => {
        if (!tempInputName.trim()) return;
        saveStateToHistory();
        setDismissedBatters(prev => [...prev, {
            name: strikerStats.name,
            dismissal: 'retired out',
            runs: strikerStats.runs,
            balls: strikerStats.balls,
            fours: strikerStats.fours,
            sixes: strikerStats.sixes,
            innings: currentInnings,
        }]);
        setStrikerStats({ name: tempInputName, runs: 0, balls: 0, fours: 0, sixes: 0 });
        setTempInputName('');
        setIsRetireModalVisible(false);
    };

    const handlePenaltyBatting = () => {
        saveStateToHistory();
        setTeamRuns(teamRuns + 5);
        setExtras(extras + 5);
        setExtrasStats((prev: { total: number; WD: number; NB: number; BYE: number; LB: number }) => ({ ...prev, total: prev.total + 5 }));
        setIsPenaltyModalVisible(false);
    };

    const handlePenaltyBowling = () => {
        saveStateToHistory();
        if (currentInnings === 1) {
            setBowlingPenaltyRuns(bowlingPenaltyRuns + 5);
        } else if (currentInnings === 2 && targetScore !== null) {
            setTargetScore(targetScore + 5);
        }
        setIsPenaltyModalVisible(false);
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header with Back & Menu */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleNavigateHome} style={{ paddingVertical: 4, paddingRight: 12 }}>
                    <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
                </TouchableOpacity>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <Text style={styles.headerTitle}>CricV</Text>
                </View>
                <TouchableOpacity onPress={() => setIsScorecardVisible(true)} style={{ padding: 6 }}>
                    <Ionicons name="menu" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
            </View>

            {/* TOP SECTION: Scrollable Scoreboard & Player Stats */}
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 8 }} showsVerticalScrollIndicator={false}>

                {/* SECTION A: Header & Scoreboard */}
                <View style={styles.headerCard}>
                    <Text style={styles.matchTitle}>{settings?.battingTeam || 'India'} vs {settings?.bowlingTeam || 'Sri Lanka'}</Text>

                    {/* Target / Equation Banner */}
                    {currentInnings === 2 && targetScore !== null && !isMatchOver && (
                        <View style={styles.targetBanner}>
                            <Text style={styles.targetBannerText}>
                                {battingTeamName} need {Math.max(0, targetScore - teamRuns)} runs in {Math.max(0, (parseInt(settings?.overs || '20') * bpo) - totalBalls)} balls
                            </Text>
                        </View>
                    )}

                    <View style={styles.teamRow}>
                        <Text style={styles.battingTeam}>{battingTeamName}</Text>
                        <Text style={styles.inningsText}>{currentInnings === 1 ? '1st' : '2nd'} Innings</Text>
                    </View>

                    <View style={styles.scoreRow}>
                        <View style={styles.scoreWrapper}>
                            <Text style={styles.mainScore}>{teamRuns}</Text>
                            <Text style={styles.slash}>/</Text>
                            <Text style={styles.mainScore}>{wickets}</Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                            {currentInnings === 2 && targetScore && (
                                <Text style={styles.targetText}>Target: {targetScore}</Text>
                            )}
                            <Text style={styles.oversText}>
                                Overs: <Text style={styles.oversHighlight}>{overs}.{currentBalls}</Text> / {settings?.overs || 20}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.statsBar}>
                        <Text style={styles.statsText}>CRR: <Text style={styles.statsBold}>{crr}</Text></Text>
                        <Text style={styles.statsText}>
                            Extras: <Text style={styles.statsBold}>{extrasStats.total}</Text> (W:{extrasStats.WD}, NB:{extrasStats.NB}, B:{extrasStats.BYE}, LB:{extrasStats.LB})
                        </Text>
                    </View>
                </View>

                {/* SECTION B: Player Stats & Compact This Over Timeline */}
                <View style={styles.playerCard}>
                    {/* Batters Header */}
                    <View style={styles.tableHeader}>
                        <Text style={[styles.thText, { flex: 3.2, textAlign: 'left' }]}>Batsman</Text>
                        <Text style={[styles.thText, { flex: 1, textAlign: 'center' }]}>R</Text>
                        <Text style={[styles.thText, { flex: 1, textAlign: 'center' }]}>B</Text>
                        <Text style={[styles.thText, { flex: 1, textAlign: 'center' }]}>4s</Text>
                        <Text style={[styles.thText, { flex: 1, textAlign: 'center' }]}>6s</Text>
                        <Text style={[styles.thText, { flex: 1.2, textAlign: 'right' }]}>SR</Text>
                    </View>
                    {/* Striker */}
                    <View style={styles.tableRow}>
                        <Text style={[styles.tdTextBold, { flex: 3.2, textAlign: 'left' }]} numberOfLines={1}>
                            <Text style={{ color: '#3B82F6', fontWeight: '800' }}>* </Text>{strikerStats.name}
                        </Text>
                        <Text style={[styles.tdTextBold, { flex: 1, textAlign: 'center' }]}>{strikerStats.runs}</Text>
                        <Text style={[styles.tdText, { flex: 1, textAlign: 'center' }]}>{strikerStats.balls}</Text>
                        <Text style={[styles.tdText, { flex: 1, textAlign: 'center' }]}>{strikerStats.fours}</Text>
                        <Text style={[styles.tdText, { flex: 1, textAlign: 'center' }]}>{strikerStats.sixes}</Text>
                        <Text style={[styles.tdText, { flex: 1.2, textAlign: 'right' }]}>
                            {strikerStats.balls > 0 ? ((strikerStats.runs / strikerStats.balls) * 100).toFixed(1) : '0.0'}
                        </Text>
                    </View>
                    {/* Non-Striker */}
                    <View style={styles.tableRow}>
                        <Text style={[styles.tdTextNormal, { flex: 3.2, textAlign: 'left', paddingLeft: 8 }]} numberOfLines={1}>
                            {nonStrikerStats.name}
                        </Text>
                        <Text style={[styles.tdTextNormal, { flex: 1, textAlign: 'center' }]}>{nonStrikerStats.runs}</Text>
                        <Text style={[styles.tdTextNormal, { flex: 1, textAlign: 'center' }]}>{nonStrikerStats.balls}</Text>
                        <Text style={[styles.tdTextNormal, { flex: 1, textAlign: 'center' }]}>{nonStrikerStats.fours}</Text>
                        <Text style={[styles.tdTextNormal, { flex: 1, textAlign: 'center' }]}>{nonStrikerStats.sixes}</Text>
                        <Text style={[styles.tdTextNormal, { flex: 1.2, textAlign: 'right' }]}>
                            {nonStrikerStats.balls > 0 ? ((nonStrikerStats.runs / nonStrikerStats.balls) * 100).toFixed(1) : '0.0'}
                        </Text>
                    </View>

                    {/* Bowler Header */}
                    <View style={[styles.tableHeader, { marginTop: 6, borderTopWidth: 1, borderTopColor: colors.divider, paddingTop: 6 }]}>
                        <Text style={[styles.thText, { flex: 3.2, textAlign: 'left' }]}>Bowler</Text>
                        <Text style={[styles.thText, { flex: 1, textAlign: 'center' }]}>O</Text>
                        <Text style={[styles.thText, { flex: 1, textAlign: 'center' }]}>M</Text>
                        <Text style={[styles.thText, { flex: 1, textAlign: 'center' }]}>R</Text>
                        <Text style={[styles.thText, { flex: 1, textAlign: 'center' }]}>W</Text>
                        <Text style={[styles.thText, { flex: 1.2, textAlign: 'right' }]}>ER</Text>
                    </View>
                    {/* Bowler Row */}
                    <View style={[styles.tableRow, { borderBottomWidth: 0 }]}>
                        <Text style={[styles.tdTextBold, { flex: 3.2, textAlign: 'left', color: '#3B82F6' }]} numberOfLines={1}>
                            {bowlerStats.name}
                        </Text>
                        <Text style={[styles.tdText, { flex: 1, textAlign: 'center' }]}>
                            {Math.floor(bowlerStats.balls / bpo)}.{bowlerStats.balls % bpo}
                        </Text>
                        <Text style={[styles.tdText, { flex: 1, textAlign: 'center' }]}>{bowlerStats.maidens}</Text>
                        <Text style={[styles.tdText, { flex: 1, textAlign: 'center' }]}>{bowlerStats.runs}</Text>
                        <Text style={[styles.tdText, { flex: 1, textAlign: 'center' }]}>{bowlerStats.wickets}</Text>
                        <Text style={[styles.tdText, { flex: 1.2, textAlign: 'right' }]}>
                            {bowlerStats.balls > 0 ? (bowlerStats.runs / (bowlerStats.balls / bpo)).toFixed(1) : '0.0'}
                        </Text>
                    </View>

                    {/* THIS OVER TIMELINE (Compact) */}
                    <View style={styles.thisOverContainer}>
                        <Text style={styles.thisOverLabel}>THIS OVER:</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thisOverList}>
                            {currentOverBalls.length === 0 ? (
                                <Text style={styles.thisOverEmpty}>—</Text>
                            ) : (
                                currentOverBalls.map((ballStr, index) => {
                                    const { circleText, runs, extraType, isWicket } = parseBallData(ballStr);

                                    let badgeBgStyle = styles.badgeNeutral;
                                    let textStyle = styles.badgeTextNeutral;

                                    if (isWicket) {
                                        badgeBgStyle = styles.badgeWicket;
                                        textStyle = styles.badgeTextWicket;
                                    } else if (runs === 6) {
                                        badgeBgStyle = styles.badgeSix;
                                        textStyle = styles.badgeTextSix;
                                    } else if (runs === 4) {
                                        badgeBgStyle = styles.badgeFour;
                                        textStyle = styles.badgeTextFour;
                                    }

                                    return (
                                        <View key={index} style={styles.ballColumn}>
                                            <View style={[styles.ballBadge, badgeBgStyle]}>
                                                <Text style={[styles.ballBadgeText, textStyle, circleText === '•' && { fontSize: 14, lineHeight: 16 }]}>
                                                    {circleText}
                                                </Text>
                                            </View>
                                            {extraType && (
                                                <Text style={[styles.extraLabel, { color: getExtraLabelColor(extraType, colors) }]}>
                                                    {extraType}
                                                </Text>
                                            )}
                                        </View>
                                    );
                                })
                            )}
                        </ScrollView>
                    </View>
                </View>

            </ScrollView>

            {/* FIXED BOTTOM SECTION: Controls, Keypad & Action Buttons */}
            <View style={styles.bottomControlsContainer}>
                {/* Row 1: Extras Pills (WD, NB, BYE, LB) */}
                <View style={styles.extrasRow}>
                    <TouchableOpacity 
                        disabled={isInningsComplete || isMatchComplete} 
                        style={[styles.extraPill, activeExtras.WD && styles.extraPillActive, (isInningsComplete || isMatchComplete) && { opacity: 0.4 }]} 
                        onPress={() => handleExtraToggle('WD')}
                    >
                        <Text style={[styles.extraPillText, activeExtras.WD && styles.extraPillTextActive]}>WD</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        disabled={isInningsComplete || isMatchComplete} 
                        style={[styles.extraPill, activeExtras.NB && styles.extraPillActive, (isInningsComplete || isMatchComplete) && { opacity: 0.4 }]} 
                        onPress={() => handleExtraToggle('NB')}
                    >
                        <Text style={[styles.extraPillText, activeExtras.NB && styles.extraPillTextActive]}>NB</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        disabled={isInningsComplete || isMatchComplete} 
                        style={[styles.extraPill, activeExtras.BYE && styles.extraPillActive, (isInningsComplete || isMatchComplete) && { opacity: 0.4 }]} 
                        onPress={() => handleExtraToggle('BYE')}
                    >
                        <Text style={[styles.extraPillText, activeExtras.BYE && styles.extraPillTextActive]}>BYE</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        disabled={isInningsComplete || isMatchComplete} 
                        style={[styles.extraPill, activeExtras.LB && styles.extraPillActive, (isInningsComplete || isMatchComplete) && { opacity: 0.4 }]} 
                        onPress={() => handleExtraToggle('LB')}
                    >
                        <Text style={[styles.extraPillText, activeExtras.LB && styles.extraPillTextActive]}>LB</Text>
                    </TouchableOpacity>
                </View>

                {/* Row 2: Utility Row (Undo, Swap, Retire, Penalty) */}
                <View style={styles.utilityRow}>
                    <TouchableOpacity style={styles.utilityBtn} onPress={handleUndo}>
                        <Ionicons name="arrow-undo" size={14} color={colors.textSecondary} style={{ marginRight: 4 }} />
                        <Text style={styles.utilityBtnText}>Undo</Text>
                    </TouchableOpacity>

                    <TouchableOpacity disabled={isInningsComplete || isMatchComplete} style={[styles.utilityBtn, (isInningsComplete || isMatchComplete) && { opacity: 0.4 }]} onPress={handleSwap}>
                        <Ionicons name="swap-horizontal" size={14} color={colors.textSecondary} style={{ marginRight: 4 }} />
                        <Text style={styles.utilityBtnText}>Swap</Text>
                    </TouchableOpacity>

                    <TouchableOpacity disabled={isInningsComplete || isMatchComplete} style={[styles.utilityBtn, (isInningsComplete || isMatchComplete) && { opacity: 0.4 }]} onPress={() => setIsRetireModalVisible(true)}>
                        <Ionicons name="exit-outline" size={14} color={colors.textSecondary} style={{ marginRight: 4 }} />
                        <Text style={styles.utilityBtnText}>Retire</Text>
                    </TouchableOpacity>

                    <TouchableOpacity disabled={isInningsComplete || isMatchComplete} style={[styles.utilityBtn, (isInningsComplete || isMatchComplete) && { opacity: 0.4 }]} onPress={() => setIsPenaltyModalVisible(true)}>
                        <Ionicons name="flag-outline" size={14} color={colors.textSecondary} style={{ marginRight: 4 }} />
                        <Text style={styles.utilityBtnText}>Penalty</Text>
                    </TouchableOpacity>
                </View>

                {/* Row 3 & 4: Primary Run & Wicket Keypad Grid */}
                {isMatchComplete ? (
                    !showMatchResultCard && (
                        <View style={styles.matchCompleteRow}>
                            <TouchableOpacity style={styles.undoMatchBtn} onPress={handleUndo}>
                                <Text style={styles.undoMatchBtnText}>Undo</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.endMatchBtn} onPress={handleFinishMatch}>
                                <Text style={styles.endMatchBtnText}>End Match</Text>
                            </TouchableOpacity>
                        </View>
                    )
                ) : (
                    <View style={styles.keypadContainer}>
                        {/* Run Row A: 0, 1, 2, 3 */}
                        <View style={styles.keypadRow}>
                            <TouchableOpacity disabled={isInningsComplete} style={[styles.runKey, isInningsComplete && { opacity: 0.4 }]} onPress={() => handlePressRun(0)}>
                                <Text style={styles.runKeyText}>0</Text>
                            </TouchableOpacity>
                            <TouchableOpacity disabled={isInningsComplete} style={[styles.runKey, isInningsComplete && { opacity: 0.4 }]} onPress={() => handlePressRun(1)}>
                                <Text style={styles.runKeyText}>1</Text>
                            </TouchableOpacity>
                            <TouchableOpacity disabled={isInningsComplete} style={[styles.runKey, isInningsComplete && { opacity: 0.4 }]} onPress={() => handlePressRun(2)}>
                                <Text style={styles.runKeyText}>2</Text>
                            </TouchableOpacity>
                            <TouchableOpacity disabled={isInningsComplete} style={[styles.runKey, isInningsComplete && { opacity: 0.4 }]} onPress={() => handlePressRun(3)}>
                                <Text style={styles.runKeyText}>3</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Run Row B: 4, 5, 6, WICKET */}
                        <View style={styles.keypadRow}>
                            <TouchableOpacity disabled={isInningsComplete} style={[styles.runKey, styles.fourKey, isInningsComplete && { opacity: 0.4 }]} onPress={() => handlePressRun(4)}>
                                <Text style={[styles.runKeyText, styles.fourKeyText]}>4</Text>
                            </TouchableOpacity>
                            <TouchableOpacity disabled={isInningsComplete} style={[styles.runKey, isInningsComplete && { opacity: 0.4 }]} onPress={() => handlePressRun(5)}>
                                <Text style={styles.runKeyText}>5</Text>
                            </TouchableOpacity>
                            <TouchableOpacity disabled={isInningsComplete} style={[styles.runKey, styles.sixKey, isInningsComplete && { opacity: 0.4 }]} onPress={() => handlePressRun(6)}>
                                <Text style={[styles.runKeyText, styles.sixKeyText]}>6</Text>
                            </TouchableOpacity>

                            {/* WICKET BUTTON (Large, Crimson Red & Prominent) */}
                            <TouchableOpacity 
                                disabled={isInningsComplete || wickets >= 10} 
                                style={[styles.wicketKey, (isInningsComplete || wickets >= 10) && { opacity: 0.4 }]} 
                                onPress={openWicketModal}
                            >
                                <Ionicons name="close-circle" size={16} color="white" style={{ marginRight: 3 }} />
                                <Text style={styles.wicketKeyText}>OUT</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </View>

            {/* END OF OVER MODAL */}
            <Modal visible={isNewBowlerModalVisible && !isMatchOver && !isInningsComplete} transparent={true} animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>End of Over</Text>
                            <TouchableOpacity onPress={cancelNewBowler}>
                                <Ionicons name="close" size={24} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalLabel}>Enter / Select Next Bowler:</Text>
                            <TextInput 
                                style={styles.modalInput} 
                                value={tempInputName} 
                                onChangeText={setTempInputName} 
                                placeholder="Bowler Name" 
                                placeholderTextColor={colors.inputPlaceholder}
                                autoFocus
                            />

                            {/* Vertical Squad Selector */}
                            {(() => {
                                const eligibleBowlers = currentBowlingSquad.filter((p: string) => !bowlerStats?.name || !matchPlayerName(p, bowlerStats.name));
                                if (eligibleBowlers.length === 0) return null;

                                return (
                                    <View style={{ marginTop: 6, marginBottom: 14 }}>
                                        <TouchableOpacity
                                            style={{
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                backgroundColor: colors.card,
                                                paddingHorizontal: 14,
                                                paddingVertical: 12,
                                                borderRadius: 12,
                                                borderWidth: 1,
                                                borderColor: showSquadDropdown ? '#10B981' : colors.buttonBg,
                                            }}
                                            onPress={() => setShowSquadDropdown(!showSquadDropdown)}
                                        >
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                                <Ionicons name="people-outline" size={18} color="#10B981" />
                                                <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textPrimary }}>
                                                    Select from Squad ({eligibleBowlers.length} Available)
                                                </Text>
                                            </View>
                                            <Ionicons name={showSquadDropdown ? "chevron-up" : "chevron-down"} size={18} color={colors.textSecondary} />
                                        </TouchableOpacity>

                                        {showSquadDropdown && (
                                            <ScrollView
                                                style={{
                                                    maxHeight: 180,
                                                    marginTop: 8,
                                                    backgroundColor: colors.card,
                                                    borderRadius: 12,
                                                    borderWidth: 1,
                                                    borderColor: colors.cardBorder,
                                                }}
                                                nestedScrollEnabled={true}
                                                showsVerticalScrollIndicator={true}
                                            >
                                                {eligibleBowlers.map((player: string, idx: number) => {
                                                    const isSelected = tempInputName === player;
                                                    return (
                                                        <TouchableOpacity
                                                            key={idx}
                                                            style={{
                                                                flexDirection: 'row',
                                                                alignItems: 'center',
                                                                justifyContent: 'space-between',
                                                                paddingHorizontal: 14,
                                                                paddingVertical: 12,
                                                                borderBottomWidth: idx < eligibleBowlers.length - 1 ? 1 : 0,
                                                                borderBottomColor: colors.cardBorder,
                                                                backgroundColor: isSelected ? colors.accentBg : 'transparent',
                                                            }}
                                                            onPress={() => {
                                                                setTempInputName(player);
                                                                setShowSquadDropdown(false);
                                                            }}
                                                        >
                                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                                                <Ionicons name="person-circle-outline" size={20} color={isSelected ? "#10B981" : colors.textSecondary} />
                                                                <Text style={{ fontSize: 14, fontWeight: isSelected ? '800' : '600', color: isSelected ? '#10B981' : colors.textPrimary }}>
                                                                    {player}
                                                                </Text>
                                                            </View>
                                                            {isSelected && <Ionicons name="checkmark-circle" size={18} color="#10B981" />}
                                                        </TouchableOpacity>
                                                    );
                                                })}
                                            </ScrollView>
                                        )}
                                    </View>
                                );
                            })()}

                            <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                                <TouchableOpacity style={[styles.saveBtn, { flex: 1, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.cardBorder }]} onPress={cancelNewBowler}>
                                    <Text style={[styles.saveBtnText, { color: colors.textSecondary }]}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.saveBtn, { flex: 1.5, backgroundColor: '#10B981' }]} onPress={submitNewBowler}>
                                    <Text style={[styles.saveBtnText, { color: colors.background }]}>Submit</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* FALL OF WICKET MODAL */}
            <Modal visible={isNewBatsmanModalVisible && !isMatchOver && !isInningsComplete} transparent={true} animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Fall of Wicket — New Batter</Text>
                            <TouchableOpacity onPress={cancelNewBatsman}>
                                <Ionicons name="close" size={24} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalLabel}>Enter / Select Incoming Batter:</Text>
                            <TextInput 
                                style={styles.modalInput} 
                                value={tempInputName} 
                                onChangeText={setTempInputName} 
                                placeholder="Batsman Name" 
                                placeholderTextColor={colors.inputPlaceholder}
                                autoFocus
                            />

                            {/* Vertical Squad Selector */}
                            {(() => {
                                const availableSquadBatters = currentBattingSquad.filter((p: string) => {
                                    const isAtCrease = (strikerStats?.name && matchPlayerName(p, strikerStats.name)) ||
                                                       (nonStrikerStats?.name && matchPlayerName(p, nonStrikerStats.name));
                                    const isOut = dismissedBatters.some(b => b.innings === currentInnings && matchPlayerName(p, b.name));
                                    return !isAtCrease && !isOut;
                                });

                                if (availableSquadBatters.length === 0) return null;

                                return (
                                    <View style={{ marginTop: 6, marginBottom: 14 }}>
                                        <TouchableOpacity
                                            style={{
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                backgroundColor: colors.card,
                                                paddingHorizontal: 14,
                                                paddingVertical: 12,
                                                borderRadius: 12,
                                                borderWidth: 1,
                                                borderColor: showSquadDropdown ? '#10B981' : colors.buttonBg,
                                            }}
                                            onPress={() => setShowSquadDropdown(!showSquadDropdown)}
                                        >
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                                <Ionicons name="people-outline" size={18} color="#10B981" />
                                                <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textPrimary }}>
                                                    Select from Squad ({availableSquadBatters.length} Available)
                                                </Text>
                                            </View>
                                            <Ionicons name={showSquadDropdown ? "chevron-up" : "chevron-down"} size={18} color={colors.textSecondary} />
                                        </TouchableOpacity>

                                        {showSquadDropdown && (
                                            <ScrollView
                                                style={{
                                                    maxHeight: 180,
                                                    marginTop: 8,
                                                    backgroundColor: colors.card,
                                                    borderRadius: 12,
                                                    borderWidth: 1,
                                                    borderColor: colors.cardBorder,
                                                }}
                                                nestedScrollEnabled={true}
                                                showsVerticalScrollIndicator={true}
                                            >
                                                {availableSquadBatters.map((player: string, idx: number) => {
                                                    const isSelected = tempInputName === player;
                                                    return (
                                                        <TouchableOpacity
                                                            key={idx}
                                                            style={{
                                                                flexDirection: 'row',
                                                                alignItems: 'center',
                                                                justifyContent: 'space-between',
                                                                paddingHorizontal: 14,
                                                                paddingVertical: 12,
                                                                borderBottomWidth: idx < availableSquadBatters.length - 1 ? 1 : 0,
                                                                borderBottomColor: colors.cardBorder,
                                                                backgroundColor: isSelected ? colors.accentBg : 'transparent',
                                                            }}
                                                            onPress={() => {
                                                                setTempInputName(player);
                                                                setShowSquadDropdown(false);
                                                            }}
                                                        >
                                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                                                <Ionicons name="person-circle-outline" size={20} color={isSelected ? "#10B981" : colors.textSecondary} />
                                                                <Text style={{ fontSize: 14, fontWeight: isSelected ? '800' : '600', color: isSelected ? '#10B981' : colors.textPrimary }}>
                                                                    {player}
                                                                </Text>
                                                            </View>
                                                            {isSelected && <Ionicons name="checkmark-circle" size={18} color="#10B981" />}
                                                        </TouchableOpacity>
                                                    );
                                                })}
                                            </ScrollView>
                                        )}
                                    </View>
                                );
                            })()}

                            <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                                <TouchableOpacity style={[styles.saveBtn, { flex: 1, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.cardBorder }]} onPress={cancelNewBatsman}>
                                    <Text style={[styles.saveBtnText, { color: colors.textSecondary }]}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.saveBtn, { flex: 1.5, backgroundColor: '#10B981' }]} onPress={submitNewBatsman}>
                                    <Text style={[styles.saveBtnText, { color: colors.background }]}>Submit</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* REAL-WORLD WICKET DISMISSAL MODAL */}
            <Modal visible={isRealWicketModalVisible} transparent={true} animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContainer, { maxWidth: 460, width: '92%', borderRadius: 20, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.cardBorder }]}>
                        {/* Header */}
                        <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: colors.divider, backgroundColor: colors.card, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.accentRedBg, justifyContent: 'center', alignItems: 'center' }}>
                                    <Ionicons name="baseball-outline" size={18} color="#EF4444" />
                                </View>
                                <View>
                                    <Text style={{ fontSize: 16, fontWeight: '800', color: colors.textPrimary }}>Dismissal Details</Text>
                                    <Text style={{ fontSize: 11, color: colors.textMuted }}>Select Wicket Type & Fielder</Text>
                                </View>
                            </View>
                            <TouchableOpacity onPress={() => setIsRealWicketModalVisible(false)} style={{ padding: 4 }}>
                                <Ionicons name="close-circle" size={22} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        {/* Body */}
                        <ScrollView style={{ padding: 16, maxHeight: 440 }} showsVerticalScrollIndicator={false}>
                            {/* Batter Selection */}
                            <Text style={{ fontSize: 10, fontWeight: '800', color: colors.inputPlaceholder, letterSpacing: 0.8, marginBottom: 6 }}>SELECT DISMISSED BATTER</Text>
                            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
                                <TouchableOpacity
                                    style={{
                                        flex: 1,
                                        backgroundColor: wicketOutPlayer === 'striker' ? colors.accentBg : colors.card,
                                        borderWidth: 1.5,
                                        borderColor: wicketOutPlayer === 'striker' ? '#10B981' : colors.cardBorder,
                                        borderRadius: 12,
                                        padding: 10,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                    }}
                                    onPress={() => setWicketOutPlayer('striker')}
                                >
                                    <View>
                                        <Text style={{ fontSize: 10, color: colors.textMuted, fontWeight: '600' }}>STRIKER</Text>
                                        <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textPrimary }} numberOfLines={1}>{strikerStats.name || 'Striker'}</Text>
                                    </View>
                                    {wicketOutPlayer === 'striker' && <Ionicons name="checkmark-circle" size={16} color="#10B981" />}
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={{
                                        flex: 1,
                                        backgroundColor: wicketOutPlayer === 'nonStriker' ? colors.accentBg : colors.card,
                                        borderWidth: 1.5,
                                        borderColor: wicketOutPlayer === 'nonStriker' ? '#10B981' : colors.cardBorder,
                                        borderRadius: 12,
                                        padding: 10,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                    }}
                                    onPress={() => setWicketOutPlayer('nonStriker')}
                                >
                                    <View>
                                        <Text style={{ fontSize: 10, color: colors.textMuted, fontWeight: '600' }}>NON-STRIKER</Text>
                                        <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textPrimary }} numberOfLines={1}>{nonStrikerStats.name || 'Non-Striker'}</Text>
                                    </View>
                                    {wicketOutPlayer === 'nonStriker' && <Ionicons name="checkmark-circle" size={16} color="#10B981" />}
                                </TouchableOpacity>
                            </View>

                            {/* Dismissal Mode Title & Toggle */}
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                <Text style={{ fontSize: 10, fontWeight: '800', color: colors.inputPlaceholder, letterSpacing: 0.8 }}>METHOD OF DISMISSAL</Text>
                                <TouchableOpacity onPress={() => setShowAdvancedDismissals(!showAdvancedDismissals)}>
                                    <Text style={{ fontSize: 11, fontWeight: '700', color: '#3B82F6' }}>
                                        {showAdvancedDismissals ? 'Show Standard' : 'More Modes...'}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {/* Standard Dismissal Grid */}
                            {!showAdvancedDismissals ? (
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
                                    {[
                                        { type: 'Bowled', icon: 'radio-button-on-outline', desc: 'b Bowler' },
                                        { type: 'Caught', icon: 'hand-left-outline', desc: 'c Fielder' },
                                        { type: 'LBW', icon: 'shield-outline', desc: 'lbw b Bowler' },
                                        { type: 'Run Out', icon: 'walk-outline', desc: 'run out' },
                                        { type: 'Stumped', icon: 'hand-right-outline', desc: 'st Keeper' },
                                        { type: 'Hit Wicket', icon: 'close-circle-outline', desc: 'hit wicket' },
                                    ].map((item) => {
                                        const isSelected = wicketDismissalType === item.type;
                                        return (
                                            <TouchableOpacity
                                                key={item.type}
                                                style={{
                                                    width: '48%',
                                                    backgroundColor: isSelected ? colors.accentRedBg : colors.card,
                                                    borderWidth: 1.5,
                                                    borderColor: isSelected ? '#EF4444' : colors.cardBorder,
                                                    borderRadius: 12,
                                                    padding: 10,
                                                    flexDirection: 'row',
                                                    alignItems: 'center',
                                                    gap: 8,
                                                }}
                                                onPress={() => setWicketDismissalType(item.type as any)}
                                            >
                                                <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: isSelected ? '#EF4444' : colors.cardBorder, justifyContent: 'center', alignItems: 'center' }}>
                                                    <Ionicons name={item.icon as any} size={14} color={isSelected ? 'white' : colors.textSecondary} />
                                                </View>
                                                <View style={{ flex: 1 }}>
                                                    <Text style={{ fontSize: 12, fontWeight: '700', color: isSelected ? colors.textPrimary : colors.textPrimary }}>{item.type}</Text>
                                                    <Text style={{ fontSize: 9, color: isSelected ? '#FCA5A5' : colors.textMuted }}>{item.desc}</Text>
                                                </View>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            ) : (
                                /* Advanced Dismissals Grid */
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
                                    {[
                                        { type: 'Hit Ball Twice', icon: 'repeat-outline', desc: 'Hit ball twice' },
                                        { type: 'Obstructing Field', icon: 'ban-outline', desc: 'Obstructing field' },
                                        { type: 'Timed Out', icon: 'time-outline', desc: 'Timed out' },
                                        { type: 'Retired Out', icon: 'exit-outline', desc: 'Retired out' },
                                        { type: 'Handled Ball', icon: 'hand-left-outline', desc: 'Handled ball' },
                                    ].map((item) => {
                                        const isSelected = wicketDismissalType === item.type;
                                        return (
                                            <TouchableOpacity
                                                key={item.type}
                                                style={{
                                                    width: '48%',
                                                    backgroundColor: isSelected ? colors.accentRedBg : colors.card,
                                                    borderWidth: 1.5,
                                                    borderColor: isSelected ? '#EF4444' : colors.cardBorder,
                                                    borderRadius: 12,
                                                    padding: 10,
                                                    flexDirection: 'row',
                                                    alignItems: 'center',
                                                    gap: 8,
                                                }}
                                                onPress={() => setWicketDismissalType(item.type as any)}
                                            >
                                                <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: isSelected ? '#EF4444' : colors.cardBorder, justifyContent: 'center', alignItems: 'center' }}>
                                                    <Ionicons name={item.icon as any} size={14} color={isSelected ? 'white' : colors.textSecondary} />
                                                </View>
                                                <View style={{ flex: 1 }}>
                                                    <Text style={{ fontSize: 11, fontWeight: '700', color: colors.textPrimary }}>{item.type}</Text>
                                                    <Text style={{ fontSize: 9, color: isSelected ? '#FCA5A5' : colors.textMuted }}>{item.desc}</Text>
                                                </View>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            )}

                            {/* Fielder Selection */}
                            {(wicketDismissalType === 'Caught' || wicketDismissalType === 'Stumped' || wicketDismissalType === 'Run Out') && (
                                <View style={{ marginBottom: 14, backgroundColor: colors.card, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.cardBorder }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                        <Text style={{ fontSize: 10, fontWeight: '800', color: '#10B981', letterSpacing: 0.8 }}>
                                            {wicketDismissalType === 'Run Out' ? 'PRIMARY FIELDER (THROWER)' : 'FIELDER NAME'}
                                        </Text>
                                        <Text style={{ fontSize: 9, fontWeight: '600', color: colors.textMuted }}>OPTIONAL</Text>
                                    </View>
                                    <TextInput
                                        style={{ borderBottomWidth: 1.5, borderBottomColor: '#10B981', fontSize: 13, color: colors.textPrimary, paddingVertical: 4, marginBottom: 6 }}
                                        value={wicketFielderName}
                                        onChangeText={setWicketFielderName}
                                        placeholder={wicketDismissalType === 'Run Out' ? "Thrower (optional)" : "Fielder (optional)"}
                                        placeholderTextColor={colors.inputPlaceholder}
                                    />

                                    {currentBowlingSquad && currentBowlingSquad.length > 0 && (
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, marginBottom: wicketDismissalType === 'Run Out' ? 8 : 0 }}>
                                            {currentBowlingSquad.map((p: string, idx: number) => (
                                                <TouchableOpacity
                                                    key={idx}
                                                    style={[styles.modalChip, wicketFielderName === p && styles.modalChipActive]}
                                                    onPress={() => setWicketFielderName(p)}
                                                >
                                                    <Text style={[styles.modalChipText, wicketFielderName === p && styles.modalChipTextActive]}>{p}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </ScrollView>
                                    )}

                                    {/* Optional 2nd Fielder for Run Out */}
                                    {wicketDismissalType === 'Run Out' && (
                                        <View style={{ marginTop: 6, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.divider }}>
                                            <Text style={{ fontSize: 10, fontWeight: '800', color: '#3B82F6', letterSpacing: 0.8, marginBottom: 4 }}>
                                                SECOND FIELDER / KEEPER (OPTIONAL)
                                            </Text>
                                            <TextInput
                                                style={{ borderBottomWidth: 1.5, borderBottomColor: '#3B82F6', fontSize: 13, color: colors.textPrimary, paddingVertical: 4, marginBottom: 6 }}
                                                value={wicketFielder2Name}
                                                onChangeText={setWicketFielder2Name}
                                                placeholder="Keeper / Catcher name"
                                                placeholderTextColor={colors.inputPlaceholder}
                                            />

                                            {currentBowlingSquad && currentBowlingSquad.length > 0 && (
                                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
                                                    {currentBowlingSquad.map((p: string, idx: number) => (
                                                        <TouchableOpacity
                                                            key={idx}
                                                            style={[
                                                                styles.modalChip,
                                                                wicketFielder2Name === p && { backgroundColor: '#3B82F6', borderColor: '#3B82F6' }
                                                            ]}
                                                            onPress={() => setWicketFielder2Name(p)}
                                                        >
                                                            <Text style={[styles.modalChipText, wicketFielder2Name === p && { color: 'white', fontWeight: 'bold' }]}>{p}</Text>
                                                        </TouchableOpacity>
                                                    ))}
                                                </ScrollView>
                                            )}
                                        </View>
                                    )}
                                </View>
                            )}

                            {/* Runs completed (for Run Out) */}
                            {wicketDismissalType === 'Run Out' && (
                                <View style={{ marginBottom: 14, backgroundColor: colors.card, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.cardBorder }}>
                                    <Text style={{ fontSize: 10, fontWeight: '800', color: '#F59E0B', letterSpacing: 0.8, marginBottom: 6 }}>RUNS COMPLETED BEFORE RUN OUT</Text>
                                    <View style={{ flexDirection: 'row', gap: 6 }}>
                                        {[0, 1, 2, 3].map((r) => (
                                            <TouchableOpacity
                                                key={r}
                                                style={{
                                                    flex: 1,
                                                    alignItems: 'center',
                                                    paddingVertical: 8,
                                                    borderRadius: 8,
                                                    backgroundColor: wicketRunsScored === r ? '#F59E0B' : colors.card,
                                                    borderWidth: 1,
                                                    borderColor: wicketRunsScored === r ? '#F59E0B' : colors.buttonBg,
                                                }}
                                                onPress={() => setWicketRunsScored(r)}
                                            >
                                                <Text style={{ fontSize: 13, fontWeight: '800', color: wicketRunsScored === r ? colors.background : colors.textPrimary }}>{r}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                            )}

                            {/* Action Buttons */}
                            <View style={{ flexDirection: 'row', gap: 8, marginTop: 4, marginBottom: 8 }}>
                                <TouchableOpacity
                                    style={{ flex: 1, backgroundColor: colors.card, paddingVertical: 12, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: colors.cardBorder }}
                                    onPress={() => setIsRealWicketModalVisible(false)}
                                >
                                    <Text style={{ color: colors.textSecondary, fontWeight: '700', fontSize: 13 }}>Cancel</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={{
                                        flex: 1.5,
                                        backgroundColor: '#EF4444',
                                        paddingVertical: 12,
                                        borderRadius: 12,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexDirection: 'row',
                                        gap: 6,
                                    }}
                                    onPress={confirmRealWicket}
                                >
                                    <Ionicons name="checkmark-circle" size={16} color="white" />
                                    <Text style={{ color: 'white', fontWeight: '800', fontSize: 14 }}>Confirm Wicket</Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* END OF INNINGS MODAL */}
            <Modal visible={showInningsModal} transparent={true} animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>1st Innings Complete</Text>
                        </View>
                        <View style={styles.modalContent}>
                            <Text style={[styles.modalLabel, { textAlign: 'center', fontSize: 16, marginBottom: 16 }]}>
                                Target is {teamRuns + 1}
                            </Text>
                            <Text style={[styles.modalTitle, { fontSize: 28, marginBottom: 20 }]}>
                                Score: {teamRuns}/{wickets}
                            </Text>
                            <TouchableOpacity style={styles.saveBtn} onPress={startSecondInnings}>
                                <Text style={styles.saveBtnText}>Start 2nd Innings</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* RETIRE BATSMAN MODAL */}
            <Modal visible={isRetireModalVisible} transparent={true} animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Retire Batsman</Text>
                            <TouchableOpacity onPress={() => setIsRetireModalVisible(false)}>
                                <Ionicons name="close" size={24} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalLabel}>Enter New Batsman's Name:</Text>
                            <TextInput 
                                style={styles.modalInput} 
                                value={tempInputName} 
                                onChangeText={setTempInputName} 
                                placeholder="Batsman Name" 
                                placeholderTextColor={colors.inputPlaceholder}
                                autoFocus
                            />

                            {currentBattingSquad && currentBattingSquad.length > 0 && (
                                <View style={styles.modalChipContainer}>
                                    <Text style={styles.modalChipLabel}>Select from Squad:</Text>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
                                        {currentBattingSquad.map((player: string, idx: number) => (
                                            <TouchableOpacity
                                                key={idx}
                                                style={[styles.modalChip, tempInputName === player && styles.modalChipActive]}
                                                onPress={() => setTempInputName(player)}
                                            >
                                                <Text style={[styles.modalChipText, tempInputName === player && styles.modalChipTextActive]}>{player}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>
                            )}

                            <TouchableOpacity style={styles.saveBtn} onPress={submitRetireBatsman}>
                                <Text style={styles.saveBtnText}>Submit</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* PENALTY MODAL */}
            <Modal visible={isPenaltyModalVisible} transparent={true} animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Add Penalty Runs</Text>
                            <TouchableOpacity onPress={() => setIsPenaltyModalVisible(false)}>
                                <Ionicons name="close" size={24} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.modalContent}>
                            <Text style={[styles.modalLabel, { textAlign: 'center', marginBottom: 16 }]}>
                                Award penalty runs to a team (e.g. ball hitting fielding helmet).
                            </Text>
                            <TouchableOpacity style={[styles.saveBtn, { marginBottom: 8 }]} onPress={handlePenaltyBatting}>
                                <Text style={styles.saveBtnText}>+5 to Batting</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.saveBtn, { marginBottom: 8, backgroundColor: '#F59E0B' }]} onPress={handlePenaltyBowling}>
                                <Text style={styles.saveBtnText}>+5 to Bowling</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.buttonBg, borderWidth: 1, borderColor: colors.cardBorder }]} onPress={() => setIsPenaltyModalVisible(false)}>
                                <Text style={[styles.saveBtnText, { color: colors.textSecondary }]}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* MATCH OVER FLOATING CARD */}
            {showMatchResultCard && (
                <View style={styles.floatingCardContainer} pointerEvents="box-none">
                    <View style={styles.floatingCard}>
                        <View style={styles.floatingCardHeader}>
                            <Text style={styles.floatingCardTitle}>Match Over</Text>
                        </View>
                        <View style={styles.floatingCardContent}>
                            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#10B981', textAlign: 'center', marginBottom: 20 }}>
                                {matchResult}
                            </Text>
                            <TouchableOpacity style={styles.saveBtn} onPress={handleNavigateHome}>
                                <Text style={styles.saveBtnText}>New Match</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}

            {/* MATCH CENTRE OVERLAY */}
            {isScorecardVisible && (
                <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 50, elevation: 5, backgroundColor: colors.background }}>
                    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
                        {/* Header */}
                        <View style={{ backgroundColor: colors.background, paddingTop: 16, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: colors.divider }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <TouchableOpacity onPress={() => setIsScorecardVisible(false)} style={{ paddingVertical: 4, paddingRight: 14 }}>
                                        <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
                                    </TouchableOpacity>
                                    <View>
                                        <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: '800' }}>Match Centre</Text>
                                        <Text style={{ color: colors.textMuted, fontSize: 11 }}>{battingTeamName} vs {bowlingTeamName}</Text>
                                    </View>
                                </View>
                            </View>

                            {/* Scoreboard / Overs Tabs */}
                            <View style={{ flexDirection: 'row' }}>
                                <TouchableOpacity
                                    style={{ flex: 1, paddingVertical: 10, alignItems: 'center', borderBottomWidth: activeScorecardTab === 'Scoreboard' ? 2 : 0, borderBottomColor: '#10B981' }}
                                    onPress={() => setActiveScorecardTab('Scoreboard')}
                                >
                                    <Text style={{ color: activeScorecardTab === 'Scoreboard' ? '#10B981' : colors.textMuted, fontWeight: activeScorecardTab === 'Scoreboard' ? '700' : '500', fontSize: 13 }}>
                                        Scoreboard
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={{ flex: 1, paddingVertical: 10, alignItems: 'center', borderBottomWidth: activeScorecardTab === 'Overs' ? 2 : 0, borderBottomColor: '#10B981' }}
                                    onPress={() => setActiveScorecardTab('Overs')}
                                >
                                    <Text style={{ color: activeScorecardTab === 'Overs' ? '#10B981' : colors.textMuted, fontWeight: activeScorecardTab === 'Overs' ? '700' : '500', fontSize: 13 }}>
                                        Over by over
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Tab Content */}
                        <View style={{ flex: 1 }}>
                            {activeScorecardTab === 'Scoreboard' ? (
                                <ScoreboardView
                                    matchResultText={isMatchOver ? matchResult : (currentInnings === 2 && targetScore ? `${battingTeamName} need ${Math.max(0, targetScore - teamRuns)} runs in ${Math.max(0, (parseInt(settings?.overs || '20') * bpo) - totalBalls)} balls` : undefined)}
                                    inningsList={(() => {
                                        const liveBatters: Batter[] = [];
                                        
                                        const currentDismissed = dismissedBatters.filter(b => b.innings === currentInnings);
                                        currentDismissed.forEach((dis, idx) => {
                                            liveBatters.push({
                                                id: `dis-${idx}`,
                                                name: dis.name,
                                                dismissal: dis.dismissal,
                                                runs: dis.runs,
                                                balls: dis.balls,
                                                fours: dis.fours,
                                                sixes: dis.sixes,
                                                strikeRate: dis.balls > 0 ? ((dis.runs / dis.balls) * 100).toFixed(2) : '0.00',
                                            });
                                        });

                                        if (strikerStats?.name && !liveBatters.some(b => matchPlayerName(b.name, strikerStats.name))) {
                                            liveBatters.push({
                                                id: 'striker-active',
                                                name: strikerStats.name,
                                                dismissal: 'not out *',
                                                runs: strikerStats.runs,
                                                balls: strikerStats.balls,
                                                fours: strikerStats.fours,
                                                sixes: strikerStats.sixes,
                                                strikeRate: strikerStats.balls > 0 ? ((strikerStats.runs / strikerStats.balls) * 100).toFixed(2) : '0.00',
                                                isNotOut: true,
                                            });
                                        }

                                        if (nonStrikerStats?.name && !liveBatters.some(b => matchPlayerName(b.name, nonStrikerStats.name))) {
                                            liveBatters.push({
                                                id: 'nonstriker-active',
                                                name: nonStrikerStats.name,
                                                dismissal: 'not out *',
                                                runs: nonStrikerStats.runs,
                                                balls: nonStrikerStats.balls,
                                                fours: nonStrikerStats.fours,
                                                sixes: nonStrikerStats.sixes,
                                                strikeRate: nonStrikerStats.balls > 0 ? ((nonStrikerStats.runs / nonStrikerStats.balls) * 100).toFixed(2) : '0.00',
                                                isNotOut: true,
                                            });
                                        }

                                        const squadList = (currentBattingSquad && currentBattingSquad.length > 0)
                                            ? currentBattingSquad
                                            : [];

                                        squadList.forEach((playerName: string, idx: number) => {
                                            const alreadyBatted = liveBatters.some(b => matchPlayerName(b.name, playerName));
                                            if (!alreadyBatted) {
                                                liveBatters.push({
                                                    id: `dnb-${idx}`,
                                                    name: playerName,
                                                    dismissal: 'did not bat',
                                                    runs: 0,
                                                    balls: 0,
                                                    fours: 0,
                                                    sixes: 0,
                                                    strikeRate: '0.00',
                                                    didNotBat: true,
                                                });
                                            }
                                        });

                                        const liveBowlers: Bowler[] = [];
                                        bowlersHistory.filter(b => b.innings === currentInnings).forEach((b, idx) => {
                                            const isActive = b.name === bowlerStats.name;
                                            const statsToUse = isActive ? bowlerStats : b;
                                            liveBowlers.push({
                                                id: `bw-${idx}`,
                                                name: statsToUse.name,
                                                overs: `${Math.floor(statsToUse.balls / bpo)}.${statsToUse.balls % bpo}`,
                                                maidens: statsToUse.maidens,
                                                runs: statsToUse.runs,
                                                wickets: statsToUse.wickets,
                                                economy: statsToUse.balls > 0 ? (statsToUse.runs / (statsToUse.balls / bpo)).toFixed(2) : '0.00',
                                            });
                                        });

                                        if (bowlerStats?.name && !liveBowlers.some(b => b.name === bowlerStats.name)) {
                                            liveBowlers.push({
                                                id: 'active-bowler',
                                                name: bowlerStats.name,
                                                overs: `${Math.floor(bowlerStats.balls / bpo)}.${bowlerStats.balls % bpo}`,
                                                maidens: bowlerStats.maidens,
                                                runs: bowlerStats.runs,
                                                wickets: bowlerStats.wickets,
                                                economy: bowlerStats.balls > 0 ? (bowlerStats.runs / (bowlerStats.balls / bpo)).toFixed(2) : '0.00',
                                            });
                                        }

                                        const liveFOW: FallOfWicket[] = fowList.filter(f => f.innings === currentInnings);

                                        const currentInningsCard = {
                                            id: `inn-${currentInnings}`,
                                            teamName: currentInnings === 2 ? (settings?.bowlingTeam || 'Visitor Team') : (settings?.battingTeam || 'Host Team'),
                                            totalScore: `${teamRuns}-${wickets}`,
                                            overs: `(${Math.floor(totalBalls / bpo)}.${totalBalls % bpo})`,
                                            extras: `${extras} (b ${extrasStats.BYE || 0}, lb ${extrasStats.LB || 0}, w ${extrasStats.WD || 0}, nb ${extrasStats.NB || 0})`,
                                            batters: liveBatters,
                                            bowlers: liveBowlers,
                                            fow: liveFOW,
                                        };

                                        return firstInningsScorecard ? [firstInningsScorecard, currentInningsCard] : [currentInningsCard];
                                    })()}
                                />
                            ) : (
                                <ScrollView style={{ flex: 1, backgroundColor: colors.background }} showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 12 }}>
                                    {(currentInnings > 1 || allOversHistory.some((o: any) => o.innings === 2)) && (
                                        <View style={{ flexDirection: 'row', backgroundColor: colors.card, marginBottom: 12, borderRadius: 10, padding: 3, borderWidth: 1, borderColor: colors.cardBorder }}>
                                            <TouchableOpacity
                                                style={{ flex: 1, paddingVertical: 6, alignItems: 'center', backgroundColor: selectedOversInnings === 1 ? '#10B981' : 'transparent', borderRadius: 8 }}
                                                onPress={() => setSelectedOversInnings(1)}
                                            >
                                                <Text style={{ color: selectedOversInnings === 1 ? colors.background : colors.textMuted, fontWeight: '700', fontSize: 12 }}>
                                                    1st Innings
                                                </Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={{ flex: 1, paddingVertical: 6, alignItems: 'center', backgroundColor: selectedOversInnings === 2 ? '#10B981' : 'transparent', borderRadius: 8 }}
                                                onPress={() => setSelectedOversInnings(2)}
                                            >
                                                <Text style={{ color: selectedOversInnings === 2 ? colors.background : colors.textMuted, fontWeight: '700', fontSize: 12 }}>
                                                    2nd Innings
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}

                                    {(() => {
                                        const currentInningsOvers = allOversHistory.filter((o: any) => o.innings === (currentInnings > 1 || allOversHistory.some((o: any) => o.innings === 2) ? selectedOversInnings : 1));
                                        const isAllExpanded = currentInningsOvers.length > 0 && currentInningsOvers.every((o: any) => !!expandedOvers[`${o.innings}-${o.overNumber}`]);

                                        if (currentInningsOvers.length === 0) {
                                            return (
                                                <View style={{ padding: 40, alignItems: 'center' }}>
                                                    <Ionicons name="baseball-outline" size={40} color={colors.inputPlaceholder} style={{ marginBottom: 10 }} />
                                                    <Text style={{ fontSize: 14, color: colors.textMuted, fontWeight: '600' }}>No overs bowled yet in this innings</Text>
                                                </View>
                                            );
                                        }

                                        return (
                                            <>
                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, paddingHorizontal: 2 }}>
                                                    <Text style={{ fontSize: 11, fontWeight: '700', color: colors.textMuted, letterSpacing: 0.5 }}>
                                                        {currentInningsOvers.length} OVERS BOWLED
                                                    </Text>
                                                    <TouchableOpacity
                                                        onPress={() => toggleExpandAllOvers(currentInningsOvers)}
                                                        style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.card, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: colors.cardBorder }}
                                                    >
                                                        <Text style={{ fontSize: 11, fontWeight: '700', color: '#10B981' }}>
                                                            {isAllExpanded ? 'Collapse All' : 'Expand All'}
                                                        </Text>
                                                        <Ionicons name={isAllExpanded ? "chevron-up" : "chevron-down"} size={12} color="#10B981" />
                                                    </TouchableOpacity>
                                                </View>

                                                {currentInningsOvers.map((over: any, oIdx: number) => {
                                                    const overKey = `${over.innings}-${over.overNumber}`;
                                                    const isExpanded = !!expandedOvers[overKey];

                                                    return (
                                                        <View key={oIdx} style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: isExpanded ? 'rgba(16, 185, 129, 0.3)' : colors.cardBorder, borderRadius: 12, padding: 12, marginBottom: 10 }}>
                                                            <TouchableOpacity
                                                                onPress={() => toggleOverExpand(overKey)}
                                                                activeOpacity={0.7}
                                                                style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}
                                                            >
                                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                                                    <View style={{ backgroundColor: '#10B981', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                                                                        <Text style={{ fontSize: 11, fontWeight: '800', color: colors.background }}>Over {over.overNumber}</Text>
                                                                    </View>
                                                                    <Text style={{ fontSize: 12, fontWeight: '600', color: colors.textSecondary }}>{over.bowlerName || 'Bowler'}</Text>
                                                                </View>
                                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                                                    <Text style={{ fontSize: 13, fontWeight: '800', color: '#10B981' }}>{over.totalRuns} Runs</Text>
                                                                    <Ionicons name={isExpanded ? "chevron-up-circle" : "chevron-down-circle-outline"} size={18} color={isExpanded ? "#10B981" : colors.textMuted} />
                                                                </View>
                                                            </TouchableOpacity>

                                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: isExpanded ? 8 : 0, flexWrap: 'wrap' }}>
                                                                {over.balls.map((ball: any, bIdx: number) => {
                                                                    const displayCircle = ball.circleText || '•';
                                                                    const sub = ball.subText;

                                                                    let badgeBgStyle = styles.badgeNeutral;
                                                                    let textStyle = styles.badgeTextNeutral;

                                                                    if (ball.isWicket) {
                                                                        badgeBgStyle = styles.badgeWicket;
                                                                        textStyle = styles.badgeTextWicket;
                                                                    } else if (ball.runs === 6) {
                                                                        badgeBgStyle = styles.badgeSix;
                                                                        textStyle = styles.badgeTextSix;
                                                                    } else if (ball.runs === 4) {
                                                                        badgeBgStyle = styles.badgeFour;
                                                                        textStyle = styles.badgeTextFour;
                                                                    }

                                                                    return (
                                                                        <View key={bIdx} style={styles.ballColumn}>
                                                                            <View style={[styles.ballBadge, badgeBgStyle]}>
                                                                                <Text style={[styles.ballBadgeText, textStyle, displayCircle === '•' && { fontSize: 14, lineHeight: 16 }]}>
                                                                                    {displayCircle}
                                                                                </Text>
                                                                            </View>
                                                                            {sub ? (
                                                                                <Text style={[styles.extraLabel, { color: getExtraLabelColor(sub, colors) }]}>
                                                                                    {sub}
                                                                                </Text>
                                                                            ) : null}
                                                                        </View>
                                                                    );
                                                                })}
                                                            </View>

                                                            {isExpanded && (
                                                                <View style={{ backgroundColor: colors.background, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, marginTop: 4 }}>
                                                                    {over.balls.map((ball: any, bIdx: number) => {
                                                                        const bBowler = ball.bowlerName || over.bowlerName || bowlerStats?.name || 'Bowler';
                                                                        const bStriker = ball.strikerName || strikerStats?.name || 'Striker';
                                                                        const bowlerShort = bBowler.split(' ')[0];
                                                                        const strikerShort = bStriker.split(' ')[0];
                                                                        const eventText = ball.isWicket ? 'Wicket' : (ball.circleText === '0' ? 'dot ball' : `${ball.circleText} runs`);

                                                                        return (
                                                                            <View key={bIdx} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 5, borderBottomWidth: bIdx < over.balls.length - 1 ? 1 : 0, borderBottomColor: colors.divider }}>
                                                                                <Text style={{ fontSize: 12, color: colors.textPrimary, fontWeight: '600' }}>
                                                                                    {bowlerShort} to {strikerShort}
                                                                                </Text>
                                                                                <Text style={{ fontSize: 11, fontWeight: '700', color: ball.isWicket ? '#EF4444' : (ball.circleText === '6' || ball.circleText === '4' ? '#10B981' : colors.textSecondary) }}>
                                                                                    {ball.circleText} ({eventText})
                                                                                </Text>
                                                                            </View>
                                                                        );
                                                                    })}
                                                                </View>
                                                            )}
                                                        </View>
                                                    );
                                                })}
                                            </>
                                        );
                                    })()}
                                </ScrollView>
                            )}
                        </View>
                    </SafeAreaView>
                </View>
            )}

        </SafeAreaView>
    );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },

    // Header
    header: { backgroundColor: colors.card, paddingHorizontal: 14, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.cardBorder },
    headerTitle: { color: colors.textPrimary, fontSize: 18, fontWeight: '800', letterSpacing: 0.5 },

    // Top Scoreboard Card
    headerCard: { backgroundColor: colors.card, paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderColor: colors.cardBorder },
    matchTitle: { textAlign: 'center', fontWeight: '600', color: colors.textMuted, fontSize: 10, marginBottom: 4, letterSpacing: 0.5, textTransform: 'uppercase' },
    targetBanner: { backgroundColor: colors.accentBg, borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.3)', borderRadius: 8, paddingVertical: 5, paddingHorizontal: 10, marginBottom: 6, alignItems: 'center' },
    targetBannerText: { fontSize: 12, fontWeight: '800', color: '#10B981', letterSpacing: 0.2 },
    teamRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    battingTeam: { fontWeight: '800', color: colors.textPrimary, fontSize: 15 },
    inningsText: { fontSize: 10, color: '#10B981', fontWeight: '700', backgroundColor: colors.accentBg, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, overflow: 'hidden' },
    scoreRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 4 },
    scoreWrapper: { flexDirection: 'row', alignItems: 'baseline' },
    mainScore: { fontSize: 32, fontWeight: '900', color: colors.textPrimary, letterSpacing: -0.5 },
    slash: { fontSize: 20, color: colors.inputPlaceholder, marginHorizontal: 2 },
    targetText: { fontSize: 12, fontWeight: 'bold', color: '#3B82F6', marginBottom: 2 },
    oversText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
    oversHighlight: { color: '#10B981', fontWeight: '800' },
    statsBar: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: colors.background, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, marginTop: 8, borderWidth: 1, borderColor: colors.cardBorder },
    statsText: { fontSize: 11, color: colors.textSecondary },
    statsBold: { color: colors.textPrimary, fontWeight: '700' },

    // Compact Player Stats Card
    playerCard: { backgroundColor: colors.card, marginHorizontal: 8, marginTop: 8, borderRadius: 12, padding: 10, borderWidth: 1, borderColor: colors.cardBorder },
    tableHeader: { flexDirection: 'row', paddingVertical: 4, paddingHorizontal: 2 },
    thText: { fontSize: 9, color: colors.inputPlaceholder, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase' },
    tableRow: { flexDirection: 'row', paddingVertical: 5, paddingHorizontal: 2, borderBottomWidth: 1, borderBottomColor: colors.divider },
    tdTextBold: { fontSize: 12, fontWeight: '700', color: colors.textPrimary },
    tdTextNormal: { fontSize: 12, color: colors.textSecondary },
    tdText: { fontSize: 12, color: colors.textSecondary },

    // Compact THIS OVER Timeline
    thisOverContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 8,
        marginTop: 6,
        borderTopWidth: 1,
        borderTopColor: colors.divider,
    },
    thisOverLabel: {
        fontSize: 9,
        fontWeight: '800',
        color: colors.inputPlaceholder,
        letterSpacing: 0.8,
        marginRight: 8,
    },
    thisOverList: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    ballColumn: {
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 26,
    },
    thisOverEmpty: {
        fontSize: 12,
        color: colors.inputPlaceholder,
        fontWeight: '500',
    },
    ballBadge: {
        width: 26,
        height: 26,
        borderRadius: 13,
        alignItems: 'center',
        justifyContent: 'center',
    },
    ballBadgeText: {
        fontSize: 11,
        fontWeight: 'bold',
    },
    extraLabel: {
        fontSize: 8,
        fontWeight: '800',
        marginTop: 2,
        textAlign: 'center',
    },
    badgeNeutral: {
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.cardBorder,
    },
    badgeTextNeutral: {
        color: colors.textSecondary,
    },
    badgeFour: {
        backgroundColor: 'rgba(59,130,246,0.18)',
        borderWidth: 1,
        borderColor: 'rgba(59,130,246,0.4)',
    },
    badgeTextFour: {
        color: '#3B82F6',
    },
    badgeSix: {
        backgroundColor: '#10B981',
        borderWidth: 1,
        borderColor: '#059669',
    },
    badgeTextSix: {
        color: '#FFFFFF',
    },
    badgeWicket: {
        backgroundColor: '#EF4444',
        borderWidth: 1,
        borderColor: '#DC2626',
    },
    badgeTextWicket: {
        color: '#FFFFFF',
    },

    // FIXED BOTTOM SECTION CONTROLS
    bottomControlsContainer: {
        backgroundColor: colors.card,
        borderTopWidth: 1,
        borderTopColor: colors.cardBorder,
        paddingHorizontal: 10,
        paddingTop: 8,
        paddingBottom: 12,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
    },

    // 1. Extras Row
    extrasRow: {
        flexDirection: 'row',
        gap: 6,
        marginBottom: 6,
    },
    extraPill: {
        flex: 1,
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.cardBorder,
        paddingVertical: 7,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    extraPillActive: {
        backgroundColor: 'rgba(59,130,246,0.18)',
        borderColor: '#3B82F6',
    },
    extraPillText: {
        color: colors.textSecondary,
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    extraPillTextActive: {
        color: '#3B82F6',
        fontWeight: '800',
    },

    // 2. Utility Row
    utilityRow: {
        flexDirection: 'row',
        gap: 6,
        marginBottom: 8,
    },
    utilityBtn: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.cardBorder,
        paddingVertical: 7,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    utilityBtnText: {
        color: colors.textSecondary,
        fontSize: 11,
        fontWeight: '600',
    },

    // 3. Run Keypad & Wicket Grid
    keypadContainer: {
        gap: 6,
    },
    keypadRow: {
        flexDirection: 'row',
        gap: 6,
    },
    runKey: {
        flex: 1,
        height: 44,
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.cardBorder,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 1,
    },
    runKeyText: {
        color: colors.textPrimary,
        fontSize: 18,
        fontWeight: '800',
    },
    fourKey: {
        backgroundColor: '#2563EB',
        borderColor: '#1D4ED8',
    },
    fourKeyText: {
        color: '#FFFFFF',
    },
    sixKey: {
        backgroundColor: '#10B981',
        borderColor: '#059669',
    },
    sixKeyText: {
        color: '#FFFFFF',
    },
    wicketKey: {
        flex: 1,
        height: 44,
        backgroundColor: '#EF4444',
        borderColor: '#DC2626',
        borderWidth: 1,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 3,
        shadowColor: '#EF4444',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    wicketKeyText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '900',
        letterSpacing: 0.5,
    },

    matchCompleteRow: {
        flexDirection: 'row',
        gap: 10,
        paddingVertical: 4,
    },
    undoMatchBtn: {
        flex: 1,
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.cardBorder,
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    undoMatchBtnText: {
        color: colors.textSecondary,
        fontSize: 14,
        fontWeight: '700',
    },
    endMatchBtn: {
        flex: 2,
        backgroundColor: '#EF4444',
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 3,
    },
    endMatchBtnText: {
        color: 'white',
        fontSize: 15,
        fontWeight: '800',
    },

    // Modals
    modalOverlay: { flex: 1, backgroundColor: colors.modalOverlay, justifyContent: 'center', alignItems: 'center' },
    modalContainer: { backgroundColor: colors.card, width: '85%', maxWidth: 360, borderRadius: 16, overflow: 'hidden', elevation: 5, borderWidth: 1, borderColor: colors.cardBorder },
    modalHeader: { padding: 14, borderBottomWidth: 1, borderBottomColor: colors.divider, backgroundColor: colors.card },
    modalTitle: { fontSize: 16, fontWeight: '800', color: colors.textPrimary, textAlign: 'center' },
    modalContent: { padding: 16 },
    modalLabel: { fontSize: 13, color: colors.textSecondary, fontWeight: '500', marginBottom: 8 },
    modalInput: { borderBottomWidth: 2, borderBottomColor: '#10B981', fontSize: 15, color: colors.textPrimary, paddingVertical: 6, marginBottom: 16 },
    saveBtn: { backgroundColor: '#10B981', padding: 12, borderRadius: 10, alignItems: 'center' },
    saveBtnText: { color: colors.background, fontWeight: '800', fontSize: 15 },

    modalChipContainer: { marginTop: 4, marginBottom: 14 },
    modalChipLabel: { fontSize: 10, color: colors.inputPlaceholder, marginBottom: 4, fontWeight: '700', letterSpacing: 0.8 },
    modalChip: { backgroundColor: colors.card, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 14, borderWidth: 1, borderColor: colors.cardBorder },
    modalChipActive: { backgroundColor: '#10B981', borderColor: '#10B981' },
    modalChipText: { fontSize: 11, color: colors.textSecondary, fontWeight: '500' },
    modalChipTextActive: { color: colors.background, fontWeight: 'bold' },

    // Floating Card
    floatingCardContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    floatingCard: {
        backgroundColor: colors.card,
        width: '90%',
        maxWidth: 360,
        borderRadius: 18,
        overflow: 'hidden',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        borderWidth: 1,
        borderColor: colors.cardBorder,
    },
    floatingCardHeader: {
        paddingVertical: 14,
        paddingHorizontal: 18,
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
        backgroundColor: colors.card,
        alignItems: 'center',
    },
    floatingCardTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: colors.textPrimary,
        textAlign: 'center',
    },
    floatingCardContent: {
        padding: 18,
    },
});
