# FOCO — B5.2 Android Distraction Detection — Design

Date: 2026-07-24
Status: technical design; safe detection V1 only; enforcement deferred
Base: `main` @ `ae3393549d4f38038e0228fe2337259fc52c7672`

## Objective

Define the first safe Android implementation slice for distraction blocking without adding irreversible enforcement or AccessibilityService behavior before the distribution/consent gate is resolved.

B5.2 V1 should detect and measure user-selected distracting apps during an active FOCO focus session, using explicit Android Usage Access permission. It must remain reversible, local-only, and should not prevent the user from leaving FOCO or uninstalling/disabling anything.

## Product constraints

- Android first.
- Offline-first remains canonical.
- No backend, account, cloud sync, paid service, or remote telemetry is required.
- No work directly on `main`.
- Physical behavior is not considered validated until tested on the target Samsung.
- B4.2 physical validation remains a separate gate.
- AccessibilityService enforcement is explicitly out of scope for this slice.
- Lock Task Mode is not the consumer-app solution for FOCO.

## Current platform facts

### UsageStatsManager

Android `UsageStatsManager` exposes device/app usage history and events. Most cross-app queries require declaring `android.permission.PACKAGE_USAGE_STATS`, and the user must grant Usage Access manually in Android Settings. FOCO cannot silently grant this permission.

References:
- https://developer.android.com/reference/android/app/usage/UsageStatsManager
- https://developer.android.com/reference/android/provider/Settings#ACTION_USAGE_ACCESS_SETTINGS

### AccessibilityService

Google Play allows AccessibilityService for non-accessibility apps only under additional policy constraints, including declaration, prominent in-app disclosure and affirmative consent. Autonomous action planning is prohibited; narrow deterministic user-configured automation is treated differently, but still carries policy and consent obligations.

References:
- https://support.google.com/googleplay/android-developer/answer/10964491
- https://support.google.com/googleplay/android-developer/answer/16558241

Decision for this slice: **do not add AccessibilityService**.

## V1 scope

### 1. User-selected distractor set

FOCO stores a local list of package identifiers the user has explicitly marked as distracting.

Suggested domain contract:

```ts
export type DistractorAppRule = {
  packageName: string;
  label: string;
  enabled: boolean;
  createdAt: string;
};
```

No global or hard-coded social-media list should be treated as canonical. Defaults may be suggested later, but the persisted rule set belongs to the user.

### 2. Permission state

Represent permission separately from rule configuration.

```ts
export type UsageAccessState =
  | 'unknown'
  | 'notGranted'
  | 'granted'
  | 'unsupported';
```

The product must distinguish:
- the user has configured distractor apps;
- Android Usage Access is not granted;
- permission has been granted and detection can run.

A missing permission is not an application error.

### 3. Detection event

During an active focus session, FOCO may observe a foreground transition into a configured distractor app and produce a local domain event.

```ts
export type DistractionDetection = {
  packageName: string;
  detectedAt: string;
  focusSessionId?: string;
};
```

V1 behavior after detection is intentionally non-enforcing:
- record the event locally;
- update session-level distraction metrics;
- optionally surface a FOCO reminder/intervention when the app is foregrounded again;
- do not close, block, overlay, navigate another app, change system settings or simulate input.

### 4. Focus-session integration

Detection only matters while FOCO considers a focus session active. It should not continuously classify the user's device usage outside an explicit focus context.

The core boundary should accept a small focus-session snapshot instead of importing mounted React state.

Suggested pure boundary:

```ts
export type DistractionObservationInput = {
  nowMs: number;
  focusActive: boolean;
  foregroundPackage?: string;
  rules: DistractorAppRule[];
};

export type DistractionObservationResult = {
  distracting: boolean;
  matchedRule?: DistractorAppRule;
};
```

This pure evaluator can be fully unit-tested without Android runtime.

### 5. Local metrics

Persist only the minimum needed for useful feedback:
- count of detected distractor opens during a focus session;
- timestamps/package identifiers for the current or recent session history;
- optional aggregate minutes only if the platform sample quality is reliable enough.

Do not introduce remote analytics for B5.2.

## Architecture

### Pure domain layer

Responsibilities:
- normalize rules;
- evaluate whether the observed foreground package matches an enabled rule;
- ignore detections when no focus session is active;
- deduplicate repeated observations within a bounded debounce window;
- create serializable detection records.

Must not import Android modules, React hooks, navigation, notifications or storage directly.

### Android adapter

Responsibilities:
- determine whether Usage Access is granted;
- open `Settings.ACTION_USAGE_ACCESS_SETTINGS` only after explicit user action;
- query recent usage/foreground events through a narrow native boundary;
- normalize package data before passing it to the pure domain layer.

No AccessibilityService in V1.

### Store integration

The mounted app/store owns persisted user rules and session metrics. Android-specific reads should feed domain events through an explicit adapter rather than mutate arbitrary persisted JSON from a background process.

## Permission UX contract

The application must not dead-end when Usage Access is missing.

Expected states:

1. **Not configured** — explain the capability briefly and allow skipping it.
2. **Rules configured, permission missing** — CTA opens Android Usage Access settings.
3. **Permission granted** — show detection active for focus sessions.
4. **Permission revoked later** — fall back cleanly to permission-missing state; existing focus timer continues normally.

Copy should describe what FOCO reads and why. Do not claim stronger privacy guarantees than the implementation provides.

## Safety and privacy boundaries

- No AccessibilityService in this slice.
- No Lock Task / kiosk mode.
- No Device Admin / Device Owner enrollment.
- No VPN-based traffic interception.
- No packet/content inspection.
- No screen capture.
- No browser-history collection.
- No remote upload of app-usage history.
- No automatic permission-grant flow.
- No hidden monitoring when focus mode is inactive.

## Testing strategy

### Pure unit tests

Add tests before implementation for:

1. active focus + enabled matching rule -> distraction detected;
2. active focus + disabled matching rule -> ignored;
3. no active focus -> ignored;
4. unrelated foreground package -> ignored;
5. duplicate observations within debounce window -> one detection;
6. malformed/empty rule list -> safe no-op;
7. permission revoked -> Android adapter reports unavailable without breaking focus flow.

### Integration/technical gates

Before implementation is considered complete:
- `npm test`;
- `npm run typecheck`;
- `npm run lint`;
- Expo Doctor;
- Android export/prebuild validation;
- GitHub Actions green.

### Physical Samsung gate

Must verify on the physical Samsung:
- Usage Access settings opens correctly;
- FOCO accurately recognizes granted/revoked permission;
- selected distractor package can be detected during active focus;
- detection does not occur when focus is inactive;
- repeated foreground events do not spam the session log;
- timer, reminders and persistence continue working after permission changes;
- app survives background/foreground transitions without fatal error.

Physical gate is explicitly separate from CI.

## Deferred enforcement gate

A later B5.2.x may evaluate deterministic blocking through AccessibilityService only after a product/distribution decision establishes:
- personal/dev-only vs Google Play distribution;
- exact user-facing disclosure;
- affirmative consent flow;
- Play Console declaration requirements;
- supported unblock/disable path;
- policy review of every automated action.

Until that gate is intentionally accepted, FOCO must remain at detection/measurement and voluntary intervention.

## Decision

Proceed with a **UsageStats-based detection/measurement V1** and a pure domain contract first. This creates a useful, testable B5.2 foundation without committing FOCO to AccessibilityService, kiosk/device-owner behavior, or sensitive enforcement permissions before the product and distribution constraints are resolved.
