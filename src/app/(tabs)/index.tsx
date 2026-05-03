import { ThemeToggle } from "@/components/theme-toggle";
import { StyleSheet, Text, View } from "react-native";


export default function Index() {
  return (
    <View style={styles.container}>
      <View style={styles.container2}>
        <ThemeToggle />
        <Text style={styles.temp}>
          hi
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container2: {
    height: 500,
    borderWidth: 1,
    borderColor: "black",
    borderStyle: "solid"
  },
  temp: {
  }
});
