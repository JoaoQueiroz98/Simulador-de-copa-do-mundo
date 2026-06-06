import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useEffect, useRef, useState } from "react";

const groups = require("../data/groups.js").groups;

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
  const [selectedTeams, setSelectedTeams] = useState<Record<string, string[]>>({});
  const [quarterFinalists, setQuarterFinalists] = useState<string[]>([]);
  const [semiFinalists, setSemiFinalists] = useState<string[]>([]);
  const [finalists, setFinalists] = useState<string[]>([]);
  const [champion, setChampion] = useState("");

  const [roundOf16Results, setRoundOf16Results] = useState<Record<number, MatchResult>>({});
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

  function generateScoreForWinner(team1: string, team2: string, winner: string): MatchResult {
    let winnerScore = Math.floor(Math.random() * 3) + 2;
    let loserScore = Math.floor(Math.random() * winnerScore);

    if (winner === team1) {
      return {
        score1: winnerScore,
        score2: loserScore,
        winner,
      };
    }

    return {
      score1: loserScore,
      score2: winnerScore,
      winner,
    };
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

  function resetKnockout() {
    setQuarterFinalists([]);
    setSemiFinalists([]);
    setFinalists([]);
    setChampion("");
    setRoundOf16Results({});
    setQuarterResults({});
    setSemiResults({});
    setFinalResult(null);
  }

  function resetTournament() {
    setSelectedTeams({});
    resetKnockout();
  }

  function handleSelect(group: string, team: string) {
    const current = selectedTeams[group] || [];

    resetKnockout();

    if (current.includes(team)) {
      setSelectedTeams({
        ...selectedTeams,
        [group]: current.filter((t) => t !== team),
      });
      return;
    }

    if (current.length < 2) {
      setSelectedTeams({
        ...selectedTeams,
        [group]: [...current, team],
      });
    }
  }

  function advanceToQuarters(index: number, team: string) {
    setQuarterFinalists((prev) => {
      const copy = [...prev];
      copy[index] = team;
      return copy.filter(Boolean).slice(0, 8);
    });

    setSemiFinalists([]);
    setFinalists([]);
    setChampion("");
    setQuarterResults({});
    setSemiResults({});
    setFinalResult(null);
  }

  function advanceToSemis(index: number, team: string) {
    setSemiFinalists((prev) => {
      const copy = [...prev];
      copy[index] = team;
      return copy.filter(Boolean).slice(0, 4);
    });

    setFinalists([]);
    setChampion("");
    setSemiResults({});
    setFinalResult(null);
  }

  function advanceToFinal(index: number, team: string) {
    setFinalists((prev) => {
      const copy = [...prev];
      copy[index] = team;
      return copy.filter(Boolean).slice(0, 2);
    });

    setChampion("");
    setFinalResult(null);
  }

  function simulateRoundOf16(index: number, team1: string, team2: string) {
    const result = generateRandomMatch(team1, team2);

    setRoundOf16Results({
      ...roundOf16Results,
      [index]: result,
    });

    advanceToQuarters(index, result.winner);
  }

  function manualRoundOf16(index: number, team1: string, team2: string, winner: string) {
    const result = generateScoreForWinner(team1, team2, winner);

    setRoundOf16Results({
      ...roundOf16Results,
      [index]: result,
    });

    advanceToQuarters(index, winner);
  }

  function simulateQuarter(index: number, team1: string, team2: string) {
    const result = generateRandomMatch(team1, team2);

    setQuarterResults({
      ...quarterResults,
      [index]: result,
    });

    advanceToSemis(index, result.winner);
  }

  function manualQuarter(index: number, team1: string, team2: string, winner: string) {
    const result = generateScoreForWinner(team1, team2, winner);

    setQuarterResults({
      ...quarterResults,
      [index]: result,
    });

    advanceToSemis(index, winner);
  }

  function simulateSemi(index: number, team1: string, team2: string) {
    const result = generateRandomMatch(team1, team2);

    setSemiResults({
      ...semiResults,
      [index]: result,
    });

    advanceToFinal(index, result.winner);
  }

  function manualSemi(index: number, team1: string, team2: string, winner: string) {
    const result = generateScoreForWinner(team1, team2, winner);

    setSemiResults({
      ...semiResults,
      [index]: result,
    });

    advanceToFinal(index, winner);
  }

  function simulateFinal(team1: string, team2: string) {
    const result = generateRandomMatch(team1, team2);
    setFinalResult(result);
    setChampion(result.winner);
  }

  function manualChampion(team1: string, team2: string, winner: string) {
    const result = generateScoreForWinner(team1, team2, winner);
    setFinalResult(result);
    setChampion(winner);
  }

  const totalGroups = Object.keys(groups).length;
  const completedGroups = Object.values(selectedTeams).filter(
    (teams: any) => teams.length === 2
  ).length;

  const groupsComplete = completedGroups === totalGroups;

  const knockoutMatches: Match[] = [
    { team1: selectedTeams["A"]?.[0], team2: selectedTeams["B"]?.[1] },
    { team1: selectedTeams["C"]?.[0], team2: selectedTeams["D"]?.[1] },
    { team1: selectedTeams["E"]?.[0], team2: selectedTeams["F"]?.[1] },
    { team1: selectedTeams["G"]?.[0], team2: selectedTeams["H"]?.[1] },
    { team1: selectedTeams["B"]?.[0], team2: selectedTeams["A"]?.[1] },
    { team1: selectedTeams["D"]?.[0], team2: selectedTeams["C"]?.[1] },
    { team1: selectedTeams["F"]?.[0], team2: selectedTeams["E"]?.[1] },
    { team1: selectedTeams["H"]?.[0], team2: selectedTeams["G"]?.[1] },
  ].map((match, index) => ({
    ...match,
    result: roundOf16Results[index] || null,
  }));

  const quarterMatches: Match[] = [
    { team1: quarterFinalists[0], team2: quarterFinalists[1] },
    { team1: quarterFinalists[2], team2: quarterFinalists[3] },
    { team1: quarterFinalists[4], team2: quarterFinalists[5] },
    { team1: quarterFinalists[6], team2: quarterFinalists[7] },
  ].map((match, index) => ({
    ...match,
    result: quarterResults[index] || null,
  }));

  const semiMatches: Match[] = [
    { team1: semiFinalists[0], team2: semiFinalists[1] },
    { team1: semiFinalists[2], team2: semiFinalists[3] },
  ].map((match, index) => ({
    ...match,
    result: semiResults[index] || null,
  }));

  return (
    <Animated.ScrollView style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.hero}>
        <Text style={styles.header}>🏆 Copa do Mundo 2026</Text>
        <Text style={styles.subHeader}>
          Escolha os classificados, simule confrontos e descubra o campeão.
        </Text>

        <TouchableOpacity style={styles.resetButton} onPress={resetTournament}>
          <Text style={styles.resetText}>🔄 Reiniciar Copa</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.progressBox}>
        <Text style={styles.progressText}>
          Grupos completos: {completedGroups}/{totalGroups}
        </Text>

        <Text style={styles.progressSub}>
          Selecione 2 classificados em cada grupo.
        </Text>
      </View>

      {Object.entries(groups).map(([groupName, teams]: [string, any]) => (
        <View key={groupName} style={styles.card}>
          <Text style={styles.title}>Grupo {groupName}</Text>

          {teams.map((team: any, index: number) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.teamButton,
                selectedTeams[groupName]?.includes(team.name) && styles.selected,
              ]}
              onPress={() => handleSelect(groupName, team.name)}
            >
              <Text style={styles.teamText}>
                {team.flag} {team.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}

      {groupsComplete && (
        <>
          <Text style={styles.resultTitle}>🏆 Oitavas de Final</Text>

          {knockoutMatches.map((match, index) => (
            <View key={index} style={styles.matchCard}>
              <TouchableOpacity
                style={[
                  styles.teamSelect,
                  quarterFinalists[index] === match.team1 && styles.winnerSelected,
                ]}
                onPress={() =>
                  match.team1 &&
                  match.team2 &&
                  manualRoundOf16(index, match.team1, match.team2, match.team1)
                }
              >
                <Text style={styles.matchText}>{match.team1}</Text>
              </TouchableOpacity>

              <Text style={styles.score}>
                {match.result ? `${match.result.score1} x ${match.result.score2}` : "VS"}
              </Text>

              <TouchableOpacity
                style={[
                  styles.teamSelect,
                  quarterFinalists[index] === match.team2 && styles.winnerSelected,
                ]}
                onPress={() =>
                  match.team1 &&
                  match.team2 &&
                  manualRoundOf16(index, match.team1, match.team2, match.team2)
                }
              >
                <Text style={styles.matchText}>{match.team2}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.randomButton}
                onPress={() =>
                  match.team1 &&
                  match.team2 &&
                  simulateRoundOf16(index, match.team1, match.team2)
                }
              >
                <Text style={styles.randomText}>🎲 Simular Aleatório</Text>
              </TouchableOpacity>
            </View>
          ))}
        </>
      )}

      {quarterFinalists.length >= 8 && (
        <>
          <Text style={styles.resultTitle}>⚽ Quartas de Final</Text>

          {quarterMatches.map((match, index) => (
            <View key={index} style={styles.matchCard}>
              <TouchableOpacity
                style={[
                  styles.teamSelect,
                  semiFinalists[index] === match.team1 && styles.winnerSelected,
                ]}
                onPress={() =>
                  match.team1 &&
                  match.team2 &&
                  manualQuarter(index, match.team1, match.team2, match.team1)
                }
              >
                <Text style={styles.matchText}>{match.team1}</Text>
              </TouchableOpacity>

              <Text style={styles.score}>
                {match.result ? `${match.result.score1} x ${match.result.score2}` : "VS"}
              </Text>

              <TouchableOpacity
                style={[
                  styles.teamSelect,
                  semiFinalists[index] === match.team2 && styles.winnerSelected,
                ]}
                onPress={() =>
                  match.team1 &&
                  match.team2 &&
                  manualQuarter(index, match.team1, match.team2, match.team2)
                }
              >
                <Text style={styles.matchText}>{match.team2}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.randomButton}
                onPress={() =>
                  match.team1 &&
                  match.team2 &&
                  simulateQuarter(index, match.team1, match.team2)
                }
              >
                <Text style={styles.randomText}>🎲 Simular Aleatório</Text>
              </TouchableOpacity>
            </View>
          ))}
        </>
      )}

      {semiFinalists.length >= 4 && (
        <>
          <Text style={styles.resultTitle}>🔥 Semifinal</Text>

          {semiMatches.map((match, index) => (
            <View key={index} style={styles.matchCard}>
              <TouchableOpacity
                style={[
                  styles.teamSelect,
                  finalists[index] === match.team1 && styles.winnerSelected,
                ]}
                onPress={() =>
                  match.team1 &&
                  match.team2 &&
                  manualSemi(index, match.team1, match.team2, match.team1)
                }
              >
                <Text style={styles.matchText}>{match.team1}</Text>
              </TouchableOpacity>

              <Text style={styles.score}>
                {match.result ? `${match.result.score1} x ${match.result.score2}` : "VS"}
              </Text>

              <TouchableOpacity
                style={[
                  styles.teamSelect,
                  finalists[index] === match.team2 && styles.winnerSelected,
                ]}
                onPress={() =>
                  match.team1 &&
                  match.team2 &&
                  manualSemi(index, match.team1, match.team2, match.team2)
                }
              >
                <Text style={styles.matchText}>{match.team2}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.randomButton}
                onPress={() =>
                  match.team1 &&
                  match.team2 &&
                  simulateSemi(index, match.team1, match.team2)
                }
              >
                <Text style={styles.randomText}>🎲 Simular Aleatório</Text>
              </TouchableOpacity>
            </View>
          ))}
        </>
      )}

      {finalists.length >= 2 && (
        <>
          <Text style={styles.resultTitle}>👑 Final</Text>

          <View style={styles.finalCard}>
            <TouchableOpacity
              style={[
                styles.teamSelect,
                champion === finalists[0] && styles.winnerSelected,
              ]}
              onPress={() => manualChampion(finalists[0], finalists[1], finalists[0])}
            >
              <Text style={styles.finalText}>{finalists[0]}</Text>
            </TouchableOpacity>

            <Text style={styles.finalScore}>
              {finalResult ? `${finalResult.score1} x ${finalResult.score2}` : "VS"}
            </Text>

            <TouchableOpacity
              style={[
                styles.teamSelect,
                champion === finalists[1] && styles.winnerSelected,
              ]}
              onPress={() => manualChampion(finalists[0], finalists[1], finalists[1])}
            >
              <Text style={styles.finalText}>{finalists[1]}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.randomButton}
              onPress={() => simulateFinal(finalists[0], finalists[1])}
            >
              <Text style={styles.randomText}>🎲 Simular Campeão</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {champion !== "" && (
        <View style={styles.championBox}>
          <Text style={styles.championTitle}>🏆 CAMPEÃO</Text>
          <Text style={styles.championText}>{champion}</Text>
          <Text style={styles.championSub}>Parabéns ao grande vencedor!</Text>
        </View>
      )}
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000814",
    paddingHorizontal: 18,
  },

  hero: {
    marginTop: 50,
    marginBottom: 25,
    alignItems: "center",
  },

  header: {
    color: "#ffffff",
    fontSize: 44,
    fontWeight: "900",
    textAlign: "center",
  },

  subHeader: {
    color: "#cbd5e1",
    fontSize: 18,
    marginTop: 10,
    fontWeight: "600",
    textAlign: "center",
  },

  resetButton: {
    backgroundColor: "#ef4444",
    paddingVertical: 13,
    paddingHorizontal: 24,
    borderRadius: 18,
    marginTop: 22,
  },

  resetText: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "900",
  },

  progressBox: {
    backgroundColor: "#001d3d",
    padding: 18,
    borderRadius: 20,
    marginBottom: 25,
    borderWidth: 2,
    borderColor: "#003566",
    alignItems: "center",
  },

  progressText: {
    color: "#ffd60a",
    fontSize: 22,
    fontWeight: "900",
  },

  progressSub: {
    color: "#cbd5e1",
    fontSize: 16,
    marginTop: 8,
    textAlign: "center",
  },

  card: {
    backgroundColor: "#001d3d",
    padding: 22,
    borderRadius: 28,
    marginBottom: 25,
    borderWidth: 2,
    borderColor: "#003566",
  },

  title: {
    color: "#ffd60a",
    fontSize: 30,
    fontWeight: "900",
    marginBottom: 20,
    textAlign: "center",
  },

  teamButton: {
    backgroundColor: "#003566",
    paddingVertical: 18,
    borderRadius: 18,
    marginBottom: 14,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#00509d",
  },

  selected: {
    backgroundColor: "#38b000",
    borderColor: "#ccff33",
  },

  winnerSelected: {
    backgroundColor: "#38b000",
    borderColor: "#ffd60a",
    borderWidth: 3,
    transform: [{ scale: 1.03 }],
  },

  teamText: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "bold",
  },

  resultTitle: {
    color: "#ffd60a",
    fontSize: 34,
    fontWeight: "900",
    marginTop: 40,
    marginBottom: 22,
    textAlign: "center",
  },

  matchCard: {
    backgroundColor: "#001d3d",
    padding: 22,
    borderRadius: 25,
    marginBottom: 22,
    borderWidth: 2,
    borderColor: "#003566",
    alignItems: "center",
  },

  matchText: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "900",
  },

  score: {
    color: "#ffd60a",
    fontSize: 30,
    marginVertical: 15,
    fontWeight: "900",
  },

  teamSelect: {
    width: "100%",
    backgroundColor: "#003566",
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#00509d",
  },

  randomButton: {
    backgroundColor: "#ffb703",
    marginTop: 18,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
  },

  randomText: {
    color: "#000",
    fontSize: 18,
    fontWeight: "900",
  },

  finalCard: {
    backgroundColor: "#001d3d",
    padding: 30,
    borderRadius: 30,
    marginBottom: 30,
    borderWidth: 3,
    borderColor: "#ffd60a",
    alignItems: "center",
  },

  finalText: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "900",
  },

  finalScore: {
    color: "#ffd60a",
    fontSize: 34,
    fontWeight: "900",
    marginVertical: 18,
  },

  championBox: {
    backgroundColor: "#38b000",
    padding: 40,
    borderRadius: 30,
    marginTop: 50,
    marginBottom: 80,
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#ffd60a",
  },

  championTitle: {
    color: "#ffd60a",
    fontSize: 40,
    fontWeight: "900",
  },

  championText: {
    color: "#ffffff",
    fontSize: 50,
    fontWeight: "900",
    marginTop: 15,
    textAlign: "center",
  },

  championSub: {
    color: "#dcfce7",
    fontSize: 18,
    marginTop: 10,
    fontWeight: "700",
  },
});