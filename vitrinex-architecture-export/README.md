# ViniteX AI - System Architecture

This repository contains the high-level architecture, system design patterns, and documentation for the **VitrineX AI** platform. It serves as a reference for the engineering team and a showcase of the architectural decisions behind the system.

> **Note:** This repository allows public sharing of technical knowledge without exposing proprietary business logic, sensitive credentials, or customer data.

## 🏗️ Tech Stack

### Core
- **Frontend Framework**: React 18
- **Language**: TypeScript 5.x
- **Build Tool**: Vite
- **Styling**: TailwindCSS

### AI & Services
- **LLM Integration**: Google Gemini 2.0 (Flash & Pro)
- **Generative Media**: Imagen 3 / Veo (Preview)
- **Voice/Audio**: Gemini Native Audio
- **Architecture**: Modular Service Layer Pattern

### State & Storage
- **State Management**: Zustand
- **Local Storage**: IndexedDB / LocalStorage (Client-first architecture)
- **Backend Communication**: Proxy-based service adapters

## 📂 Repository Structure

- `STRUCTURE.md`: Detailed directory tree and module organization.
- `DIAGRAMS.md`: C4 and Flow charts visualizing system interactions.
- `PATTERNS.md`: Engineering standards, including the "Antigravity" UI rules.

## 🚀 Key Architectural Decisions

1.  **Client-Side AI Orchestration**: Heavy leveraging of client-side logic to reduce backend latency, using edge-ready service proxies.
2.  **Adaptive UI**: Mobile-first responsive design with specific "Antigravity" motion principles.
3.  **Modular AI Services**: Abstraction layer (`src/services/ai/*`) allowing hot-swapping of models (e.g., switching from Flash to Pro or Thinking models) without affecting UI components.
