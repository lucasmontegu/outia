import { Onboarding, OnboardingStep } from "@/components/ui/onboarding";
import { useColors } from "@/hooks/useColors";
import { router } from "expo-router";
import { CloudRain, Sparkles, BellRing } from "lucide-react-native";
import React from "react";

export default function OnboardingScreen() {
  const colors = useColors();
  const iconColor = colors.blue;

  const steps: OnboardingStep[] = [
    {
      id: "weather-route",
      title: "Clima en tu ruta, no en tu ciudad",
      description:
        "Outia analiza las condiciones climaticas a lo largo de tu recorrido, no solo en tu destino.",
      icon: <CloudRain size={80} color={iconColor} strokeWidth={1.5} />,
    },
    {
      id: "smart-recommendations",
      title: "Recomendaciones inteligentes",
      description:
        "Nuestro analisis AI te dice cuando salir y que esperar en cada tramo de tu viaje.",
      icon: <Sparkles size={80} color={iconColor} strokeWidth={1.5} />,
    },
    {
      id: "smart-alerts",
      title: "Alertas antes de que importan",
      description:
        "Recibe notificaciones cuando el clima cambia en tu ruta. Sin sorpresas, sin riesgos.",
      icon: <BellRing size={80} color={iconColor} strokeWidth={1.5} />,
    },
  ];

  const handleComplete = () => {
    router.replace("/(auth)/sign-in");
  };

  return (
    <Onboarding
      steps={steps}
      onComplete={handleComplete}
      showSkip
      onSkip={handleComplete}
      primaryButtonText="Comenzar"
      nextButtonText="Siguiente"
      backButtonText="Atras"
      skipButtonText="Omitir"
    />
  );
}
