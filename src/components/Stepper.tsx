import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '../theme';

export function Stepper({ value, onChange, min = 1, max = 20, suffix }: { value: number; onChange: (v: number) => void; min?: number; max?: number; suffix?: string }) {
  return (
    <View style={styles.row}>
      <Pressable style={styles.btn} onPress={() => onChange(Math.max(min, value - 1))} accessibilityLabel="Moins">
        <Text style={styles.btnText}>−</Text>
      </Pressable>
      <Text style={styles.value}>
        {value}
        {suffix ? ` ${suffix}` : ''}
      </Text>
      <Pressable style={styles.btn} onPress={() => onChange(Math.min(max, value + 1))} accessibilityLabel="Plus">
        <Text style={styles.btnText}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface2, borderRadius: radius.pill, padding: 3 },
  btn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface },
  btnText: { color: colors.text, fontSize: 18, fontWeight: '700' },
  value: { color: colors.text, fontWeight: '700', minWidth: 64, textAlign: 'center' },
});
