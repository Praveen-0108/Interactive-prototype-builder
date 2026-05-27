import { Prototype } from "./types";

export const INITIAL_PROTOTYPE: Prototype = {
  id: "food_delivery_app",
  name: "YumExpress - Food Delivery app",
  description: "A sleek, modern 4-screen flow for ordering quick meals, taking the user from the welcome screen to cart completion, with interactive screens and navigation transitions.",
  startScreenId: "welcome",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  screens: [
    {
      id: "welcome",
      name: "Welcome Splash",
      backgroundColor: "#0f172a", // Dark Navy
      elements: [
        {
          id: "accent_glow",
          type: "container",
          x: 10,
          y: 15,
          width: 80,
          height: 35,
          text: "",
          fontSize: 14,
          color: "#ffffff",
          backgroundColor: "#1e293b",
          borderRadius: 24,
          action: { type: "none" }
        },
        {
          id: "splash_logo",
          type: "icon",
          x: 40,
          y: 20,
          width: 20,
          height: 10,
          text: "",
          fontSize: 32,
          color: "#f97316", // Orange
          backgroundColor: "transparent",
          iconName: "ChefHat",
          action: { type: "none" }
        },
        {
          id: "splash_title",
          type: "text",
          x: 15,
          y: 32,
          width: 70,
          height: 12,
          text: "YumExpress",
          fontSize: 28,
          color: "#ffffff",
          backgroundColor: "transparent",
          action: { type: "none" }
        },
        {
          id: "splash_subtitle",
          type: "text",
          x: 15,
          y: 43,
          width: 70,
          height: 15,
          text: "Great food delivered in record speeds directly to your doorstep.",
          fontSize: 14,
          color: "#94a3b8",
          backgroundColor: "transparent",
          action: { type: "none" }
        },
        {
          id: "splash_card",
          type: "card",
          x: 12,
          y: 62,
          width: 76,
          height: 14,
          text: "🔥 50% discount on your first order!",
          fontSize: 13,
          color: "#ea580c",
          backgroundColor: "#ffedd5",
          borderRadius: 16,
          action: { type: "none" }
        },
        {
          id: "btn_get_started",
          type: "button",
          x: 12,
          y: 80,
          width: 76,
          height: 10,
          text: "Browse Restaurants",
          fontSize: 16,
          color: "#ffffff",
          backgroundColor: "#ea580c",
          borderRadius: 9999,
          action: {
            type: "navigate",
            targetScreenId: "dashboard",
            transition: "slide-left"
          }
        }
      ],
      comments: [
        {
          id: "comment_welcome_1",
          author: "Alex (Lead Designer)",
          text: "The orange logo and text are very inviting. Can we add a subtle animation to the button later?",
          x: 50,
          y: 85,
          createdAt: new Date().toISOString()
        }
      ]
    },
    {
      id: "dashboard",
      name: "Main Explore",
      backgroundColor: "#f8fafc", // Light Slate
      elements: [
        // Navigation Bar Header
        {
          id: "header_bar",
          type: "navbar",
          x: 0,
          y: 0,
          width: 100,
          height: 12,
          text: "🍔 Explore Feasts",
          fontSize: 18,
          color: "#1e293b",
          backgroundColor: "#ffffff",
          action: { type: "none" }
        },
        {
          id: "btn_back_home",
          type: "icon",
          x: 4,
          y: 4,
          width: 10,
          height: 5,
          text: "",
          fontSize: 16,
          color: "#475569",
          backgroundColor: "transparent",
          iconName: "ArrowLeft",
          action: {
            type: "navigate",
            targetScreenId: "welcome",
            transition: "slide-right"
          }
        },
        {
          id: "input_search",
          type: "input",
          x: 6,
          y: 15,
          width: 88,
          height: 8,
          text: "",
          placeholder: "Search sushi, burgers, pizza...",
          fontSize: 13,
          color: "#64748b",
          backgroundColor: "#ffffff",
          borderRadius: 8,
          action: { type: "none" }
        },
        // Quick Category Badges
        {
          id: "badge_pizza",
          type: "button",
          x: 6,
          y: 26,
          width: 25,
          height: 6,
          text: "🍕 Pizza",
          fontSize: 12,
          color: "#ffffff",
          backgroundColor: "#ea580c",
          borderRadius: 9999,
          action: { type: "none" }
        },
        {
          id: "badge_burger",
          type: "button",
          x: 35,
          y: 26,
          width: 28,
          height: 6,
          text: "🍔 Burgers",
          fontSize: 12,
          color: "#475569",
          backgroundColor: "#e2e8f0",
          borderRadius: 9999,
          action: { type: "none" }
        },
        {
          id: "badge_healthy",
          type: "button",
          x: 67,
          y: 26,
          width: 27,
          height: 6,
          text: "🥗 Salads",
          fontSize: 12,
          color: "#475569",
          backgroundColor: "#e2e8f0",
          borderRadius: 9999,
          action: { type: "none" }
        },
        // Food Card 1
        {
          id: "food_card_1",
          type: "card",
          x: 6,
          y: 36,
          width: 88,
          height: 18,
          text: "",
          fontSize: 14,
          color: "#000000",
          backgroundColor: "#ffffff",
          borderRadius: 16,
          action: { type: "none" }
        },
        {
          id: "food_card_1_title",
          type: "text",
          x: 10,
          y: 39,
          width: 50,
          height: 6,
          text: "Supreme Spicy Veggie",
          fontSize: 14,
          color: "#1e293b",
          backgroundColor: "transparent",
          action: { type: "none" }
        },
        {
          id: "food_card_1_meta",
          type: "text",
          x: 10,
          y: 44,
          width: 50,
          height: 4,
          text: "⭐️ 4.9 • 20 mins • Free Delivery",
          fontSize: 11,
          color: "#64748b",
          backgroundColor: "transparent",
          action: { type: "none" }
        },
        {
          id: "food_card_1_price",
          type: "text",
          x: 10,
          y: 48,
          width: 20,
          height: 4,
          text: "$12.99",
          fontSize: 14,
          color: "#ea580c",
          backgroundColor: "transparent",
          action: { type: "none" }
        },
        {
          id: "btn_add_pizza",
          type: "button",
          x: 65,
          y: 43,
          width: 24,
          height: 8,
          text: "Add +",
          fontSize: 12,
          color: "#ffffff",
          backgroundColor: "#16a34a", // Green
          borderRadius: 8,
          action: {
            type: "navigate",
            targetScreenId: "cart",
            transition: "slide-up"
          }
        },
        // Food Card 2
        {
          id: "food_card_2",
          type: "card",
          x: 6,
          y: 57,
          width: 88,
          height: 18,
          text: "",
          fontSize: 14,
          color: "#000000",
          backgroundColor: "#ffffff",
          borderRadius: 16,
          action: { type: "none" }
        },
        {
          id: "food_card_2_title",
          type: "text",
          x: 10,
          y: 60,
          width: 50,
          height: 6,
          text: "Crispy Cheddar Feast",
          fontSize: 14,
          color: "#1e293b",
          backgroundColor: "transparent",
          action: { type: "none" }
        },
        {
          id: "food_card_2_meta",
          type: "text",
          x: 10,
          y: 65,
          width: 50,
          height: 4,
          text: "⭐️ 4.7 • 15 mins • $1.50 Deliv",
          fontSize: 11,
          color: "#64748b",
          backgroundColor: "transparent",
          action: { type: "none" }
        },
        {
          id: "food_card_2_price",
          type: "text",
          x: 10,
          y: 69,
          width: 20,
          height: 4,
          text: "$9.49",
          fontSize: 14,
          color: "#ea580c",
          backgroundColor: "transparent",
          action: { type: "none" }
        },
        {
          id: "btn_add_burger",
          type: "button",
          x: 65,
          y: 64,
          width: 24,
          height: 8,
          text: "Add +",
          fontSize: 12,
          color: "#ffffff",
          backgroundColor: "#16a34a",
          borderRadius: 8,
          action: {
            type: "navigate",
            targetScreenId: "cart",
            transition: "slide-up"
          }
        },
        // Sticky Footer
        {
          id: "footer_bar",
          type: "navbar",
          x: 0,
          y: 88,
          width: 100,
          height: 12,
          text: "",
          fontSize: 12,
          color: "#64748b",
          backgroundColor: "#ffffff",
          action: { type: "none" }
        },
        {
          id: "footer_home_icon",
          type: "icon",
          x: 15,
          y: 91,
          width: 10,
          height: 5,
          text: "Home",
          fontSize: 11,
          color: "#ea580c",
          backgroundColor: "transparent",
          iconName: "Home",
          action: { type: "none" }
        },
        {
          id: "footer_search_icon",
          type: "icon",
          x: 45,
          y: 91,
          width: 10,
          height: 5,
          text: "Search",
          fontSize: 11,
          color: "#64748b",
          backgroundColor: "transparent",
          iconName: "Search",
          action: { type: "none" }
        },
        {
          id: "footer_cart_icon",
          type: "icon",
          x: 75,
          y: 91,
          width: 10,
          height: 5,
          text: "Cart",
          fontSize: 11,
          color: "#64748b",
          backgroundColor: "transparent",
          iconName: "ShoppingCart",
          action: {
            type: "navigate",
            targetScreenId: "cart",
            transition: "fade"
          }
        }
      ],
      comments: [
        {
          id: "comment_dashboard_1",
          author: "Sam (UX Researcher)",
          text: "Should we make the entire card clickable, or is having the dedicated green 'Add +' button clear enough?",
          x: 50,
          y: 50,
          createdAt: new Date().toISOString()
        }
      ]
    },
    {
      id: "cart",
      name: "Your Cart",
      backgroundColor: "#ffffff",
      elements: [
        // Navigation Header
        {
          id: "cart_header",
          type: "navbar",
          x: 0,
          y: 0,
          width: 100,
          height: 12,
          text: "🛒 Checkout Basket",
          fontSize: 18,
          color: "#1e293b",
          backgroundColor: "#ffffff",
          action: { type: "none" }
        },
        {
          id: "btn_back_to_shop",
          type: "icon",
          x: 4,
          y: 4,
          width: 10,
          height: 5,
          text: "",
          fontSize: 16,
          color: "#475569",
          backgroundColor: "transparent",
          iconName: "ArrowLeft",
          action: {
            type: "navigate",
            targetScreenId: "dashboard",
            transition: "slide-right"
          }
        },
        // Summary list container
        {
          id: "order_summary_title",
          type: "text",
          x: 6,
          y: 16,
          width: 60,
          height: 5,
          text: "Selected Items:",
          fontSize: 15,
          color: "#1e293b",
          backgroundColor: "transparent",
          action: { type: "none" }
        },
        {
          id: "cart_item_row_1",
          type: "card",
          x: 6,
          y: 23,
          width: 88,
          height: 12,
          text: "🍕  1x Supreme Spicy Veggie ...... $12.99",
          fontSize: 13,
          color: "#334155",
          backgroundColor: "#f8fafc",
          borderRadius: 8,
          action: { type: "none" }
        },
        {
          id: "cart_item_row_2",
          type: "card",
          x: 6,
          y: 37,
          width: 88,
          height: 12,
          text: "🥤  1x Iced Lemon Tea ........... $2.50",
          fontSize: 13,
          color: "#334155",
          backgroundColor: "#f8fafc",
          borderRadius: 8,
          action: { type: "none" }
        },
        // Totals Box
        {
          id: "cart_receipt_box",
          type: "container",
          x: 6,
          y: 53,
          width: 88,
          height: 20,
          text: "",
          fontSize: 12,
          color: "#334155",
          backgroundColor: "#f1f5f9",
          borderRadius: 12,
          action: { type: "none" }
        },
        {
          id: "cart_subtotal",
          type: "text",
          x: 12,
          y: 56,
          width: 76,
          height: 4,
          text: "Subtotal: $15.49",
          fontSize: 13,
          color: "#475569",
          backgroundColor: "transparent",
          action: { type: "none" }
        },
        {
          id: "cart_delivery",
          type: "text",
          x: 12,
          y: 61,
          width: 76,
          height: 4,
          text: "Delivery Fee: FREE",
          fontSize: 13,
          color: "#16a34a",
          backgroundColor: "transparent",
          action: { type: "none" }
        },
        {
          id: "cart_total",
          type: "text",
          x: 12,
          y: 66,
          width: 76,
          height: 5,
          text: "Total Amount: $15.49",
          fontSize: 15,
          color: "#1e293b",
          backgroundColor: "transparent",
          action: { type: "none" }
        },
        // Checkout Interactive Button
        {
          id: "btn_complete_order",
          type: "button",
          x: 6,
          y: 80,
          width: 88,
          height: 10,
          text: "Place Order ($15.49)",
          fontSize: 15,
          color: "#ffffff",
          backgroundColor: "#16a34a",
          borderRadius: 12,
          action: {
            type: "navigate",
            targetScreenId: "success",
            transition: "scale"
          }
        }
      ],
      comments: []
    },
    {
      id: "success",
      name: "Order Completed",
      backgroundColor: "#10b981", // Solid Green
      elements: [
        {
          id: "star_bg",
          type: "container",
          x: 15,
          y: 20,
          width: 70,
          height: 40,
          text: "",
          fontSize: 14,
          color: "#ffffff",
          backgroundColor: "rgba(255,255,255,0.15)",
          borderRadius: 24,
          action: { type: "none" }
        },
        {
          id: "success_icon",
          type: "icon",
          x: 40,
          y: 26,
          width: 20,
          height: 10,
          text: "",
          fontSize: 48,
          color: "#ffffff",
          backgroundColor: "transparent",
          iconName: "CheckCircle",
          action: { type: "none" }
        },
        {
          id: "success_text",
          type: "text",
          x: 20,
          y: 39,
          width: 60,
          height: 8,
          text: "Order Placed!",
          fontSize: 22,
          color: "#ffffff",
          backgroundColor: "transparent",
          action: { type: "none" }
        },
        {
          id: "success_subtext",
          type: "text",
          x: 20,
          y: 48,
          width: 60,
          height: 10,
          text: "Your chefs are already cooking. Deliverer is assigned and headed to kitchen.",
          fontSize: 12,
          color: "#ecfdf5",
          backgroundColor: "transparent",
          action: { type: "none" }
        },
        {
          id: "btn_back_explore",
          type: "button",
          x: 20,
          y: 75,
          width: 60,
          height: 10,
          text: "Back to Dashboard",
          fontSize: 14,
          color: "#10b981",
          backgroundColor: "#ffffff",
          borderRadius: 9999,
          action: {
            type: "navigate",
            targetScreenId: "dashboard",
            transition: "slide-right"
          }
        }
      ],
      comments: []
    }
  ]
};
