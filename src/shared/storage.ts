import { UserPreferences, DEFAULT_PREFERENCES } from './types/sites';

const STORAGE_KEY_PREFERENCES = 'omniai_preferences';

// In-memory high-speed cache for 0ms synchronous access
let cachedPrefs: UserPreferences | null = null;
let isStorageListenerAttached = false;

function setupStorageSync() {
  if (isStorageListenerAttached || typeof chrome === 'undefined' || !chrome.storage?.onChanged) return;
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local' && changes[STORAGE_KEY_PREFERENCES]) {
      const newValue = changes[STORAGE_KEY_PREFERENCES].newValue;
      if (newValue) {
        cachedPrefs = {
          ...DEFAULT_PREFERENCES,
          ...newValue,
          enableFloatingButton: newValue.enableFloatingButton !== false,
          enableCornerWidget: newValue.enableCornerWidget !== false,
          promptPresets: {
            ...DEFAULT_PREFERENCES.promptPresets,
            ...(newValue.promptPresets || {}),
          },
        };
      }
    }
  });
  isStorageListenerAttached = true;
}

export async function getUserPreferences(): Promise<UserPreferences> {
  if (cachedPrefs) {
    return cachedPrefs;
  }

  setupStorageSync();

  return new Promise((resolve) => {
    if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) {
      cachedPrefs = DEFAULT_PREFERENCES;
      resolve(DEFAULT_PREFERENCES);
      return;
    }

    chrome.storage.local.get([STORAGE_KEY_PREFERENCES], (result) => {
      if (result && result[STORAGE_KEY_PREFERENCES]) {
        const stored = result[STORAGE_KEY_PREFERENCES];
        const parsed: UserPreferences = {
          ...DEFAULT_PREFERENCES,
          ...stored,
          enableFloatingButton: stored.enableFloatingButton !== false,
          enableCornerWidget: stored.enableCornerWidget !== false,
          promptPresets: {
            ...DEFAULT_PREFERENCES.promptPresets,
            ...(stored.promptPresets || {}),
          },
        };
        cachedPrefs = parsed;
        resolve(parsed);
      } else {
        cachedPrefs = DEFAULT_PREFERENCES;
        resolve(DEFAULT_PREFERENCES);
      }
    });
  });
}

export async function saveUserPreferences(prefs: Partial<UserPreferences>): Promise<void> {
  setupStorageSync();

  const current = await getUserPreferences();
  const updated: UserPreferences = {
    ...current,
    ...prefs,
    promptPresets: {
      ...current.promptPresets,
      ...(prefs.promptPresets || {}),
    },
  };

  cachedPrefs = updated;

  return new Promise((resolve) => {
    if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) {
      resolve();
      return;
    }

    chrome.storage.local.set({ [STORAGE_KEY_PREFERENCES]: updated }, () => {
      resolve();
    });
  });
}

