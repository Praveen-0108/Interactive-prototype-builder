import React, { useState } from "react";
import { UserTestSession, PrototypeScreen, Prototype, ScreenComment } from "../types";
import { Brain, ListFilter, Activity, MessageSquare, Award, AlertCircle, Sparkles, Loader2 } from "lucide-react";

interface TestingDashboardProps {
  activePrototype: Prototype;
  testSessions: UserTestSession[];
  onClearSessions: () => void;
}

export const TestingDashboard: React.FC<TestingDashboardProps> = ({
  activePrototype,
  testSessions,
  onClearSessions
}) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"logs" | "heat" | "comments">("logs");

  // Sum metrics across all sessions
  const totalLogs = testSessions.flatMap((s) => s.logs);
  const totalClicks = totalLogs.filter((l) => l.type === "click").length;
  const totalMisses = totalLogs.filter((l) => l.type === "miss").length;
  const totalNavigations = totalLogs.filter((l) => l.type === "navigation").length;
  const totalCompletions = totalLogs.filter((l) => l.type === "complete").length;

  // Retrieve comments across all screens
  const allComments = activePrototype.screens.flatMap((screen) =>
    screen.comments.map((comment) => ({
      ...comment,
      screenName: screen.name,
      screenId: screen.id
    }))
  );

  // Group misses per screen for a simple friction heat analysis
  const missCountByScreen: Record<string, number> = {};
  totalLogs.forEach((l) => {
    if (l.type === "miss") {
      const screenName = activePrototype.screens.find((s) => s.id === l.screenId)?.name || l.screenId;
      missCountByScreen[screenName] = (missCountByScreen[screenName] || 0) + 1;
    }
  });

  // Check if there are dead end screens in the active prototype
  const potentialDeadEnds = activePrototype.screens.filter((screen) => {
    const hasBackOrForward = screen.elements.some((el) => el.action?.type === "navigate");
    return !hasBackOrForward;
  });

  const triggerAIReport = async () => {
    setAnalyzing(true);
    setAiReport(null);

    try {
      const response = await fetch("/api/analyze-test-results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prototype: activePrototype,
          testSessions: testSessions.slice(-15), // keep body size tight
          comments: allComments
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Analysis failed.");
      }

      setAiReport(data.analysis || "AI was unable to compile the design report.");
    } catch (err: any) {
      setAiReport(`Error launching design review: ${err.message || "Ensure key configuration is correct."}`);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* LEFT COLUMN: ACTIVE SESSIONS METRICS & ANALYSIS CARD */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* STAT SCORECARD */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-orange-600" /> Usability Analytics Recap
            </h3>
            {testSessions.length > 0 && (
              <button
                type="button"
                onClick={onClearSessions}
                className="text-xs text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                Clear Testing Logs
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100/60">
              <span className="block text-2xl font-bold text-slate-800">{testSessions.length}</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Testers</span>
            </div>
            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100/40">
              <span className="block text-2xl font-bold text-emerald-700">{totalClicks}</span>
              <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider font-mono">Hits Registered</span>
            </div>
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-100/40">
              <span className="block text-2xl font-bold text-amber-700">{totalMisses}</span>
              <span className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">Misclicks (Misses)</span>
            </div>
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100/40">
              <span className="block text-2xl font-bold text-blue-700">{totalCompletions}</span>
              <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">Scenario Goal Done</span>
            </div>
          </div>

          {testSessions.length === 0 && (
            <div className="text-center py-10 text-slate-400 text-sm mt-4 border border-dashed border-slate-200 rounded-xl bg-slate-50">
              <AlertCircle className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p className="font-medium">No Usability testing data logged yet.</p>
              <p className="text-xs mt-1 text-slate-400 max-w-sm mx-auto">Toggle into 'Interactive Preview', click simulation buttons, or perform mis-clicks inside the smartphone case to collect testing metadata logs.</p>
            </div>
          )}
        </div>

        {/* DETAILS LISTING PANELS */}
        {testSessions.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
            
            <div className="flex border-b border-slate-100">
              <button
                className={`py-2 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 cursor-pointer transition-colors ${
                  activeTab === "logs" ? "border-orange-600 text-orange-600" : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
                onClick={() => setActiveTab("logs")}
              >
                Detailed Logs ({totalLogs.length})
              </button>
              <button
                className={`py-2 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 cursor-pointer transition-colors ${
                  activeTab === "heat" ? "border-orange-600 text-orange-600" : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
                onClick={() => setActiveTab("heat")}
              >
                Friction Hotspots ({Object.keys(missCountByScreen).length})
              </button>
              <button
                className={`py-2 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 cursor-pointer transition-colors ${
                  activeTab === "comments" ? "border-orange-600 text-orange-600" : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
                onClick={() => setActiveTab("comments")}
              >
                Comments Pins ({allComments.length})
              </button>
            </div>

            {/* TAB CONTENT: LOGS */}
            {activeTab === "logs" && (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {testSessions.map((session) => (
                  <div key={session.id} className="border border-slate-100 rounded-xl p-3 bg-slate-5/40 text-xs">
                    <div className="flex items-center justify-between mb-1.5 border-b border-slate-50 pb-1">
                      <span className="font-semibold text-slate-700">Tester: {session.testerName}</span>
                      <span className="text-[10px] text-slate-400">{new Date(session.startedAt).toLocaleTimeString()}</span>
                    </div>
                    
                    <div className="space-y-1.5 font-mono text-[10px]">
                      {session.logs.map((log) => (
                        <div key={log.id} className="flex gap-2">
                          <span className={`w-16 font-bold ${
                            log.type === "click" ? "text-emerald-600" :
                            log.type === "miss" ? "text-amber-500 font-extrabold" :
                            log.type === "navigation" ? "text-blue-500" : "text-purple-600"
                          }`}>
                            [{log.type.toUpperCase()}]
                          </span>
                          <span className="text-slate-400">Screen ID: "{log.screenId}"</span>
                          <span className="text-slate-700 flex-1">{log.details || log.elementText}</span>
                          <span className="text-slate-400">({log.x}%, {log.y}%)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB CONTENT: FRUCTION HEAT */}
            {activeTab === "heat" && (
              <div className="space-y-3">
                <p className="text-xs text-slate-500 leading-normal">
                  Hotspot Misses flag elements that users tapped heavily, but have no interactions. These often indicate components designed to look clickable but lacking interaction wires.
                </p>
                {Object.keys(missCountByScreen).length === 0 ? (
                  <div className="p-4 text-center text-slate-400 text-xs">No misclicks logged yet! Good design clarity.</div>
                ) : (
                  <div className="space-y-2">
                    {Object.entries(missCountByScreen).map(([screenName, count]) => (
                      <div key={screenName} className="flex items-center justify-between bg-amber-50/50 p-3 rounded-xl border border-amber-100/30 text-xs text-amber-900">
                        <span className="font-medium">Screen: {screenName}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {count} Miss Clicks registered
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: COMMENTS */}
            {activeTab === "comments" && (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {allComments.length === 0 ? (
                  <div className="p-4 text-center text-slate-400 text-xs">No visual comments placed yet. Go to Annotation mode on the phone to place some notes.</div>
                ) : (
                  allComments.map((comment) => (
                    <div key={comment.id} className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs">
                      <div className="flex justify-between font-semibold text-slate-800 mb-1">
                        <span>{comment.author} <span className="font-normal text-slate-400">on Screen:</span> {comment.screenName}</span>
                        <span className="text-[10px] text-slate-400">Coord: ({comment.x}%, {comment.y}%)</span>
                      </div>
                      <p className="text-slate-600 leading-relaxed">{comment.text}</p>
                    </div>
                  ))
                )}
              </div>
            )}

          </div>
        )}
      </div>

      {/* RIGHT COLUMN: AI ANALYST WORKSPACE */}
      <div className="bg-slate-950 text-white rounded-2xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
        
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            <div className="bg-orange-500/10 p-2 rounded-xl border border-orange-500/20">
              <Brain className="w-5 h-5 text-orange-400 animate-pulse" />
            </div>
            <div>
              <span className="block text-xs text-orange-400 uppercase font-bold tracking-wider">AI Design Assistant</span>
              <h4 className="font-semibold text-white text-base">Generate UX Heuristic Review</h4>
            </div>
          </div>

          <p className="text-slate-400 text-xs leading-relaxed">
            Let Gemini review the active screen structure, broken links (dead ends), user testing interaction logs, and feedback notes. It compiles a formal design scorecard evaluation.
          </p>

          {potentialDeadEnds.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-xs text-red-300 space-y-1">
              <p className="font-bold">⚠️ Dead Ends Detected</p>
              <p className="opacity-80">Screens [{potentialDeadEnds.map(s => `"${s.name}"`).join(", ")}] do not contain click interaction elements. Testers will get stuck here!</p>
            </div>
          )}

          {/* AI report output display */}
          {aiReport && (
            <div id="ai_design_report_box" className="bg-slate-900 border border-white/5 rounded-xl p-3.5 max-h-96 overflow-y-auto text-xs whitespace-pre-wrap leading-relaxed text-slate-300">
              <div className="flex items-center gap-1.5 mb-2 font-bold text-orange-400 border-b border-white/5 pb-1">
                <Sparkles className="w-4 h-4" /> AI Report Compiled
              </div>
              {aiReport}
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-white/5">
          <button
            id="btn_trigger_ai_review"
            type="button"
            className="w-full bg-orange-600 hover:bg-orange-500 active:scale-98 text-white text-xs font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            disabled={analyzing}
            onClick={triggerAIReport}
          >
            {analyzing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Running Heuristic Audit...</span>
              </>
            ) : (
              <>
                <span>Request AI Design Audit</span>
                <Sparkles className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>

      </div>

    </div>
  );
};
