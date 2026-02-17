import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useColors } from "@/hooks/useColors";
import { FONT_SIZE } from "@/theme/globals";
import { LinearGradient as ExpoLinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Check } from "lucide-react-native";
import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

type Plan = "annual" | "monthly";

export default function PaywallScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [selectedPlan, setSelectedPlan] = useState<Plan>("annual");
  const completeOnboarding = useMutation(api.users.completeOnboarding);

  const handleContinueFree = async () => {
    try {
      await completeOnboarding();
    } catch (_) {
      // Silently continue — onboarding state will be retried later
    }
    router.replace("/(app)/home");
  };

  const handleSubscribe = async () => {
    // MVP: subscription logic comes later — just complete onboarding
    try {
      await completeOnboarding();
    } catch (_) {
      // Silently continue
    }
    router.replace("/(app)/home");
  };

  const features = [
    "Rutas ilimitadas con clima en tiempo real",
    "Recomendaciones AI personalizadas",
    "Alertas proactivas de cambios climaticos",
    "Analisis de mejor hora de salida",
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + 12,
            paddingBottom: insets.bottom + 24,
          },
        ]}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Skip / Continue free */}
        <View style={styles.skipRow}>
          <Pressable
            onPress={handleContinueFree}
            hitSlop={16}
            style={styles.skipButton}
          >
            <Text
              variant="caption"
              style={{ color: colors.mutedForeground, fontSize: 15 }}
            >
              Continuar gratis
            </Text>
          </Pressable>
        </View>

        {/* Hero gradient area */}
        <ExpoLinearGradient
          colors={[`${colors.blue}18`, `${colors.blue}06`, "transparent"]}
          style={styles.heroGradient}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        >
          <View
            style={[
              styles.appIconContainer,
              { backgroundColor: colors.blue },
            ]}
          >
            <Text
              style={{
                fontSize: 32,
                fontWeight: "800",
                color: "#FFFFFF",
              }}
            >
              O
            </Text>
          </View>
        </ExpoLinearGradient>

        {/* Headline */}
        <View style={styles.headlineSection}>
          <Text
            variant="heading"
            style={{
              textAlign: "center",
              fontSize: 30,
              fontWeight: "800",
              letterSpacing: -0.5,
            }}
          >
            Viaja con confianza
          </Text>
          <Text
            variant="caption"
            style={{
              textAlign: "center",
              fontSize: 17,
              marginTop: 8,
              lineHeight: 24,
              color: colors.mutedForeground,
            }}
          >
            Desbloquea el clima completo en tu ruta
          </Text>
        </View>

        {/* Feature list */}
        <View style={styles.featureList}>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <View
                style={[
                  styles.checkCircle,
                  { backgroundColor: `${colors.green}18` },
                ]}
              >
                <Check size={16} color={colors.green} strokeWidth={3} />
              </View>
              <Text
                style={{
                  fontSize: FONT_SIZE,
                  fontWeight: "500",
                  color: colors.text,
                  flex: 1,
                  lineHeight: 22,
                }}
              >
                {feature}
              </Text>
            </View>
          ))}
        </View>

        {/* Pricing cards */}
        <View style={styles.pricingRow}>
          {/* Annual */}
          <Pressable
            onPress={() => setSelectedPlan("annual")}
            style={[
              styles.pricingCard,
              {
                borderColor:
                  selectedPlan === "annual" ? colors.blue : colors.border,
                borderWidth: selectedPlan === "annual" ? 2 : 1,
                backgroundColor:
                  selectedPlan === "annual"
                    ? `${colors.blue}0A`
                    : colors.background,
              },
            ]}
          >
            {/* Badge */}
            <View
              style={[styles.badge, { backgroundColor: colors.blue }]}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "700",
                  color: "#FFFFFF",
                  letterSpacing: 0.3,
                }}
              >
                Ahorra 40%
              </Text>
            </View>

            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: colors.mutedForeground,
                marginTop: 4,
              }}
            >
              Anual
            </Text>
            <Text
              style={{
                fontSize: 26,
                fontWeight: "800",
                color:
                  selectedPlan === "annual" ? colors.blue : colors.text,
                marginTop: 4,
                letterSpacing: -0.5,
              }}
            >
              $4.99
            </Text>
            <Text
              style={{
                fontSize: 13,
                fontWeight: "500",
                color: colors.mutedForeground,
              }}
            >
              /mes
            </Text>
          </Pressable>

          {/* Monthly */}
          <Pressable
            onPress={() => setSelectedPlan("monthly")}
            style={[
              styles.pricingCard,
              {
                borderColor:
                  selectedPlan === "monthly" ? colors.blue : colors.border,
                borderWidth: selectedPlan === "monthly" ? 2 : 1,
                backgroundColor:
                  selectedPlan === "monthly"
                    ? `${colors.blue}0A`
                    : colors.background,
              },
            ]}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: colors.mutedForeground,
                marginTop: 22,
              }}
            >
              Mensual
            </Text>
            <Text
              style={{
                fontSize: 26,
                fontWeight: "800",
                color:
                  selectedPlan === "monthly" ? colors.blue : colors.text,
                marginTop: 4,
                letterSpacing: -0.5,
              }}
            >
              $7.99
            </Text>
            <Text
              style={{
                fontSize: 13,
                fontWeight: "500",
                color: colors.mutedForeground,
              }}
            >
              /mes
            </Text>
          </Pressable>
        </View>

        {/* CTA Button */}
        <View style={styles.ctaSection}>
          <Button
            onPress={handleSubscribe}
            size="lg"
            style={{ width: "100%" }}
          >
            Comenzar prueba gratis
          </Button>
        </View>

        {/* Fine print */}
        <Text
          style={{
            fontSize: 13,
            fontWeight: "400",
            color: colors.mutedForeground,
            textAlign: "center",
            marginTop: 12,
            lineHeight: 18,
          }}
        >
          7 dias gratis. Cancela cuando quieras.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  skipRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 8,
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  heroGradient: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 36,
    borderRadius: 24,
    marginBottom: 24,
  },
  appIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headlineSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  featureList: {
    gap: 16,
    marginBottom: 32,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  checkCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  pricingRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 28,
  },
  pricingCard: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  ctaSection: {
    alignItems: "center",
  },
});
