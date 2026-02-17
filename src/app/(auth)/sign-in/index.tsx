import { useSSO } from "@clerk/clerk-expo";
import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, View, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";

WebBrowser.maybeCompleteAuthSession();

type SSOProvider = "oauth_google" | "oauth_apple";

export default function SignInScreen() {
  const { startSSOFlow } = useSSO();
  const insets = useSafeAreaInsets();

  const [pending, setPending] = useState<SSOProvider | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSSO = useCallback(
    async (strategy: SSOProvider) => {
      setPending(strategy);
      setError(null);

      try {
        const { createdSessionId, setActive } = await startSSOFlow({
          strategy,
          redirectUrl: Linking.createURL("/"),
        });

        if (createdSessionId && setActive) {
          await setActive({ session: createdSessionId });
        }
      } catch (err: any) {
        setError(
          err?.errors?.[0]?.longMessage ??
            err?.message ??
            "No se pudo iniciar sesion."
        );
      } finally {
        setPending(null);
      }
    },
    [startSSOFlow]
  );

  return (
    <View
      className="flex-1 bg-white dark:bg-black px-6 justify-between"
      style={{ paddingTop: insets.top + 60, paddingBottom: insets.bottom + 20 }}
    >
      {/* Header */}
      <View className="gap-3">
        <View className="w-14 h-14 rounded-2xl bg-zinc-900 dark:bg-zinc-200 items-center justify-center">
          <Text className="text-2xl font-bold text-white dark:text-zinc-900">
            O
          </Text>
        </View>

        <View className="gap-1 mt-2">
          <Text className="text-2xl font-bold text-zinc-900 dark:text-white">
            Bienvenido a Outia
          </Text>
          <Text className="text-base text-zinc-500 dark:text-zinc-400">
            Inicia sesion para continuar
          </Text>
        </View>
      </View>

      {/* Social buttons + footer */}
      <View className="gap-4">
        {/* Error */}
        {error ? (
          <View className="bg-red-500/10 rounded-xl p-3">
            <Text className="text-red-500 text-sm">{error}</Text>
          </View>
        ) : null}

        {/* Google */}
        <Pressable
          onPress={() => handleSSO("oauth_google")}
          disabled={pending !== null}
          className="h-13 rounded-xl border border-zinc-300 dark:border-zinc-700 flex-row items-center justify-center gap-2.5 active:bg-zinc-100 dark:active:bg-zinc-800"
          style={{ opacity: pending && pending !== "oauth_google" ? 0.5 : 1 }}
        >
          {pending === "oauth_google" ? (
            <ActivityIndicator size="small" />
          ) : (
            <>
              <View className="w-5 h-5 rounded-full border-2 border-blue-500 items-center justify-center">
                <Text className="text-xs font-extrabold text-blue-500">G</Text>
              </View>
              <Text className="text-base font-semibold text-zinc-900 dark:text-white">
                Continuar con Google
              </Text>
            </>
          )}
        </Pressable>

        {/* Apple */}
        <Pressable
          onPress={() => handleSSO("oauth_apple")}
          disabled={pending !== null}
          className="h-13 rounded-xl bg-zinc-900 dark:bg-zinc-200 flex-row items-center justify-center gap-2.5 active:opacity-80"
          style={{ opacity: pending && pending !== "oauth_apple" ? 0.5 : 1 }}
        >
          {pending === "oauth_apple" ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Text className="text-xl text-white dark:text-zinc-900 -mt-0.5">
                {"\uF8FF"}
              </Text>
              <Text className="text-base font-semibold text-white dark:text-zinc-900">
                Continuar con Apple
              </Text>
            </>
          )}
        </Pressable>

        {/* Terms */}
        <Text className="text-xs text-zinc-400 dark:text-zinc-500 text-center mt-2">
          Al continuar, aceptas los terminos de servicio y la politica de
          privacidad.
        </Text>
      </View>
    </View>
  );
}
