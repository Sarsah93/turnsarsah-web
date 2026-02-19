# Developer Localization Guide

This guide provides instructions for managing and expanding multi-language support in TurnSarsah.

## Centralized Translations

All localized strings are managed in `src/constants/translations.ts`. The structure follows a nested object pattern:

```typescript
export const TRANSLATIONS = {
    KR: {
        SETTINGS: { ... },
        TUTORIAL: { ... },
        COMBAT: { ... },
        CONDITIONS: { ... },
        RULES: { ... },
        UI: { ... }
    },
    EN: {
        // Must mirror KR structure exactly
    }
};
```

## Adding New Strings

1.  **Update `translations.ts`**: Add new keys to both `KR` and `EN` sections.
2.  **Use in Components**:
    ```tsx
    const { language } = useGameStore();
    const t = TRANSLATIONS[language];
    
    return <div>{t.UI.YOUR_NEW_LABEL}</div>;
    ```
3.  **Use in Logic Hooks**:
    ```typescript
    const t = TRANSLATIONS[language];
    setMessage(t.COMBAT.SOME_ACTION);
    ```

## Status Effect Descriptions

Status effect (Condition) descriptions are no longer hardcoded in `CONDITION_PRESETS`. Instead, they are fetched dynamically:

```typescript
const condKey = conditionName.toUpperCase().replace(/\s+/g, '_');
const description = (t.CONDITIONS as any)[condKey]?.DESC;
```

> [!IMPORTANT]
> When adding a new status effect, you **must** add its `NAME` and `DESC` to the `CONDITIONS` section in `translations.ts` using the UPPER_SNAKE_CASE of its name.

## Boss Rules

Boss rules for Stage 10 and generic stage indicators use keys from `t.RULES`.

- Stage 10 rules are often combined (e.g., `RULE: BLIND+BAN_SUIT`).
- Use `t.RULES.RULE_HINT` to prefix rules (e.g., "RULE: ").

## Best Practices

- **Avoid Hardcoded Strings**: Never use literal strings for UI messages. Always use `t.SECTION.KEY`.
- **Dynamic Content**: Use `.replace('{variable}', value)` for strings containing dynamic data.
- **Mirroring**: Ensure every key added to `KR` is also added to `EN` (and vice versa) to avoid undefined errors.
- **Type Safety**: Use `(t.SECTION as any)[key]` when keys are generated dynamically from names/types.

## Future Languages

To add a new language (e.g., Japanese):
1.  Add `JP` to the `Language` type in `translations.ts`.
2.  Add the `JP` object to `TRANSLATIONS`.
3.  Update `SettingsMenu.tsx` to include the Japanese selection option.
