import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'right', 'bottom', 'left']}>
      <View style={styles.content}>
        <View style={styles.mark} accessibilityElementsHidden>
          <View style={styles.markInner} />
        </View>

        <Text style={styles.eyebrow}>REACT NATIVE + EXPO</Text>
        <Text style={styles.title}>Mobile Lab</Text>
        <Text style={styles.subtitle}>Entorno móvil funcionando</Text>

        <View style={styles.statusCard}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>Listo para construir FOCO</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#08090B',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  mark: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1,
    borderColor: '#303238',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    backgroundColor: '#111317',
  },
  markInner: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 3,
    borderColor: '#F5F5F5',
    borderTopColor: '#5C6068',
  },
  eyebrow: {
    color: '#8D9199',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 2.2,
    marginBottom: 12,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 42,
    lineHeight: 48,
    fontWeight: '700',
    letterSpacing: -1.2,
    textAlign: 'center',
  },
  subtitle: {
    color: '#B7BAC0',
    fontSize: 18,
    lineHeight: 26,
    textAlign: 'center',
    marginTop: 10,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 36,
    paddingHorizontal: 18,
    paddingVertical: 13,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#292C31',
    backgroundColor: '#111317',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F5F5F5',
  },
  statusText: {
    color: '#D8DADE',
    fontSize: 14,
    fontWeight: '500',
  },
});
