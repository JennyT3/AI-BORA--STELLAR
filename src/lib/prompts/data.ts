export interface Prompt {
  id: string;
  title: string;
  category: string;
  image: string;
  prompt: string;
  isPremium: boolean;
  tags: string[];
}

export const prompts: Prompt[] = [
  {
    id: "1",
    title: "Cybernetic Elegance",
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80",
    prompt: "professional editorial photography of a woman with metallic neural lace, cinematic atmosphere, 8k resolution, photorealistic textures, hyper-detailed cyberpunk aesthetic, volumetric lighting, emerald green and gold accents, dramatic shadows, haute couture fashion photography",
    isPremium: false,
    tags: ["fashion", "portrait", "cyberpunk"]
  },
  {
    id: "2", 
    title: "Liquid Iridescence",
    category: "Abstract",
    image: "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=600&q=80",
    prompt: "abstract liquid metal flow, iridescent pink and dark obsidian, flowing shapes like silk in zero gravity, high contrast, macro photography style, 3d render, octane render, 8k, hyper realistic textures",
    isPremium: false,
    tags: ["abstract", "3d", "liquid"]
  },
  {
    id: "3",
    title: "Modern Brutalism",
    category: "Architecture", 
    image: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&q=80",
    prompt: "minimalist brutalist architecture building at dusk, warm interior lights glowing through floor to ceiling windows, misty atmospheric background, concrete textures, geometric shapes, architectural photography, golden hour lighting",
    isPremium: true,
    tags: ["architecture", "minimalist", "brutalist"]
  },
  {
    id: "4",
    title: "Premium Skincare",
    category: "Product",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80",
    prompt: "premium skincare bottle on a floating stone pedestal, soft morning sunlight, desert landscape background, high-end commercial style, minimalist composition, earth tones, 8k product photography, sharp focus",
    isPremium: true,
    tags: ["product", "commercial", "skincare"]
  },
  {
    id: "5",
    title: "Bioluminescent Wilds",
    category: "Nature",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&q=80",
    prompt: "ethereal forest with giant glowing mushrooms, bioluminescent spores floating in the air, deep purple and teal color palette, fantasy art style, atmospheric fog, cinematic composition, magical lighting, 8k resolution",
    isPremium: true,
    tags: ["nature", "fantasy", "bioluminescent"]
  },
  {
    id: "6",
    title: "Heritage Soul",
    category: "Portrait",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&q=80",
    prompt: "close-up portrait of an elderly man with wisdom lines, wearing traditional ornate robes, soft natural light from a window, documentary photography style, warm tones, shallow depth of field, emotional storytelling",
    isPremium: false,
    tags: ["portrait", "documentary", "lifestyle"]
  }
];
