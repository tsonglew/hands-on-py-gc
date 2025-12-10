# Python Garbage Collection Visualizer

An interactive web application built with NestJS and React to visualize and understand Python's garbage collection mechanism, including reference counting and generational garbage collection.

## Features

- **Interactive Object Creation**: Create Python objects (dict, list, tuple, set, object, function) dynamically
- **Reference Management**: Create and remove references between objects to see how reference counting works
- **Root Object Management**: Mark objects as roots to protect them from collection
- **Generational GC**: Trigger garbage collection for different generations (0, 1, 2)
- **Real-time Visualization**: Interactive D3.js force-directed graph showing objects and their relationships
- **Step-by-Step Timeline**: View detailed steps of the garbage collection process
- **Statistics Panel**: Track object counts, collections, and generation statistics

## How Python GC Works

This visualizer demonstrates two main garbage collection mechanisms in Python:

### 1. Reference Counting
- Every object maintains a reference count
- When an object is referenced, its count increases
- When a reference is removed, the count decreases
- Objects with a reference count of 0 (and not marked as roots) are immediately collected

### 2. Generational Garbage Collection
- Objects are divided into 3 generations (0, 1, 2)
- New objects start in generation 0 (young)
- Objects that survive a collection are promoted to the next generation
- Generation 0 is collected most frequently, generation 2 least frequently
- Uses mark-and-sweep algorithm to detect cyclic references

## Project Structure

```
hands-on-py-gc/
├── src/                      # Backend (NestJS)
│   ├── gc/                   # GC module
│   │   ├── models/          # Data models (PyObject, GCState)
│   │   ├── dto/             # Data transfer objects
│   │   ├── gc.service.ts    # GC algorithm implementation
│   │   ├── gc.controller.ts # API endpoints
│   │   └── gc.module.ts     # Module definition
│   ├── app.module.ts        # Main app module
│   └── main.ts              # Application entry point
├── client/                   # Frontend (React + D3.js)
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── GCVisualization.tsx    # D3.js graph visualization
│   │   │   ├── ControlPanel.tsx       # Control interface
│   │   │   ├── StepTimeline.tsx       # Step history
│   │   │   └── StatsPanel.tsx         # Statistics display
│   │   ├── services/        # API service layer
│   │   ├── types/           # TypeScript types
│   │   ├── App.tsx          # Main app component
│   │   └── main.tsx         # React entry point
│   └── index.html           # HTML template
└── README.md                # This file
```

## Installation

```bash
# Install dependencies
pnpm install
```

## Development

Run both the backend and frontend in development mode:

```bash
# Run both servers concurrently
pnpm run dev

# Or run them separately:
pnpm run dev:server  # Backend on http://localhost:3000
pnpm run dev:client  # Frontend on http://localhost:5173
```

The frontend dev server proxies API requests to the backend.

## Build

```bash
# Build both frontend and backend
pnpm run build

# Or build separately:
pnpm run build:client  # Build React frontend
pnpm run build:server  # Build NestJS backend
```

## Production

```bash
# Start the production server
pnpm run start:prod
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## Usage Guide

### Creating Objects

1. Enter an object name (e.g., "my_list")
2. Select a type (dict, list, tuple, set, object, function)
3. Click "Create Object"

### Creating References

1. Select a source object from the dropdown
2. Select a target object from the dropdown
3. Click "Create Reference"
4. The target object's reference count will increase

### Managing Roots

- Click "Set Root" to protect an object from garbage collection
- Root objects are displayed in red in the visualization
- Click "Remove Root" to allow the object to be collected if its reference count reaches 0

### Triggering Garbage Collection

1. Select a generation (0, 1, or 2)
2. Click "Trigger GC"
3. Watch the visualization update and see the collection steps in the timeline

### Understanding the Visualization

- **Blue circles**: Normal objects
- **Red circles**: Root objects (protected from collection)
- **Green circles**: Marked objects (reachable during mark phase)
- **Gray circles**: Collected objects
- **Arrows**: References between objects
- **Labels**: Show object name, reference count, and generation

## API Endpoints

- `GET /api/gc/state` - Get current GC state
- `POST /api/gc/reset` - Reset the GC state
- `POST /api/gc/objects` - Create a new object
- `POST /api/gc/references` - Create a reference between objects
- `DELETE /api/gc/references` - Remove a reference
- `POST /api/gc/roots` - Set or unset an object as a root
- `POST /api/gc/collect` - Trigger garbage collection
- `GET /api/gc/steps` - Get all GC steps
- `GET /api/gc/steps/:stepNumber` - Get a specific step

## Learning Resources

This visualizer helps you understand:

1. **Reference Counting**: How Python tracks object references
2. **Cyclic References**: Why reference counting alone isn't enough
3. **Generational Hypothesis**: Why younger objects are collected more frequently
4. **Mark-and-Sweep**: How Python detects and collects cyclic garbage
5. **Generation Promotion**: How objects move between generations

## Technologies Used

- **Backend**: NestJS, TypeScript
- **Frontend**: React, TypeScript, D3.js
- **Build Tools**: Vite (frontend), NestJS CLI (backend)
- **Package Manager**: pnpm

## License

UNLICENSED
