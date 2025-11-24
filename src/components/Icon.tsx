//still trying to fix this

import React from 'react';
import { NativeModules, Text } from 'react-native';

type Props = {
  name: string;
  size?: number;
  color?: string;
};

const hasLinkedVectorIcons = (): boolean => {
  try {
    const modules = NativeModules as typeof NativeModules & {
      RNVectorIconsManager?: unknown;
      RNVectorIconsModule?: unknown;
    };
    return Boolean(modules.RNVectorIconsManager || modules.RNVectorIconsModule);
  } catch (e) {
    return false;
  }
};

let VectorIconComponent: React.ComponentType<any> | null = null;
let warnedAboutIcons = false;

if (hasLinkedVectorIcons()) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require('react-native-vector-icons/MaterialCommunityIcons');
    VectorIconComponent = mod?.default || mod;
    // Some environments need loadFont to be called before icons render.
    if (VectorIconComponent && typeof (VectorIconComponent as any).loadFont === 'function') {
      (VectorIconComponent as any).loadFont();
    }
  } catch (e) {
    warnedAboutIcons = true;
    // eslint-disable-next-line no-console
    console.warn('react-native-vector-icons not available, falling back to emoji icons.');
  }
} else if (!warnedAboutIcons) {
  warnedAboutIcons = true;
  // eslint-disable-next-line no-console
  console.warn('react-native-vector-icons native module not linked, using fallback icons.');
}

// Runtime-safe icon wrapper. It attempts to use MaterialCommunityIcons
// and falls back to emoji/text if the package isn't installed.
export default function Icon({ name, size = 18, color = '#000' }: Props) {
  if (!VectorIconComponent && !warnedAboutIcons && hasLinkedVectorIcons()) {
    // Attempt dynamic require again in case the module became available later.
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mod = require('react-native-vector-icons/MaterialCommunityIcons');
      VectorIconComponent = mod?.default || mod;
      if (VectorIconComponent && typeof (VectorIconComponent as any).loadFont === 'function') {
        (VectorIconComponent as any).loadFont();
      }
    } catch (e) {
      warnedAboutIcons = true;
      // eslint-disable-next-line no-console
      console.warn('react-native-vector-icons not available, falling back to emoji icons.');
    }
  }

  if (VectorIconComponent) {
    const Component = VectorIconComponent;
    return <Component name={name} size={size} color={color} />;
  }

  // Fallback mapping for the handful of icons used in the app.
  const fallbackMap: Record<string, string> = {
    home: '🏠',
    bookmark: '🔖',
    chat: '💬',
    magnify: '🔍',
    filter: '⚙️',
    share: '🔗',
    close: '✖️',
  };

  const entry = Object.entries(fallbackMap).find(([key]) => name.includes(key));
  const glyph = entry ? entry[1] : '•';

  return (
    <Text style={{ fontSize: size, color }} accessibilityLabel={name}>
      {glyph}
    </Text>
  );
}
