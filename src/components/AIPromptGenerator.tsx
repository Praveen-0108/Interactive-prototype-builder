import React, { useState, useEffect } from "react";
import { Sparkles, Loader2, ArrowRight } from "lucide-react";
import { Prototype } from "../types";

interface AIPromptGeneratorProps {
  onPrototypeGenerated: (generated: Prototype) => void;
}

const PRESET_IDEAS = [
  { label: "💳 Banking Transfer", prompt: "A secure 3-screen banking wire flow: 1. Balance Overview with a Send Money button, 2. Form to choose recipient & amount, 3. Success dialog with receipt information." },
  { label: "🏃 Fitness tracker", prompt: "A 3-screen activity tracking dashboard: 1. Daily steps, logs list, and Add Workout button, 2. Selection menu of sport types (run, bike, swim), 3. Active maps routing layout with metrics." },
  { label: "💡 Smart Home", prompt: "A 4-screen light and temperature controller: 1. Home dashboard outlining rooms (Kitchen, Bed, Living), 2. Living room detail slider for brightness, 3. Automated schedules, 4. Energy insights." },
  { label: "📦 Product Detail", prompt: "An elegant e-commerce flow: 1. Clean listing grid of high-end headsets, 2. Immersive detail preview with reviews, cart action, and 3. Checkout confirmation popup." }
];

const LOADING_STEPS = [
  "Formulating visual architecture...",
  "Drafting wireframe screen layouts...",
  "Wiring click paths and transition layers...",
  "Applying Tailwind spacing and hex styles...",
  "Aligning interactive hotspots and buttons...",
  "Reviewing against UX design guidelines..."
];

export const AIPromptGenerator: React.FC<AIPromptGeneratorProps> = ({ onPrototypeGenerated }) => {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStepIdx, setLoadingStepIdx] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      interval = setInterval(() => {
        setLoadingStepIdx((prev) => (prev + 1) % LOADING_STEPS.length);
      }, 3000);
    } else {
      setLoadingStepIdx(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleGenerate = async (selectedPrompt?: string) => {
    const textToSubmit = selectedPrompt || prompt;
    if (!textToSubmit.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/generate-prototype", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: textToSubmit })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "An error occurred during prototype creation.");
      }

      if (!data.screens || data.screens.length === 0) {
        throw new Error("AI returned an empty list of screens. Please try a different descriptive prompt.");
      }

      // Convert generated screen names and structures back into a full Prototype object
      const formattedProto: Prototype = {
        id: "ai_generated_" + Date.now(),
        name: data.name || "AI Generated Prototype",
        description: data.description || textToSubmit,
        screens: data.screens,
        startScreenId: data.screens[0].id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      onPrototypeGenerated(formattedProto);
      setPrompt("");
    } catch (err: any) {
      setError(err.message || "Failed to generate visual prototype. Please check key config.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="ai_prompt_container" className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-orange-50 p-2.5 rounded-xl">
          <Sparkles className="w-5 h-5 text-orange-600" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-900 text-lg">Instant AI Wireframe Generator</h3>
          <p className="text-sm text-slate-500">Describe any screen flow to draft structured interactive mockups in seconds.</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <textarea
            id="ai_prompt_textarea"
            className="w-full text-sm border border-slate-200 rounded-xl p-3.5 h-24 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            placeholder="E.g., An elegant coffee shop ordering app. Welcome splash with logo, interactive menu filter for Latte or Espresso, product view with options size, and an animated payment success screen."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={loading}
          />
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 text-xs p-3 rounded-xl border border-red-100">
            <p className="font-medium">Generation Error</p>
            <p className="opacity-90">{error}</p>
            <p className="mt-1 text-[10px] text-red-500">Ensure your server is initialized and GEMINI_API_KEY is active in Settings &gt; Secrets.</p>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {PRESET_IDEAS.map((preset, i) => (
            <button
              key={i}
              type="button"
              className="text-xs bg-slate-50 hover:bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors cursor-pointer"
              onClick={() => {
                setPrompt(preset.prompt);
                handleGenerate(preset.prompt);
              }}
              disabled={loading}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="flex justify-end pt-2">
          <button
            id="btn_submit_ai_generation"
            type="button"
            className="bg-slate-950 hover:bg-slate-900 text-white text-sm font-medium py-2.5 px-5 rounded-xl flex items-center gap-2 transition-all disabled:opacity-55 cursor-pointer"
            onClick={() => handleGenerate()}
            disabled={loading || !prompt.trim()}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-orange-400" />
                <span>{LOADING_STEPS[loadingStepIdx]}</span>
              </>
            ) : (
              <>
                <span>Build Screens</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
