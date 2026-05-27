import { useState, useEffect } from "react";
import { INITIAL_PROTOTYPE } from "./initialData";
import { Prototype, PrototypeScreen, UIElement, ScreenComment, UserTestSession, UserTestLog } from "./types";
import { DeviceSimulator } from "./components/DeviceSimulator";
import { SidebarEditor } from "./components/SidebarEditor";
import { AIPromptGenerator } from "./components/AIPromptGenerator";
import { TestingDashboard } from "./components/TestingDashboard";
import { 
  Play, 
  Settings, 
  Award, 
  HelpCircle, 
  Eye, 
  EyeOff, 
  RotateCcw, 
  Wrench, 
  CheckCircle2, 
  Sparkles, 
  ClipboardList, 
  Smartphone,
  ChevronRight,
  MousePointerClick
} from "lucide-react";

export default function App() {
  // --- STATE ---
  const [prototype, setPrototype] = useState<Prototype>(() => {
    const saved = localStorage.getItem("protocraft_saved_prototype");
    return saved ? JSON.parse(saved) : INITIAL_PROTOTYPE;
  });

  const [activeScreenId, setActiveScreenId] = useState<string>(() => {
    const saved = localStorage.getItem("protocraft_saved_prototype");
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.startScreenId || parsed.screens[0]?.id;
    }
    return INITIAL_PROTOTYPE.startScreenId;
  });

  const [currentTab, setCurrentTab] = useState<"design" | "insights">("design");
  
  // Simulation controllers
  const [addCommentMode, setAddCommentMode] = useState(false);
  const [showHotspots, setShowHotspots] = useState(true);
  
  // Usability test tracking State
  const [testSessions, setTestSessions] = useState<UserTestSession[]>(() => {
    const saved = localStorage.getItem("protocraft_test_sessions");
    return saved ? JSON.parse(saved) : [];
  });
  
  const [currentSession, setCurrentSession] = useState<UserTestSession | null>(null);
  const [testerNameInput, setTesterNameInput] = useState("");
  const [startTestModal, setStartTestModal] = useState(false);

  // --- PERSISTENCE ---
  useEffect(() => {
    localStorage.setItem("protocraft_saved_prototype", JSON.stringify(prototype));
  }, [prototype]);

  useEffect(() => {
    localStorage.setItem("protocraft_test_sessions", JSON.stringify(testSessions));
  }, [testSessions]);

  // --- ACTIONS ---

  // Handle direct navigation in live simulator
  const handleSimulatorNavigate = (targetScreenId: string, transition: string) => {
    setActiveScreenId(targetScreenId);
  };

  // Add Comment Pin
  const handleAddComment = (commentFields: Omit<ScreenComment, "id" | "createdAt">) => {
    const freshComment: ScreenComment = {
      ...commentFields,
      id: "comment_" + Date.now(),
      createdAt: new Date().toISOString()
    };

    setPrototype((prev) => {
      const updatedScreens = prev.screens.map((screen) => {
        if (screen.id === activeScreenId) {
          return {
            ...screen,
            comments: [...(screen.comments || []), freshComment]
          };
        }
        return screen;
      });

      return { ...prev, screens: updatedScreens };
    });

    setAddCommentMode(false); // Disable mode once dropped
  };

  // Log user clicks & misclicks inside dynamic test recorder
  const handleAddTrackLog = (logFields: Omit<UserTestLog, "id" | "timestamp">) => {
    if (!currentSession) return;

    const newLog: UserTestLog = {
      id: "log_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
      timestamp: new Date().toISOString(),
      ...logFields
    };

    setCurrentSession((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        logs: [...prev.logs, newLog]
      };
    });
  };

  // Starts real usability test recording
  const handleStartUsabilityTest = () => {
    if (!testerNameInput.trim()) {
      alert("Please give a Tester Identifier Name.");
      return;
    }

    const freshSession: UserTestSession = {
      id: "sess_" + Date.now(),
      testerName: testerNameInput.trim(),
      startedAt: new Date().toISOString(),
      status: "active",
      logs: [
        {
          id: "log_init_" + Date.now(),
          timestamp: new Date().toISOString(),
          type: "start",
          screenId: prototype.startScreenId,
          x: 0,
          y: 0,
          details: `Tester '${testerNameInput.trim()}' initiated usability test scenario.`
        }
      ]
    };

    setCurrentSession(freshSession);
    setActiveScreenId(prototype.startScreenId); // start simulation from very beginning!
    setAddCommentMode(false); // disable annotations during execution
    setStartTestModal(false);
  };

  // Submit test session log
  const handleEndUsabilityTest = (status: "completed" | "abandoned") => {
    if (!currentSession) return;

    const completedSession: UserTestSession = {
      ...currentSession,
      completedAt: new Date().toISOString(),
      status: status
    };

    setTestSessions((prev) => [...prev, completedSession]);
    setCurrentSession(null);
    setTesterNameInput("");
    
    // Auto route to reports dashboard
    setCurrentTab("insights");
    alert("Usability test session recorded successfully! Toggling metrics view.");
  };

  // Clear session databases
  const handleClearSessions = () => {
    if (confirm("Are you sure you want to scrub all tester activity logs? This clears charts stats.")) {
      setTestSessions([]);
      localStorage.removeItem("protocraft_test_sessions");
    }
  };

  // Preset prototype override
  const handleResetToDefault = () => {
    if (confirm("Revert your alterations and reset project to default YumExpress food delivery template?")) {
      setPrototype(INITIAL_PROTOTYPE);
      setActiveScreenId(INITIAL_PROTOTYPE.startScreenId);
      localStorage.removeItem("protocraft_saved_prototype");
    }
  };

  // AIPrompt callback imports completely new prototype
  const handleAIScreensGenerated = (generatedProto: Prototype) => {
    setPrototype(generatedProto);
    setActiveScreenId(generatedProto.startScreenId);
    setTestSessions([]); // reset log since layout structure completely changed
    alert(`Success! "${generatedProto.name}" AI wires generated. Standard start screen set: "${generatedProto.screens[0]?.name}".`);
  };

  // --- ELEMENT CREATION & INSPECTION FUNCTIONS ---

  const handleSetStartScreen = (id: string) => {
    setPrototype((prev) => ({ ...prev, startScreenId: id }));
  };

  const handleAddScreen = (name: string, bgColor: string) => {
    const id = "scr_" + Date.now().toString().slice(-6);
    const newScreen: PrototypeScreen = {
      id: id,
      name: name,
      backgroundColor: bgColor,
      elements: [],
      comments: []
    };

    setPrototype((prev) => ({
      ...prev,
      screens: [...prev.screens, newScreen]
    }));
    setActiveScreenId(id);
  };

  const handleDeleteScreen = (id: string) => {
    setPrototype((prev) => {
      // Don't delete if it is the only screen left
      if (prev.screens.length <= 1) return prev;
      
      const filtered = prev.screens.filter((s) => s.id !== id);
      const isStartBeingDeleted = prev.startScreenId === id;
      const nextStartScreen = isStartBeingDeleted ? filtered[0].id : prev.startScreenId;

      // Clean dangling references inside actions navigating to this screen
      const scrubbed = filtered.map((screen) => {
        const cleanedElements = screen.elements.map((el) => {
          if (el.action.type === "navigate" && el.action.targetScreenId === id) {
            return {
              ...el,
              action: { ...el.action, type: "none" as const, targetScreenId: undefined }
            };
          }
          return el;
        });
        return { ...screen, elements: cleanedElements };
      });

      return {
        ...prev,
        screens: scrubbed,
        startScreenId: nextStartScreen
      };
    });
  };

  const handleAddElement = (type: UIElement["type"]) => {
    // Generate centered relative coordinates for ease of click & adjustment
    const id = `${type}_${Date.now().toString().slice(-4)}`;
    
    // Set standard templates per component type
    let defaultText = "Click Here";
    let defaultColor = "#ffffff";
    let defaultBG = "#3b82f6"; // blue
    let iconName = undefined;

    if (type === "input") {
      defaultText = "";
      defaultColor = "#1e293b";
      defaultBG = "#ffffff";
    } else if (type === "text") {
      defaultText = "Interactive Label Block";
      defaultColor = "#1e293b";
      defaultBG = "transparent";
    } else if (type === "card") {
      defaultText = "Informative Item card element detail container";
      defaultColor = "#1e293b";
      defaultBG = "#ffffff";
    } else if (type === "container") {
      defaultText = "";
      defaultColor = "#334155";
      defaultBG = "#f1f5f9";
    } else if (type === "icon") {
      defaultText = "Home Label";
      defaultColor = "#475569";
      defaultBG = "transparent";
      iconName = "Home";
    }

    const newElement: UIElement = {
      id: id,
      type: type,
      x: 15,
      y: 40,
      width: 70,
      height: type === "container" || type === "card" ? 18 : 8,
      text: defaultText,
      fontSize: 14,
      color: defaultColor,
      backgroundColor: defaultBG,
      borderRadius: type === "button" || type === "input" ? 8 : 4,
      borderWidth: type === "input" || type === "container" ? 1 : undefined,
      borderColor: type === "input" || type === "container" ? "#cbd5e1" : undefined,
      iconName: iconName,
      action: { type: "none" }
    };

    setPrototype((prev) => {
      const updatedScreens = prev.screens.map((screen) => {
        if (screen.id === activeScreenId) {
          return {
            ...screen,
            elements: [...screen.elements, newElement]
          };
        }
        return screen;
      });

      return { ...prev, screens: updatedScreens };
    });
  };

  const handleUpdateElement = (elementId: string, updatedFields: Partial<UIElement>) => {
    setPrototype((prev) => {
      const updatedScreens = prev.screens.map((screen) => {
        if (screen.id === activeScreenId) {
          const updatedElements = screen.elements.map((el) => {
            if (el.id === elementId) {
              return { ...el, ...updatedFields };
            }
            return el;
          });
          return { ...screen, elements: updatedElements };
        }
        return screen;
      });

      return { ...prev, screens: updatedScreens };
    });
  };

  const handleDeleteElement = (elementId: string) => {
    setPrototype((prev) => {
      const updatedScreens = prev.screens.map((screen) => {
        if (screen.id === activeScreenId) {
          const filteredElements = screen.elements.filter((el) => el.id !== elementId);
          return { ...screen, elements: filteredElements };
        }
        return screen;
      });

      return { ...prev, screens: updatedScreens };
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-4 md:p-8">
      
      {/* HEADER SECTION */}
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 pb-5 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-orange-600 text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md">
              V2.5 Live
            </span>
            <span className="text-slate-400 text-xs font-mono">ID: {prototype.id}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">{prototype.name}</h1>
          <p className="text-slate-500 text-xs md:text-sm mt-1 max-w-2xl leading-normal">{prototype.description}</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Preset rollback reset option */}
          <button
            type="button"
            title="Reset to food express template"
            onClick={handleResetToDefault}
            className="p-2.5 text-slate-500 hover:text-slate-700 bg-white border border-slate-200 rounded-xl transition-all hover:shadow-xs flex items-center justify-center cursor-pointer text-xs font-medium gap-1"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Template</span>
          </button>
        </div>
      </header>

      {/* CORE WORKSPACE NAV TABS */}
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 mb-6">
        
        {/* Navigation Selector Buttons */}
        <div className="flex bg-slate-200/60 p-1 rounded-xl">
          <button
            onClick={() => setCurrentTab("design")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              currentTab === "design"
                ? "bg-white text-slate-950 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Wrench className="w-4 h-4 text-slate-500" />
            <span>Interactive Designer Canvas</span>
          </button>
          <button
            onClick={() => setCurrentTab("insights")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              currentTab === "insights"
                ? "bg-white text-slate-950 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Award className="w-4 h-4 text-slate-500" />
            <span>Testing & AI UX Audits</span>
            {testSessions.length > 0 && (
              <span className="bg-orange-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold font-mono">
                {testSessions.length}
              </span>
            )}
          </button>
        </div>

        {/* Hotspot triggers */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => setShowHotspots(!showHotspots)}
            className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 font-medium cursor-pointer transition-colors ${
              showHotspots 
                ? "bg-orange-50 border-orange-200 text-orange-700" 
                : "bg-white border-slate-200 text-slate-500"
            }`}
          >
            {showHotspots ? (
              <>
                <Eye className="w-4 h-4" />
                <span>Show Blue Hotspots</span>
              </>
            ) : (
              <>
                <EyeOff className="w-4 h-4" />
                <span>Blind Tester mode (Off)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* WORKSPACE AREA */}
      <main className="max-w-7xl mx-auto">
        
        {currentTab === "design" ? (
          /* DESIGN WORKSPACE VIEW */
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
            
            {/* LEFT / CENTER COLUMN: PHONE PREVIEW SIMULATION (7/12 cols width) */}
            <div className="xl:col-span-7 flex flex-col items-center">
              
              {/* INTERACTIVE CONTROLLER BANNER */}
              <div className="w-full bg-white rounded-2xl border border-slate-100 p-4 shadow-xs mb-6 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base flex items-center gap-1.5">
                      <Smartphone className="w-5 h-5 text-slate-600" />
                      Active: {prototype.screens.find(s => s.id === activeScreenId)?.name || "Screen View"}
                    </h3>
                    <p className="text-slate-400 text-xs mt-0.5">Use properties sidebar to edit, or interact directly with phone buttons.</p>
                  </div>

                  {/* USER USABILITY TEST CONTROL PANEL */}
                  <div className="flex flex-wrap items-center gap-2">
                    {currentSession ? (
                      <div className="flex items-center gap-2 bg-red-50 border border-red-100 p-1.5 rounded-xl">
                        <span className="text-xs font-bold text-red-600 animate-pulse flex items-center gap-1">
                          <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
                          Testing: {currentSession.testerName}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleEndUsabilityTest("completed")}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-2.5 py-1 rounded-lg cursor-pointer"
                        >
                          Complete test
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEndUsabilityTest("abandoned")}
                          className="text-slate-500 hover:text-slate-800 text-[10px] px-1 py-0.5"
                        >
                          Aband.
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setStartTestModal(true)}
                        className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm hover:translate-y-[-1px] transition-all cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 text-orange-400" />
                        <span>Conduct Usability Test</span>
                      </button>
                    )}

                    {/* Annotation toggles */}
                    <button
                      type="button"
                      onClick={() => setAddCommentMode(!addCommentMode)}
                      className={`text-xs px-3 py-2 rounded-xl border font-bold cursor-pointer transition-all ${
                        addCommentMode
                          ? "bg-amber-100 border-amber-300 text-amber-800 shadow-inner"
                          : "bg-white hover:bg-slate-50 text-slate-600 border-slate-200"
                      }`}
                    >
                      💬 Annotation
                    </button>
                  </div>
                </div>
              </div>

              {/* PHONE MOCKUP OVERLAY CONTAINER */}
              <DeviceSimulator
                screens={prototype.screens}
                activeScreenId={activeScreenId}
                onNavigate={handleSimulatorNavigate}
                addCommentMode={addCommentMode}
                onAddComment={handleAddComment}
                testingActive={!!currentSession}
                onAddTrackLog={handleAddTrackLog}
                showHotspots={showHotspots}
              />
            </div>

            {/* RIGHT COLUMN: FIGMA EDITOR SIDEBAR + AI GENERATOR (5/12 cols width) */}
            <div className="xl:col-span-5 space-y-6">
              
              {/* AI Copilot Prompt */}
              <AIPromptGenerator onPrototypeGenerated={handleAIScreensGenerated} />

              {/* Visual Layout Manager Properties sidebar */}
              <SidebarEditor
                screens={prototype.screens}
                activeScreenId={activeScreenId}
                startScreenId={prototype.startScreenId}
                onSetStartScreen={handleSetStartScreen}
                onScreenSelect={setActiveScreenId}
                onAddScreen={handleAddScreen}
                onDeleteScreen={handleDeleteScreen}
                onAddElement={handleAddElement}
                onUpdateElement={handleUpdateElement}
                onDeleteElement={handleDeleteElement}
              />
            </div>

          </div>
        ) : (
          /* INSIGHTS & AI AUDITS METRICS VIEW */
          <div className="space-y-6">
            <TestingDashboard
              activePrototype={prototype}
              testSessions={testSessions}
              onClearSessions={handleClearSessions}
            />
          </div>
        )}
      </main>

      {/* MODAL: START TEST */}
      {startTestModal && (
        <div className="fixed inset-0 bg-slate-950/60 flex items-center justify-center p-4 z-[999]">
          <div className="bg-white rounded-2xl p-6 shadow-2xl border border-slate-100 max-w-md w-full text-slate-800 space-y-4">
            
            <div className="flex items-center gap-2 text-slate-900">
              <ClipboardList className="w-5 h-5 text-orange-600" />
              <h3 className="font-bold text-lg">Initiate Usability Tester scenario</h3>
            </div>
            
            <p className="text-slate-500 text-xs leading-normal">
              Conduct interactive user test sessions. The testing suite records user journey paths, navigation step timing, and "hotspot mis-clicks" (clicking on design areas waiting to be interactive), enabling you to extract precision UX feedback analytics.
            </p>

            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Tester Identifier Name:</label>
                <input
                  type="text"
                  placeholder="E.g., Kevin (Prototyping Tester) or Beta-User-09"
                  className="w-full border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                  value={testerNameInput}
                  onChange={(e) => setTesterNameInput(e.target.value)}
                />
              </div>

              <div className="bg-orange-50 text-orange-800 p-3 rounded-xl border border-orange-100 text-xs">
                <p className="font-semibold flex items-center gap-1 mb-0.5">
                  <Play className="w-3.5 h-3.5 text-orange-600" /> Next Workflow Action:
                </p>
                <p className="opacity-90">Inside the simulation preview, conduct tasks naturally. The simulator will flash dots indicating click points. Push 'Complete test' at the top when you reach the final screen.</p>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                className="text-xs bg-slate-100 text-slate-700 font-medium px-4 py-2 rounded-xl cursor-pointer hover:bg-slate-200"
                onClick={() => setStartTestModal(false)}
              >
                Go Back
              </button>
              <button
                type="button"
                className="text-xs bg-slate-950 text-white font-medium px-4 py-2 rounded-xl cursor-pointer hover:bg-slate-900"
                onClick={handleStartUsabilityTest}
                disabled={!testerNameInput.trim()}
              >
                Launch Test Log
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
