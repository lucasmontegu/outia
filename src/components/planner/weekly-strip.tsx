import React from "react";
import { FlatList, View, StyleSheet } from "react-native";
import { DayCard } from "./day-card";

interface DayScore {
  date: string;
  overallScore: number | null;
  bestDepartureHour: number | null;
}

interface WeeklyStripProps {
  scores: DayScore[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

const DAY_NAMES_ES = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"];

export function WeeklyStrip({
  scores,
  selectedDate,
  onSelectDate,
}: WeeklyStripProps) {
  const today = new Date().toISOString().split("T")[0];

  return (
    <FlatList
      horizontal
      data={scores}
      keyExtractor={(item) => item.date}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.list}
      ItemSeparatorComponent={() => <View style={{ width: 8 }} />}
      renderItem={({ item }) => {
        const d = new Date(item.date + "T12:00:00");
        return (
          <DayCard
            dayName={DAY_NAMES_ES[d.getDay()]}
            dayNumber={d.getDate()}
            score={item.overallScore}
            isToday={item.date === today}
            isSelected={item.date === selectedDate}
            onPress={() => onSelectDate(item.date)}
          />
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: 4,
  },
});
