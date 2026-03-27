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
  // LIBRES (20)
  {
    id: "1",
    title: "Cybernetic Elegance",
    category: "Fotografia",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&q=80",
    prompt: "professional editorial photography of a woman with metallic neural lace, cinematic atmosphere, 8k resolution, photorealistic textures, hyper-detailed cyberpunk aesthetic, volumetric lighting, emerald green and gold accents, dramatic shadows, haute couture fashion photography",
    isPremium: false,
    tags: ["fashion", "portrait", "cyberpunk"]
  },
  {
    id: "2", 
    title: "Liquid Gold",
    category: "3D",
    image: "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=600&q=80",
    prompt: "abstract liquid metal flow, iridescent gold and amber, flowing shapes like silk in zero gravity, high contrast, macro photography style, 3d render, octane render, 8k, hyper realistic textures",
    isPremium: false,
    tags: ["abstract", "3d", "gold"]
  },
  {
    id: "3",
    title: "Neon Portrait",
    category: "Retrato",
    image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&q=80",
    prompt: "portrait with neon lighting, cyberpunk aesthetic, vibrant pink and blue reflections, dramatic shadows, editorial fashion photography, 8k resolution, photorealistic skin textures",
    isPremium: false,
    tags: ["portrait", "neon", "cyberpunk"]
  },
  {
    id: "4",
    title: "Abstract Waves",
    category: "Ilustracao",
    image: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=600&q=80",
    prompt: "abstract flowing waves, gradient colors from deep purple to orange, digital art style, smooth curves, modern illustration, vibrant colors, artistic composition",
    isPremium: false,
    tags: ["abstract", "illustration", "gradient"]
  },
  {
    id: "5",
    title: "Coffee Brand",
    category: "Produto",
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80",
    prompt: "premium coffee bag mockup on marble surface, warm morning light, rustic wooden background, artisan coffee branding, professional product photography, earthy tones",
    isPremium: false,
    tags: ["coffee", "branding", "product"]
  },
  {
    id: "6",
    title: "Mountain Vista",
    category: "Fotografia",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
    prompt: "majestic mountain landscape at golden hour, snow-capped peaks, dramatic clouds, cinematic wide angle, nature photography, 8k resolution, atmospheric perspective",
    isPremium: false,
    tags: ["landscape", "mountains", "nature"]
  },
  {
    id: "7",
    title: "Tech Interface",
    category: "Design",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&q=80",
    prompt: "futuristic UI dashboard design, dark mode interface, neon accents, data visualization, holographic elements, clean typography, professional web design mockup",
    isPremium: false,
    tags: ["ui", "dashboard", "futuristic"]
  },
  {
    id: "8",
    title: "Street Style",
    category: "Retrato",
    image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600&q=80",
    prompt: "urban street fashion photography, candid moment, vibrant city background, natural lighting, trendy outfit, lifestyle editorial, 35mm film aesthetic",
    isPremium: false,
    tags: ["street", "fashion", "lifestyle"]
  },
  {
    id: "9",
    title: "Geometric 3D",
    category: "3D",
    image: "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=600&q=80",
    prompt: "abstract geometric shapes floating in space, soft pastel gradients, 3d render, minimal composition, studio lighting, modern art direction, clean aesthetic",
    isPremium: false,
    tags: ["3d", "geometric", "abstract"]
  },
  {
    id: "10",
    title: "Wine Bottle",
    category: "Produto",
    image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&q=80",
    prompt: "elegant wine bottle product shot, dark moody lighting, crystal glass reflections, luxury beverage photography, black background, professional studio setup",
    isPremium: false,
    tags: ["wine", "luxury", "beverage"]
  },
  {
    id: "11",
    title: "Ocean Sunset",
    category: "Fotografia",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80",
    prompt: "dramatic ocean sunset, waves crashing on rocks, orange and purple sky, long exposure photography, coastal landscape, serene atmosphere, 8k detail",
    isPremium: false,
    tags: ["ocean", "sunset", "seascape"]
  },
  {
    id: "12",
    title: "App Mockup",
    category: "Design",
    image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&q=80",
    prompt: "mobile app interface mockup, smartphone floating in hand, clean background, professional presentation, ui/ux design showcase, modern minimal style",
    isPremium: false,
    tags: ["app", "mockup", "mobile"]
  },
  {
    id: "13",
    title: "Portrait Studio",
    category: "Retrato",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=80",
    prompt: "professional studio portrait, soft box lighting, neutral gray background, sharp focus on eyes, high-end fashion photography, clean retouching",
    isPremium: false,
    tags: ["studio", "portrait", "professional"]
  },
  {
    id: "14",
    title: "Fluid Art",
    category: "Ilustracao",
    image: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600&q=80",
    prompt: "fluid acrylic pour painting, cells and wisps, vibrant color mixing, abstract expressionism, high resolution texture, artistic background",
    isPremium: false,
    tags: ["fluid", "art", "colorful"]
  },
  {
    id: "15",
    title: "Watch Detail",
    category: "Produto",
    image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&q=80",
    prompt: "luxury wristwatch macro photography, intricate dial details, leather strap texture, dramatic side lighting, premium product shot, shallow depth of field",
    isPremium: false,
    tags: ["watch", "luxury", "macro"]
  },
  {
    id: "16",
    title: "Forest Path",
    category: "Fotografia",
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=80",
    prompt: "mystical forest path, morning fog filtering through trees, sun rays, green canopy, nature photography, serene woodland scene, atmospheric depth",
    isPremium: false,
    tags: ["forest", "nature", "path"]
  },
  {
    id: "17",
    title: "Brand Identity",
    category: "Design",
    image: "https://images.unsplash.com/photo-1600607686527-6fb886090705?w=600&q=80",
    prompt: "brand identity mockup flat lay, business cards, letterhead, envelope, cohesive design system, professional branding presentation, clean white background",
    isPremium: false,
    tags: ["branding", "identity", "mockup"]
  },
  {
    id: "18",
    title: "Cinematic Car",
    category: "Fotografia",
    image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&q=80",
    prompt: "cinematic car photography, sleek sports vehicle, dramatic lighting, wet reflective surface, automotive commercial, high-end luxury aesthetic, 8k resolution",
    isPremium: false,
    tags: ["car", "automotive", "cinematic"]
  },
  {
    id: "19",
    title: "Glass Renders",
    category: "3D",
    image: "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=600&q=80",
    prompt: "transparent glass objects, caustic light effects, 3d render, minimal scene, refraction and dispersion, clean studio environment, product visualization",
    isPremium: false,
    tags: ["glass", "3d", "caustics"]
  },
  {
    id: "20",
    title: "Urban Night",
    category: "Fotografia",
    image: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=600&q=80",
    prompt: "urban night photography, city lights bokeh, neon signs, wet streets reflection, cyberpunk atmosphere, street scene, cinematic color grading",
    isPremium: false,
    tags: ["night", "urban", "city"]
  },
  // PREMIUM (4 bloqueados)
  {
    id: "21",
    title: "Luxury Villa",
    category: "Fotografia",
    image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&q=80",
    prompt: "luxury modern villa exterior, infinity pool, sunset ocean view, architectural photography, high-end real estate, dramatic lighting, professional composition",
    isPremium: true,
    tags: ["architecture", "luxury", "villa"]
  },
  {
    id: "22",
    title: "Diamond Jewelry",
    category: "Produto",
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80",
    prompt: "diamond ring macro photography, brilliant cut sparkle, black velvet background, luxury jewelry commercial, studio lighting, extreme detail, 8k resolution",
    isPremium: true,
    tags: ["jewelry", "diamond", "luxury"]
  },
  {
    id: "23",
    title: "Astronaut 3D",
    category: "3D",
    image: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=600&q=80",
    prompt: "astronaut floating in space, earth reflection in helmet, cinematic 3d render, volumetric lighting, cosmic atmosphere, hyper realistic textures, sci-fi art",
    isPremium: true,
    tags: ["space", "astronaut", "sci-fi"]
  },
  {
    id: "24",
    title: "Fashion Week",
    category: "Retrato",
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&q=80",
    prompt: "high fashion runway photography, model in avant-garde outfit, dramatic pose, professional fashion week coverage, editorial style, bold colors, haute couture",
    isPremium: true,
    tags: ["fashion", "runway", "editorial"]
  }
];

export const categories = [
  "Todos",
  "Produto e Marca", 
  "Fotografia",
  "Design",
  "Retrato",
  "Ilustracao",
  "3D",
  "Tendencias"
];
