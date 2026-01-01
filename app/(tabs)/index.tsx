import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Button } from "@/components/ui/Button";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { taskService, type Task } from "@/lib/services/taskService";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

export default function DashboardScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setUserId] = useState<string | null>(null);

  const backgroundColor = useThemeColor({}, "background");
  const cardBackground = useThemeColor({}, "backgroundCard");
  const primaryColor = Colors[colorScheme].primary;
  const textColor = useThemeColor({}, "text");
  const textMuted = useThemeColor({}, "textMuted");

  useEffect(() => {
    const loadUserAndTasks = async () => {
      try {
        const userStr = await AsyncStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          setUserId(user.id);
          const userTasks = await taskService.getTasksByUserId(user.id);
          setTasks(userTasks);
        }
      } catch (error) {
        console.error("Error loading tasks:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUserAndTasks();
  }, []);

  const completedTasks = tasks.filter(
    (task) => task.status === "completed"
  ).length;
  const totalTasks = tasks.length;

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            Dashboard
          </ThemedText>
          <ThemedText style={[styles.subtitle, { color: textMuted }]}>
            Welcome to your wishlist
          </ThemedText>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: cardBackground }]}>
            <Ionicons name="list" size={24} color={primaryColor} />
            <ThemedText style={[styles.statNumber, { color: textColor }]}>
              {loading ? "..." : totalTasks}
            </ThemedText>
            <ThemedText style={[styles.statLabel, { color: textMuted }]}>
              Total Wishes
            </ThemedText>
          </View>
          <View style={[styles.statCard, { backgroundColor: cardBackground }]}>
            <Ionicons name="checkmark-circle" size={24} color={primaryColor} />
            <ThemedText style={[styles.statNumber, { color: textColor }]}>
              {loading ? "..." : completedTasks}
            </ThemedText>
            <ThemedText style={[styles.statLabel, { color: textMuted }]}>
              Completed
            </ThemedText>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
            Quick Actions
          </ThemedText>
          <View style={styles.actionsContainer}>
            <Button
              onPress={() => {
                // TODO: Implement add wish functionality
              }}
              style={styles.actionButton}
            >
              <Ionicons name="add" size={20} color="#ffffff" />
              <ThemedText style={styles.actionText}>Add Wish</ThemedText>
            </Button>
            <Button
              onPress={() => {
                // Navigate within tabs
                router.push("/(tabs)/categories" as any);
              }}
              variant="outline"
              style={styles.actionButton}
            >
              <Ionicons name="folder" size={20} color={primaryColor} />
              <ThemedText style={[styles.actionText, { color: primaryColor }]}>
                Manage Categories
              </ThemedText>
            </Button>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
            Recent Activity
          </ThemedText>
          <View
            style={[styles.emptyState, { backgroundColor: cardBackground }]}
          >
            <Ionicons name="time-outline" size={48} color={textMuted} />
            <ThemedText style={[styles.emptyStateText, { color: textMuted }]}>
              No recent activity
            </ThemedText>
            <ThemedText
              style={[styles.emptyStateSubtext, { color: textMuted }]}
            >
              Start by adding your first wish
            </ThemedText>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    gap: 8,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 14,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
  },
  actionsContainer: {
    gap: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  actionText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "500",
  },
  emptyState: {
    padding: 40,
    borderRadius: 16,
    alignItems: "center",
    gap: 12,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "500",
  },
  emptyStateSubtext: {
    fontSize: 14,
  },
});
