import themesData from '@/data/themes.json';
import tokensData from '@/data/tokens.json';
import screensData from '@/data/screens.json';
import flowsData from '@/data/flows.json';
import componentsData from '@/data/components.json';
import scenariosData from '@/data/scenarios.json';
import type {
  ComponentDefinition,
  DesignTheme,
  DesignTokens,
  FlowDefinition,
  ScenarioDefinition,
  ScreenDefinition
} from './types';

export const themes = themesData.themes as Record<string, DesignTheme>;
export const designTokens = tokensData as DesignTokens;
export const screens = screensData.screens as ScreenDefinition[];
export const flows = flowsData.flows as FlowDefinition[];
export const components = componentsData.components as ComponentDefinition[];
export const scenarios = scenariosData.scenarios as ScenarioDefinition[];

export function getScreenById(id: string) {
  return screens.find((screen) => screen.id === id) ?? screens[0];
}

export function getFlowById(id: string) {
  return flows.find((flow) => flow.id === id) ?? flows[0];
}

export function getScreenPath(screenId: string) {
  return getScreenById(screenId).path;
}

export function getFirstScreenForFlow(flowId: string) {
  const flow = getFlowById(flowId);
  return getScreenById(flow.firstScreenId);
}

export function groupScreensByGroup() {
  return screens.reduce<Record<string, ScreenDefinition[]>>((groups, screen) => {
    groups[screen.group] = groups[screen.group] ?? [];
    groups[screen.group].push(screen);
    return groups;
  }, {});
}

export function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
