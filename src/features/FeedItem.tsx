import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  GestureResponderEvent,
} from 'react-native';

type Props = {
  id?: string;
  title: string;
  subtitle?: string; // e.g., time text
  location?: string;
  image?: string; // uri
  onPress?: (e?: GestureResponderEvent) => void;
  onShare?: () => void;
  saved?: boolean;
};

export default function FeedItem({
  title,
  subtitle,
  location,
  image,
  onPress,
  onShare,
  saved = false,
}: Props) {
  return (
    <TouchableOpacity style={styles.rowWrapper} activeOpacity={0.9} onPress={onPress}>
      <View style={styles.leftThumb}>
        {image ? (
          <Image source={{ uri: image }} style={styles.thumbImage} />
        ) : (
          <View style={styles.thumbPlaceholder} />
        )}
      </View>

      <View style={styles.center}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        {location ? <Text style={styles.location}>{location}</Text> : null}
      </View>

      {saved ? (
        <View style={styles.savedBadge} pointerEvents="none">
          <Text style={styles.savedText}>You're In</Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  rowWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 12,
    marginVertical: 8,
    borderRadius: 12,
    backgroundColor: '#2b2b23',
    overflow: 'hidden',
  },
  leftThumb: {
    width: 96,
    height: 96,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 16,
  },
  thumbImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  thumbPlaceholder: {
    flex: 1,
    backgroundColor: '#222',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    color: '#cfcfcf',
  },
  location: {
    marginTop: 4,
    fontSize: 13,
    color: '#9da1a3',
  },
  savedBadge: {
    position: 'absolute',
    right: 18,
    top: 12,
    backgroundColor: '#2b7cff',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    elevation: 4,
  },
  savedText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
});
