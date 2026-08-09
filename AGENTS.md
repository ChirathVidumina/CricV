# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

# Dynamic Dual Light & Dark Theme System Rule

For all UI development, components, and updates across React Native and Expo:
1. **Dynamic Theme Context**: Always use dynamic theme tokens (`useTheme()`) and dynamic stylesheet factories `useMemo(() => createStyles(colors), [colors])`.
2. **No Hardcoded Hex Colors**: Do not use hardcoded hex colors directly in component styles (e.g., `#ffffff`, `#000000`, `#0f172a`). Use `colors.background`, `colors.card`, `colors.cardBorder`, `colors.textPrimary`, `colors.textSecondary`, `colors.textMuted`, `colors.buttonBg`, `colors.divider`, `colors.inputPlaceholder`, etc.
3. **Dual-Theme Compatibility**: Every UI element (backgrounds, cards, typography, inputs, modals, buttons, borders, headers, FABs) MUST adapt seamlessly and look state-of-the-art in BOTH Light Theme and Dark Theme when toggled.

