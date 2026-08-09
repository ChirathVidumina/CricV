import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, ThemeColors } from '../src/ThemeContext';

export interface Batter {
  id: string;
  name: string;
  dismissal: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  strikeRate: string;
  isNotOut?: boolean;
  didNotBat?: boolean;
}

export interface Bowler {
  id: string;
  name: string;
  overs: string;
  maidens: number;
  runs: number;
  wickets: number;
  economy: string;
}

export interface FallOfWicket {
  id: string;
  wicketNumber: number;
  player: string;
  score: string;
  overs: string;
}

export interface InningsScorecard {
  id: string;
  teamName: string;
  totalScore: string;
  overs: string;
  extras: string;
  batters: Batter[];
  bowlers: Bowler[];
  fow: FallOfWicket[];
}

export interface ScoreboardViewProps {
  matchResultText?: string;
  inningsList?: InningsScorecard[];
  teamName?: string;
  totalScore?: string;
  overs?: string;
  extras?: string;
  battersData?: Batter[];
  bowlersData?: Bowler[];
  fowData?: FallOfWicket[];
}

const DEFAULT_INNINGS_1: InningsScorecard = {
  id: 'inn-1',
  teamName: 'India',
  totalScore: '183-9',
  overs: '(20.0)',
  extras: '12 (b 2, lb 3, w 5, nb 2)',
  batters: [
    { id: 'b1', name: 'Rohit Sharma (c)', dismissal: 'c Kusal b Theekshana', runs: 22, balls: 15, fours: 3, sixes: 1, strikeRate: '146.67' },
    { id: 'b2', name: 'Shubman Gill', dismissal: 'c Mendis b Asalanka', runs: 12, balls: 10, fours: 1, sixes: 0, strikeRate: '120.00' },
    { id: 'b3', name: 'KL Rahul (wk)', dismissal: 'c Charith b Madushanka', runs: 0, balls: 3, fours: 0, sixes: 0, strikeRate: '0.00' },
    { id: 'b4', name: 'Virat Kohli', dismissal: 'c Pathum b Wellalage', runs: 32, balls: 24, fours: 4, sixes: 0, strikeRate: '133.33' },
    { id: 'b5', name: 'Suryakumar Yadav', dismissal: 'c & b Asalanka', runs: 15, balls: 10, fours: 2, sixes: 0, strikeRate: '150.00' },
    { id: 'b6', name: 'Hardik Pandya', dismissal: 'b Hasaranga', runs: 40, balls: 22, fours: 2, sixes: 3, strikeRate: '181.82' },
    { id: 'b7', name: 'Jasprit Bumrah', dismissal: 'c Shanaka b Theekshana', runs: 4, balls: 5, fours: 0, sixes: 0, strikeRate: '80.00' },
    { id: 'b8', name: 'Mohammed Siraj', dismissal: 'b Madushanka', runs: 1, balls: 2, fours: 0, sixes: 0, strikeRate: '50.00' },
    { id: 'b9', name: 'Kuldeep Yadav', dismissal: 'run out (Mendis / Theekshana)', runs: 0, balls: 1, fours: 0, sixes: 0, strikeRate: '0.00' },
    { id: 'b10', name: 'Ravindra Jadeja', dismissal: 'not out *', runs: 28, balls: 18, fours: 2, sixes: 1, strikeRate: '155.56', isNotOut: true },
    { id: 'b11', name: 'Axar Patel', dismissal: 'not out *', runs: 0, balls: 0, fours: 0, sixes: 0, strikeRate: '0.00', isNotOut: true },
  ],
  bowlers: [
    { id: 'bw1', name: 'Maheesh Theekshana', overs: '4.0', maidens: 0, runs: 28, wickets: 2, economy: '7.00' },
    { id: 'bw2', name: 'Dunith Wellalage', overs: '4.0', maidens: 0, runs: 32, wickets: 1, economy: '8.00' },
    { id: 'bw3', name: 'Charith Asalanka', overs: '4.0', maidens: 0, runs: 35, wickets: 1, economy: '8.75' },
    { id: 'bw4', name: 'Dilshan Madushanka', overs: '4.0', maidens: 0, runs: 40, wickets: 1, economy: '10.00' },
    { id: 'bw5', name: 'Wanindu Hasaranga', overs: '4.0', maidens: 0, runs: 36, wickets: 1, economy: '9.00' },
  ],
  fow: [
    { id: 'fw1', wicketNumber: 1, player: 'Rohit Sharma', score: '35/1', overs: '3.2' },
    { id: 'fw2', wicketNumber: 2, player: 'Shubman Gill', score: '58/2', overs: '6.1' },
    { id: 'fw3', wicketNumber: 3, player: 'KL Rahul', score: '59/3', overs: '6.5' },
    { id: 'fw4', wicketNumber: 4, player: 'Virat Kohli', score: '94/4', overs: '11.4' },
    { id: 'fw5', wicketNumber: 5, player: 'Hardik Pandya', score: '156/5', overs: '17.3' },
  ],
};

const DEFAULT_INNINGS_2: InningsScorecard = {
  id: 'inn-2',
  teamName: 'Sri Lanka',
  totalScore: '172-7',
  overs: '(19.0)',
  extras: '10 (b 1, lb 2, w 5, nb 2)',
  batters: [
    { id: 'sb1', name: 'Pathum Nissanka', dismissal: 'c Pant b Bumrah', runs: 28, balls: 20, fours: 4, sixes: 0, strikeRate: '140.00' },
    { id: 'sb2', name: 'Kusal Mendis (wk)', dismissal: 'lbw b Siraj', runs: 18, balls: 14, fours: 2, sixes: 1, strikeRate: '128.57' },
    { id: 'sb3', name: 'Kusal Perera (wk)', dismissal: 'not out *', runs: 45, balls: 30, fours: 5, sixes: 1, strikeRate: '150.00', isNotOut: true },
    { id: 'sb4', name: 'Charith Asalanka (c)', dismissal: 'c & b Kuldeep', runs: 32, balls: 22, fours: 3, sixes: 1, strikeRate: '145.45' },
    { id: 'sb5', name: 'Kamindu Mendis', dismissal: 'b Axar Patel', runs: 12, balls: 10, fours: 1, sixes: 0, strikeRate: '120.00' },
    { id: 'sb6', name: 'Dasun Shanaka', dismissal: 'run out (Hardik / Pant)', runs: 15, balls: 11, fours: 1, sixes: 1, strikeRate: '136.36' },
    { id: 'sb7', name: 'Wanindu Hasaranga', dismissal: 'b Bumrah', runs: 8, balls: 7, fours: 1, sixes: 0, strikeRate: '114.29' },
    { id: 'sb8', name: 'Avishka Fernando', dismissal: 'c Rahul b Hardik', runs: 2, balls: 4, fours: 0, sixes: 0, strikeRate: '50.00' },
    { id: 'sb9', name: 'Maheesh Theekshana', dismissal: 'not out *', runs: 14, balls: 6, fours: 1, sixes: 1, strikeRate: '233.33', isNotOut: true },
    { id: 'sb10', name: 'Dunith Wellalage', dismissal: 'did not bat', runs: 0, balls: 0, fours: 0, sixes: 0, strikeRate: '0.00', didNotBat: true },
    { id: 'sb11', name: 'Matheesha Pathirana', dismissal: 'did not bat', runs: 0, balls: 0, fours: 0, sixes: 0, strikeRate: '0.00', didNotBat: true },
  ],
  bowlers: [
    { id: 'ibw1', name: 'Jasprit Bumrah', overs: '4.0', maidens: 0, runs: 32, wickets: 1, economy: '8.00' },
    { id: 'ibw2', name: 'Mohammed Siraj', overs: '4.0', maidens: 0, runs: 38, wickets: 1, economy: '9.50' },
    { id: 'ibw3', name: 'Kuldeep Yadav', overs: '4.0', maidens: 0, runs: 35, wickets: 1, economy: '8.75' },
    { id: 'ibw4', name: 'Axar Patel', overs: '4.0', maidens: 0, runs: 36, wickets: 1, economy: '9.00' },
    { id: 'ibw5', name: 'Washington Sundar', overs: '3.0', maidens: 0, runs: 40, wickets: 0, economy: '13.33' },
  ],
  fow: [
    { id: 'ifw1', wicketNumber: 1, player: 'Pathum Nissanka', score: '89/1', overs: '9.4' },
    { id: 'ifw2', wicketNumber: 2, player: 'Kusal Mendis', score: '135/2', overs: '13.2' },
    { id: 'ifw3', wicketNumber: 3, player: 'Avishka Fernando', score: '150/3', overs: '15.1' },
    { id: 'ifw4', wicketNumber: 4, player: 'Charith Asalanka', score: '168/4', overs: '17.3' },
  ],
};

export default function ScoreboardView({
  matchResultText,
  inningsList,
  teamName,
  totalScore,
  overs,
  extras,
  battersData,
  bowlersData,
  fowData,
}: ScoreboardViewProps) {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  // If single-innings backwards compatibility props or live match props are passed, map them into inningsList
  const effectiveInningsList: InningsScorecard[] = inningsList && inningsList.length > 0
    ? inningsList
    : [
        {
          id: 'inn-live-1',
          teamName: teamName || '1st Innings',
          totalScore: totalScore || '0-0',
          overs: overs || '(0.0)',
          extras: extras || '0',
          batters: battersData || [],
          bowlers: bowlersData || [],
          fow: fowData || [],
        }
      ];

  // Track expanded state for each innings accordion card
  const [expandedInnings, setExpandedInnings] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    effectiveInningsList.forEach((inn, idx) => {
      initial[inn.id] = true; // Default all expanded or 1st expanded
    });
    return initial;
  });

  const toggleInnings = (id: string) => {
    setExpandedInnings(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Match Result Banner */}
        {matchResultText ? (
          <View style={styles.resultBanner}>
            <Text style={styles.resultText}>{matchResultText}</Text>
          </View>
        ) : null}

        {/* Innings Accordion Cards */}
        {effectiveInningsList.map((innings) => {
          const isExpanded = expandedInnings[innings.id] ?? true;

          return (
            <View key={innings.id} style={styles.inningsAccordionCard}>
              {/* Accordion Header Bar */}
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.accordionHeader}
                onPress={() => toggleInnings(innings.id)}
              >
                <Text style={styles.headerTeamText}>{innings.teamName}</Text>

                <View style={styles.headerRightContainer}>
                  <Text style={styles.headerScoreText}>
                    {innings.totalScore} <Text style={styles.headerOversText}>{innings.overs}</Text>
                  </Text>
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color="white"
                    style={{ marginLeft: 6 }}
                  />
                </View>
              </TouchableOpacity>

              {/* Accordion Content */}
              {isExpanded && (
                <View style={styles.accordionContent}>
                  {/* Batters Table */}
                  <View style={styles.tableCard}>
                    <View style={styles.tableHeaderRow}>
                      <Text style={[styles.headerCell, styles.cellName]}>Batsman</Text>
                      <Text style={[styles.headerCell, styles.cellStat, styles.boldHeader]}>R</Text>
                      <Text style={[styles.headerCell, styles.cellStat]}>B</Text>
                      <Text style={[styles.headerCell, styles.cellStat]}>4s</Text>
                      <Text style={[styles.headerCell, styles.cellStat]}>6s</Text>
                      <Text style={[styles.headerCell, styles.cellStatWide]}>SR</Text>
                    </View>

                    {innings.batters
                      .filter((batter, index, self) => 
                        index === self.findIndex(b => b.name.toLowerCase().trim() === batter.name.toLowerCase().trim())
                      )
                      .map((batter) => (
                      <View key={batter.id} style={styles.tableDataRow}>
                        <View style={styles.cellName}>
                          <Text style={[styles.batterNameText, batter.didNotBat && styles.didNotBatNameText, batter.isNotOut && { color: '#10B981', fontWeight: '700' }]}>
                            {batter.name}
                            {batter.isNotOut && !batter.name.includes('*') ? ' *' : ''}
                          </Text>
                          <Text style={[styles.dismissalText, batter.didNotBat && styles.didNotBatDismissalText, batter.isNotOut && { color: '#10B981', fontWeight: '600' }]}>
                            {batter.dismissal || (batter.isNotOut ? 'not out *' : '')}
                          </Text>
                        </View>
                        <Text style={[styles.dataCell, styles.cellStat, styles.boldRunText, batter.didNotBat && styles.didNotBatCell]}>
                          {batter.didNotBat ? '-' : batter.runs}
                        </Text>
                        <Text style={[styles.dataCell, styles.cellStat, batter.didNotBat && styles.didNotBatCell]}>
                          {batter.didNotBat ? '-' : batter.balls}
                        </Text>
                        <Text style={[styles.dataCell, styles.cellStat, batter.didNotBat && styles.didNotBatCell]}>
                          {batter.didNotBat ? '-' : batter.fours}
                        </Text>
                        <Text style={[styles.dataCell, styles.cellStat, batter.didNotBat && styles.didNotBatCell]}>
                          {batter.didNotBat ? '-' : batter.sixes}
                        </Text>
                        <Text style={[styles.dataCell, styles.cellStatWide, batter.didNotBat && styles.didNotBatCell]}>
                          {batter.didNotBat ? '-' : batter.strikeRate}
                        </Text>
                      </View>
                    ))}

                    {/* Extras Row */}
                    <View style={styles.extrasRow}>
                      <Text style={styles.extrasLabel}>Extras</Text>
                      <Text style={styles.extrasValue}>{innings.extras}</Text>
                    </View>
                  </View>

                  {/* Bowlers Table */}
                  {innings.bowlers.length > 0 && (
                    <View style={styles.tableCard}>
                      <View style={styles.tableHeaderRow}>
                        <Text style={[styles.headerCell, styles.cellName]}>Bowler</Text>
                        <Text style={[styles.headerCell, styles.cellStat]}>O</Text>
                        <Text style={[styles.headerCell, styles.cellStat]}>M</Text>
                        <Text style={[styles.headerCell, styles.cellStat]}>R</Text>
                        <Text style={[styles.headerCell, styles.cellStat, styles.boldHeader]}>W</Text>
                        <Text style={[styles.headerCell, styles.cellStatWide]}>Eco</Text>
                      </View>

                      {innings.bowlers.filter(b => b.overs !== '0.0' && b.overs !== '0').map((bowler) => (
                        <View key={bowler.id} style={styles.tableDataRow}>
                          <View style={styles.cellName}>
                            <Text style={styles.bowlerNameText}>{bowler.name}</Text>
                          </View>
                          <Text style={[styles.dataCell, styles.cellStat]}>{bowler.overs}</Text>
                          <Text style={[styles.dataCell, styles.cellStat]}>{bowler.maidens}</Text>
                          <Text style={[styles.dataCell, styles.cellStat]}>{bowler.runs}</Text>
                          <Text style={[styles.dataCell, styles.cellStat, styles.boldWicketText]}>
                            {bowler.wickets}
                          </Text>
                          <Text style={[styles.dataCell, styles.cellStatWide]}>{bowler.economy}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Fall of Wickets (FOW) Table */}
                  {innings.fow.length > 0 && (
                    <View style={styles.tableCard}>
                      <View style={styles.tableHeaderRow}>
                        <Text style={[styles.headerCell, { flex: 3 }]}>Fall of wickets</Text>
                        <Text style={[styles.headerCell, { flex: 2, textAlign: 'right' }]}>Score (ov)</Text>
                      </View>

                      {innings.fow.map((fow) => (
                        <View key={fow.id} style={styles.tableDataRow}>
                          <View style={{ flex: 3 }}>
                            <Text style={styles.fowPlayerText}>
                              {fow.wicketNumber}. {fow.player}
                            </Text>
                          </View>
                          <View style={{ flex: 2, alignItems: 'flex-end' }}>
                            <Text style={styles.fowScoreText}>
                              {fow.score} ({fow.overs} ov)
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              )}
            </View>
          );
        })}

      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 12,
  },

  /* Match Result Banner */
  resultBanner: {
    backgroundColor: 'rgba(16,185,129,0.08)',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.accentBorder,
  },
  resultText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },

  /* Innings Accordion Card */
  inningsAccordionCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  accordionHeader: {
    backgroundColor: colors.card,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  headerTeamText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1,
  },
  headerRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerScoreText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#10B981',
  },
  headerOversText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textMuted,
  },
  accordionContent: {
    padding: 12,
    backgroundColor: colors.card,
  },

  /* Table Cards */
  tableCard: {
    backgroundColor: colors.card,
    borderRadius: 10,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    alignItems: 'center',
  },
  headerCell: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.inputPlaceholder,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  boldHeader: {
    fontWeight: '700',
    color: colors.textSecondary,
  },
  tableDataRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.card,
    alignItems: 'center',
  },

  /* Column Flex Ratios */
  cellName: {
    flex: 3,
    paddingRight: 6,
  },
  cellStat: {
    flex: 1,
    textAlign: 'right',
  },
  cellStatWide: {
    flex: 1.2,
    textAlign: 'right',
  },

  /* Batting Specific Text Styles */
  batterNameText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  didNotBatNameText: {
    color: colors.inputPlaceholder,
  },
  dismissalText: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  didNotBatDismissalText: {
    color: colors.inputPlaceholder,
    fontStyle: 'italic',
  },
  dataCell: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  didNotBatCell: {
    color: colors.inputPlaceholder,
  },
  boldRunText: {
    fontWeight: '700',
    color: colors.textPrimary,
  },

  /* Extras Row */
  extrasRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: colors.card,
  },
  extrasLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
  },
  extrasValue: {
    fontSize: 13,
    color: colors.textSecondary,
  },

  /* Bowling Specific Text Styles */
  bowlerNameText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  boldWicketText: {
    fontWeight: '800',
    color: '#10B981',
  },

  /* Fall of Wickets Text Styles */
  fowPlayerText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  fowScoreText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#EF4444',
  },
});
