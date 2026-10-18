# ⚡ SysDesign AI Simulator

An interactive, high-performance **System Design Simulator** that renders a smooth 60FPS animation on an HTML5 `<canvas>`, powered by **WebAssembly (WASM)** for graph calculations and discrete-event traffic simulation, **LangChain** for autonomous AI architecture synthesis, and modern HTML5/CSS3 for both **Light and Dark mode**.

---

## 🌟 Key Features

1. **60FPS HTML5 Canvas Engine**:
   - Zero-garbage-collection Particle Pool animating synthetic traffic packets along cubic Bezier curves.
   - Smooth viewport camera supporting mouse wheel zoom, pan, grid snapping, and auto-fit to content.
   - High-DPI (Retina/4K) sub-pixel crisp rendering.

2. **WebAssembly Simulation Core**:
   - Discrete-event traffic simulator modeling M/M/1 and M/M/c queueing curves, cache hit/miss flows, and latency percentiles (`p50`, `p95`, `p99`).
   - Strategy Pattern load balancing: Round Robin, Dynamic Least Connections, and Consistent Hashing.
   - Native Rust crate (`wasm-engine/`) + in-browser WebAssembly coprocessor fallback ensuring out-of-the-box execution in every browser.

3. **LangChain AI Architect & Custom Tokens**:
   - Plug in your custom OpenAI / LangChain API key or local LLM endpoint (Ollama, LMStudio) via the settings modal.
   - Natural language commands: *"Design a URL Shortener"*, *"Design a video streaming platform"*, *"Fix all single points of failure"*, *"Add a Redis cache"*.
   - Structured tool execution: `add_node`, `connect_nodes`, `configure_node`, `evaluate_architecture`, `auto_fix_spof`.

4. **Real-Time Agentic SPOF & Anti-Pattern Evaluation**:
   - **Tarjan's Articulation Points Algorithm**: Detects Single Points of Failure where a node outage isolates downstream services.
   - Detects missing load balancers, direct client-to-database connections, and un-cached high read loads.
   - **1-Click Auto-Fix**: Automatically scales instances or provisions read replicas directly from the report!

5. **10 Pre-Built Interview Scenarios (Sorted Low to High Difficulty)**:
   - ⭐ **URL Shortener (Bitly)** — Easy
   - ⭐ **Pastebin** — Easy
   - ⭐⭐ **Distributed Rate Limiter** — Medium
   - ⭐⭐ **Chat Application (WhatsApp / Slack)** — Medium
   - ⭐⭐ **Notification System** — Medium
   - ⭐⭐⭐ **Social News Feed / Timeline** — Hard
   - ⭐⭐⭐ **Video Streaming (Netflix / YouTube)** — Hard
   - ⭐⭐⭐ **Distributed Cache (Redis Cluster)** — Hard
   - ⭐⭐⭐⭐ **Web Crawler & Search Engine** — Expert
   - ⭐⭐⭐⭐ **Ride-Sharing Dispatch (Uber / Lyft)** — Expert

6. **Deep Node Inspection & Configuration**:
   - **Cache**: LRU / LFU / FIFO / Random eviction, Max memory allocation, TTL, Cache hit ratio.
   - **Database**: SQL Relational / NoSQL Document / Key-Value, Hash / Range sharding, Read replicas (0–10).
   - **Load Balancer**: Round Robin / Least Connections / Consistent Hashing, Health check intervals.
   - **Microservices**: Instance scaling (1–20), concurrency limits, timeouts.
   - **Message Queue**: Kafka partitions, RabbitMQ.
   - **CDN**: Edge cache ratio (50%–99%).

7. **Synthetic Load Injector HUD**:
   - Dual-bound slider and numeric input for exact RPS control (1,000 to 1,000,000+ req/s).
   - Traffic profiles: Constant, Flash Spike, Diurnal Wave.

8. **Both Light and Dark Mode**:
   - Curated HSL color palette, Obsidian & Cyber Indigo dark theme, clean typography with Google Fonts (*Plus Jakarta Sans* & *JetBrains Mono*).

---

## 🏗️ Design Patterns Demonstrated

| Pattern | Module | Purpose |
|---------|--------|---------|
| **Observer** | `src/core/event-bus.js` | Complete decoupling between UI, Canvas, and Simulation layers |
| **Adapter** | `src/core/wasm-bridge.js` | Bridges JavaScript state with WebAssembly linear memory and routines |
| **Strategy** | `wasm-engine/src/load_balancer.rs` | Swappable routing algorithms (Round Robin, Least Conn, Consistent Hash) |
| **Command** | `src/core/history-manager.js` | Full reversible history stack for `Cmd+Z` Undo and `Cmd+Y` Redo |
| **Object Pool** | `src/canvas/particle-system.js` | Pre-allocated particle pool eliminating GC pauses for locked 60FPS |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+) and npm

### Running Locally
```bash
# Install dependencies
npm install

# Start Vite development server
npm run dev
```

Open `http://localhost:5173` in your browser!

### Compiling the Rust WebAssembly Engine (Optional)
The application includes an in-browser WebAssembly coprocessor that runs out-of-the-box. To compile the full Rust crate with `wasm-pack`:
```bash
cd wasm-engine
wasm-pack build --target web --release
```

---

## 📜 Keyboard Shortcuts

- `Del` / `Backspace`: Delete selected node or connection wire
- `Cmd + Z` / `Ctrl + Z`: Undo action
- `Cmd + Y` / `Ctrl + Y`: Redo action
- `Space + Drag`: Pan canvas
- `Mouse Wheel`: Zoom in / out centered on cursor
- `Escape`: Deselect all / cancel wire drag
