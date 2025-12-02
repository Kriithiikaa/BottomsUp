import React from 'react';
import { Text, StyleSheet, Platform } from 'react-native';

type Props = {
  name: string;
  size?: number;
  color?: string;
};

// Prefer react-native-vector-icons (MaterialCommunityIcons). If the package
// isn't installed yet we'll gracefully fall back to the emoji/glyph mapping
// so the app doesn't crash.
let VectorIcon: any = null;
let triedLoadFont = false;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const _v = require('react-native-vector-icons/MaterialCommunityIcons');
  VectorIcon = _v && _v.default ? _v.default : _v;

  // make sure the font is loaded (otherwise Android shows '?')
  if (VectorIcon && typeof VectorIcon.loadFont === 'function' && !triedLoadFont) {
    triedLoadFont = true;
    VectorIcon.loadFont().catch(() => {
      /* ignore font load errors */
    });
  }
} catch (e) {
  VectorIcon = null;
}
// Log availability to help debugging in Metro logs
try {
  // eslint-disable-next-line no-console
  console.log('[Icon] VectorIcon available:', !!VectorIcon);
} catch (e) {
  // ignore
}

export default function Icon({ name, size = 18, color = '#000' }: Props) {
  if (VectorIcon) {
    return <VectorIcon name={name} size={size} color={color} />;
  }

  const glyph = getGlyphForName(name);
  // show emoji glyph with an explicit emoji font on platforms where the app
  // might override the default font (prevents '?' placeholders)
  return (
    <Text
      style={[
        styles.icon,
        { fontSize: size, color, ...(Platform.select({ ios: { fontFamily: 'Apple Color Emoji' }, android: { fontFamily: 'Noto Color Emoji' } }) || {}) },
      ]}
    >
      {glyph}
    </Text>
  );
}

function getGlyphForName(name: string) {
  switch (name) {
    case 'magnify':
    case 'magnify-close':
      return '🔍';
    case 'plus':
    case 'plus-circle':
      return '➕';
    case 'filter-variant':
    case 'filter':
      return '🔽';
    case 'clock-outline':
      return '⏰';
    case 'calendar-blank':
    case 'calendar-blank-outline':
    case 'calendar-outline':
      return '📅';
    case 'map-marker':
    case 'map-marker-outline':
      return '📍';
    case 'share-variant':
      return '🔗';
    case 'send':
      return '🚀';
    case 'chevron-left':
      return '◀️';
    case 'chevron-right':
      return '▶️';
    case 'menu':
      return '☰';
    case 'close-circle':
      return '✖️';
    default:
      return '';
  }
}

const styles = StyleSheet.create({
  icon: {
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});
