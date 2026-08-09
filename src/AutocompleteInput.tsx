import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    StyleProp,
    ViewStyle,
    TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from './ThemeContext';

export interface PlayerData {
    id?: string;
    fullName: string;
    displayName?: string;
    role?: string;
}

export type SuggestionItem = string | PlayerData;

interface AutocompleteInputProps {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    suggestions: SuggestionItem[];
    excludeNames?: string[];
    containerStyle?: StyleProp<ViewStyle>;
    inputStyle?: StyleProp<TextStyle>;
    inputLabel?: string;
}

export default function AutocompleteInput({
    value,
    onChangeText,
    placeholder = 'Enter player name',
    suggestions = [],
    excludeNames = [],
    containerStyle,
    inputStyle,
    inputLabel,
}: AutocompleteInputProps) {
    const { colors } = useTheme();
    const [isFocused, setIsFocused] = useState(false);

    // Normalize suggestion items into unified format
    const normalizedSuggestions = suggestions.map(item => {
        if (typeof item === 'string') {
            return { fullName: item, effectiveName: item, displayName: undefined };
        }
        const effectiveName = item.displayName && item.displayName.trim() ? item.displayName.trim() : item.fullName;
        return {
            ...item,
            effectiveName,
        };
    });

    const normalizedExclude = excludeNames.map(n => n.trim().toLowerCase()).filter(n => n !== '');

    // Filter suggestions based on typed input and excludeNames
    const query = value.trim().toLowerCase();
    const filteredSuggestions = query.length === 0
        ? []
        : normalizedSuggestions.filter(item => {
            const fullLower = item.fullName.toLowerCase();
            const displayLower = item.displayName ? item.displayName.toLowerCase() : '';
            const effectiveLower = item.effectiveName.toLowerCase();

            // Exclude if player is already selected in excludeNames list
            const isExcluded = normalizedExclude.some(ex =>
                ex === fullLower || ex === displayLower || ex === effectiveLower
            );
            if (isExcluded) return false;

            const matchesFullName = fullLower.includes(query);
            const matchesDisplayName = displayLower ? displayLower.includes(query) : false;
            return matchesFullName || matchesDisplayName;
        });

    const showDropdown = isFocused && filteredSuggestions.length > 0;

    const handleSelectSuggestion = (effectiveName: string) => {
        onChangeText(effectiveName);
        setIsFocused(false);
    };

    return (
        <View style={[{ position: 'relative', zIndex: isFocused ? 9999 : 1 }, containerStyle]}>
            {inputLabel && <Text style={styles(colors).inputLabel}>{inputLabel}</Text>}

            <TextInput
                style={[
                    styles(colors).inputField,
                    isFocused && { borderBottomColor: '#10B981' },
                    inputStyle,
                ]}
                placeholder={placeholder}
                placeholderTextColor={colors.inputPlaceholder}
                value={value}
                onChangeText={text => {
                    onChangeText(text);
                    if (!isFocused) setIsFocused(true);
                }}
                onFocus={() => setIsFocused(true)}
                onBlur={() => {
                    // Slight delay to allow onPress of suggestion item to register
                    setTimeout(() => setIsFocused(false), 200);
                }}
            />

            {showDropdown && (
                <View style={styles(colors).dropdownOverlay}>
                    <ScrollView
                        nestedScrollEnabled={true}
                        keyboardShouldPersistTaps="handled"
                        style={{ maxHeight: 160 }}
                    >
                        {filteredSuggestions.map((item, index) => {
                            const isLast = index === filteredSuggestions.length - 1;
                            return (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles(colors).dropdownItem,
                                        !isLast && styles(colors).dropdownItemBorder,
                                    ]}
                                    onPress={() => handleSelectSuggestion(item.effectiveName)}
                                >
                                    <Ionicons name="person-outline" size={14} color="#10B981" style={{ marginRight: 8 }} />
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles(colors).suggestionPrimaryText} numberOfLines={1}>
                                            {item.effectiveName}
                                        </Text>
                                        {item.displayName && item.displayName !== item.fullName && (
                                            <Text style={styles(colors).suggestionSecondaryText} numberOfLines={1}>
                                                Full Name: {item.fullName}
                                            </Text>
                                        )}
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>
            )}
        </View>
    );
}

const styles = (colors: any) =>
    StyleSheet.create({
        inputLabel: {
            fontSize: 11,
            fontWeight: '700',
            color: colors.textMuted,
            marginBottom: 4,
            letterSpacing: 0.5,
            textTransform: 'uppercase',
        },
        inputField: {
            borderBottomWidth: 1,
            borderBottomColor: colors.divider,
            paddingVertical: 8,
            fontSize: 15,
            color: colors.textPrimary,
        },
        dropdownOverlay: {
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.cardBorder,
            borderRadius: 10,
            elevation: 10,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 8,
            zIndex: 9999,
            overflow: 'hidden',
            marginTop: 2,
        },
        dropdownItem: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 10,
            paddingHorizontal: 12,
            backgroundColor: colors.card,
        },
        dropdownItemBorder: {
            borderBottomWidth: 1,
            borderBottomColor: colors.divider,
        },
        suggestionPrimaryText: {
            fontSize: 14,
            fontWeight: '600',
            color: colors.textPrimary,
        },
        suggestionSecondaryText: {
            fontSize: 11,
            color: colors.textMuted,
            marginTop: 1,
        },
    });
