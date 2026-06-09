import {
  Animated,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useEffect, useRef, useState } from "react";

const groups = require("../data/groups.js").groups;

type GroupSelection = {
  first?: string;
  second?: string;
  third?: string;
};

type MatchResult = {
  score1: number;
  score2: number;
  winner: string;
};

type Match = {
  team1?: string;
  team2?: string;
  result?: MatchResult | null;
};

export default function HomeScreen() {
  const [selectedTeams, setSelectedTeams] = useState<Record<string, GroupSelection>>({});
  const [activeTeam, setActiveTeam] = useState("");

  const [round32Winners, setRound32Winners] = useState<string[]>([]);
  const [round16Winners, setRound16Winners] = useState<string[]>([]);
  const [quarterWinners, setQuarterWinners] = useState<string[]>([]);
  const [semiWinners, setSemiWinners] = useState<string[]>([]);
  const [champion, setChampion] = useState("");

  const [round32Results, setRound32Results] = useState<Record<number, MatchResult>>({});
  const [round16Results, setRound16Results] = useState<Record<number, MatchResult>>({});
  const [quarterResults, setQuarterResults] = useState<Record<number, MatchResult>>({});
  const [semiResults, setSemiResults] = useState<Record<number, MatchResult>>({});
  const [finalResult, setFinalResult] = useState<MatchResult | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 900,
      useNativeDriver: true,
    }).start();
  }, []);

  function clearKnockout() {
    setRound32Winners([]);
    setRound16Winners([]);
    setQuarterWinners([]);
    setSemiWinners([]);
    setChampion("");
    setRound32Results({});
    setRound16Results({});
    setQuarterResults({});
    setSemiResults({});
    setFinalResult(null);
  }

  function resetTournament() {
    setSelectedTeams({});
    setActiveTeam("");
    clearKnockout();
  }

  function shuffleArray<T>(array: T[]) {
    return [...array].sort(() => Math.random() - 0.5);
  }

  function randomizeGroups() {
    clearKnockout();
    setActiveTeam("");

    const groupNames = Object.keys(groups);
    const shuffledThirdGroups = shuffleArray(groupNames).slice(0, 8);
    const newSelections: Record<string, GroupSelection> = {};

    groupNames.forEach((groupName) => {
      const groupTeams = groups[groupName] as any[];
      const shuffledTeams = shuffleArray(groupTeams);

      newSelections[groupName] = {
        first: shuffledTeams[0].name,
        second: shuffledTeams[1].name,
        third: shuffledThirdGroups.includes(groupName)
          ? shuffledTeams[2].name
          : undefined,
      };
    });

    setSelectedTeams(newSelections);
  }

  function getPosition(selection: GroupSelection, team: string) {
    if (selection.first === team) return "1º";
    if (selection.second === team) return "2º";
    if (selection.third === team) return "3º";
    return "";
  }

  function getPositionStyle(position: string) {
    if (position === "1º") return styles.firstBadge;
    if (position === "2º") return styles.secondBadge;
    if (position === "3º") return styles.thirdBadge;
    return styles.emptyBadge;
  }

  function getMedal(position: string) {
    if (position === "1º") return "🥇";
    if (position === "2º") return "🥈";
    if (position === "3º") return "🥉";
    return "";
  }

  function selectGroupPosition(
    groupName: string,
    teamName: string,
    position: "first" | "second" | "third" | "fourth"
  ) {
    clearKnockout();

    setSelectedTeams((prev) => {
      const current = prev[groupName] || {};

      const updated: GroupSelection = {
        first: current.first === teamName ? undefined : current.first,
        second: current.second === teamName ? undefined : current.second,
        third: current.third === teamName ? undefined : current.third,
      };

      if (position === "fourth") {
        return { ...prev, [groupName]: updated };
      }

      if (position === "third") {
        const currentThirdCount = Object.entries(prev).filter(
          ([group, selection]) => group !== groupName && selection.third
        ).length;

        if (currentThirdCount >= 8 && current.third !== teamName) {
          alert("Só é possível escolher 8 melhores terceiros colocados.");
          return prev;
        }
      }

      updated[position] = teamName;
      return { ...prev, [groupName]: updated };
    });

    setActiveTeam("");
  }

  function generateScoreForWinner(team1: string, team2: string, winner: string): MatchResult {
    const winnerScore = Math.floor(Math.random() * 3) + 2;
    const loserScore = Math.floor(Math.random() * winnerScore);

    if (winner === team1) return { score1: winnerScore, score2: loserScore, winner };

    return { score1: loserScore, score2: winnerScore, winner };
  }

  function generateRandomMatch(team1: string, team2: string): MatchResult {
    let score1 = Math.floor(Math.random() * 5);
    let score2 = Math.floor(Math.random() * 5);

    while (score1 === score2) {
      score2 = Math.floor(Math.random() * 5);
    }

    return {
      score1,
      score2,
      winner: score1 > score2 ? team1 : team2,
    };
  }

  function updateWinnerArray(
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    index: number,
    team: string,
    limit: number
  ) {
    setter((prev) => {
      const copy = [...prev];
      copy[index] = team;
      return copy.slice(0, limit);
    });
  }

  function countFilled(items: string[]) {
    return items.filter(Boolean).length;
  }

  function makeMatches(teams: string[]): Match[] {
    const matches: Match[] = [];

    for (let i = 0; i < teams.length / 2; i++) {
      matches.push({
        team1: teams[i],
        team2: teams[teams.length - 1 - i],
      });
    }

    return matches;
  }

  function manualRound32(index: number, team1: string, team2: string, winner: string) {
    const result = generateScoreForWinner(team1, team2, winner);
    setRound32Results({ ...round32Results, [index]: result });
    updateWinnerArray(setRound32Winners, index, winner, 16);

    setRound16Winners([]);
    setQuarterWinners([]);
    setSemiWinners([]);
    setChampion("");
    setRound16Results({});
    setQuarterResults({});
    setSemiResults({});
    setFinalResult(null);
  }

  function simulateRound32(index: number, team1: string, team2: string) {
    const result = generateRandomMatch(team1, team2);
    setRound32Results({ ...round32Results, [index]: result });
    updateWinnerArray(setRound32Winners, index, result.winner, 16);

    setRound16Winners([]);
    setQuarterWinners([]);
    setSemiWinners([]);
    setChampion("");
    setRound16Results({});
    setQuarterResults({});
    setSemiResults({});
    setFinalResult(null);
  }

  function manualRound16(index: number, team1: string, team2: string, winner: string) {
    const result = generateScoreForWinner(team1, team2, winner);
    setRound16Results({ ...round16Results, [index]: result });
    updateWinnerArray(setRound16Winners, index, winner, 8);

    setQuarterWinners([]);
    setSemiWinners([]);
    setChampion("");
    setQuarterResults({});
    setSemiResults({});
    setFinalResult(null);
  }

  function simulateRound16(index: number, team1: string, team2: string) {
    const result = generateRandomMatch(team1, team2);
    setRound16Results({ ...round16Results, [index]: result });
    updateWinnerArray(setRound16Winners, index, result.winner, 8);

    setQuarterWinners([]);
    setSemiWinners([]);
    setChampion("");
    setQuarterResults({});
    setSemiResults({});
    setFinalResult(null);
  }

  function manualQuarter(index: number, team1: string, team2: string, winner: string) {
    const result = generateScoreForWinner(team1, team2, winner);
    setQuarterResults({ ...quarterResults, [index]: result });
    updateWinnerArray(setQuarterWinners, index, winner, 4);

    setSemiWinners([]);
    setChampion("");
    setSemiResults({});
    setFinalResult(null);
  }

  function simulateQuarter(index: number, team1: string, team2: string) {
    const result = generateRandomMatch(team1, team2);
    setQuarterResults({ ...quarterResults, [index]: result });
    updateWinnerArray(setQuarterWinners, index, result.winner, 4);

    setSemiWinners([]);
    setChampion("");
    setSemiResults({});
    setFinalResult(null);
  }

  function manualSemi(index: number, team1: string, team2: string, winner: string) {
    const result = generateScoreForWinner(team1, team2, winner);
    setSemiResults({ ...semiResults, [index]: result });
    updateWinnerArray(setSemiWinners, index, winner, 2);

    setChampion("");
    setFinalResult(null);
  }

  function simulateSemi(index: number, team1: string, team2: string) {
    const result = generateRandomMatch(team1, team2);
    setSemiResults({ ...semiResults, [index]: result });
    updateWinnerArray(setSemiWinners, index, result.winner, 2);

    setChampion("");
    setFinalResult(null);
  }

  function manualFinal(team1: string, team2: string, winner: string) {
    const result = generateScoreForWinner(team1, team2, winner);
    setFinalResult(result);
    setChampion(winner);
  }

  function simulateFinal(team1: string, team2: string) {
    const result = generateRandomMatch(team1, team2);
    setFinalResult(result);
    setChampion(result.winner);
  }

  const groupNames = Object.keys(groups);

  const firstPlaced = groupNames
    .map((group) => selectedTeams[group]?.first)
    .filter(Boolean) as string[];

  const secondPlaced = groupNames
    .map((group) => selectedTeams[group]?.second)
    .filter(Boolean) as string[];

  const thirdPlaced = groupNames
    .map((group) => selectedTeams[group]?.third)
    .filter(Boolean) as string[];

  const topTwoComplete = firstPlaced.length === 12 && secondPlaced.length === 12;
  const thirdComplete = thirdPlaced.length === 8;
  const round32Ready = topTwoComplete && thirdComplete;

  const qualifiedTeams = [...firstPlaced, ...secondPlaced, ...thirdPlaced];

  const round32Matches = makeMatches(qualifiedTeams).map((match, index) => ({
    ...match,
    result: round32Results[index] || null,
  }));

  const round16Matches = makeMatches(round32Winners).map((match, index) => ({
    ...match,
    result: round16Results[index] || null,
  }));

  const quarterMatches = makeMatches(round16Winners).map((match, index) => ({
    ...match,
    result: quarterResults[index] || null,
  }));

  const semiMatches = makeMatches(quarterWinners).map((match, index) => ({
    ...match,
    result: semiResults[index] || null,
  }));

  const finalMatch = {
    team1: semiWinners[0],
    team2: semiWinners[1],
  };

  function renderMatches(
    title: string,
    matches: Match[],
    winners: string[],
    manualFunction: (index: number, team1: string, team2: string, winner: string) => void,
    randomFunction: (index: number, team1: string, team2: string) => void
  ) {
    return (
      <>
        <Text style={styles.resultTitle}>{title}</Text>

        {matches.map((match, index) => (
          <View key={index} style={styles.matchCard}>
            <TouchableOpacity
              style={[
                styles.teamSelect,
                winners[index] === match.team1 && styles.winnerSelected,
              ]}
              onPress={() =>
                match.team1 &&
                match.team2 &&
                manualFunction(index, match.team1, match.team2, match.team1)
              }
            >
              <Text style={styles.matchText}>{match.team1 || "?"}</Text>
            </TouchableOpacity>

            <Text style={styles.score}>
              {match.result ? `${match.result.score1} x ${match.result.score2}` : "VS"}
            </Text>

            <TouchableOpacity
              style={[
                styles.teamSelect,
                winners[index] === match.team2 && styles.winnerSelected,
              ]}
              onPress={() =>
                match.team1 &&
                match.team2 &&
                manualFunction(index, match.team1, match.team2, match.team2)
              }
            >
              <Text style={styles.matchText}>{match.team2 || "?"}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.randomButton}
              onPress={() =>
                match.team1 &&
                match.team2 &&
                randomFunction(index, match.team1, match.team2)
              }
            >
              <Text style={styles.randomText}>🎲 Simular Aleatório</Text>
            </TouchableOpacity>
          </View>
        ))}
      </>
    );
  }

  return (
    <Animated.ScrollView style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.hero}>
        <Text style={styles.trophy}>🏆</Text>
        <Text style={styles.header}>Copa do Mundo 2026</Text>

        <Text style={styles.subHeader}>
          Monte os grupos, escolha os classificados e simule o campeão.
        </Text>

        <View style={styles.heroButtons}>
          <TouchableOpacity style={styles.randomGroupsButton} onPress={randomizeGroups}>
            <Text style={styles.resetIcon}>🎲</Text>
            <Text style={styles.resetText}>Sortear Grupos</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.resetButton} onPress={resetTournament}>
            <Text style={styles.resetIcon}>↻</Text>
            <Text style={styles.resetText}>Nova Simulação</Text>
          </TouchableOpacity>
        </View>
      </View>

      {Object.entries(groups).map(([groupName, teams]: [string, any]) => {
        const selection = selectedTeams[groupName] || {};

        const sortedTeams = [...teams].sort((a: any, b: any) => {
          const getOrder = (teamName: string) => {
            if (selection.first === teamName) return 1;
            if (selection.second === teamName) return 2;
            if (selection.third === teamName) return 3;
            return 4;
          };

          return getOrder(a.name) - getOrder(b.name);
        });

        return (
          <View key={groupName} style={styles.card}>
            <Text style={styles.title}>Grupo {groupName}</Text>

            <View style={styles.groupTable}>
              <View style={styles.tableHeader}>
                <Text style={[styles.headerText, styles.posColumn]}>POS</Text>
                <Text style={[styles.headerText, styles.teamColumn]}>SELEÇÃO</Text>
              </View>

              {sortedTeams.map((team: any, index: number) => {
                const position = getPosition(selection, team.name);
                const activeKey = `${groupName}-${team.name}`;
                const isActive = activeTeam === activeKey;

                return (
                  <View key={team.name}>
                    <TouchableOpacity
                      style={[
                        styles.teamRow,
                        !position && index % 2 === 0 && styles.teamRowAlt,
                        position === "1º" && styles.firstPlaceRow,
                        position === "2º" && styles.secondPlaceRow,
                        position === "3º" && styles.thirdPlaceRow,
                        isActive && styles.activeRow,
                      ]}
                      onPress={() => setActiveTeam(isActive ? "" : activeKey)}
                    >
                      <View style={[styles.positionBadge, getPositionStyle(position)]}>
                        <Text style={styles.positionBadgeText}>{position}</Text>
                      </View>

                      <View style={styles.teamInfo}>
                        <Image
                          source={{
                            uri: `https://flagcdn.com/w40/${team.code}.png`,
                          }}
                          style={styles.flagImage}
                        />

                        <Text style={styles.teamName}>
                          {team.name} {getMedal(position)}
                        </Text>
                      </View>
                    </TouchableOpacity>

                    {isActive && (
                      <View style={styles.choiceBox}>
                        <Text style={styles.choiceTitle}>
                          Definir posição de {team.name}
                        </Text>

                        <View style={styles.choiceRow}>
                          <TouchableOpacity
                            style={[styles.choiceButton, styles.firstChoice]}
                            onPress={() =>
                              selectGroupPosition(groupName, team.name, "first")
                            }
                          >
                            <Text style={styles.choiceText}>1º</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={[styles.choiceButton, styles.secondChoice]}
                            onPress={() =>
                              selectGroupPosition(groupName, team.name, "second")
                            }
                          >
                            <Text style={styles.choiceText}>2º</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={[styles.choiceButton, styles.thirdChoice]}
                            onPress={() =>
                              selectGroupPosition(groupName, team.name, "third")
                            }
                          >
                            <Text style={styles.choiceText}>3º</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={[styles.choiceButton, styles.fourthChoice]}
                            onPress={() =>
                              selectGroupPosition(groupName, team.name, "fourth")
                            }
                          >
                            <Text style={styles.choiceText}>Não classifica</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        );
      })}

      {round32Ready &&
        renderMatches(
          "⚔️ 16 avos de Final",
          round32Matches,
          round32Winners,
          manualRound32,
          simulateRound32
        )}

      {countFilled(round32Winners) >= 16 &&
        renderMatches(
          "🏆 Oitavas de Final",
          round16Matches,
          round16Winners,
          manualRound16,
          simulateRound16
        )}

      {countFilled(round16Winners) >= 8 &&
        renderMatches(
          "⚽ Quartas de Final",
          quarterMatches,
          quarterWinners,
          manualQuarter,
          simulateQuarter
        )}

      {countFilled(quarterWinners) >= 4 &&
        renderMatches(
          "🔥 Semifinal",
          semiMatches,
          semiWinners,
          manualSemi,
          simulateSemi
        )}

      {countFilled(semiWinners) >= 2 && (
        <>
          <Text style={styles.resultTitle}>👑 Final</Text>

          <View style={styles.finalCard}>
            <TouchableOpacity
              style={[
                styles.teamSelect,
                champion === finalMatch.team1 && styles.winnerSelected,
              ]}
              onPress={() =>
                finalMatch.team1 &&
                finalMatch.team2 &&
                manualFinal(finalMatch.team1, finalMatch.team2, finalMatch.team1)
              }
            >
              <Text style={styles.finalText}>{finalMatch.team1}</Text>
            </TouchableOpacity>

            <Text style={styles.finalScore}>
              {finalResult ? `${finalResult.score1} x ${finalResult.score2}` : "VS"}
            </Text>

            <TouchableOpacity
              style={[
                styles.teamSelect,
                champion === finalMatch.team2 && styles.winnerSelected,
              ]}
              onPress={() =>
                finalMatch.team1 &&
                finalMatch.team2 &&
                manualFinal(finalMatch.team1, finalMatch.team2, finalMatch.team2)
              }
            >
              <Text style={styles.finalText}>{finalMatch.team2}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.randomButton}
              onPress={() =>
                finalMatch.team1 &&
                finalMatch.team2 &&
                simulateFinal(finalMatch.team1, finalMatch.team2)
              }
            >
              <Text style={styles.randomText}>🎲 Simular Campeão</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {champion !== "" && (
        <View style={styles.championBox}>
          <View style={styles.confettiRow}>
            <Text style={styles.confetti}>🎉</Text>
            <Text style={styles.confetti}>✨</Text>
            <Text style={styles.confetti}>🎊</Text>
            <Text style={styles.confetti}>⭐</Text>
            <Text style={styles.confetti}>🎉</Text>
          </View>

          <Text style={styles.championTitle}>🏆 CAMPEÃO DO MUNDO</Text>
          <Text style={styles.championText}>{champion}</Text>

          <Text style={styles.championSub}>
            Uma campanha histórica até o título da Copa do Mundo 2026!
          </Text>

          <View style={styles.confettiRow}>
            <Text style={styles.confetti}>🎊</Text>
            <Text style={styles.confetti}>🏆</Text>
            <Text style={styles.confetti}>✨</Text>
            <Text style={styles.confetti}>🎉</Text>
            <Text style={styles.confetti}>⭐</Text>
          </View>
        </View>
      )}
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
  flex: 1,
  backgroundColor: "#cfd6df",
  paddingHorizontal: 18,
},

  hero: {
    marginTop: 30,
    marginBottom: 35,
    alignItems: "center",
    paddingVertical: 38,
    paddingHorizontal: 20,
    backgroundColor: "#dde4ec",
    borderRadius: 34,
    borderWidth: 2,
    borderColor: "#d5dbe3",
  },

  trophy: {
    fontSize: 68,
    marginBottom: 6,
  },

  header: {
    color: "#111827",
    fontSize: 58,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: 1,
  },

  subHeader: {
    color: "#475569",
    fontSize: 20,
    marginTop: 12,
    marginBottom: 24,
    fontWeight: "700",
    textAlign: "center",
  },

  heroButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 14,
  },

  randomGroupsButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#16a34a",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "#166534",
  },

  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#dc2626",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "#991b1b",
  },

  resetIcon: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "900",
    marginRight: 10,
  },

  resetText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "900",
  },

  card: {
    backgroundColor: "#dde4ec",
    padding: 20,
    borderRadius: 28,
    marginBottom: 25,
    borderWidth: 2,
    borderColor: "#d5dbe3",
  },

  title: {
    color: "#111827",
    fontSize: 30,
    fontWeight: "900",
    marginBottom: 18,
    textAlign: "center",
  },

  groupTable: {
    borderWidth: 2,
    borderColor: "#d5dbe3",
    borderRadius: 18,
    overflow: "hidden",
  },

  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#111827",
    paddingVertical: 12,
    paddingHorizontal: 14,
  },

  headerText: {
    color: "#f8fafc",
    fontSize: 13,
    fontWeight: "900",
  },

  posColumn: {
    width: 70,
    textAlign: "center",
  },

  teamColumn: {
    flex: 1,
    paddingLeft: 12,
  },

  teamRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e5ebf2",
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#d5dbe3",
  },

  teamRowAlt: {
    backgroundColor: "#dbe2ea",
  },

  firstPlaceRow: {
    backgroundColor: "#d9fbe7",
  },

  secondPlaceRow: {
    backgroundColor: "#ddeaff",
  },

  thirdPlaceRow: {
    backgroundColor: "#ffe8d1",
  },

  activeRow: {
    backgroundColor: "#fff7cc",
  },

  positionBadge: {
    width: 52,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },

  firstBadge: {
    backgroundColor: "#16a34a",
    borderColor: "#15803d",
  },

  secondBadge: {
    backgroundColor: "#2563eb",
    borderColor: "#1d4ed8",
  },

  thirdBadge: {
    backgroundColor: "#f97316",
    borderColor: "#ea580c",
  },

  emptyBadge: {
    backgroundColor: "transparent",
    borderColor: "transparent",
  },

  positionBadgeText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "900",
  },

  teamInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 14,
  },

  flagImage: {
    width: 34,
    height: 23,
    marginRight: 14,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },

  teamName: {
    color: "#111827",
    fontSize: 20,
    fontWeight: "900",
  },

  choiceBox: {
    backgroundColor: "#dce4ec",
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#d5dbe3",
  },

  choiceTitle: {
    color: "#334155",
    fontSize: 15,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 12,
  },

  choiceRow: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 8,
  },

  choiceButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderWidth: 2,
  },

  firstChoice: {
    backgroundColor: "#16a34a",
    borderColor: "#15803d",
  },

  secondChoice: {
    backgroundColor: "#2563eb",
    borderColor: "#1d4ed8",
  },

  thirdChoice: {
    backgroundColor: "#f97316",
    borderColor: "#ea580c",
  },

  fourthChoice: {
    backgroundColor: "#64748b",
    borderColor: "#475569",
  },

  choiceText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "900",
  },

  resultTitle: {
    color: "#111827",
    fontSize: 36,
    fontWeight: "900",
    marginTop: 40,
    marginBottom: 22,
    textAlign: "center",
  },

  matchCard: {
    backgroundColor: "#dde4ec",
    padding: 22,
    borderRadius: 25,
    marginBottom: 22,
    borderWidth: 2,
    borderColor: "#d5dbe3",
    alignItems: "center",
  },

  matchText: {
    color: "#111827",
    fontSize: 24,
    fontWeight: "900",
  },

  score: {
    color: "#16a34a",
    fontSize: 32,
    marginVertical: 15,
    fontWeight: "900",
  },

  teamSelect: {
    width: "100%",
    backgroundColor: "#eef2f7",
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#cbd5e1",
  },

  winnerSelected: {
    backgroundColor: "#d9fbe7",
    borderColor: "#16a34a",
    borderWidth: 3,
    transform: [{ scale: 1.03 }],
  },

  randomButton: {
    backgroundColor: "#facc15",
    marginTop: 18,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#ca8a04",
  },

  randomText: {
    color: "#111827",
    fontSize: 18,
    fontWeight: "900",
  },

  finalCard: {
    backgroundColor: "#dde4ec",
    padding: 30,
    borderRadius: 30,
    marginBottom: 30,
    borderWidth: 3,
    borderColor: "#facc15",
    alignItems: "center",
  },

  finalText: {
    color: "#111827",
    fontSize: 28,
    fontWeight: "900",
  },

  finalScore: {
    color: "#16a34a",
    fontSize: 36,
    fontWeight: "900",
    marginVertical: 18,
  },

  championBox: {
    backgroundColor: "#16a34a",
    padding: 48,
    borderRadius: 36,
    marginTop: 55,
    marginBottom: 90,
    alignItems: "center",
    borderWidth: 6,
    borderColor: "#facc15",
  },

  confettiRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 12,
    gap: 18,
  },

  confetti: {
    fontSize: 36,
  },

  championTitle: {
    color: "#facc15",
    fontSize: 44,
    fontWeight: "900",
    textAlign: "center",
  },

  championText: {
    color: "#ffffff",
    fontSize: 60,
    fontWeight: "900",
    marginTop: 18,
    textAlign: "center",
  },

  championSub: {
    color: "#dcfce7",
    fontSize: 20,
    marginTop: 14,
    fontWeight: "800",
    textAlign: "center",
  },
});