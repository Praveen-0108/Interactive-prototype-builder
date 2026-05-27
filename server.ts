import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json({ limit: '10mb' }));

const PORT = 3000;

// Initialize Gemini safely from environment variable
let ai: GoogleGenAI | null = null;
const apiKey = process.env.GEMINI_API_KEY;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
} else {
  console.warn("WARNING: GEMINI_API_KEY environment variable is not set. AI features will fail gracefully.");
}

// 1. API: Generate prototype using Gemini
app.post("/api/generate-prototype", async (req: Request, res: Response) => {
  if (!ai) {
    return res.status(500).json({ error: "Gemini API client not initialized. Please configure GEMINI_API_KEY in secrets." });
  }

  const { prompt } = req.body;
  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "Prompt is required and must be a string." });
  }

  try {
    const systemPrompt = `You are an expert UX/UI designer and interactive prototyper.
Your objective is to generate a fully functioning interactive mobile-app prototype matching the user's description.
You MUST produce high quality mock screen layouts designed for a standard 100x100 relative mobile container.
Layout Coordinate Rules:
- The responsive canvas has relative dimensions 0 to 100 for both X (left) and Y (top).
- Elements must fit nicely, with realistic sizes and positions. For example, a standard centered button might have x: 10, y: 80, width: 80, height: 8.
- Ensure buttons, text, inputs, cards, and icons do not overlap messy, but align professionally like a grid.
- Do NOT place multiple elements at the exact same x, y coordinates.
- Ensure interactive links ('action') actually wire screens together. For example, a Login button on the 'login' screen should have a 'navigate' action to the 'home' dashboard screen.

Define nice-looking colors (hex colors like dark navy '#0f172a', elegant white '#ffffff', charcoal text etc.) or tailwind color classes.
Choose modern Lucide-react icons (like 'Home', 'ArrowRight', 'ShoppingCart', 'Settings', 'User', 'Lock', 'Mail', 'Check', 'Plus', 'Menu', 'ChevronRight', 'Info', 'Trash', 'Heart', 'Search').

Provide at least 3-5 screens representing a complete logical flow from the user description. Make sure there is a home screen and a few details/sub-screens.`;

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING, description: "A simple literal name for this prototype" },
        description: { type: Type.STRING, description: "A comprehensive description of what this flow prototype accomplishes" },
        screens: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING, description: "Unique snake_case or short identifier for the screen (e.g., 'welcome', 'login', 'dashboard', 'details')" },
              name: { type: Type.STRING, description: "Beautiful human-readable title of the screen" },
              backgroundColor: { type: Type.STRING, description: "A elegant background color hex string (e.g. '#ffffff', '#f8fafc', '#0f172a')" },
              elements: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING, description: "Unique element id inside the screen" },
                    type: { type: Type.STRING, description: "The type of element: choose from 'button', 'input', 'text', 'image', 'card', 'navbar', 'icon', 'container'" },
                    x: { type: Type.INTEGER, description: "The responsive X position from 0 to 100" },
                    y: { type: Type.INTEGER, description: "The responsive Y position from 0 to 100" },
                    width: { type: Type.INTEGER, description: "The relative width from 0 to 100" },
                    height: { type: Type.INTEGER, description: "The relative height from 0 to 100" },
                    text: { type: Type.STRING, description: "Element inner text, label, or display content" },
                    placeholder: { type: Type.STRING, description: "Optional placeholder text if type is 'input'" },
                    fontSize: { type: Type.INTEGER, description: "Font size weight/indicator in px (typically 12, 14, 16, 18, 24)" },
                    color: { type: Type.STRING, description: "Text hex color (e.g. '#1e293b' or '#ffffff')" },
                    backgroundColor: { type: Type.STRING, description: "Element fill background color hex code (e.g., '#3b82f6', '#f1f5f9', '#22c55e' or transparent)" },
                    iconName: { type: Type.STRING, description: "Case-sensitive Lucide icon name, e.g. 'Search', 'Home', 'ArrowRight', 'Menu'" },
                    action: {
                      type: Type.OBJECT,
                      properties: {
                        type: { type: Type.STRING, description: "Action type: 'navigate', 'submit', 'alert', 'none'" },
                        targetScreenId: { type: Type.STRING, description: "The ID of the screen that this element routes to (e.g., 'dashboard')" },
                        transition: { type: Type.STRING, description: "Animations flow visual choice of: 'slide-left', 'slide-right', 'slide-up', 'fade', 'scale', 'none'" }
                      },
                      required: ["type"]
                    }
                  },
                  required: ["id", "type", "x", "y", "width", "height", "text", "action"]
                }
              }
            },
            required: ["id", "name", "elements"]
          }
        }
      },
      required: ["name", "description", "screens"]
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Build a highly detailed, comprehensive working interactive prototype for this request: "${prompt}"`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response received from Gemini.");
    }

    try {
      const parsedData = JSON.parse(text);
      res.json(parsedData);
    } catch {
      console.error("Failed to parse Gemini JSON output. Raw output was:", text);
      res.status(500).json({ error: "Failed to parse generated layout. AI returned invalid JSON.", details: text });
    }
  } catch (error: any) {
    console.error("AI Generation error:", error);
    res.status(500).json({ error: error.message || "Something went wrong during prototype generation." });
  }
});

// 2. API: Analyze user testing results & review comments
app.post("/api/analyze-test-results", async (req: Request, res: Response) => {
  if (!ai) {
    return res.status(500).json({ error: "Gemini API client not initialized." });
  }

  const { prototype, testSessions, comments } = req.body;
  if (!prototype) {
    return res.status(400).json({ error: "Prototype data is required for review." });
  }

  try {
    const promptMessage = `As an automated UX design researcher, analyze the following interactive prototype structure, the user testing session logs, and specific page comments to provide a structured, professional design review.

Prototype Name: ${prototype.name}
Objective & Description: ${prototype.description}

Screens count: ${prototype.screens?.length || 0}
Screens config: ${JSON.stringify(prototype.screens?.map((s: any) => ({
      id: s.id,
      name: s.name,
      elementsCount: s.elements?.length || 0,
      elementsText: s.elements?.map((e: any) => `${e.text} (${e.type} -> ${e.action?.type})`)
    })))}

User Testing Session Logs:
${JSON.stringify(testSessions)}

User-placed Design Annotations / Comments:
${JSON.stringify(comments)}

Please generate a high-quality feedback analysis including:
1. **Executive Scorecard**: Evaluate layout alignment, ease of interaction flow, and prototype coherence (out of 100).
2. **User Journey & Friction Points**: List any bottlenecks. Mention 'Hotspot Misses' (where users clicked on static non-clickable parts, identifying areas expected to be interactive).
3. **Dead Ends**: Mention if there are screens without buttons back/forward or broken routes.
4. **Actionable Design Recommendations**: Provide concrete improvements (e.g. increase button contrast, rename labels, add a navigation bar, etc.).

Return the response in visually elegant HTML/Markdown text.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptMessage,
    });

    res.json({ analysis: response.text });
  } catch (error: any) {
    console.error("AI Analysis error:", error);
    res.status(500).json({ error: error.message || "Failed to analyze design results." });
  }
});

// Setup Vite Dev server or production static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development Mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production Mode
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
