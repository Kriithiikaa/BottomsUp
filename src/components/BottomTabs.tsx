// the bottom tab bar

import React, { useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Pressable, Animated } from 'react-native';
import Icon from './Icon';

type TabKey = 'home' | 'saved' | 'chat';

type Props = {
  activeTab?: TabKey;
  onPressHome?: () => void;
  onPressSaved?: () => void;
  onPressChat?: () => void;
  searchVisible?: boolean;
  onChangeSearchVisible?: (visible: boolean) => void;
  filterActive?: boolean;
  onRequestFilter?: () => void;
};

export default function BottomTabs({
  activeTab = 'home',
  onPressHome,
  onPressSaved,
  onPressChat,
  searchVisible = false,
  onChangeSearchVisible,
  filterActive = false,
  onRequestFilter,
}: Props) {
  const tabs: Array<{ key: TabKey; icon: string; onPress?: () => void }> = [
    { key: 'home', icon: 'home-variant', onPress: onPressHome },
    { key: 'saved', icon: 'bookmark-multiple', onPress: onPressSaved },
    { key: 'chat', icon: 'message-text', onPress: onPressChat },
  ];

  const showActions = activeTab === 'home';

  return (
    <View style={[styles.wrapper, { bottom: 12 }]}>
      <View style={styles.bar}>
        <View style={styles.segmentContainer}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.segmentBtn, isActive ? styles.segmentBtnActive : styles.segmentBtnInactive]}
                onPress={tab.onPress}
                activeOpacity={0.8}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Icon name={tab.icon} size={20} color={isActive ? '#8c3d00' : '#7d8289'} />
              </TouchableOpacity>
            );
          })}
        </View>
        {showActions ? (
          <View style={styles.actionButtons}>
            <ActionIconButton
              name="filter-variant"
              active={filterActive}
              onPress={() => {
                onPressHome?.();
                onRequestFilter?.();
              }}
            />
            <View style={styles.divider} />
            <ActionIconButton
              name="magnify"
              active={searchVisible}
              onPress={() => {
                onPressHome?.();
                onChangeSearchVisible?.(!searchVisible);
              }}
            />
          </View>
        ) : null}
      </View>
    </View>
  );
}

function ActionIconButton({ name, onPress, active = false }: { name: string; onPress?: () => void; active?: boolean }) {
  const scale = useRef(new Animated.Value(1)).current;
  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.9, useNativeDriver: true, speed: 20, bounciness: 6 }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 6 }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
    >
      <Animated.View
        style={[
          styles.iconBtn,
          active ? styles.iconBtnActive : styles.iconBtnInactive,
          { transform: [{ scale }] },
        ]}
      >
        <Icon name={name} size={20} color={active ? '#8c3d00' : '#7d8289'} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    pointerEvents: 'box-none',
  },
  bar: {
    width: '92%',
    maxWidth: 440,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 26,
    paddingHorizontal: 6,
    marginLeft: 12,
    borderWidth: 1,
    borderColor: '#e5e5e7',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
    height: 56,
  },
  segmentContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f4f5f7',
    borderRadius: 26,
    paddingHorizontal: 6,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#e3e4e7',
    height: 56,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  segmentBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 18,
  },
  segmentBtnInactive: {
    backgroundColor: '#f4f5f7',
  },
  segmentBtnActive: {
    backgroundColor: '#fff8f2',
    borderWidth: 1,
    borderColor: '#ffd9b0',
    shadowColor: '#f59e42',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  iconBtn: {
    minWidth: 52,
    height: 44,
    paddingHorizontal: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnInactive: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderColor: 'transparent',
    shadowColor: 'transparent',
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
  },
  iconBtnActive: {
    backgroundColor: '#fff4e6',
    borderWidth: 1,
    borderColor: '#ffd9b0',
    shadowColor: '#f59e42',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: '#e5e5e7',
    marginHorizontal: 8,
  },
});
