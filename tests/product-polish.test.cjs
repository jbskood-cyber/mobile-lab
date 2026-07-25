const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

function source(relativePath) {
  return fs.readFileSync(path.join(__dirname, '..', relativePath), 'utf8');
}

const emptyStateSource = source('src/ui/FocoEmptyState.tsx');
const todaySource = source('src/features/today/TodayScreen.tsx');
const inboxSource = source('src/features/inbox/InboxSheet.tsx');
const skeletonSource = source('src/ui/FocoSkeleton.tsx');
const skeletonPulseSource = source('src/ui/FocoSkeletonPulse.tsx');

test('FOCO owns one abstract empty-state primitive without mascot or stock-art language', () => {
  assert.match(emptyStateSource, /export function FocoEmptyState/);
  assert.match(emptyStateSource, /react-native-svg/);
  assert.match(emptyStateSource, /Circle/);
  assert.match(emptyStateSource, /Path|Line/);
  assert.match(emptyStateSource, /accessibilityLabel/);
  assert.doesNotMatch(emptyStateSource, /mascot|character|stock|illustration package|lottie/i);
});

test('empty-state geometry comes from FOCO focus-point\/orbit\/trajectory language', () => {
  assert.match(emptyStateSource, /orbit|ring|trajectory|focus point|focusPoint/i);
  assert.match(emptyStateSource, /theme\.colors\.accent/);
  assert.match(emptyStateSource, /compact/);
});

test('Today and Inbox reuse the shared empty state instead of duplicating generic markup', () => {
  assert.match(todaySource, /FocoEmptyState/);
  assert.match(inboxSource, /FocoEmptyState/);
  assert.doesNotMatch(todaySource, /function Empty\(/);
  assert.doesNotMatch(inboxSource, /styles\.emptyTitle|styles\.emptyCopy/);
});

test('loading uses one quiet reduced-motion-aware pulse and keeps content-shaped skeletons', () => {
  assert.match(skeletonSource, /FocoSkeletonPulse/);
  assert.match(skeletonPulseSource, /react-native-reanimated/);
  assert.match(skeletonPulseSource, /useReducedMotion/);
  assert.match(skeletonPulseSource, /withRepeat/);
  assert.match(skeletonPulseSource, /withTiming/);
  assert.match(skeletonPulseSource, /motionDurations/);
  assert.doesNotMatch(skeletonSource + skeletonPulseSource, /ActivityIndicator|spinner/i);
  assert.match(skeletonSource, /TodaySkeleton/);
  assert.match(skeletonSource, /AgendaSkeleton/);
  assert.match(skeletonSource, /ProjectsSkeleton/);
  assert.match(skeletonSource, /FocusSkeleton/);
  assert.match(skeletonSource, /StatsSkeleton/);
});
