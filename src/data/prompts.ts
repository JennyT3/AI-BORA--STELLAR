export interface Prompt {
  id: string;
  title: string;
  category: string;
  image: string;
  prompt: string;
  isPremium: boolean;
  tags: string[];
}

export type AspectRatio = "1:1" | "4:5" | "16:9" | "9:16";

export const aspectRatios: { value: AspectRatio; label: string }[] = [
  { value: "1:1", label: "Post" },
  { value: "4:5", label: "Feed" },
  { value: "16:9", label: "Wide" },
  { value: "9:16", label: "Story" }
];

export const prompts: Prompt[] = [];

export const categories = [
  "Todos",
  "Fotografia",
  "Retrato",
  "3D",
  "Design",
  "Ilustracao",
  "Produto",
  "Tendencias"
];
