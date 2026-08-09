export const loadFinalOverThriller = () => {
  return {
    matchInfo: {
      team1: "Australia",
      team2: "Sri Lanka",
      toss: "Australia won the toss and elected to bat first",
      currentInnings: 2,
      target: 200,
      matchStatus: "Sri Lanka need 15 runs in 6 balls"
    },
    firstInnings: {
      battingTeam: "Australia",
      bowlingTeam: "Sri Lanka",
      currentScore: 199,
      wickets: 5,
      oversCompleted: 20.0,
      runRate: "9.95",
      extras: { wides: 2, noBalls: 1, legByes: 1, byes: 0, total: 4 },
      batters: [
        { id: 1, name: "David Warner", runs: 55, balls: 35, fours: 6, sixes: 2, sr: 157.1, status: "c Shanaka b Theekshana" },
        { id: 2, name: "Travis Head", runs: 32, balls: 20, fours: 4, sixes: 1, sr: 160.0, status: "c Asalanka b Madushanka" },
        { id: 3, name: "Mitchell Marsh", runs: 45, balls: 25, fours: 3, sixes: 3, sr: 180.0, status: "lbw b Hasaranga" },
        { id: 4, name: "Glenn Maxwell", runs: 19, balls: 12, fours: 2, sixes: 1, sr: 158.3, status: "c Mendis b Pathirana" },
        { id: 5, name: "Marcus Stoinis", runs: 25, balls: 15, fours: 2, sixes: 1, sr: 166.7, status: "b Madushanka" },
        { id: 6, name: "Tim David", runs: 15, balls: 8, fours: 1, sixes: 1, sr: 187.5, status: "not out" },
        { id: 7, name: "Matthew Wade", runs: 4, balls: 5, fours: 0, sixes: 0, sr: 80.0, status: "not out" }
      ],
      bowlers: [
        { id: 1, name: "Maheesh Theekshana", overs: 4.0, maidens: 0, runs: 32, wickets: 1, econ: 8.00 },
        { id: 2, name: "Dilshan Madushanka", overs: 4.0, maidens: 0, runs: 45, wickets: 2, econ: 11.25 },
        { id: 3, name: "Matheesha Pathirana", overs: 4.0, maidens: 0, runs: 38, wickets: 1, econ: 9.50 },
        { id: 4, name: "Wanindu Hasaranga", overs: 4.0, maidens: 0, runs: 40, wickets: 1, econ: 10.00 },
        { id: 5, name: "Dasun Shanaka", overs: 4.0, maidens: 0, runs: 43, wickets: 0, econ: 10.75 }
      ],
      fow: [
        { wicket: 1, player: "Travis Head", score: 45, over: "4.2" },
        { wicket: 2, player: "David Warner", score: 98, over: "8.3" },
        { wicket: 3, player: "Mitchell Marsh", score: 148, over: "13.3" },
        { wicket: 4, player: "Glenn Maxwell", score: 175, over: "16.3" },
        { wicket: 5, player: "Marcus Stoinis", score: 190, over: "18.2" }
      ],
      overByOver: [
        { overNumber: 1, runs: 8, balls: ["1", "0", "4", "1", "1", "1"] },
        { overNumber: 2, runs: 12, balls: ["4", "2", "1", "1", "4", "0"] },
        { overNumber: 3, runs: 6, balls: ["1", "1", "1", "1", "1", "1"] },
        { overNumber: 4, runs: 15, balls: ["6", "4", "1", "1", "1", "2"] },
        { overNumber: 5, runs: 9, balls: ["1", "W", "1", "4", "2", "1"] },
        { overNumber: 6, runs: 10, balls: ["4", "1", "1", "1", "Wd", "1", "1"] },
        { overNumber: 7, runs: 7, balls: ["1", "1", "2", "1", "1", "1"] },
        { overNumber: 8, runs: 11, balls: ["4", "4", "1", "1", "1", "0"] },
        { overNumber: 9, runs: 8, balls: ["1", "1", "W", "1", "4", "1"] },
        { overNumber: 10, runs: 12, balls: ["6", "1", "1", "2", "1", "1"] },
        { overNumber: 11, runs: 6, balls: ["1", "1", "1", "1", "1", "1"] },
        { overNumber: 12, runs: 14, balls: ["4", "6", "1", "1", "1", "1"] },
        { overNumber: 13, runs: 9, balls: ["1", "1", "Nb+1", "1", "2", "1", "1"] },
        { overNumber: 14, runs: 11, balls: ["4", "1", "W", "1", "4", "1"] },
        { overNumber: 15, runs: 10, balls: ["1", "2", "1", "1", "4", "1"] },
        { overNumber: 16, runs: 12, balls: ["6", "1", "2", "1", "1", "Lb1"] },
        { overNumber: 17, runs: 8, balls: ["1", "1", "W", "1", "4", "1"] },
        { overNumber: 18, runs: 12, balls: ["4", "1", "4", "1", "1", "1"] },
        { overNumber: 19, runs: 9, balls: ["1", "W", "1", "Wd", "1", "4", "1"] },
        { overNumber: 20, runs: 9, balls: ["1", "2", "1", "4", "1", "0"] }
      ]
    },
    secondInnings: {
      battingTeam: "Sri Lanka",
      bowlingTeam: "Australia",
      currentScore: 185,
      wickets: 6,
      oversCompleted: 19.0,
      runRate: "9.74",
      requiredRuns: 15,
      remainingBalls: 6,
      extras: { wides: 2, noBalls: 1, legByes: 1, byes: 0, total: 4 },
      batters: [
        { id: 1, name: "Pathum Nissanka", runs: 16, balls: 12, fours: 2, sixes: 0, sr: 133.3, status: "c Smith b Starc" },
        { id: 2, name: "Kusal Mendis", runs: 24, balls: 15, fours: 3, sixes: 0, sr: 160.0, status: "lbw b Cummins" },
        { id: 3, name: "Kusal Perera", runs: 12, balls: 10, fours: 1, sixes: 0, sr: 120.0, status: "c Carey b Hazlewood" },
        { id: 4, name: "Charith Asalanka", runs: 31, balls: 18, fours: 4, sixes: 1, sr: 172.2, status: "c Maxwell b Zampa" },
        { id: 5, name: "Bhanuka Rajapaksa", runs: 15, balls: 14, fours: 2, sixes: 0, sr: 107.1, status: "b Starc" },
        { id: 6, name: "Wanindu Hasaranga", runs: 26, balls: 16, fours: 2, sixes: 2, sr: 162.5, status: "c Warner b Cummins" },
        { id: 7, name: "Dasun Shanaka", runs: 45, balls: 20, fours: 3, sixes: 3, sr: 225.0, status: "not out", isStriker: true },
        { id: 8, name: "Chamika Karunaratne", runs: 12, balls: 9, fours: 1, sixes: 0, sr: 133.3, status: "not out", isStriker: false }
      ],
      bowlers: [
        { id: 1, name: "Mitchell Starc", overs: 4.0, maidens: 0, runs: 35, wickets: 2, econ: 8.75 },
        { id: 2, name: "Pat Cummins", overs: 4.0, maidens: 0, runs: 42, wickets: 2, econ: 10.50 },
        { id: 3, name: "Josh Hazlewood", overs: 4.0, maidens: 0, runs: 38, wickets: 1, econ: 9.50 },
        { id: 4, name: "Adam Zampa", overs: 4.0, maidens: 0, runs: 41, wickets: 1, econ: 10.25 },
        { id: 5, name: "Glenn Maxwell", overs: 3.0, maidens: 0, runs: 28, wickets: 0, econ: 9.33, isCurrentBowler: true }
      ],
      fow: [
        { wicket: 1, player: "Pathum Nissanka", score: 37, over: "4.2" },
        { wicket: 2, player: "Kusal Perera", score: 57, over: "6.5" },
        { wicket: 3, player: "Kusal Mendis", score: 92, over: "10.1" },
        { wicket: 4, player: "Charith Asalanka", score: 123, over: "13.4" },
        { wicket: 5, player: "Bhanuka Rajapaksa", score: 152, over: "16.2" },
        { wicket: 6, player: "Wanindu Hasaranga", score: 160, over: "17.1" }
      ],
      overByOver: [
        { overNumber: 1, runs: 10, balls: ["1", "4", "1", "1", "1", "2"] },
        { overNumber: 2, runs: 8, balls: ["0", "1", "1", "4", "1", "1"] },
        { overNumber: 3, runs: 12, balls: ["4", "4", "0", "2", "1", "1"] },
        { overNumber: 4, runs: 6, balls: ["1", "0", "1", "Wd", "1", "1", "1"] },
        { overNumber: 5, runs: 8, balls: ["1", "W", "1", "4", "1", "1"] },
        { overNumber: 6, runs: 10, balls: ["2", "1", "1", "4", "1", "1"] },
        { overNumber: 7, runs: 5, balls: ["1", "1", "0", "1", "W", "1"] },
        { overNumber: 8, runs: 14, balls: ["4", "6", "1", "2", "0", "1"] },
        { overNumber: 9, runs: 11, balls: ["1", "4", "1", "1", "Wd", "2", "1"] },
        { overNumber: 10, runs: 8, balls: ["1", "1", "4", "1", "1", "0"] },
        { overNumber: 11, runs: 4, balls: ["W", "1", "0", "1", "1", "1"] },
        { overNumber: 12, runs: 15, balls: ["6", "4", "1", "2", "1", "1"] },
        { overNumber: 13, runs: 9, balls: ["1", "4", "1", "1", "1", "1"] },
        { overNumber: 14, runs: 6, balls: ["1", "1", "1", "W", "1", "1"] },
        { overNumber: 15, runs: 12, balls: ["4", "6", "1", "1", "0", "0"] },
        { overNumber: 16, runs: 14, balls: ["1", "Nb+1", "1", "4", "6", "0", "1"] },
        { overNumber: 17, runs: 8, balls: ["0", "W", "1", "4", "2", "1"] },
        { overNumber: 18, runs: 7, balls: ["W", "1", "2", "1", "Lb1", "2"] },
        { overNumber: 19, runs: 18, balls: ["4", "6", "2", "1", "1", "4"] }
      ]
    }
  };
};
