import React from 'react';
import {
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLauncher } from '../context/LauncherContext';

export const YouTubeModal: React.FC = () => {
  const {
    activeModal,
    closeModal,
    theme,
    fontScale,
    vibrate,
  } = useLauncher();

  if (activeModal !== 'youtube') {
    return null;
  }

  const seniorCategories = [
    {
      title: 'Relaxing Nature & Bird Songs',
      desc: 'Calming sounds and scenery',
      icon: 'leaf',
      color: '#059669',
      searchQuery: 'relaxing nature sounds 4k birds',
    },
    {
      title: 'Golden Era Music & Classics',
      desc: 'Old hits from 50s, 60s & 70s',
      icon: 'musical-notes',
      color: '#D97706',
      searchQuery: 'classic old songs greatest hits',
    },
    {
      title: 'Senior Gentle Exercises & Yoga',
      desc: 'Easy sitting exercises for mobility',
      icon: 'fitness',
      color: '#2563EB',
      searchQuery: 'chair exercises for seniors gentle mobility',
    },
    {
      title: 'Daily News Highlights',
      desc: 'Clear headline summaries',
      icon: 'newspaper',
      color: '#DC2626',
      searchQuery: 'daily news updates',
    },
    {
      title: 'Gardening & Cooking Tips',
      desc: 'Enjoyable home hobbies',
      icon: 'restaurant',
      color: '#7C3AED',
      searchQuery: 'easy home gardening and classic cooking',
    },
  ];

  const handleOpenApp = async (query?: string) => {
    vibrate('medium');
    const url = query
      ? `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`
      : 'https://www.youtube.com';

    await Linking.openURL(url);
  };

  return (
    <Modal
      visible={true}
      transparent={true}
      animationType="slide"
      onRequestClose={closeModal}
    >
      <View style={[styles.overlay, { backgroundColor: theme.modalOverlay }]}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.modalBg,
              borderColor: theme.cardBorder,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Ionicons name="logo-youtube" size={36} color="#FF0000" />
              <Text
                style={[
                  styles.headerTitle,
                  {
                    color: theme.textPrimary,
                    fontSize: fontScale.sectionTitle,
                  },
                ]}
              >
                YouTube Hub
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.closeBtn, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
              onPress={closeModal}
              activeOpacity={0.7}
              accessibilityLabel="Close YouTube Hub"
              accessibilityRole="button"
            >
              <Ionicons name="close" size={26} color={theme.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Big Master YouTube Button */}
          <TouchableOpacity
            style={styles.masterBtn}
            onPress={() => handleOpenApp()}
            activeOpacity={0.8}
            accessibilityLabel="Open YouTube Home"
            accessibilityRole="button"
          >
            <Ionicons name="play-circle" size={38} color="#FFFFFF" />
            <View style={styles.masterBtnTextWrap}>
              <Text style={[styles.masterBtnTitle, { fontSize: fontScale.buttonLabel * 1.15 }]}>
                OPEN FULL YOUTUBE APP
              </Text>
              <Text style={styles.masterBtnSub}>Tap here to search and watch anything</Text>
            </View>
          </TouchableOpacity>

          <Text
            style={[
              styles.categoryHeader,
              {
                color: theme.textSecondary,
                fontSize: fontScale.body,
              },
            ]}
          >
            Or pick a favorite topic:
          </Text>

          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {seniorCategories.map((item, idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.categoryCard,
                  {
                    backgroundColor: theme.card,
                    borderColor: theme.cardBorder,
                  },
                ]}
                onPress={() => handleOpenApp(item.searchQuery)}
                activeOpacity={0.7}
                accessibilityLabel={item.title}
                accessibilityRole="button"
              >
                <View style={[styles.categoryIconWrap, { backgroundColor: item.color }]}>
                  <Ionicons name={item.icon as any} size={28} color="#FFFFFF" />
                </View>
                <View style={styles.categoryInfo}>
                  <Text
                    style={[
                      styles.categoryTitle,
                      {
                        color: theme.textPrimary,
                        fontSize: fontScale.contactName * 0.9,
                      },
                    ]}
                  >
                    {item.title}
                  </Text>
                  <Text
                    style={[
                      styles.categoryDesc,
                      {
                        color: theme.textMuted,
                        fontSize: fontScale.caption,
                      },
                    ]}
                  >
                    {item.desc}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color={theme.textMuted} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  card: {
    width: '100%',
    maxHeight: '90%',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderWidth: 2,
    borderBottomWidth: 0,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontWeight: '800',
    marginLeft: 10,
  },
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  masterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF0000',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#FF0000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  masterBtnTextWrap: {
    marginLeft: 12,
    flex: 1,
  },
  masterBtnTitle: {
    color: '#FFFFFF',
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  masterBtnSub: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  categoryHeader: {
    fontWeight: '700',
    marginBottom: 12,
  },
  list: {
    maxHeight: 380,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 2,
    padding: 12,
    marginBottom: 10,
    elevation: 2,
  },
  categoryIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryTitle: {
    fontWeight: '800',
  },
  categoryDesc: {
    fontWeight: '600',
    marginTop: 2,
  },
});
