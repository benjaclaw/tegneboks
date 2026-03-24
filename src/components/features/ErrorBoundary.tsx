import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { colors } from "../../theme";

interface Props {
  children: React.ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.warn("ErrorBoundary caught:", error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Noe gikk galt</Text>
          <Text style={styles.message}>
            Tegneflaten krasjet. Prøv å gå tilbake og åpne tegningen på nytt.
          </Text>
          <Pressable style={styles.button} onPress={this.handleReset}>
            <Text style={styles.buttonText}>Prøv igjen</Text>
          </Pressable>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  title: {
    fontFamily: "Nunito_700Bold",
    fontSize: 24,
    color: colors.text,
    marginBottom: 12,
  },
  message: {
    fontFamily: "Nunito_700Bold",
    fontSize: 16,
    color: colors.border,
    textAlign: "center",
    marginBottom: 24,
  },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  buttonText: {
    fontFamily: "Nunito_700Bold",
    fontSize: 16,
    color: "#FFFFFF",
  },
});
