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

export const prompts: Prompt[] = [
  {
    id: "static-1",
    title: "Cinematic portrait",
    category: "Portrait",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop",
    prompt: "Cinematic portrait of a person, soft lighting, highly detailed, 8k, professional photography",
    isPremium: false,
    tags: ["portrait", "cinematic", "photography"]
  },
  {
    id: "static-2",
    title: "Futuristic landscape",
    category: "3D",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop",
    prompt: "Futuristic landscape with glowing neon lights, cyberpunk style, digital art, ultra detailed",
    isPremium: false,
    tags: ["3d", "futuristic", "cyberpunk"]
  },
  {
    id: "static-3",
    title: "Minimalist logo design",
    category: "Design",
    image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&auto=format&fit=crop",
    prompt: "Minimalist logo design for a tech company, clean lines, modern aesthetic, vector style",
    isPremium: false,
    tags: ["design", "logo", "minimal"]
  }
];

export const categories = [
  "All",
  "Photography",
  "Portrait",
  "3D",
  "Design",
  "Illustration",
  "Product",
  "Trends"
];
