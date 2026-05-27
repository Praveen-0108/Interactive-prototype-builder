export interface ElementAction {
  type: 'navigate' | 'submit' | 'alert' | 'none';
  targetScreenId?: string;
  transition?: 'none' | 'fade' | 'slide-left' | 'slide-right' | 'slide-up' | 'scale';
}

export type ElementType = 'button' | 'input' | 'text' | 'image' | 'card' | 'navbar' | 'icon' | 'container';

export interface UIElement {
  id: string;
  type: ElementType;
  x: number; // percentage (0 - 100)
  y: number; // percentage (0 - 100)
  width: number; // percentage
  height: number; // percentage
  text: string;
  placeholder?: string;
  fontSize: number; // in px or scale
  color: string; // text hex/tailwind class
  backgroundColor: string; // bg hex/tailwind class
  borderColor?: string;
  borderWidth?: number; // px
  borderRadius?: number; // px
  iconName?: string; // Lucide icon
  action: ElementAction;
}

export interface ScreenComment {
  id: string;
  author: string;
  text: string;
  x: number; // percentage location for annotation
  y: number; // percentage location for annotation
  createdAt: string;
}

export interface PrototypeScreen {
  id: string;
  name: string;
  backgroundColor: string;
  elements: UIElement[];
  comments: ScreenComment[];
}

export interface Prototype {
  id: string;
  name: string;
  description: string;
  screens: PrototypeScreen[];
  startScreenId: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserTestLog {
  id: string;
  timestamp: string;
  type: 'start' | 'click' | 'navigation' | 'miss' | 'complete';
  screenId: string;
  elementId?: string;
  elementText?: string;
  x: number; // percentage
  y: number; // percentage
  details?: string;
}

export interface UserTestSession {
  id: string;
  testerName: string;
  startedAt: string;
  completedAt?: string;
  logs: UserTestLog[];
  status: 'active' | 'completed' | 'abandoned';
}
