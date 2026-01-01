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
  const colorScheme = (useColorScheme() ?? "light") as "light" | "dark";
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

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
          const userTasks = await taskService.getAllTasks();
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

  // Get recent tasks sorted by updated date (most recent first)
  const recentTasks = [...tasks]
    .sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.createdAt).getTime();
      const dateB = new Date(b.updatedAt || b.createdAt).getTime();
      return dateB - dateA;
    })
    .slice(0, 5); // Show only the 5 most recent

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
          {loading ? (
            <View
              style={[styles.emptyState, { backgroundColor: cardBackground }]}
            >
              <ThemedText style={[styles.emptyStateText, { color: textMuted }]}>
                Loading...
              </ThemedText>
            </View>
          ) : recentTasks.length === 0 ? (
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
          ) : (
            <View style={styles.tasksList}>
              {recentTasks.map((task) => {
                const statusColor =
                  task.status === "completed"
                    ? Colors[colorScheme].success
                    : task.status === "in progress"
                    ? primaryColor
                    : textMuted;
                const statusIcon =
                  task.status === "completed"
                    ? "checkmark-circle"
                    : task.status === "in progress"
                    ? "time"
                    : "ellipse-outline";

                return (
                  <View
                    key={task._id}
                    style={[
                      styles.taskCard,
                      { backgroundColor: cardBackground },
                    ]}
                  >
                    <View style={styles.taskHeader}>
                      <View style={styles.taskTitleRow}>
                        <Ionicons
                          name={statusIcon as any}
                          size={20}
                          color={statusColor}
                        />
                        <ThemedText
                          style={[styles.taskTitle, { color: textColor }]}
                          numberOfLines={1}
                        >
                          {task.title}
                        </ThemedText>
                      </View>
                      <ThemedText
                        style={[styles.taskDate, { color: textMuted }]}
                      >
                        {new Date(
                          task.updatedAt || task.createdAt
                        ).toLocaleDateString()}
                      </ThemedText>
                    </View>
                    {task.description && (
                      <ThemedText
                        style={[styles.taskDescription, { color: textMuted }]}
                        numberOfLines={2}
                      >
                        {task.description}
                      </ThemedText>
                    )}
                    <View style={styles.taskFooter}>
                      <View
                        style={[
                          styles.statusBadge,
                          {
                            backgroundColor: statusColor + "20",
                            borderColor: statusColor,
                          },
                        ]}
                      >
                        <ThemedText
                          style={[styles.statusText, { color: statusColor }]}
                        >
                          {task.status.charAt(0).toUpperCase() +
                            task.status.slice(1)}
                        </ThemedText>
                      </View>
                      {task.priority && (
                        <View
                          style={[
                            styles.priorityBadge,
                            {
                              backgroundColor:
                                task.priority === "HIGH"
                                  ? Colors[colorScheme].error + "20"
                                  : task.priority === "NORMAL"
                                  ? primaryColor + "20"
                                  : textMuted + "20",
                            },
                          ]}
                        >
                          <ThemedText
                            style={[
                              styles.priorityText,
                              {
                                color:
                                  task.priority === "HIGH"
                                    ? Colors[colorScheme].error
                                    : task.priority === "NORMAL"
                                    ? primaryColor
                                    : textMuted,
                              },
                            ]}
                          >
                            {task.priority}
                          </ThemedText>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          )}
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
  tasksList: {
    gap: 12,
  },
  taskCard: {
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  taskTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  taskDate: {
    fontSize: 12,
    marginLeft: 8,
  },
  taskDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  taskFooter: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
    textTransform: "capitalize",
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: "500",
  },
});
