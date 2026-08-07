// Info: Visual theme showcase — renders all theme tokens for visual inspection.
// Navigate here to verify theme derivation is working correctly.
'use strict';

const React = require('react');
const { View, Text, ScrollView, Pressable, StyleSheet } = require('react-native');
const { useLib } = require('../../contexts/lib-context');

// Color swatch component
function ColorSwatch({ name, color }) {
  return (
    <View style={styles.swatchContainer}>
      <View style={[styles.swatch, { backgroundColor: color }]} />
      <Text style={styles.swatchLabel}>{name}</Text>
      <Text style={styles.swatchValue}>{color}</Text>
    </View>
  );
}

// Typography sample
function TypeSample({ name, size, lineHeight, Font }) {
  return (
    <View style={styles.typeRow}>
      <Text style={styles.typeLabel}>{name}</Text>
      <Text style={[styles.typeSample, { fontSize: size, lineHeight, fontFamily: Font.family.primary }]}>
        Aa {size}px
      </Text>
    </View>
  );
}

// Spacing sample
function SpaceSample({ name, value }) {
  return (
    <View style={styles.spaceRow}>
      <Text style={styles.spaceLabel}>{name}</Text>
      <View style={[styles.spaceBox, { width: value, height: value }]} />
      <Text style={styles.spaceValue}>{value}px</Text>
    </View>
  );
}

// Radius sample
function RadiusSample({ name, value, Color }) {
  return (
    <View style={styles.radiusRow}>
      <Text style={styles.radiusLabel}>{name}</Text>
      <View style={[styles.radiusBox, { borderRadius: value, backgroundColor: Color.APP_PRIMARY }]}>
        <Text style={styles.radiusValue}>{value === 999 ? 'pill' : value + 'px'}</Text>
      </View>
    </View>
  );
}

// Main showcase using current theme
function ThemeShowcaseContent() {
  const theme = useLib().ThemeContext.useTheme();
  const { Color, Dimension, Font } = theme;

  const colorTokens = [
    ['APP_PRIMARY', Color.APP_PRIMARY],
    ['APP_PRIMARY_HOVERED', Color.APP_PRIMARY_HOVERED],
    ['APP_PRIMARY_PRESSED', Color.APP_PRIMARY_PRESSED],
    ['APP_PRIMARY_DISABLED', Color.APP_PRIMARY_DISABLED],
    ['APP_PRIMARY_SUBTLE', Color.APP_PRIMARY_SUBTLE],
    ['TEXT_PRIMARY', Color.TEXT_PRIMARY],
    ['TEXT_SECONDARY', Color.TEXT_SECONDARY],
    ['TEXT_MUTED', Color.TEXT_MUTED],
    ['TEXT_ON_PRIMARY', Color.TEXT_ON_PRIMARY],
    ['BACKGROUND_PRIMARY', Color.BACKGROUND_PRIMARY],
    ['BACKGROUND_SECONDARY', Color.BACKGROUND_SECONDARY],
    ['SURFACE', Color.SURFACE],
    ['BORDER', Color.BORDER],
    ['STATUS_SUCCESS', Color.STATUS_SUCCESS],
    ['STATUS_SUCCESS_SUBTLE', Color.STATUS_SUCCESS_SUBTLE],
    ['STATUS_DANGER', Color.STATUS_DANGER],
    ['STATUS_DANGER_SUBTLE', Color.STATUS_DANGER_SUBTLE],
    ['STATUS_WARNING', Color.STATUS_WARNING],
    ['STATUS_WARNING_SUBTLE', Color.STATUS_WARNING_SUBTLE],
    ['STATUS_INFO', Color.STATUS_INFO],
    ['STATUS_INFO_SUBTLE', Color.STATUS_INFO_SUBTLE],
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: Color.BACKGROUND_PRIMARY }]}>
      {/* Hero Preview */}
      <View style={[styles.hero, { backgroundColor: Color.APP_PRIMARY }]}>
        <Text style={[styles.heroText, { color: Color.TEXT_ON_PRIMARY }]}>
          THEME
        </Text>
        <Text style={[styles.heroSubtext, { color: Color.TEXT_ON_PRIMARY }]}>
          {Color.APP_PRIMARY}
        </Text>
      </View>

      {/* Colors */}
      <View style={[styles.section, { backgroundColor: Color.SURFACE }]}>
        <Text style={[styles.sectionTitle, { color: Color.TEXT_PRIMARY }]}>
          Color Tokens ({colorTokens.length})
        </Text>
        <View style={styles.grid}>
          {colorTokens.map(function([name, color]) {
            return <ColorSwatch key={name} name={name} color={color} />;
          })}
        </View>
      </View>

      {/* Typography */}
      <View style={[styles.section, { backgroundColor: Color.SURFACE }]}>
        <Text style={[styles.sectionTitle, { color: Color.TEXT_PRIMARY }]}>
          Typography Scale
        </Text>
        <Text style={[styles.sectionSubtitle, { color: Color.TEXT_SECONDARY }]}>
          Base: {Dimension.fontSize.md}px • Ratio: {Dimension.lineHeightRatio}
        </Text>
        {Object.entries(Dimension.fontSize).map(function([key, size]) {
          return (
            <TypeSample
              key={key}
              name={key}
              size={size}
              lineHeight={Math.round(size * Dimension.lineHeightRatio)}
              Font={Font}
            />
          );
        })}
      </View>

      {/* Font Info */}
      <View style={[styles.section, { backgroundColor: Color.SURFACE }]}>
        <Text style={[styles.sectionTitle, { color: Color.TEXT_PRIMARY }]}>
          Font Families
        </Text>
        <Text style={[styles.infoText, { color: Color.TEXT_SECONDARY }]}>
          Primary: {Font.family.primary}
        </Text>
        <Text style={[styles.infoText, { color: Color.TEXT_SECONDARY }]}>
          Secondary: {Font.family.secondary}
        </Text>
        <Text style={[styles.sectionTitle, { marginTop: 16, color: Color.TEXT_PRIMARY }]}>
          Font Weights
        </Text>
        {Object.entries(Font.weight).map(function([key, weight]) {
          return (
            <Text key={key} style={[styles.infoText, { color: Color.TEXT_SECONDARY }]}>
              {key}: {weight}
            </Text>
          );
        })}
      </View>

      {/* Spacing */}
      <View style={[styles.section, { backgroundColor: Color.SURFACE }]}>
        <Text style={[styles.sectionTitle, { color: Color.TEXT_PRIMARY }]}>
          Spacing Scale (Unit: {Dimension.space.xs}px)
        </Text>
        {Object.entries(Dimension.space).map(function([key, value]) {
          return <SpaceSample key={key} name={key} value={value} />;
        })}
      </View>

      {/* Radius */}
      <View style={[styles.section, { backgroundColor: Color.SURFACE }]}>
        <Text style={[styles.sectionTitle, { color: Color.TEXT_PRIMARY }]}>
          Border Radius
        </Text>
        {Object.entries(Dimension.radius).map(function([key, value]) {
          return <RadiusSample key={key} name={key} value={value} Color={Color} />;
        })}
      </View>

      <View style={styles.footer} />
    </ScrollView>
  );
}

export default function ThemeShowcase() {
  return <ThemeShowcaseContent />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    padding: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 12,
  },
  hero: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroText: {
    fontSize: 48,
    fontWeight: '700',
  },
  heroSubtext: {
    fontSize: 16,
    marginTop: 8,
    opacity: 0.8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  swatchContainer: {
    width: '23%',
    marginBottom: 12,
  },
  swatch: {
    width: '100%',
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  swatchLabel: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 4,
  },
  swatchValue: {
    fontSize: 9,
    fontFamily: 'monospace',
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  typeLabel: {
    fontSize: 12,
    width: 40,
  },
  typeSample: {
    fontWeight: '500',
  },
  spaceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  spaceLabel: {
    fontSize: 12,
    width: 60,
  },
  spaceBox: {
    backgroundColor: '#4F46E5',
    marginHorizontal: 12,
  },
  spaceValue: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  radiusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  radiusLabel: {
    fontSize: 12,
    width: 60,
  },
  radiusBox: {
    width: 60,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 12,
  },
  radiusValue: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  infoText: {
    fontSize: 14,
    paddingVertical: 4,
  },
  footer: {
    height: 32,
  },
});
