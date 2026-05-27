import React, { useState } from "react";
import * as Icons from "lucide-react";
import { Plus, Trash2, Play, Edit2, Link, Layers, Sliders, Type, Palette } from "lucide-react";
import { PrototypeScreen, UIElement, ElementAction } from "../types";

// Suggested Lucide Icons to choose from easily in UI
const SUGGESTED_ICONS = [
  "Home", "Search", "ShoppingCart", "User", "Lock", "Mail", "CheckCircle", "HelpCircle",
  "ArrowRight", "ArrowLeft", "Plus", "Menu", "ChevronRight", "Info", "Trash2", "Heart",
  "Bell", "Settings", "Share2", "Calendar", "Star", "MapPin", "Filter", "CreditCard"
];

interface SidebarEditorProps {
  screens: PrototypeScreen[];
  activeScreenId: string;
  startScreenId: string;
  onSetStartScreen: (id: string) => void;
  onScreenSelect: (id: string) => void;
  onAddScreen: (name: string, bgColor: string) => void;
  onDeleteScreen: (id: string) => void;
  
  // Elements
  onAddElement: (type: UIElement["type"]) => void;
  onUpdateElement: (elementId: string, updatedFields: Partial<UIElement>) => void;
  onDeleteElement: (elementId: string) => void;
}

export const SidebarEditor: React.FC<SidebarEditorProps> = ({
  screens,
  activeScreenId,
  startScreenId,
  onSetStartScreen,
  onScreenSelect,
  onAddScreen,
  onDeleteScreen,
  onAddElement,
  onUpdateElement,
  onDeleteElement
}) => {
  const [newScreenName, setNewScreenName] = useState("");
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  const activeScreen = screens.find((s) => s.id === activeScreenId);
  const selectedElement = activeScreen?.elements.find((el) => el.id === selectedElementId);

  const handleCreateScreen = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScreenName.trim()) return;
    onAddScreen(newScreenName.trim(), "#ffffff");
    setNewScreenName("");
  };

  return (
    <div className="space-y-6">
      
      {/* 1. SCREENS CONTROLLER */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-800" />
            <h4 className="font-semibold text-slate-900 text-sm">Screens & Flow ({screens.length})</h4>
          </div>
        </div>

        {/* Create Screen Mini Form */}
        <form onSubmit={handleCreateScreen} className="flex gap-1.5">
          <input
            type="text"
            className="flex-1 text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-orange-500"
            placeholder="New Screen Title..."
            value={newScreenName}
            onChange={(e) => setNewScreenName(e.target.value)}
          />
          <button
            type="submit"
            className="bg-slate-900 hover:bg-slate-800 text-white rounded-lg px-3 py-1.5 text-xs font-semibold flex items-center justify-center cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Existing Screens List */}
        <div className="divide-y divide-slate-50 border border-slate-100 rounded-xl max-h-48 overflow-y-auto">
          {screens.map((screen) => {
            const isStart = screen.id === startScreenId;
            const isActive = screen.id === activeScreenId;

            return (
              <div
                key={screen.id}
                className={`flex items-center justify-between p-2.5 transition-colors cursor-pointer group ${
                  isActive ? "bg-orange-50/50" : "hover:bg-slate-50"
                }`}
                onClick={() => {
                  onScreenSelect(screen.id);
                  // Reset select element when screen changes
                  setSelectedElementId(null);
                }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3.5 h-3.5 rounded border border-slate-200"
                    style={{ backgroundColor: screen.backgroundColor }}
                  ></div>
                  <span className={`text-xs ${isActive ? "font-semibold text-orange-900" : "text-slate-700"}`}>
                    {screen.name}
                  </span>
                  {isStart && (
                    <span className="bg-slate-100 text-slate-600 text-[9px] px-1.5 py-0.5 rounded font-mono font-medium flex items-center gap-0.5">
                      <Play className="w-2.5 h-2.5 text-slate-500" />
                      Home
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!isStart && (
                    <button
                      type="button"
                      title="Set as starting layout"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSetStartScreen(screen.id);
                      }}
                      className="text-slate-400 hover:text-slate-600 p-1 rounded"
                    >
                      <Play className="w-3 h-3" />
                    </button>
                  )}
                  {screens.length > 1 && (
                    <button
                      type="button"
                      title="Delete screen"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Are you sure you want to delete current screen: "${screen.name}"? This removes all its layouts.`)) {
                          onDeleteScreen(screen.id);
                          if (isActive) {
                            onScreenSelect(screens.find((s) => s.id !== screen.id)!.id);
                          }
                          setSelectedElementId(null);
                        }
                      }}
                      className="text-rose-400 hover:text-rose-600 p-1 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. ADD COMPONENT/ELEMENT PANEL */}
      {activeScreen && (
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-emerald-600" />
            <h4 className="font-semibold text-slate-900 text-sm">Add UI Component to Canvas</h4>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center text-xs">
            <button
              onClick={() => onAddElement("button")}
              className="bg-slate-50 hover:bg-slate-100 border border-slate-200/60 p-2.5 rounded-xl cursor-pointer text-slate-700 font-medium hover:border-slate-300 transition-all flex flex-col items-center gap-1"
            >
              <Icons.Square className="w-4 h-4 text-blue-500" />
              <span>Button</span>
            </button>
            <button
              onClick={() => onAddElement("input")}
              className="bg-slate-50 hover:bg-slate-100 border border-slate-200/60 p-2.5 rounded-xl cursor-pointer text-slate-700 font-medium hover:border-slate-300 transition-all flex flex-col items-center gap-1"
            >
              <Icons.Type className="w-4 h-4 text-violet-500" />
              <span>User Input</span>
            </button>
            <button
              onClick={() => onAddElement("text")}
              className="bg-slate-50 hover:bg-slate-100 border border-slate-200/60 p-2.5 rounded-xl cursor-pointer text-slate-700 font-medium hover:border-slate-300 transition-all flex flex-col items-center gap-1"
            >
              <Icons.Layers className="w-4 h-4 text-amber-500" />
              <span>Label Block</span>
            </button>
            <button
              onClick={() => onAddElement("card")}
              className="bg-slate-50 hover:bg-slate-100 border border-slate-200/60 p-2.5 rounded-xl cursor-pointer text-slate-700 font-medium hover:border-slate-300 transition-all flex flex-col items-center gap-1"
            >
              <Icons.MenuSquare className="w-4 h-4 text-emerald-500" />
              <span>Item Card</span>
            </button>
            <button
              onClick={() => onAddElement("container")}
              className="bg-slate-50 hover:bg-slate-100 border border-slate-200/60 p-2.5 rounded-xl cursor-pointer text-slate-700 font-medium hover:border-slate-300 transition-all flex flex-col items-center gap-1"
            >
              <Icons.Box className="w-4 h-4 text-purple-500" />
              <span>Panel Container</span>
            </button>
            <button
              onClick={() => onAddElement("icon")}
              className="bg-slate-50 hover:bg-slate-100 border border-slate-200/60 p-2.5 rounded-xl cursor-pointer text-slate-700 font-medium hover:border-slate-300 transition-all flex flex-col items-center gap-1"
            >
              <Icons.Star className="w-4 h-4 text-yellow-500" />
              <span>Lucide Icon</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. ELEMENT INSPECTOR */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
        <h4 className="font-semibold text-slate-900 border-b border-slate-50 pb-2 text-sm flex items-center gap-2">
          <Sliders className="w-4 h-4 text-orange-600" />
          Layout & Properties Inspector
        </h4>

        {/* Selected Screen background color quick edit */}
        {activeScreen && !selectedElement && (
          <div className="space-y-3.5">
            <p className="text-xs text-slate-400">Select any layout element inside the viewport to edit it directly, or tweak screen backgrounds here.</p>
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-slate-500" /> Screen BG Hex
              </span>
              <input
                type="color"
                className="w-8 h-8 rounded border-none cursor-pointer p-0"
                value={activeScreen.backgroundColor.startsWith("#") ? activeScreen.backgroundColor : "#ffffff"}
                onChange={(e) => {
                  // Direct edit screen background
                  activeScreen.backgroundColor = e.target.value;
                  onUpdateElement("dummy", {}); // trigger parent state refresh
                }}
              />
            </div>
          </div>
        )}

        {/* List of current elements on screen for list select */}
        {activeScreen && activeScreen.elements.length > 0 && (
          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">Screen Layout Elements</label>
              <select
                id="workspace_element_selector"
                className="w-full text-xs border border-slate-200 p-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500"
                value={selectedElementId || ""}
                onChange={(e) => setSelectedElementId(e.target.value || null)}
              >
                <option value="">-- Click element on layout or choose here --</option>
                {activeScreen.elements.map((el) => (
                  <option key={el.id} value={el.id}>
                    [{el.type.toUpperCase()}] {el.text ? `"${el.text.slice(0,18)}"` : el.placeholder ? `"${el.placeholder}"` : `ID:${el.id}`}
                  </option>
                ))}
              </select>
            </div>

            {selectedElement && (
              <div className="space-y-4 border-t border-slate-100 pt-4 text-xs">
                
                {/* Text Label edit */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 flex items-center gap-1">
                    <Edit2 className="w-3 h-3 text-slate-400" /> Display Text
                  </label>
                  <input
                    type="text"
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs"
                    value={selectedElement.text}
                    onChange={(e) => onUpdateElement(selectedElement.id, { text: e.target.value })}
                  />
                </div>

                {/* Input-specific placeholder */}
                {selectedElement.type === "input" && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 flex items-center gap-1">
                      <Type className="w-3 h-3" /> Input Placeholder
                    </label>
                    <input
                      type="text"
                      className="w-full border border-slate-200 rounded-lg p-2 text-xs"
                      value={selectedElement.placeholder || ""}
                      onChange={(e) => onUpdateElement(selectedElement.id, { placeholder: e.target.value })}
                    />
                  </div>
                )}

                {/* Sliders for responsive positioning */}
                <div className="space-y-2.5 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 mb-1 border-b border-slate-100 pb-1">
                    <span>Layout Sliders</span>
                    <span className="text-[10px] text-slate-400">Grid %</span>
                  </div>
                  
                  {/* Left coordinate Slider */}
                  <div className="flex items-center gap-2">
                    <span className="w-14 text-[10px] text-slate-500">Left (X):</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      className="flex-1 accent-orange-600"
                      value={selectedElement.x}
                      onChange={(e) => onUpdateElement(selectedElement.id, { x: parseInt(e.target.value) })}
                    />
                    <span className="w-6 text-right text-[10px] font-mono text-slate-600">{selectedElement.x}%</span>
                  </div>

                  {/* Top coordinate Slider */}
                  <div className="flex items-center gap-2">
                    <span className="w-14 text-[10px] text-slate-500">Top (Y):</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      className="flex-1 accent-orange-600"
                      value={selectedElement.y}
                      onChange={(e) => onUpdateElement(selectedElement.id, { y: parseInt(e.target.value) })}
                    />
                    <span className="w-6 text-right text-[10px] font-mono text-slate-600">{selectedElement.y}%</span>
                  </div>

                  {/* Width slider */}
                  <div className="flex items-center gap-2">
                    <span className="w-14 text-[10px] text-slate-500">Width:</span>
                    <input
                      type="range"
                      min="4"
                      max="100"
                      className="flex-1 accent-orange-600"
                      value={selectedElement.width}
                      onChange={(e) => onUpdateElement(selectedElement.id, { width: parseInt(e.target.value) })}
                    />
                    <span className="w-6 text-right text-[10px] font-mono text-slate-600">{selectedElement.width}%</span>
                  </div>

                  {/* Height slider */}
                  <div className="flex items-center gap-2">
                    <span className="w-14 text-[10px] text-slate-500">Height:</span>
                    <input
                      type="range"
                      min="2"
                      max="100"
                      className="flex-1 accent-orange-600"
                      value={selectedElement.height}
                      onChange={(e) => onUpdateElement(selectedElement.id, { height: parseInt(e.target.value) })}
                    />
                    <span className="w-6 text-right text-[10px] font-mono text-slate-600">{selectedElement.height}%</span>
                  </div>
                </div>

                {/* Element details (Color, FontSize, BorderRadius) */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Bg Hex</label>
                    <input
                      type="text"
                      className="w-full border border-slate-200 rounded p-1.5 text-xs font-mono"
                      value={selectedElement.backgroundColor}
                      onChange={(e) => onUpdateElement(selectedElement.id, { backgroundColor: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Text Hex</label>
                    <input
                      type="text"
                      className="w-full border border-slate-200 rounded p-1.5 text-xs font-mono"
                      value={selectedElement.color}
                      onChange={(e) => onUpdateElement(selectedElement.id, { color: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Font Size</label>
                    <input
                      type="number"
                      className="w-full border border-slate-200 rounded p-1.5 text-xs"
                      value={selectedElement.fontSize}
                      onChange={(e) => onUpdateElement(selectedElement.id, { fontSize: parseInt(e.target.value) || 12 })}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Rounded</label>
                    <input
                      type="number"
                      className="w-full border border-slate-200 rounded p-1.5 text-xs"
                      value={selectedElement.borderRadius ?? 0}
                      onChange={(e) => onUpdateElement(selectedElement.id, { borderRadius: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                {/* Lucide icon name selector if type is "icon" */}
                {selectedElement.type === "icon" && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 flex items-center gap-1">
                      <Icons.Star className="w-3 h-3 text-yellow-500" /> Select Lucide Icon
                    </label>
                    <select
                      className="w-full text-xs border border-slate-200 p-2 rounded-lg"
                      value={selectedElement.iconName || "HelpCircle"}
                      onChange={(e) => onUpdateElement(selectedElement.id, { iconName: e.target.value })}
                    >
                      {SUGGESTED_ICONS.map((ic) => (
                        <option key={ic} value={ic}>{ic}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* 4. ACTIONS / INTERACTIONS WIRES */}
                <div className="space-y-2 border-t border-slate-100 pt-3">
                  <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                    <Link className="w-3.5 h-3.5 text-blue-600" /> Tap Interactions Flow
                  </span>
                  
                  <div className="space-y-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">On Click trigger:</label>
                      <select
                        className="w-full text-xs border border-slate-200 p-1.5 rounded bg-white"
                        value={selectedElement.action.type}
                        onChange={(e) => {
                          const val = e.target.value as ElementAction["type"];
                          const defaultTarget = val === "navigate" ? screens[0]?.id : undefined;
                          onUpdateElement(selectedElement.id, {
                            action: {
                              ...selectedElement.action,
                              type: val,
                              targetScreenId: defaultTarget,
                              transition: "fade"
                            }
                          });
                        }}
                      >
                        <option value="none">No Action (static component)</option>
                        <option value="navigate">Navigate Route to Target Screen</option>
                        <option value="alert">Open Popup Dialog</option>
                        <option value="submit">Simulate Form submit</option>
                      </select>
                    </div>

                    {selectedElement.action.type === "navigate" && (
                      <div className="grid grid-cols-2 gap-1.5">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">To Screen:</label>
                          <select
                            className="w-full text-[11px] border border-slate-200 p-1 rounded bg-white font-medium"
                            value={selectedElement.action.targetScreenId || ""}
                            onChange={(e) => {
                              onUpdateElement(selectedElement.id, {
                                action: {
                                  ...selectedElement.action,
                                  targetScreenId: e.target.value
                                }
                              });
                            }}
                          >
                            {screens.map((sc) => (
                              <option key={sc.id} value={sc.id}>{sc.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Motion Anim:</label>
                          <select
                            className="w-full text-[11px] border border-slate-200 p-1 rounded bg-white"
                            value={selectedElement.action.transition || "none"}
                            onChange={(e) => {
                              onUpdateElement(selectedElement.id, {
                                action: {
                                  ...selectedElement.action,
                                  transition: e.target.value as any
                                }
                              });
                            }}
                          >
                            <option value="none">None</option>
                            <option value="fade">Quick Fade</option>
                            <option value="slide-left">Slide Left</option>
                            <option value="slide-right">Slide Right</option>
                            <option value="slide-up">Slide Rise</option>
                            <option value="scale">Bounce Zoom</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Delete button component container */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm("Remove selected UI element from active screen?")) {
                        onDeleteElement(selectedElement.id);
                        setSelectedElementId(null);
                      }
                    }}
                    className="w-full border border-rose-100 bg-rose-50/50 hover:bg-rose-50 text-rose-600 font-medium py-1.5 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer text-xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete Selected Element
                  </button>
                </div>

              </div>
            )}
          </div>
        )}

        {/* Empty layout placeholder */}
        {activeScreen && activeScreen.elements.length === 0 && (
          <div className="text-center p-6 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-xs">
            No element components on this screen yet. Click any tool button above to insert a block!
          </div>
        )}
      </div>

    </div>
  );
};
