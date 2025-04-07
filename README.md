# 3D Line Visualization

A Three.js implementation of a stable 3D line visualization with consistent visibility at all zoom levels.

## Features

- Smooth 3D line visualization
- Consistent visibility at all zoom levels and angles
- Interactive controls:
  - Zoom in/out
  - Rotate view
  - Pan camera
- Optimized performance with multiple line layers
- Responsive design

## Setup

1. Clone the repository
2. Serve the files using a local server (e.g., `python -m http.server 8000`)
3. Open `http://localhost:8000` in your browser

## Files

- `index.html` - Basic HTML structure and script imports
- `styles.css` - Basic styling for the container
- `main.js` - Three.js implementation of the 3D line visualization

## Controls

- Left mouse button: Rotate view
- Right mouse button: Pan camera
- Mouse wheel: Zoom in/out

## Technical Details

- Uses Three.js for 3D rendering
- Multiple line layers for consistent visibility
- Optimized camera settings for close-up viewing
- Responsive window resizing 