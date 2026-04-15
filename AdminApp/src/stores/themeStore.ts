/**
 * Store de Zustand para manejo del tema de la aplicación
 *
 * Persiste la preferencia del usuario en AsyncStorage
 * y proporciona métodos para cambiar entre tema claro y oscuro
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_STORAGE_KEY = '@adminapp/theme';

export type ThemeMode = 'light' | 'dark';

interface ThemeState {
  themeMode: ThemeMode;
  isLoading: boolean;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  toggleTheme: () => Promise<void>;
  loadThemePreference: () => Promise<void>;
}

/**
 * Store global para el tema de la aplicación
 */
export const useThemeStore = create<ThemeState>((set, get) => ({
  themeMode: 'light',
  isLoading: true,

  /**
   * Cambia el tema y persiste la preferencia
   */
  setThemeMode: async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      set({ themeMode: mode });
      console.log(`[Theme] Tema cambiado a: ${mode}`);
    } catch (error) {
      console.error('[Theme] Error al guardar tema:', error);
    }
  },

  /**
   * Alterna entre tema claro y oscuro
   */
  toggleTheme: async () => {
    const currentMode = get().themeMode;
    const newMode: ThemeMode = currentMode === 'light' ? 'dark' : 'light';
    await get().setThemeMode(newMode);
  },

  /**
   * Carga la preferencia de tema desde AsyncStorage
   */
  loadThemePreference: async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme === 'light' || savedTheme === 'dark') {
        set({ themeMode: savedTheme, isLoading: false });
        console.log(`[Theme] Tema cargado: ${savedTheme}`);
      } else {
        set({ isLoading: false });
        console.log('[Theme] No hay tema guardado, usando predeterminado: light');
      }
    } catch (error) {
      console.error('[Theme] Error al cargar tema:', error);
      set({ isLoading: false });
    }
  },
}));
