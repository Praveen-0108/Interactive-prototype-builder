import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import * as Icons from "lucide-react";
import { PrototypeScreen, UIElement, ScreenComment, UserTestLog } from "../types";

// Dynamic Lucide-react Icon helper
const DynamicIcon: React.FC<{ name: string; className?: string }> = ({ name, className = "w-5 h-5" }) => {
  const IconComponent = (Icons as Record<string, any>)[name];
  if (!IconComponent) return <Icons.HelpCircle className={className} />;
  return <IconComponent className={className} />;
};

interface DeviceSimulatorProps {
  screens: PrototypeScreen[];
  activeScreenId: string;
  onNavigate: (targetScreenId: string, transition: string) => void;
  // Feedback
  addCommentMode: boolean;
  onAddComment: (comment: Omit<ScreenComment, "id" | "createdAt">) => void;
  // User testing
  testingActive: boolean;
  onAddTrackLog: (log: Omit<UserTestLog, "id" | "timestamp">) => void;
  showHotspots: boolean;
}

export const DeviceSimulator: React.FC<DeviceSimulatorProps> = ({
  screens,
  activeScreenId,
  onNavigate,
  addCommentMode,
  onAddComment,
  testingActive,
  onAddTrackLog,
  showHotspots
}) => {
  const [typedInputs, setTypedInputs] = useState<Record<string, string>>({});
  const [clickFlashElementId, setClickFlashElementId] = useState<string | null>(null);
  const [missClickAnim, setMissClickAnim] = useState<{ x: number; y: number } | null>(null);
  
  // Annotation typing dialog
  const [hoverComment, setHoverComment] = useState<string | null>(null);
  const [newCommentCoords, setNewCommentCoords] = useState<{ x: number; y: number } | null>(null);
  const [newCommentText, setNewCommentText] = useState("");
  const [newCommentAuthor, setNewCommentAuthor] = useState("");

  const activeScreen = screens.find((s) => s.id === activeScreenId) || screens[0];
  const containerRef = useRef<HTMLDivElement>(null);

  // Transition settings based on action
  const [transitionType, setTransitionType] = useState<string>("none");

  // Reset inputs when running screens
  useEffect(() => {
    setTypedInputs({});
  }, [activeScreenId]);

  if (!activeScreen) {
    return (
      <div className="flex items-center justify-center h-96 bg-slate-100 rounded-2xl border border-slate-200">
        <p className="text-slate-500 text-sm">No screens designed yet. Generate or add a screen!</p>
      </div>
    );
  }

  // Handle clicking inside the simulated mobile viewport
  const handleViewportClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    
    // Bounds
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    // 1. If in Add Comment Mode, trigger coordinate pin drop dialog
    if (addCommentMode) {
      setNewCommentCoords({ x: Math.round(clickX), y: Math.round(clickY) });
      return;
    }

    // 2. Interaction evaluation: Find out if we clicked an element
    const clickedElement = [...activeScreen.elements]
      .reverse() // check overlapping topmost first
      .find((el) => {
        return (
          clickX >= el.x &&
          clickX <= el.x + el.width &&
          clickY >= el.y &&
          clickY <= el.y + el.height
        );
      });

    if (clickedElement) {
      const { action } = clickedElement;
      
      // Let's flash the element slightly for interactive feedback
      setClickFlashElementId(clickedElement.id);
      setTimeout(() => setClickFlashElementId(null), 250);

      // Track test log active
      if (testingActive) {
        onAddTrackLog({
          type: "click",
          screenId: activeScreen.id,
          elementId: clickedElement.id,
          elementText: clickedElement.text || clickedElement.placeholder || `[${clickedElement.type}]`,
          x: Math.round(clickX),
          y: Math.round(clickY),
          details: `Interact action '${action.type}' with target '${action.targetScreenId || "None"}'`
        });
      }

      // Execute Action
      if (action.type === "navigate" && action.targetScreenId) {
        const targetScreenExists = screens.some((s) => s.id === action.targetScreenId);
        if (targetScreenExists) {
          setTransitionType(action.transition || "none");
          setTimeout(() => {
            onNavigate(action.targetScreenId!, action.transition || "none");
            if (testingActive) {
              onAddTrackLog({
                type: "navigation",
                screenId: action.targetScreenId!,
                elementId: clickedElement.id,
                x: Math.round(clickX),
                y: Math.round(clickY),
                details: `Simulated navigation to screen: ${action.targetScreenId}`
              });
              
              // If target is order success or final splash, trigger completion metric
              const isGoalScreen = ["success", "complete", "finished", "thank_you"].includes(action.targetScreenId!.toLowerCase());
              if (isGoalScreen) {
                onAddTrackLog({
                  type: "complete",
                  screenId: action.targetScreenId!,
                  x: Math.round(clickX),
                  y: Math.round(clickY),
                  details: `User completed wireframe scenario successfully!`
                });
              }
            }
          }, 50);
        } else {
          alert(`Dead Link! Element attempts to navigate to nonexistent screen ID: "${action.targetScreenId}"`);
        }
      } else if (action.type === "alert") {
        alert(clickedElement.text ? `Prototype Dialog: ${clickedElement.text}` : "Simulated action button clicked!");
      } else if (action.type === "submit") {
        alert("Form Submitted! Entered fields:\n" + JSON.stringify(typedInputs, null, 2));
      }
    } else {
      // Mis-click: Spot not interactive
      setMissClickAnim({ x: clickX, y: clickY });
      setTimeout(() => setMissClickAnim(null), 600);

      if (testingActive) {
        onAddTrackLog({
          type: "miss",
          screenId: activeScreen.id,
          x: Math.round(clickX),
          y: Math.round(clickY),
          details: `Missed click outside hotspots at x: ${Math.round(clickX)}%, y: ${Math.round(clickY)}%`
        });
      }
    }
  };

  const handleSaveComment = () => {
    if (!newCommentCoords) return;
    if (!newCommentText.trim()) {
      alert("Please specify a note.");
      return;
    }
    onAddComment({
      author: newCommentAuthor.trim() || "Anonymous Reviewer",
      text: newCommentText,
      x: newCommentCoords.x,
      y: newCommentCoords.y
    });
    setNewCommentText("");
    setNewCommentCoords(null);
  };

  // Animate dynamic transitions
  const getTransitionVariants = (type: string) => {
    switch (type) {
      case "slide-left":
        return {
          initial: { x: "100%", opacity: 0.9 },
          animate: { x: 0, opacity: 1 },
          exit: { x: "-100%", opacity: 0.9 }
        };
      case "slide-right":
        return {
          initial: { x: "-100%", opacity: 0.9 },
          animate: { x: 0, opacity: 1 },
          exit: { x: "100%", opacity: 0.9 }
        };
      case "slide-up":
        return {
          initial: { y: "100%", opacity: 0.9 },
          animate: { y: 0, opacity: 1 },
          exit: { y: "-100%", opacity: 0.9 }
        };
      case "fade":
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 }
        };
      case "scale":
        return {
          initial: { scale: 0.85, opacity: 0 },
          animate: { scale: 1, opacity: 1 },
          exit: { scale: 0.85, opacity: 0 }
        };
      default:
        return {
          initial: { opacity: 1 },
          animate: { opacity: 1 },
          exit: { opacity: 1 }
        };
    }
  };

  return (
    <div className="flex flex-col items-center">
      
      {/* Interaction Warning Bars */}
      <div className="mb-4 text-center">
        {addCommentMode ? (
          <span className="bg-amber-100 border border-amber-200 text-amber-800 text-xs px-3.5 py-1.5 rounded-full font-medium inline-flex items-center gap-2 animate-pulse">
            <Icons.Pin className="w-3.5 h-3.5" />
            Annotation Mode Active: Click any point on the screen to pin a feedback comment
          </span>
        ) : testingActive ? (
          <span className="bg-red-50 border border-red-200 text-red-700 text-xs px-3.5 py-1.5 rounded-full font-medium inline-flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
            Usability Testing Action Logged: Play with app naturally to inspect hotspot metrics
          </span>
        ) : (
          <span className="bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs px-3 py-1 rounded-full font-medium inline-flex items-center gap-1.5">
            <Icons.Play className="w-3.5 h-3.5 text-emerald-600" />
            Interactive Simulation Preview Mode
          </span>
        )}
      </div>

      {/* Styled Physical Smartphone Cover */}
      <div className="relative w-[370px] h-[750px] bg-slate-900 rounded-[56px] p-3.5 shadow-2xl border-[6px] border-slate-800 select-none">
        
        {/* Device Notch Spearker */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-6 w-36 bg-slate-900 rounded-b-2xl z-40 flex items-center justify-center">
          <div className="w-12 h-1 bg-slate-800 rounded-full mb-1"></div>
        </div>

        {/* Device Side Buttons */}
        <div className="absolute top-28 -left-2.5 w-1 h-12 bg-slate-800 rounded-r-lg"></div>
        <div className="absolute top-44 -left-2.5 w-1 h-16 bg-slate-800 rounded-r-lg"></div>
        <div className="absolute top-64 -left-2.5 w-1 h-16 bg-slate-800 rounded-r-lg"></div>
        <div className="absolute top-36 -right-2.5 w-1 h-20 bg-slate-800 rounded-l-lg"></div>

        {/* Screen Internal Viewport */}
        <div
          id="device_screen_viewport"
          ref={containerRef}
          onClick={handleViewportClick}
          className="relative w-full h-full rounded-[42px] overflow-hidden bg-slate-500 cursor-crosshair border border-slate-950/20"
        >
          {/* Default Mobile System Status Overlays */}
          <div className="absolute top-0 inset-x-0 h-10 flex justify-between items-center px-7 text-xs font-semibold z-30 transition-colors pointer-events-none drop-shadow-sm text-slate-400">
            <div>09:41</div>
            <div className="flex items-center gap-1.5">
              <Icons.Wifi className="w-3.5 h-3.5" />
              <Icons.BatteryCharging className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Render Active Screen Content with Animations */}
          <div className="w-full h-full relative" style={{ backgroundColor: activeScreen.backgroundColor }}>
            
            {/* Screen Content */}
            <div className="absolute inset-x-0 top-10 bottom-0 overflow-hidden">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={activeScreen.id}
                  variants={getTransitionVariants(transitionType)}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ type: "spring", stiffness: 220, damping: 24 }}
                  className="absolute inset-0 w-full h-full overflow-y-auto overflow-x-hidden"
                >
                  {activeScreen.elements.map((el) => {
                    const isHotspotAndInteractive = showHotspots && el.action?.type !== "none";
                    const isFlashing = clickFlashElementId === el.id;

                    return (
                      <div
                        key={el.id}
                        id={`rendered_el_${el.id}`}
                        style={{
                          left: `${el.x}%`,
                          top: `${el.y}%`,
                          width: `${el.width}%`,
                          height: `${el.height}%`,
                          color: el.color,
                          backgroundColor: el.backgroundColor,
                          fontSize: `${el.fontSize}px`,
                          borderRadius: `${el.borderRadius ?? 0}px`,
                          borderWidth: el.borderWidth ? `${el.borderWidth}px` : undefined,
                          borderColor: el.borderColor,
                        }}
                        className={`absolute flex items-center justify-center text-center p-1 transition-all pointer-events-none ${
                          el.type === "button"
                            ? "shadow-sm font-semibold hover:brightness-95 active:scale-95"
                            : el.type === "card"
                            ? "shadow-xs text-left justify-start items-start p-3 border border-slate-100"
                            : el.type === "navbar"
                            ? "font-bold text-slate-800 border-b border-slate-100 px-4"
                            : el.type === "container"
                            ? "border border-slate-200"
                            : ""
                        } ${isHotspotAndInteractive ? "outline outline-2 outline-dashed outline-orange-400/70 outline-offset-1" : ""} ${
                          isFlashing ? "brightness-75 scale-95 duration-100" : ""
                        }`}
                      >
                        {el.type === "input" ? (
                          <input
                            type="text"
                            placeholder={el.placeholder}
                            value={typedInputs[el.id] || ""}
                            onChange={(event) => {
                              // Enable input typing inside mock simulation
                              setTypedInputs({ ...typedInputs, [el.id]: event.target.value });
                            }}
                            className="w-full h-full text-center outline-none bg-transparent"
                            style={{ fontSize: `${el.fontSize}px`, color: el.color }}
                            disabled // disabled for click capture but displays placeholder cleanly
                          />
                        ) : el.type === "icon" ? (
                          <div className="flex flex-col items-center justify-center gap-1">
                            <DynamicIcon name={el.iconName || "HelpCircle"} className="w-6 h-6" />
                            {el.text && <span className="text-[10px] opacity-80 whitespace-nowrap">{el.text}</span>}
                          </div>
                        ) : (
                          <span className="line-clamp-4 leading-snug">{el.text}</span>
                        )}
                      </div>
                    );
                  })}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Render Miss-Click Feedback Dot Ripple */}
            {missClickAnim && (
              <span
                className="absolute w-8 h-8 rounded-full bg-orange-500/25 border-2 border-orange-500 z-50 pointer-events-none -translate-x-1/2 -translate-y-1/2 animate-ping"
                style={{ left: `${missClickAnim.x}%`, top: `${missClickAnim.y}%` }}
              ></span>
            )}

            {/* Render Placed Commentary Pins / Overlays */}
            {activeScreen.comments?.map((comment, index) => (
              <div
                key={comment.id}
                className="absolute z-40 -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${comment.x}%`, top: `${comment.y}%` }}
              >
                <div
                  onMouseEnter={() => setHoverComment(comment.id)}
                  onMouseLeave={() => setHoverComment(null)}
                  className="w-6 h-6 rounded-full bg-slate-900 border-2 border-white text-white flex items-center justify-center font-mono text-[11px] font-bold shadow-md cursor-pointer hover:scale-115 transition-transform"
                >
                  {index + 1}
                </div>

                {/* Hover Comment Card */}
                {hoverComment === comment.id && (
                  <div className="absolute left-7 top-0 w-48 bg-slate-800 text-white rounded-xl p-2.5 shadow-xl border border-slate-700 z-50 text-xs text-left pointer-events-none">
                    <p className="font-bold text-orange-400 mb-0.5">{comment.author}</p>
                    <p className="opacity-90 leading-normal">{comment.text}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* New Comment Composition Dialog */}
          {newCommentCoords && (
            <div className="absolute inset-0 bg-slate-950/70 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl p-4 shadow-2xl border border-slate-100 max-w-xs w-full text-slate-800">
                <div className="flex items-center gap-2 mb-3">
                  <Icons.Pin className="w-4 h-4 text-orange-600" />
                  <span className="font-semibold text-sm">Drop Pin (x:{newCommentCoords.x}%, y:{newCommentCoords.y}%)</span>
                </div>
                <div className="space-y-2.5">
                  <input
                    type="text"
                    placeholder="Your Name (e.g., Lead Reviewer)"
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                    value={newCommentAuthor}
                    onChange={(e) => setNewCommentAuthor(e.target.value)}
                  />
                  <textarea
                    placeholder="Leave design feedback or visual annotation here..."
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs h-18 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                  />
                  <div className="flex gap-2 justify-end pt-1">
                    <button
                      type="button"
                      className="text-xs bg-slate-100 text-slate-700 font-medium px-3 py-1.5 rounded-lg cursor-pointer hover:bg-slate-200"
                      onClick={() => setNewCommentCoords(null)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="text-xs bg-orange-600 text-white font-medium px-3 py-1.5 rounded-lg cursor-pointer hover:bg-orange-700"
                      onClick={handleSaveComment}
                    >
                      Pin Feedback
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Device Home bar line indicator overlay at bottom */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-slate-400 rounded-full z-30 pointer-events-none"></div>

        </div>
      </div>
    </div>
  );
};
