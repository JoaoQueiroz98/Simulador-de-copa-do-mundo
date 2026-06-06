import { useState } from "react";
import { ScrollView, StyleSheet, Text } from "react-native";

import GroupCard from "../components/GroupCard";
import { groups } from "../data/groups";

export default function HomeScreen() {
  const [selectedTeams, setSelectedTeams] = useState({});

  function handleSelect(group, team) {
    setSelectedTeams({
      ...selectedTeams,
      [group]: team,
    });
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>
        🏆 Simulador da Copa do Mundo
      </Text>

      {Object.entries(groups).map(([groupName, teams]) => (
        <GroupCard
          key={groupName}
          groupName={groupName}
          teams={teams}
          selectedTeam={selectedTeams[groupName]}
          onSelect={(team) => handleSelect(groupName, team)}
        />
      ))}

      <Text style={styles.resultTitle}>
        Campeões dos grupos:
      </Text>

      {Object.entries(selectedTeams).map(([group, team]) => (
        <Text key={group} style={styles.resultText}>
          Grupo {group}: {team}
        </Text>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    padding: 20,
  },

  header: {
    color: "white",
    fontSize: 32,
    fontWeight: "bold",
    marginTop: 50,
    marginBottom: 30,
    textAlign: "center",
  },

  resultTitle: {
    color: "#facc15",
    fontSize: 26,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },

  resultText: {
    color: "white",
    fontSize: 20,
    marginBottom: 10,
  },
});