# App Map

This document maps each file in the project (excluding `node_modules/`) and summarizes its purpose.

## Root

- __`package.json`__ — Project metadata and scripts. Entry point `server.js`. Start script: `node server.js`. Dependency: `express`.
- __`pnpm-lock.yaml`__ — Lockfile for PNPM dependencies and versions.
- __`server.js`__ — Express static server. Serves `public/`, sets CORS and cache headers, health endpoint `/healthz`, listens on `PORT`/`SHOWROOM_PORT` or 4176.

## `public/` (static assets and client code)

### HTML
- __`public/index.html`__ — Main UI for the device testing platform. Links core CSS (`device-skins.css`, `verridian-theme.css`, `verridian-production.css`, `verridian-media-optimized.css`), sets globals, and loads bridge/monitor scripts. Renders header, controls, and device iframe.
- __`public/favicon-display.html`__ — Demo page to preview favicon rendering.
- __`public/favicon-generator.html`__ — Utility page for generating favicon assets.
- __`public/test-ai-chat.html`__ — Test page for AI chat interface integration.

### CSS (themes, effects, skins)
- __`public/ai-agent-factory-theme.css`__ — Dark theme variables and layout for “AI Agent Factory”, includes video background container styles and overlay effects.
- __`public/cosmic-effects.css`__ — Cosmic visual effects (glows, particles, decorative classes) for background/containers.
- __`public/cosmic-loaders.css`__ — Animated loader/spinner styles with cosmic motifs.
- __`public/device-skins.css`__ — Device frame mockups (iPhone/Android/Desktop) sizes, bezels, and screen styling.
- __`public/enhanced-header.css`__ — Styles for the glass header/nav with enhanced effects.
- __`public/verridian-media-optimized.css`__ — Video background layers, fallback starfield gradient, logo filters, and performance/override rules (including hiding video backgrounds).
- __`public/verridian-production.css`__ — Production-grade glassmorphism components (cards, buttons, modals) with performance optimizations and accessibility.
- __`public/verridian-theme.css`__ — Global theme overrides; forces black body background, disables certain header/pseudo backgrounds; core variables.

### JavaScript (client logic, integrations, utilities)
- __`public/ai-chat-integration.js`__ — Hooks UI to AI chat backend/bridge; manages chat events and message flow.
- __`public/ai-prompt-templates.js`__ — Predefined prompt templates and helpers for AI interactions.
- __`public/button-test.js`__ — Dev/test script for verifying button interactions/animations.
- __`public/chat-interface-fixes.js`__ — Patches and UX tweaks for the chat UI behaviors.
- __`public/claude-api-config.js`__ — Configuration (endpoints/keys placeholders) for Claude API usage.
- __`public/claude-api-enhancement-agent.js`__ — Agent that enhances prompts/results via Claude before/after processing.
- __`public/claude-chat-interface.js`__ — Chat UI integration specifically targeting Claude workflows.
- __`public/claude-cli-bridge.js`__ — Bridges browser UI to a CLI-like Claude interface or local dev tooling.
- __`public/claude-vision-handler.js`__ — Handles image/vision inputs for Claude and response rendering.
- __`public/collaboration-system.js`__ — Collaboration features (sessions, presence, or shared state syncing).
- __`public/cosmic-particles-advanced.js`__ — Advanced canvas particle system (nebula, orbitals, comets) auto-inits on `#cosmic-canvas` if present.
- __`public/cosmic-particles.js`__ — Simpler/alternate particle effect renderer for background.
- __`public/device-skin-context-agent.js`__ — Logic for selecting/applying device skin contexts to the emulator frame.
- __`public/dom-analysis-engine.js`__ — DOM scanning utilities for analysis/selection and metadata extraction.
- __`public/element-inspector.js`__ — Element inspection tools (hover overlays, bounds) for the emulator or page.
- __`public/element-overlay-ui.js`__ — UI layer for drawing overlays/highlights on inspected elements.
- __`public/element-selection-agent.js`__ — Agent to drive element selection and pass selectors back to tools.
- __`public/enhanced-protocol-integration-bridge.js`__ — Main bridge for enhanced WebSocket/protocol comms with the server/broker.
- __`public/enhanced-protocol-integration-bridge-part2.js`__ — Continuation/split module for the integration bridge.
- __`public/enhanced-protocol-integration-bridge-complete.js`__ — Bundled/combined bridge version with full feature set.
- __`public/enhanced-websocket-protocols.js`__ — Extended WebSocket protocol helpers (reconnect, heartbeats, channels).
- __`public/frontend-integration-agent.js`__ — Orchestrates front-end integrations (agents, bridges, and UI hooks).
- __`public/generate-favicons.js`__ — Script to generate or manage favicons from source images.
- __`public/integration-initializer.js`__ — Bootstraps integrations on page load (wires up agents and config).
- __`public/mock-cli-server.js`__ — Mock server/bridge for local CLI-like interactions during development.
- __`public/multi-ide-integration-agent.js`__ — Agent for integration across multiple IDEs/editors.
- __`public/performance-monitor.js`__ — Monitors FPS, timing, and resource usage; warns if performance degrades.
- __`public/realtime-collaboration-agent.js`__ — Manages realtime collaboration sessions between clients.
- __`public/screenshot-capture-agent.js`__ — Client agent to request or capture screenshots from the emulator/page.
- __`public/screenshot-capture-system.js`__ — System-level screenshot orchestration and plumbing.
- __`public/security-config.js`__ — Security-related client config (CSP hints, sandboxing toggles, allowed origins).
- __`public/system-integration-test.js`__ — Test harness to validate integration stack end-to-end.
- __`public/testing-validation-agent.js`__ — Agent to assist with automated/manual testing flows.
- __`public/verridian-motion.js`__ — Motion/animation utilities (springs, gestures) used across UI.
- __`public/video-optimizer.js`__ — Optimize and adapt background video quality/visibility.
- __`public/websocket-broker-stability-agent.js`__ — Keeps WS connections stable to the broker; handles retries/backoff.
- __`public/websocket-protocol-agent.js`__ — Higher-level WS agent for command routing and protocol messages.

### Media and assets
- __`public/AI_CHAT_SETUP_GUIDE.md`__ — Guide for setting up AI chat features within the project.
- __`public/AI_COMPUTER_VISION_GUIDE.md`__ — Guide for integrating AI computer vision flows.
- __`public/COSMIC_MEDIA_MANIFEST.md`__ — Manifest describing cosmic media assets and usage.
- __`public/Verridian_V.png`__ — Branding asset (Verridian V logo).
- __`public/Verridian_logo_1.png`__ — Branding asset (Verridian logo variant).
- __`public/background full video.mp4`__ — Background video for galaxy/cosmic effect.
- __`public/background1.png`__ — Static background image (cosmic/landscape variant).
- __`public/background5.png`__ — Static background image (cosmic/landscape variant).
- __`public/cosmic-animations.svg`__ — SVG animations/effects used in UI.
- __`public/favicon.svg`__ — Main SVG favicon.
- __`public/gold_1.png`__ — Decorative texture used in backgrounds/overlays.
- __`public/landscape_1.png`__ — Background image.
- __`public/new_electronic_logo.png`__ — App logo used in header and favicons.
- __`public/verridian-logo-animated.svg`__ — Animated SVG logo.
- __`public/verridian-logo-cosmic.png`__ — Cosmic-styled logo PNG.
- __`public/verridian-showroom-screenshot.png`__ — Screenshot of the showroom UI.

### Fonts `public/fonts/`
- __`BraveEightyoneRegular-ZVGvm.ttf`__ — Display font used in headers/UI accents.
- __`Decaydence-MALnB.ttf`__ — Decorative display font.
- __`DecaydenceStraight-KVJzZ.ttf`__ — Decorative display font (straight variant).
- __`GalacticVanguardianNcv-myVP.ttf`__ — Thematic display font.

## Notes
- Many JS files are modular “agents” or “bridges” for WebSocket comms, collaboration, testing, and integrations. Only a subset is loaded by `index.html` by default.
- Background visuals come from a combination of theme CSS and media (video + fallbacks). `verridian-theme.css` currently forces a black body background and `verridian-media-optimized.css` includes overrides to hide video layers.
