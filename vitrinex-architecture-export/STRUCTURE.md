# 📂 Project Structure

Verified directory layout. Code files are omitted to protect IP.

```text
src/
├── components/         # UI Building Blocks
│   ├── admin/          # Administrative & Dashboard widgets
│   ├── features/       # Business-specific components (e.g., NotificationDropdown)
│   ├── layout/         # Shell, Sidebar, MobileNav
│   └── ui/             # Reusable atoms (Buttons, Inputs, Cards)
├── pages/              # Route Controllers
│   ├── AdminConsole.tsx
│   ├── ClientManager.tsx
│   ├── AIManager.tsx
│   └── ...
├── services/           # Logic Layer (Separation of Concerns)
│   ├── ai/             # AI Strategy adapters (Text, Image, Video)
│   ├── core/           # Auth, DB, API proxies
│   └── admin/          # Admin-privileged operations
├── contexts/           # React Contexts (Toast, Auth)
├── hooks/              # Custom React Hooks
├── types/              # TypeScript Interfaces & Domain Models
├── constants.ts        # Configuration & Environment constants
└── App.tsx             # Root Orchestrator
```

## Module Responsibilities

- **Components**: Pure presentation logic.
- **Pages**: Data fetching orchestration and layout composition.
- **Services**: Pure business logic and side-effects (API calls).
- **Types**: Shared contract definitions.
