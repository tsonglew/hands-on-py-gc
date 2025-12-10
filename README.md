# Python Garbage Collection Visualizer

Interactive web application to visualize and understand Python's garbage collection mechanism.

![Python GC Visualizer](https://img.shields.io/badge/Python-GC%20Visualizer-blue)
![NestJS](https://img.shields.io/badge/NestJS-Backend-red)
![React](https://img.shields.io/badge/React-Frontend-61dafb)

## Quick Start

```bash
# Install dependencies
pnpm install

# Build the application
pnpm run build

# Start the application
pnpm run start
```

Visit [http://localhost:3000](http://localhost:3000) to use the visualizer.

## Development Mode

```bash
# Run both frontend and backend in development mode
pnpm run dev
```

This will start:
- Backend server at [http://localhost:3000](http://localhost:3000)
- Frontend dev server at [http://localhost:5173](http://localhost:5173) (with API proxy)

## Features

### Interactive Visualization
- **D3.js Force Graph**: Visualize objects and their references in real-time
- **Color-Coded Objects**:
  - Blue: Normal objects
  - Red: Root objects (protected from GC)
  - Green: Marked (reachable) objects
  - Gray: Collected objects

### Python GC Mechanisms

#### 1. Reference Counting
- Create objects and references to see reference counts in action
- Remove references to trigger immediate collection
- Mark objects as roots to protect them from collection

#### 2. Generational GC
- Three generations (0: Young, 1: Middle, 2: Old)
- New objects start in generation 0
- Surviving objects are promoted to higher generations
- Trigger collection for specific generations

### Interactive Controls
- **Create Objects**: Add Python objects (dict, list, tuple, set, object, function)
- **Manage References**: Create and remove references between objects
- **Set Roots**: Mark objects as GC roots
- **Trigger GC**: Run garbage collection for any generation
- **View Steps**: See detailed timeline of GC operations

### Statistics Dashboard
- Total objects count
- Alive vs collected objects
- Number of GC collections
- Generation statistics

## How Python GC Works

### Reference Counting
Every Python object maintains a reference count. When the count reaches zero (and the object is not a root), it's immediately collected.

### Mark-and-Sweep (Generational)
Python uses a generational garbage collector to detect and collect cyclic references:

1. **Mark Phase**: Starting from root objects, mark all reachable objects
2. **Sweep Phase**: Collect all unmarked objects
3. **Generation Promotion**: Surviving objects move to the next generation

## Project Structure

```
hands-on-py-gc/
├── src/                          # Backend (NestJS)
│   ├── gc/                       # GC module
│   │   ├── models/              # PyObject, GCState models
│   │   ├── dto/                 # API DTOs
│   │   ├── gc.service.ts        # GC algorithm implementation
│   │   ├── gc.controller.ts     # REST API endpoints
│   │   └── gc.module.ts
│   └── app.module.ts
├── client/                       # Frontend (React + D3.js)
│   ├── src/
│   │   ├── components/          # React components
│   │   │   ├── GCVisualization.tsx
│   │   │   ├── ControlPanel.tsx
│   │   │   ├── StepTimeline.tsx
│   │   │   └── StatsPanel.tsx
│   │   ├── services/            # API client
│   │   └── App.tsx
│   └── index.html
└── README.md
```

## API Endpoints

- `GET /api/gc/state` - Get current GC state
- `POST /api/gc/reset` - Reset the GC state
- `POST /api/gc/objects` - Create a new object
- `POST /api/gc/references` - Create a reference
- `DELETE /api/gc/references` - Remove a reference
- `POST /api/gc/roots` - Set/unset root object
- `POST /api/gc/collect` - Trigger garbage collection
- `GET /api/gc/steps` - Get all GC steps

## Technologies

- **Backend**: NestJS, TypeScript
- **Frontend**: React, TypeScript, D3.js
- **Build**: Vite (frontend), NestJS CLI (backend)
- **Package Manager**: pnpm

## Usage Example

1. **Create some objects**:
   - Create "list_a" (type: list)
   - Create "dict_b" (type: dict)
   - Create "obj_c" (type: object)

2. **Add references**:
   - list_a → dict_b
   - dict_b → obj_c
   - obj_c → list_a (creates a cycle!)

3. **Set a root**:
   - Mark list_a as a root object

4. **Trigger GC**:
   - Click "Trigger GC" for generation 0
   - Watch the mark-and-sweep process in the timeline
   - See that all objects survive because list_a is a root

5. **Remove root and trigger again**:
   - Unmark list_a as root
   - Trigger GC again
   - All three objects will be collected (cyclic garbage)

## License

UNLICENSED

## Learn More

This visualizer demonstrates core concepts from Python's CPython implementation:
- [PEP 442 - Safe object finalization](https://www.python.org/dev/peps/pep-0442/)
- [CPython gc module documentation](https://docs.python.org/3/library/gc.html)
- [Python Memory Management](https://docs.python.org/3/c-api/memory.html)
