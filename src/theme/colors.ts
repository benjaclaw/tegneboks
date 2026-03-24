export const colors = {
  primary: "#FF6B8A",
  secondary: "#6BC5FF",
  accent: "#FFD93D",
  background: "#FFF8F0",
  surface: "#FFFFFF",
  canvas: "#FFFFFF",
  toolbar: "#FFF0E6",
  border: "#FFE0CC",
  shadow: "rgba(255, 107, 138, 0.15)",
  danger: "#FF6B6B",
  success: "#51CF66",
  text: "#2C2C2C",
} as const;

export const drawingColors = [
  "#FF4444", // Rød
  "#FF8C42", // Oransje
  "#FFD93D", // Gul
  "#A8E06C", // Lime
  "#51CF66", // Grønn
  "#38D9A9", // Turkis
  "#4DABF7", // Blå
  "#5C7CFA", // Indigo
  "#9775FA", // Lilla
  "#F06595", // Rosa
  "#8B5E3C", // Brun
  "#2C2C2C", // Svart
] as const;

export const neonColors = [
  "#39FF14", // Neongrønn
  "#FF6EC7", // Neonrosa
  "#04D9FF", // Neonblå
] as const;

export const pastelColors = [
  "#FFB6C1", // Pastell-rosa
  "#AEC6CF", // Pastell-blå
  "#77DD77", // Pastell-grønn
  "#B39EB5", // Pastell-lilla
] as const;

export const glitterColors = [
  "#FFD700", // Gull
  "#C0C0C0", // Sølv
  "#B76E79", // Rosé-gull
] as const;

export interface ColorGroup {
  label: string;
  colors: readonly string[];
}

export const colorGroups: ColorGroup[] = [
  { label: "Standard", colors: drawingColors },
  { label: "Neon", colors: neonColors },
  { label: "Pastell", colors: pastelColors },
  { label: "Glitter", colors: glitterColors },
];

export const penSizes = {
  thin: 2,
  medium: 5,
  thick: 10,
} as const;
