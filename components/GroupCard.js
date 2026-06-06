import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function GroupCard({
  groupName,
  teams,
  selectedTeam,
  onSelect,
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Grupo {groupName}</Text>

      {teams.map((team, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.teamButton,
            selectedTeam === team && styles.selected,
          ]}
          onPress={() => onSelect(team)}
        >
          <Text style={styles.teamText}>⚽ {team}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1e293b",
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
  },

  title: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
  },

  teamButton: {
    backgroundColor: "#334155",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },

  selected: {
    backgroundColor: "#16a34a",
  },

  teamText: {
    color: "white",
    fontSize: 18,
  },
});