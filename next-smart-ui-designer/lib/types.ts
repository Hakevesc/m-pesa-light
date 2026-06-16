export type ThemeId = 'light' | 'dark';

export type ColorToken = Record<string, string>;

export type TypographyToken = {
  fontSize: string;
  lineHeight: string;
  fontWeight: number;
  letterSpacing?: string;
  textTransform?: string;
};

export type DesignTheme = {
  id: ThemeId;
  label: string;
  colors: ColorToken;
};

export type DesignTokens = {
  version: string;
  spacing: Record<string, string>;
  radius: Record<string, string>;
  shadow: Record<string, string>;
  blur: Record<string, string>;
  stroke: Record<string, string>;
  typography: Record<string, TypographyToken>;
  icons: Record<string, string | number>;
  fonts: string[];
};

export type ScreenStatus = 'legacy-html' | 'next-component' | 'design-system';

export type ScreenDefinition = {
  id: string;
  title: string;
  group: string;
  path: string;
  icon: string;
  status: ScreenStatus;
  sourceFile: string;
};

export type FlowDefinition = {
  id: string;
  label: string;
  description: string;
  icon: string;
  firstScreenId: string;
  screens: string[];
};

export type ComponentVariant = {
  id: string;
  label: string;
  description?: string;
};

export type ComponentDefinition = {
  id: string;
  name: string;
  category: string;
  description: string;
  props: string[];
  variants: string[];
  states: string[];
  tokens: string[];
};

export type ScenarioDefinition = {
  id: string;
  name: string;
  description: string;
  targetScreens: string[];
  type: 'modal' | 'tooltip' | 'toast' | 'state';
  tone: 'success' | 'error' | 'warning' | 'info' | 'primary' | 'neutral';
};
