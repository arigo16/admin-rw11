'use client'
import { createContext, useState, ReactNode, useEffect } from 'react';
import config from './config'
import React from "react";

const STORAGE_KEY = 'admin-rw11-settings';

// Define the shape of stored settings
interface StoredSettings {
  activeDir?: string;
  activeMode?: string;
  activeTheme?: string;
  activeLayout?: string;
  isCardShadow?: boolean;
  isLayout?: string;
  isBorderRadius?: number;
  isCollapse?: string;
  isLanguage?: string;
}

// Define the shape of the context state
interface CustomizerContextState {
  activeDir: string;
  setActiveDir: (dir: string) => void;
  activeMode: string;
  setActiveMode: (mode: string) => void;
  activeTheme: string;
  setActiveTheme: (theme: string) => void;
  activeLayout: string;
  setActiveLayout: (layout: string) => void;
  isCardShadow: boolean;
  setIsCardShadow: (shadow: boolean) => void;
  isLayout: string;
  setIsLayout: (layout: string) => void;
  isBorderRadius: number;
  setIsBorderRadius: (radius: number) => void;
  isCollapse: string;
  setIsCollapse: (collapse: string) => void;
  isSidebarHover: boolean;
  setIsSidebarHover: (isHover: boolean) => void;
  isMobileSidebar: boolean;
  setIsMobileSidebar: (isMobileSidebar: boolean) => void;
}

// Helper function to load settings from localStorage
const loadSettings = (): StoredSettings => {
  if (typeof window === 'undefined') return {};
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

// Helper function to save settings to localStorage
const saveSettings = (settings: StoredSettings) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Ignore storage errors
  }
};

// Create the context with an initial value
export const CustomizerContext = createContext<CustomizerContextState | any>(undefined);

// Define the type for the children prop
interface CustomizerContextProps {
  children: ReactNode;
}

// Create the provider component
export const CustomizerContextProvider: React.FC<CustomizerContextProps> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [activeDir, setActiveDirState] = useState<string>(config.activeDir);
  const [activeMode, setActiveModeState] = useState<string>(config.activeMode);
  const [activeTheme, setActiveThemeState] = useState<string>(config.activeTheme);
  const [activeLayout, setActiveLayoutState] = useState<string>(config.activeLayout);
  const [isCardShadow, setIsCardShadowState] = useState<boolean>(config.isCardShadow);
  const [isLayout, setIsLayoutState] = useState<string>(config.isLayout);
  const [isBorderRadius, setIsBorderRadiusState] = useState<number>(config.isBorderRadius);
  const [isCollapse, setIsCollapseState] = useState<string>(config.isCollapse);
  const [isLanguage, setIsLanguageState] = useState<string>(config.isLanguage);
  const [isSidebarHover, setIsSidebarHover] = useState<boolean>(false);
  const [isMobileSidebar, setIsMobileSidebar] = useState<boolean>(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const stored = loadSettings();
    if (stored.activeDir) setActiveDirState(stored.activeDir);
    if (stored.activeMode) setActiveModeState(stored.activeMode);
    if (stored.activeTheme) setActiveThemeState(stored.activeTheme);
    if (stored.activeLayout) setActiveLayoutState(stored.activeLayout);
    if (stored.isCardShadow !== undefined) setIsCardShadowState(stored.isCardShadow);
    if (stored.isLayout) setIsLayoutState(stored.isLayout);
    if (stored.isBorderRadius !== undefined) setIsBorderRadiusState(stored.isBorderRadius);
    if (stored.isCollapse) setIsCollapseState(stored.isCollapse);
    if (stored.isLanguage) setIsLanguageState(stored.isLanguage);
    setIsInitialized(true);
  }, []);

  // Wrapper functions that also save to localStorage
  const setActiveDir = (dir: string) => {
    setActiveDirState(dir);
    const stored = loadSettings();
    saveSettings({ ...stored, activeDir: dir });
  };

  const setActiveMode = (mode: string) => {
    setActiveModeState(mode);
    const stored = loadSettings();
    saveSettings({ ...stored, activeMode: mode });
  };

  const setActiveTheme = (theme: string) => {
    setActiveThemeState(theme);
    const stored = loadSettings();
    saveSettings({ ...stored, activeTheme: theme });
  };

  const setActiveLayout = (layout: string) => {
    setActiveLayoutState(layout);
    const stored = loadSettings();
    saveSettings({ ...stored, activeLayout: layout });
  };

  const setIsCardShadow = (shadow: boolean) => {
    setIsCardShadowState(shadow);
    const stored = loadSettings();
    saveSettings({ ...stored, isCardShadow: shadow });
  };

  const setIsLayout = (layout: string) => {
    setIsLayoutState(layout);
    const stored = loadSettings();
    saveSettings({ ...stored, isLayout: layout });
  };

  const setIsBorderRadius = (radius: number) => {
    setIsBorderRadiusState(radius);
    const stored = loadSettings();
    saveSettings({ ...stored, isBorderRadius: radius });
  };

  const setIsCollapse = (collapse: string) => {
    setIsCollapseState(collapse);
    const stored = loadSettings();
    saveSettings({ ...stored, isCollapse: collapse });
  };

  const setIsLanguage = (language: string) => {
    setIsLanguageState(language);
    const stored = loadSettings();
    saveSettings({ ...stored, isLanguage: language });
  };

  // Set attributes immediately
  useEffect(() => {
    if (!isInitialized) return;
    document.documentElement.setAttribute("class", activeMode);
    document.documentElement.setAttribute("dir", activeDir);
    document.documentElement.setAttribute('data-color-theme', activeTheme);
    document.documentElement.setAttribute("data-layout", activeLayout);
    document.documentElement.setAttribute("data-boxed-layout", isLayout);
    document.documentElement.setAttribute("data-sidebar-type", isCollapse);
  }, [isInitialized, activeMode, activeDir, activeTheme, activeLayout, isLayout, isCollapse]);

  return (
    <CustomizerContext.Provider
      value={{
        activeDir,
        setActiveDir,
        activeMode,
        setActiveMode,
        activeTheme,
        setActiveTheme,
        activeLayout,
        setActiveLayout,
        isCardShadow,
        setIsCardShadow,
        isLayout,
        setIsLayout,
        isBorderRadius,
        setIsBorderRadius,
        isCollapse,
        setIsCollapse,
        isLanguage,
        setIsLanguage,
        isSidebarHover,
        setIsSidebarHover,
        isMobileSidebar,
        setIsMobileSidebar
      }}
    >
      {children}
    </CustomizerContext.Provider>
  );
};
