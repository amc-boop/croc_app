import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radius } from '../theme';

interface Props {
  label: string;
  emoji?: string;
  selected?: boolean;
  onPress?: () => void;
  onRemove?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function Chip({ label, emoji, selected, onPress, onRemove, style }: Props) {
  return (
    <Pressable
      onPress={onPress ?? onRemove}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={({ pressed }) => [styles.chip, selected && styles.selected, pressed && { opacity: 0.7 }, style]}
    >
      <Text style={[styles.text, selected && styles.textSelected]}>
        {emoji ? `${emoji}  ` : ''}
        {label}
        {onRemove ? '  ✕' : ''}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radius.pill,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selected: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  text: { color: colors.text, fontSize: 14, fontWeight: '500' },
  textSelected: { color: colors.primary, fontWeight: '700' },
});
