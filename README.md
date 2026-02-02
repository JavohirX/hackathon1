# 🧘 System Calm

> **Meditation for You & Your Computer**

A meditation app that monitors its own performance and responds with increasing anxiety. When the system can't cope, it fragments into multiple instances, each desperately trying to guide you to calm.

## 🎯 The Concept

System Calm is not your typical meditation app. It monitors itself—frame rate, memory pressure, worker responsiveness—and genuinely becomes anxious about its own performance.

The twist? The monitoring creates load. The load increases anxiety. The anxiety triggers more monitoring. It's a perfect feedback loop that culminates in a digital panic attack.

**The secret sauce**: This isn't fake chaos. The system genuinely stresses itself while trying to help you relax.

## 🚀 Quick Start

### Deploy to Vercel
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/system-calm)

Or deploy manually:
```bash
npm i -g vercel
vercel --prod
```

### Run Locally
Just open `index.html` in a browser (for full functionality, use a local server):
```bash
npx serve .
```

## ⏱ The Experience (2-3 minutes)

1. **Calm Phase** (0:00-0:30)
   - Soothing voice, gentle visuals
   - "Everything is running smoothly..."

2. **Escalation** (0:30-1:30)
   - App starts self-stressing
   - Metrics climb, voice becomes concerned
   - "I'm creating additional guidance processes..."

3. **Collapse** (1:30-2:30)
   - Screen splits into 4 meditation instances
   - Multiple voices talking over each other
   - Each instance trying (and failing) to help

4. **Resolution** (2:30+)
   - Fade to black
   - Reflective message about trying too hard
   - Option to try again

## 🎹 Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+X` | Skip to collapse (for judges/demos) |

## 🛠 Technical Stack

- **Vanilla JavaScript** - No framework overhead
- **Web Audio API** - Real-time audio synthesis and glitch effects
- **Canvas API** - Breathing circle with particle system
- **Performance API** - Frame timing, memory monitoring
- **Web Workers** - Latency testing and synthetic load
- **Web Speech API** - Meditation narration

## 📁 Project Structure

```
system-calm/
├── index.html          # Main HTML structure
├── styles.css          # All styling (CSS variables, animations)
├── app.js              # Core application (all classes)
├── stress-test-worker.js   # Web Worker for stress testing
├── vercel.json         # Vercel deployment config
└── README.md           # This file
```

## 🎨 Design Philosophy

- **The monitoring IS the art** - Performance measurement creates performance degradation
- **Self-inflicted chaos** - The app creates its own stress while trying to optimize your calm
- **Emotional resonance** - You feel bad for the app as it struggles
- **Meta-commentary** - About systems that try too hard and make things worse

## 🔧 Customization

### Anxiety Thresholds
In `app.js`, modify `ANXIETY_STATES`:
```javascript
const ANXIETY_STATES = {
  CALM: { range: [0, 30], ... },
  AWARE: { range: [30, 50], ... },
  // etc.
};
```

### Collapse Trigger
```javascript
this.collapseThreshold = 85; // Adjust when collapse happens
```

### Self-Stress Rate
In `startSelfStress()`, adjust the intervals and probability values to make the progression faster or slower.

## 📱 Mobile Support

The app adapts to mobile:
- Single-column instance grid
- Touch-friendly controls
- Adjusted visual complexity

## 🐛 Known Behaviors (Features, Not Bugs)

- **Audio glitches at high anxiety** - Intentional
- **Screen tears and color shifts** - Intentional
- **Multiple voices overlapping** - Very intentional
- **Browser might feel sluggish** - That's the point

## 📄 License

MIT - Do whatever you want with it.

---

*"Sometimes the best thing to do is stop trying so hard."*
