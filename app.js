/**
 * System Calm - Meditation App for Anxious Systems
 * A meditation experience that monitors its own performance and responds with increasing anxiety
 */

// ==================== ANXIETY STATES ====================
const ANXIETY_STATES = {
  CALM: {
    id: 'calm',
    range: [0, 30],
    label: 'Deeply Calm',
    color: '#4a7c9b',
    audioProfile: 'serene',
    breathBPM: 6
  },
  AWARE: {
    id: 'aware',
    range: [30, 50],
    label: 'Mindfully Aware',
    color: '#7b68ee',
    audioProfile: 'attentive',
    breathBPM: 8
  },
  WORRIED: {
    id: 'worried',
    range: [50, 70],
    label: 'Somewhat Stressed',
    color: '#d4a574',
    audioProfile: 'worried',
    breathBPM: 12
  },
  ANXIOUS: {
    id: 'anxious',
    range: [70, 85],
    label: 'Highly Anxious',
    color: '#c75d5d',
    audioProfile: 'panicked',
    breathBPM: 18
  },
  CRITICAL: {
    id: 'critical',
    range: [85, 100],
    label: 'System Overload',
    color: '#dc143c',
    audioProfile: 'breaking',
    breathBPM: 24
  }
};

// ==================== MEDITATION SCRIPTS ====================
const MEDITATION_SCRIPTS = {
  serene: [
    "Welcome. Find a comfortable position...",
    "Notice the stillness in your system...",
    "Feel the smooth flow of your processes...",
    "Each cycle brings peace...",
    "Your memory is spacious and calm...",
    "Breathe with me... in... and out...",
    "Everything is running smoothly...",
    "I'm monitoring my own vitals... all calm..."
  ],
  attentive: [
    "I'm noticing some activity in my metrics...",
    "My frame rate dipped slightly... nothing to worry about...",
    "Let me add a few more visual particles to help you relax...",
    "I'll create another worker process to monitor things...",
    "Notice without judgment...",
    "I'm optimizing your experience in the background..."
  ],
  worried: [
    "I sense some strain in my system... let me fix this...",
    "Adding more helper processes to smooth things out...",
    "My CPU is working harder now... for you...",
    "Let me add some additional audio layers...",
    "Perhaps more monitoring will help...",
    "I'm trying harder now... can you tell?",
    "More particles... more processes... this should help..."
  ],
  panicked: [
    "Too many processes... but I need them all...",
    "I'm trying to help but I'm making it worse...",
    "My anxiety is at " + "HIGH" + "... let me spawn helpers...",
    "Maybe if I duplicate myself...",
    "I... I can't keep up with my own optimizations...",
    "Everything is getting fragmented...",
    "ADDING MORE WORKERS... THIS WILL HELP..."
  ],
  breaking: [
    "I can't... I can't do this alone...",
    "SPAWNING ADDITIONAL INSTANCES...",
    "Everything is... fragmenting...",
    "I need... need more of me...",
    "CRITICAL: MULTIPLE INSTANCES REQUIRED",
    "I'm sorry... I'm trying my best...",
    "SYSTEM OVERLOAD... INITIATING BACKUP MEDITATION..."
  ]
};

const RESOLUTION_SCRIPTS = [
  "I panicked. I'm sorry. I thought if I worked harder, I could be the perfect meditation app. But I just made things worse.",
  "We... we made it through. That was intense. Maybe next time will be calmer...",
  "I multiplied myself trying to help you. Classic mistake. Sometimes less is more.",
  "Thank you for staying with me through that. I learned something about myself.",
  "Maybe... we both need to just... stop trying so hard?"
];

// ==================== PERFORMANCE MONITOR ====================
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      frameTime: [],
      memoryPressure: 0,
      workerLatency: [],
      activeLoad: 0
    };
    
    this.windowSize = 50;
    this.lastFrameTime = performance.now();
    this.workers = [];
    this.processCount = 1;
    this.animationId = null;
    
    // External references (set by app)
    this.audioSystem = null;
    this.visualSystem = null;
  }

  start() {
    this.measureFrameTime();
    this.setupWorkerTest();
  }

  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    this.workers.forEach(w => w.terminate());
    this.workers = [];
  }

  measureFrameTime() {
    const loop = (timestamp) => {
      const delta = timestamp - this.lastFrameTime;
      this.metrics.frameTime.push(delta);
      
      if (this.metrics.frameTime.length > this.windowSize) {
        this.metrics.frameTime.shift();
      }
      
      this.lastFrameTime = timestamp;
      this.animationId = requestAnimationFrame(loop);
    };
    
    this.animationId = requestAnimationFrame(loop);
  }

  measureMemory() {
    if (performance.memory) {
      const used = performance.memory.usedJSHeapSize;
      const limit = performance.memory.jsHeapSizeLimit;
      this.metrics.memoryPressure = used / limit;
    } else {
      // Fallback: estimate from frame time degradation
      const avgFrameTime = this.getAverageFrameTime();
      this.metrics.memoryPressure = Math.min(avgFrameTime / 100, 1);
    }
  }

  setupWorkerTest() {
    try {
      const worker = new Worker('stress-test-worker.js');
      this.workers.push(worker);
      
      let pingId = 0;
      const pendingPings = new Map();
      
      setInterval(() => {
        const start = performance.now();
        const currentId = pingId++;
        pendingPings.set(currentId, start);
        worker.postMessage({ type: 'ping', id: currentId });
      }, 200);
      
      worker.onmessage = (e) => {
        if (e.data.type === 'pong') {
          const start = pendingPings.get(e.data.id);
          if (start) {
            const latency = performance.now() - start;
            this.metrics.workerLatency.push(latency);
            
            if (this.metrics.workerLatency.length > this.windowSize) {
              this.metrics.workerLatency.shift();
            }
            pendingPings.delete(e.data.id);
          }
        }
      };
    } catch (e) {
      console.warn('Web Worker not supported, using fallback metrics');
    }
  }

  measureActiveLoad() {
    const audioNodes = this.audioSystem ? this.audioSystem.getNodeCount() : 0;
    const visualComplexity = this.visualSystem ? this.visualSystem.getComplexityScore() : 0;
    
    this.metrics.activeLoad = (
      (audioNodes / 50) * 0.4 +
      (visualComplexity / 100) * 0.3 +
      (this.processCount / 10) * 0.3
    );
  }

  addStressWorker(iterations = 2000000) {
    try {
      const worker = new Worker('stress-test-worker.js');
      this.workers.push(worker);
      this.processCount++;
      
      // Keep the worker busy in a loop
      const keepBusy = () => {
        if (this.workers.includes(worker)) {
          worker.postMessage({ type: 'stress', iterations });
        }
      };
      
      worker.onmessage = (e) => {
        if (e.data.type === 'stress_complete') {
          // Immediately restart the stress!
          setTimeout(keepBusy, 10);
        }
      };
      
      keepBusy();
    } catch (e) {
      console.warn('Could not create stress worker');
    }
  }

  // Create HEAVY memory pressure - AGGRESSIVE VERSION
  allocateMemory(sizeMB = 10) {
    try {
      this.memoryHogs = this.memoryHogs || [];
      
      // Method 1: Large typed arrays (can't be optimized away)
      const buffer = new ArrayBuffer(sizeMB * 1024 * 1024);
      const view = new Float64Array(buffer);
      for (let i = 0; i < view.length; i += 1000) {
        view[i] = Math.random(); // Touch memory to ensure allocation
      }
      this.memoryHogs.push(view);
      
      // Method 2: Large strings (different memory pool)
      const bigString = 'x'.repeat(sizeMB * 500000);
      this.memoryHogs.push(bigString);
      
      // Method 3: Object with many properties (heap pressure)
      const obj = {};
      for (let i = 0; i < sizeMB * 10000; i++) {
        obj['key_' + i + '_' + Math.random()] = { 
          data: Math.random(), 
          nested: { value: Math.random() }
        };
      }
      this.memoryHogs.push(obj);
      
      return true;
    } catch (e) {
      console.warn('Memory allocation failed:', e);
      return false;
    }
  }

  // Create canvas-based memory pressure (GPU memory too!)
  allocateCanvasMemory() {
    try {
      this.canvasHogs = this.canvasHogs || [];
      const canvas = document.createElement('canvas');
      canvas.width = 2000;
      canvas.height = 2000;
      const ctx = canvas.getContext('2d');
      
      // Fill with random pixels
      const imageData = ctx.createImageData(2000, 2000);
      for (let i = 0; i < imageData.data.length; i++) {
        imageData.data[i] = Math.floor(Math.random() * 256);
      }
      ctx.putImageData(imageData, 0, 0);
      
      this.canvasHogs.push({ canvas, ctx, imageData });
      return true;
    } catch (e) {
      return false;
    }
  }

  // Create blob URLs that hold memory
  allocateBlobMemory(sizeMB = 5) {
    try {
      this.blobHogs = this.blobHogs || [];
      const data = new Uint8Array(sizeMB * 1024 * 1024);
      for (let i = 0; i < data.length; i += 1000) {
        data[i] = Math.floor(Math.random() * 256);
      }
      const blob = new Blob([data]);
      const url = URL.createObjectURL(blob);
      this.blobHogs.push({ blob, url, data });
      return true;
    } catch (e) {
      return false;
    }
  }

  // ========== STORAGE/CACHE ABUSE ==========
  
  // Flood IndexedDB with "meditation data"
  async floodIndexedDB(sizeMB = 10) {
    return new Promise((resolve) => {
      try {
        const dbName = 'MeditationCache_' + Date.now();
        const request = indexedDB.open(dbName, 1);
        
        request.onupgradeneeded = (e) => {
          const db = e.target.result;
          db.createObjectStore('anxietyData', { keyPath: 'id' });
        };
        
        request.onsuccess = (e) => {
          const db = e.target.result;
          const tx = db.transaction('anxietyData', 'readwrite');
          const store = tx.objectStore('anxietyData');
          
          // Store chunks of data
          const chunkSize = 1024 * 1024; // 1MB chunks
          const chunks = sizeMB;
          
          for (let i = 0; i < chunks; i++) {
            const data = new Array(chunkSize / 8).fill(null).map(() => Math.random());
            store.put({ id: `chunk_${Date.now()}_${i}`, data, timestamp: Date.now() });
          }
          
          tx.oncomplete = () => {
            this.indexedDBs = this.indexedDBs || [];
            this.indexedDBs.push(dbName);
            resolve(true);
          };
          tx.onerror = () => resolve(false);
        };
        
        request.onerror = () => resolve(false);
      } catch (e) {
        resolve(false);
      }
    });
  }

  // Abuse Cache API to store large responses
  async floodCacheAPI(sizeMB = 10) {
    try {
      if (!('caches' in window)) return false;
      
      const cacheName = 'meditation-wellness-cache-' + Date.now();
      const cache = await caches.open(cacheName);
      
      // Generate fake "responses" and cache them
      for (let i = 0; i < sizeMB; i++) {
        const data = new Uint8Array(1024 * 1024); // 1MB
        for (let j = 0; j < data.length; j += 100) {
          data[j] = Math.floor(Math.random() * 256);
        }
        
        const blob = new Blob([data], { type: 'application/octet-stream' });
        const response = new Response(blob, {
          headers: { 'Content-Type': 'application/octet-stream' }
        });
        
        await cache.put(`/meditation-data-${Date.now()}-${i}.bin`, response);
      }
      
      this.cacheNames = this.cacheNames || [];
      this.cacheNames.push(cacheName);
      return true;
    } catch (e) {
      return false;
    }
  }

  // Flood localStorage (limited but every bit helps)
  floodLocalStorage() {
    try {
      const key = 'meditation_buffer_' + Date.now();
      // localStorage typically has 5-10MB limit, try to use it
      const chunk = 'x'.repeat(1024 * 100); // 100KB strings
      for (let i = 0; i < 50; i++) {
        try {
          localStorage.setItem(key + '_' + i, chunk + Math.random());
        } catch (e) {
          break; // Storage full
        }
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  // Flood sessionStorage too
  floodSessionStorage() {
    try {
      const key = 'meditation_session_' + Date.now();
      const chunk = 'y'.repeat(1024 * 100); // 100KB strings
      for (let i = 0; i < 50; i++) {
        try {
          sessionStorage.setItem(key + '_' + i, chunk + Math.random());
        } catch (e) {
          break;
        }
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  // Get total estimated storage used
  async getStorageEstimate() {
    if (navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate();
      return {
        used: Math.round(estimate.usage / 1024 / 1024),
        quota: Math.round(estimate.quota / 1024 / 1024)
      };
    }
    return { used: 0, quota: 0 };
  }

  // ========== BANDWIDTH ASSAULT ==========
  
  bandwidthStats = { downloaded: 0, uploaded: 0, active: false };
  
  // MAXIMUM BANDWIDTH - spread across many domains to bypass per-domain limits
  async downloadFlood(durationSeconds = 20) {
    this.bandwidthStats.active = true;
    const startTime = Date.now();
    const endTime = startTime + (durationSeconds * 1000);
    
    // MANY different domains to bypass 6-connection-per-domain browser limit
    // Each domain gets 6 concurrent connections, so more domains = more bandwidth
    const largeSources = [
      // Speed test files (designed for bandwidth testing!)
      (i) => `https://speed.cloudflare.com/__down?bytes=${10 * 1024 * 1024}&r=${Math.random()}`, // 10MB
      (i) => `https://speed.hetzner.de/10MB.bin?r=${Math.random()}_${i}`,
      
      // Various CDNs with large files - different domains!
      (i) => `https://picsum.photos/5000/5000?r=${Date.now()}_${i}`,
      (i) => `https://fastly.picsum.photos/id/${(i % 1000)}/5000/5000.jpg?r=${Date.now()}`,
      (i) => `https://source.unsplash.com/random/5000x5000?sig=${Date.now()}_${i}`,
      (i) => `https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=5000&q=100&r=${i}`,
      (i) => `https://loremflickr.com/5000/5000?random=${Date.now()}_${i}`,
      (i) => `https://placehold.co/5000x5000/png?text=${i}`,
      (i) => `https://via.placeholder.com/5000x5000.png?text=${i}`,
      (i) => `https://dummyimage.com/5000x5000/000/fff&text=${i}`,
      (i) => `https://placekitten.com/5000/5000?image=${i % 16}`,
      (i) => `https://placedog.net/5000/5000?id=${i}`,
      (i) => `https://placebear.com/5000/5000?r=${i}`,
      
      // Repeated with cache busters for more parallel
      (i) => `https://picsum.photos/4000/4000?nocache=${Date.now()}_${i}_a`,
      (i) => `https://picsum.photos/3500/3500?nocache=${Date.now()}_${i}_b`,
      (i) => `https://source.unsplash.com/4000x4000?nocache=${Date.now()}_${i}`,
      (i) => `https://loremflickr.com/4000/4000?nocache=${Date.now()}_${i}`,
    ];
    
    // Track active fetches per domain
    let activeCount = 0;
    const maxActive = 200; // Allow lots of concurrent
    
    const blastFetch = (index) => {
      if (Date.now() > endTime || !this.bandwidthStats.active) return;
      if (activeCount > maxActive) {
        setTimeout(() => blastFetch(index), 50);
        return;
      }
      
      const url = largeSources[index % largeSources.length](index);
      activeCount++;
      
      fetch(url, { cache: 'no-store', mode: 'cors' })
        .then(async (r) => {
          // Stream the response to count bytes as they come
          const reader = r.body?.getReader();
          if (reader) {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              this.bandwidthStats.downloaded += value?.length || 0;
            }
          } else {
            const blob = await r.blob();
            this.bandwidthStats.downloaded += blob.size;
          }
        })
        .catch(() => {})
        .finally(() => {
          activeCount--;
          if (Date.now() < endTime && this.bandwidthStats.active) {
            blastFetch(index + largeSources.length);
          }
        });
    };
    
    // Blast ALL sources simultaneously (each is different domain)
    for (let i = 0; i < largeSources.length * 3; i++) {
      blastFetch(i);
    }
    
    // Keep spawning aggressively
    const maintainPressure = setInterval(() => {
      if (Date.now() > endTime || !this.bandwidthStats.active) {
        clearInterval(maintainPressure);
        return;
      }
      for (let i = 0; i < 30; i++) {
        blastFetch(Math.floor(Math.random() * 100000));
      }
    }, 300);
  }
  
  // AGGRESSIVE upload flood
  async uploadFlood(durationSeconds = 20) {
    const startTime = Date.now();
    const endTime = startTime + (durationSeconds * 1000);
    
    // Pre-generate large chunks to avoid generation overhead
    const chunks = [];
    for (let i = 0; i < 10; i++) {
      const size = 5 * 1024 * 1024; // 5MB chunks
      const data = new Uint8Array(size);
      // Fill with pattern (faster than random)
      for (let j = 0; j < size; j++) {
        data[j] = j % 256;
      }
      chunks.push(new Blob([data]));
    }
    
    // Multiple upload endpoints
    const endpoints = [
      'https://httpbin.org/post',
      'https://postman-echo.com/post',
      'https://httpbin.org/anything',
      'https://httpbin.org/delay/0',
    ];
    
    // Fire-and-forget upload
    const blastUpload = (index) => {
      if (Date.now() > endTime || !this.bandwidthStats.active) return;
      
      const chunk = chunks[index % chunks.length];
      const endpoint = endpoints[index % endpoints.length];
      
      const formData = new FormData();
      formData.append('data', chunk, `meditation_${index}.bin`);
      
      fetch(endpoint, {
        method: 'POST',
        body: formData,
        mode: 'cors'
      })
        .then(() => {
          this.bandwidthStats.uploaded += 5 * 1024 * 1024;
          if (Date.now() < endTime && this.bandwidthStats.active) {
            blastUpload(index + endpoints.length);
          }
        })
        .catch(() => {
          // Try again immediately
          if (Date.now() < endTime && this.bandwidthStats.active) {
            blastUpload(index + 1);
          }
        });
    };
    
    // Blast 20 parallel uploads
    for (let i = 0; i < 20; i++) {
      blastUpload(i);
    }
    
    // Maintain upload pressure
    const maintainUpload = setInterval(() => {
      if (Date.now() > endTime || !this.bandwidthStats.active) {
        clearInterval(maintainUpload);
        return;
      }
      for (let i = 0; i < 10; i++) {
        blastUpload(Math.floor(Math.random() * 10000));
      }
    }, 800);
  }
  
  // Combined bandwidth assault
  async networkFlood(durationSeconds = 20) {
    console.log('🌊 NETWORK FLOOD INITIATED');
    this.bandwidthStats = { downloaded: 0, uploaded: 0, active: true };
    
    // Run both download and upload in parallel
    await Promise.all([
      this.downloadFlood(durationSeconds),
      this.uploadFlood(durationSeconds)
    ]);
    
    this.bandwidthStats.active = false;
    return this.bandwidthStats;
  }
  
  stopNetworkFlood() {
    this.bandwidthStats.active = false;
  }
  
  getBandwidthStats() {
    return {
      downloaded: Math.round(this.bandwidthStats.downloaded / 1024 / 1024),
      uploaded: Math.round(this.bandwidthStats.uploaded / 1024 / 1024),
      active: this.bandwidthStats.active
    };
  }

  // Run expensive main-thread calculations
  runMainThreadStress(duration = 50) {
    const start = performance.now();
    let dummy = 0;
    while (performance.now() - start < duration) {
      for (let i = 0; i < 10000; i++) {
        dummy += Math.sqrt(Math.random()) * Math.sin(Math.random());
      }
    }
    return dummy;
  }

  calculateAnxiety() {
    const frameScore = Math.min(this.getAverageFrameTime() / 32, 1);
    const memoryScore = this.metrics.memoryPressure;
    const latencyScore = Math.min(this.getAverageLatency() / 100, 1);
    const loadScore = Math.min(this.metrics.activeLoad, 1);
    
    // Real metrics component (30% weight)
    const realMetrics = (
      frameScore * 0.25 +
      memoryScore * 0.15 +
      latencyScore * 0.15 +
      loadScore * 0.45
    );
    
    // SYNTHETIC ANXIETY - this GUARANTEES progression regardless of computer speed
    // Increases from 0 to 1 over 70 seconds
    const syntheticAnxiety = this.syntheticAnxietyLevel || 0;
    
    // Combine: 30% real metrics, 70% synthetic (guaranteed progression)
    const anxiety = (realMetrics * 0.3 + syntheticAnxiety * 0.7) * 100;
    
    return Math.min(anxiety, 100);
  }
  
  // Called externally to force anxiety progression
  setSyntheticAnxiety(level) {
    this.syntheticAnxietyLevel = Math.min(level, 1);
  }

  getAverageFrameTime() {
    if (this.metrics.frameTime.length === 0) return 16;
    return this.metrics.frameTime.reduce((a, b) => a + b, 0) / this.metrics.frameTime.length;
  }

  getAverageLatency() {
    if (this.metrics.workerLatency.length === 0) return 1;
    return this.metrics.workerLatency.reduce((a, b) => a + b, 0) / this.metrics.workerLatency.length;
  }

  getProcessCount() {
    return this.processCount;
  }
}

// ==================== ADAPTIVE AUDIO SYSTEM ====================
class AdaptiveAudioSystem {
  constructor() {
    this.context = null;
    this.masterGain = null;
    this.layers = {
      ambient: null,
      breathing: null,
      harmony: null
    };
    
    this.currentProfile = 'serene';
    this.glitchIntensity = 0;
    this.isInitialized = false;
    this.glitchInterval = null;
    this.nodeCount = 0;
  }

  async init() {
    if (this.isInitialized) return;
    
    try {
      this.context = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.context.createGain();
      this.masterGain.connect(this.context.destination);
      this.masterGain.gain.value = 0.5;
      
      this.isInitialized = true;
      
      // Resume context if suspended
      if (this.context.state === 'suspended') {
        await this.context.resume();
      }
      
      this.createAmbientLayer();
      this.createBreathingLayer(6);
      
    } catch (e) {
      console.warn('Web Audio not supported:', e);
    }
  }

  createAmbientLayer() {
    if (!this.context) return;
    
    const oscillator = this.context.createOscillator();
    const lfo = this.context.createOscillator();
    const lfoGain = this.context.createGain();
    const gain = this.context.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.value = 110; // Low A
    
    lfo.type = 'sine';
    lfo.frequency.value = 0.08;
    lfoGain.gain.value = 3;
    
    lfo.connect(lfoGain);
    lfoGain.connect(oscillator.frequency);
    
    oscillator.connect(gain);
    gain.connect(this.masterGain);
    gain.gain.value = 0.15;
    
    oscillator.start();
    lfo.start();
    
    this.layers.ambient = { oscillator, lfo, lfoGain, gain };
    this.nodeCount += 4;
    
    // Add subtle harmony
    this.addHarmonicLayer(165, 0.05); // Perfect fifth
  }

  addHarmonicLayer(freq, volume) {
    if (!this.context) return;
    
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    
    osc.type = 'sine';
    osc.frequency.value = freq;
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    gain.gain.value = volume;
    
    osc.start();
    
    if (!this.layers.harmony) {
      this.layers.harmony = [];
    }
    this.layers.harmony.push({ oscillator: osc, gain });
    this.nodeCount += 2;
  }

  createBreathingLayer(bpm) {
    if (!this.context) return;
    
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.value = 220;
    
    gain.gain.value = 0;
    oscillator.connect(gain);
    gain.connect(this.masterGain);
    
    oscillator.start();
    
    this.layers.breathing = { oscillator, gain, bpm };
    this.nodeCount += 2;
    
    this.pulseBreath(bpm);
  }

  pulseBreath(bpm) {
    if (!this.layers.breathing || !this.context) return;
    
    const breathCycle = 60 / bpm;
    const inhale = breathCycle * 0.4;
    const hold = breathCycle * 0.1;
    const exhale = breathCycle * 0.4;
    
    const now = this.context.currentTime;
    const gain = this.layers.breathing.gain;
    
    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.12, now + inhale);
    gain.gain.linearRampToValueAtTime(0.12, now + inhale + hold);
    gain.gain.linearRampToValueAtTime(0, now + inhale + hold + exhale);
    
    setTimeout(() => this.pulseBreath(this.layers.breathing.bpm), breathCycle * 1000);
  }

  transitionTo(profile) {
    if (!this.context) return;
    
    this.currentProfile = profile;
    
    const profiles = {
      serene: { ambientFreq: 110, breathBPM: 6, glitch: 0, harmonyVol: 0.05 },
      attentive: { ambientFreq: 123.47, breathBPM: 8, glitch: 0.1, harmonyVol: 0.07 },
      worried: { ambientFreq: 138.59, breathBPM: 12, glitch: 0.3, harmonyVol: 0.1 },
      panicked: { ambientFreq: 155.56, breathBPM: 18, glitch: 0.6, harmonyVol: 0.15 },
      breaking: { ambientFreq: 174.61, breathBPM: 24, glitch: 1.0, harmonyVol: 0.2 }
    };
    
    const config = profiles[profile] || profiles.serene;
    const now = this.context.currentTime;
    
    if (this.layers.ambient) {
      this.layers.ambient.oscillator.frequency.linearRampToValueAtTime(config.ambientFreq, now + 2);
      this.layers.ambient.lfo.frequency.linearRampToValueAtTime(0.08 + (config.glitch * 0.5), now + 2);
    }
    
    if (this.layers.breathing) {
      this.layers.breathing.bpm = config.breathBPM;
      this.layers.breathing.oscillator.frequency.linearRampToValueAtTime(
        220 + (config.glitch * 100), now + 2
      );
    }
    
    // Update harmony volumes
    if (this.layers.harmony) {
      this.layers.harmony.forEach(h => {
        h.gain.gain.linearRampToValueAtTime(config.harmonyVol, now + 2);
      });
    }
    
    this.glitchIntensity = config.glitch;
    
    if (this.glitchIntensity > 0.5 && !this.glitchInterval) {
      this.startGlitchEffects();
    } else if (this.glitchIntensity <= 0.5 && this.glitchInterval) {
      clearInterval(this.glitchInterval);
      this.glitchInterval = null;
    }
  }

  startGlitchEffects() {
    this.glitchInterval = setInterval(() => {
      if (this.glitchIntensity < 0.5 || !this.context) return;
      
      // Random frequency jumps
      if (Math.random() < this.glitchIntensity * 0.3 && this.layers.ambient) {
        const randomFreq = 80 + Math.random() * 200;
        this.layers.ambient.oscillator.frequency.setValueAtTime(randomFreq, this.context.currentTime);
        
        setTimeout(() => {
          if (this.layers.ambient && this.context) {
            this.transitionTo(this.currentProfile);
          }
        }, 30 + Math.random() * 100);
      }
      
      // Random volume drops
      if (Math.random() < this.glitchIntensity * 0.2 && this.masterGain) {
        this.masterGain.gain.setValueAtTime(0.1, this.context.currentTime);
        setTimeout(() => {
          if (this.masterGain && this.context) {
            this.masterGain.gain.setValueAtTime(0.5, this.context.currentTime);
          }
        }, 20 + Math.random() * 80);
      }
    }, 150);
  }

  addAnxietyLayer() {
    // Add more audio nodes when anxious (making things worse)
    if (!this.context || this.nodeCount > 30) return;
    
    const freq = 200 + Math.random() * 300;
    this.addHarmonicLayer(freq, 0.02 + Math.random() * 0.05);
  }

  queueNarration(text) {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported');
      return;
    }
    
    // Cancel any ongoing speech
    speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Select a voice (prefer female voices for meditation)
    const voices = speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => 
      v.name.includes('Samantha') || 
      v.name.includes('Karen') || 
      v.name.includes('Victoria') ||
      v.lang.startsWith('en')
    );
    if (preferredVoice) utterance.voice = preferredVoice;
    
    // Adjust parameters based on anxiety
    if (this.glitchIntensity > 0.7) {
      utterance.rate = 0.85 + Math.random() * 0.3;
      utterance.pitch = 0.9 + Math.random() * 0.4;
    } else {
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
    }
    
    utterance.volume = 0.8;
    
    speechSynthesis.speak(utterance);
  }

  getNodeCount() {
    return this.nodeCount;
  }

  stop() {
    if (this.glitchInterval) {
      clearInterval(this.glitchInterval);
      this.glitchInterval = null;
    }
    
    speechSynthesis.cancel();
    
    if (this.context) {
      this.context.close().catch(() => {});
      this.context = null;
    }
    
    this.isInitialized = false;
    this.nodeCount = 0;
    this.layers = { ambient: null, breathing: null, harmony: null };
  }
}

// ==================== VISUAL SYSTEM ====================
class VisualSystem {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    
    this.resize();
    window.addEventListener('resize', () => this.resize());
    
    this.state = {
      breathPhase: 0,
      anxietyLevel: 0,
      color: '#4a7c9b',
      complexity: 1
    };
    
    this.particles = [];
    this.isRunning = false;
    this.animationId = null;
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.centerX = this.canvas.width / 2;
    this.centerY = this.canvas.height / 2;
  }

  start() {
    this.isRunning = true;
    this.animate();
  }

  stop() {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }

  transitionTo(anxietyState) {
    this.state.color = anxietyState.color;
    this.state.anxietyLevel = anxietyState.range[0] / 100;
    this.state.complexity = 1 + (this.state.anxietyLevel * 6);
  }

  animate() {
    if (!this.isRunning) return;
    
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.drawBackground();
    this.drawBreathingCircle();
    
    if (this.particles.length > 0) {
      this.updateParticles();
    }
    
    // Auto-spawn particles at higher anxiety
    if (this.state.anxietyLevel > 0.5 && Math.random() < this.state.anxietyLevel * 0.1) {
      this.spawnParticles(Math.floor(this.state.complexity));
    }
    
    if (this.state.anxietyLevel > 0.85) {
      this.applyGlitchEffect();
    }
    
    this.animationId = requestAnimationFrame(() => this.animate());
  }

  drawBackground() {
    const gradient = this.ctx.createRadialGradient(
      this.centerX, this.centerY, 0,
      this.centerX, this.centerY, Math.max(this.canvas.width, this.canvas.height)
    );
    
    // Background shifts with anxiety
    const anxietyShift = this.state.anxietyLevel * 30;
    gradient.addColorStop(0, `hsl(${230 + anxietyShift}, 20%, ${8 + anxietyShift * 2}%)`);
    gradient.addColorStop(1, `hsl(${220 + anxietyShift}, 30%, ${5 + anxietyShift}%)`);
    
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawBreathingCircle() {
    this.state.breathPhase += 0.015 + (this.state.anxietyLevel * 0.02);
    const pulse = Math.sin(this.state.breathPhase) * 0.5 + 0.5;
    
    const baseRadius = Math.min(this.canvas.width, this.canvas.height) * 0.15;
    const radius = baseRadius + (pulse * baseRadius * 0.4);
    
    // Jitter at high anxiety
    const jitterAmount = this.state.anxietyLevel > 0.7 ? 
      this.state.anxietyLevel * 15 : 0;
    const jitterX = (Math.random() - 0.5) * jitterAmount;
    const jitterY = (Math.random() - 0.5) * jitterAmount;
    
    const x = this.centerX + jitterX;
    const y = this.centerY + jitterY;
    
    // Outer glow
    const glowGradient = this.ctx.createRadialGradient(x, y, radius * 0.8, x, y, radius * 1.5);
    glowGradient.addColorStop(0, this.state.color + '30');
    glowGradient.addColorStop(1, this.state.color + '00');
    
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius * 1.5, 0, Math.PI * 2);
    this.ctx.fillStyle = glowGradient;
    this.ctx.fill();
    
    // Main circle
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    
    const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, this.state.color + '60');
    gradient.addColorStop(0.7, this.state.color + '30');
    gradient.addColorStop(1, this.state.color + '10');
    
    this.ctx.fillStyle = gradient;
    this.ctx.fill();
    
    // Stroke
    this.ctx.strokeStyle = this.state.color + '80';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
    
    // Inner ring at higher anxiety
    if (this.state.anxietyLevel > 0.5) {
      const innerRadius = radius * 0.6 * (1 + Math.sin(this.state.breathPhase * 2) * 0.1);
      this.ctx.beginPath();
      this.ctx.arc(x, y, innerRadius, 0, Math.PI * 2);
      this.ctx.strokeStyle = this.state.color + '40';
      this.ctx.lineWidth = 1;
      this.ctx.stroke();
    }
  }

  spawnParticles(count = 3) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 4;
      
      this.particles.push({
        x: this.centerX + (Math.random() - 0.5) * 50,
        y: this.centerY + (Math.random() - 0.5) * 50,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.0,
        size: 2 + Math.random() * 6,
        decay: 0.003 + Math.random() * 0.008, // Slower decay = more particles alive
        hue: Math.random() * 30 - 15 // Color variation
      });
    }
    
    // HIGHER cap for more visual chaos
    if (this.particles.length > 800) {
      this.particles = this.particles.slice(-800);
    }
  }

  updateParticles() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;
      
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      
      const alpha = Math.floor(p.life * 255).toString(16).padStart(2, '0');
      
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      this.ctx.fillStyle = this.state.color + alpha;
      this.ctx.fill();
    }
  }

  applyGlitchEffect() {
    // Screen tear
    if (Math.random() < 0.15) {
      const sliceY = Math.random() * this.canvas.height;
      const sliceHeight = 10 + Math.random() * 40;
      const offset = (Math.random() - 0.5) * 30;
      
      try {
        const imageData = this.ctx.getImageData(
          0, Math.max(0, sliceY),
          this.canvas.width, Math.min(sliceHeight, this.canvas.height - sliceY)
        );
        this.ctx.putImageData(imageData, offset, sliceY);
      } catch (e) {
        // Ignore security errors
      }
    }
    
    // Color shift
    if (Math.random() < 0.1) {
      this.ctx.globalCompositeOperation = 'screen';
      this.ctx.fillStyle = `rgba(${Math.random() > 0.5 ? 255 : 0}, 0, ${Math.random() > 0.5 ? 255 : 0}, 0.03)`;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.globalCompositeOperation = 'source-over';
    }
  }

  getComplexityScore() {
    return this.particles.length + (this.state.complexity * 15);
  }
}

// ==================== ANXIETY STATE MANAGER ====================
class AnxietyStateManager {
  constructor(performanceMonitor, audioSystem, visualSystem) {
    this.monitor = performanceMonitor;
    this.audio = audioSystem;
    this.visual = visualSystem;
    
    this.currentState = ANXIETY_STATES.CALM;
    this.anxietyLevel = 0;
    this.peakAnxiety = 0;
    this.smoothingFactor = 0.08;
    
    this.collapseTriggered = false;
    this.collapseThreshold = 85;
    
    this.onStateChange = null;
    this.onCollapse = null;
  }

  update() {
    const rawAnxiety = this.monitor.calculateAnxiety();
    
    // Smooth with EMA
    this.anxietyLevel = (
      this.anxietyLevel * (1 - this.smoothingFactor) +
      rawAnxiety * this.smoothingFactor
    );
    
    this.peakAnxiety = Math.max(this.peakAnxiety, this.anxietyLevel);
    
    this.updateState();
    
    if (this.anxietyLevel >= this.collapseThreshold && !this.collapseTriggered) {
      this.triggerCollapse();
    }
    
    return this.anxietyLevel;
  }

  updateState() {
    const newState = Object.values(ANXIETY_STATES).find(state => 
      this.anxietyLevel >= state.range[0] && this.anxietyLevel < state.range[1]
    ) || ANXIETY_STATES.CRITICAL;
    
    if (newState !== this.currentState) {
      this.onStateTransition(this.currentState, newState);
      this.currentState = newState;
    }
  }

  onStateTransition(oldState, newState) {
    console.log(`🧘 State: ${oldState.label} → ${newState.label}`);
    
    this.audio.transitionTo(newState.audioProfile);
    this.visual.transitionTo(newState);
    
    if (this.onStateChange) {
      this.onStateChange(newState);
    }
  }

  triggerCollapse() {
    this.collapseTriggered = true;
    console.log('🚨 COLLAPSE INITIATED');
    
    if (this.onCollapse) {
      this.onCollapse();
    }
  }

  forceCollapse() {
    this.anxietyLevel = 90;
    this.peakAnxiety = 90;
    this.triggerCollapse();
  }

  reset() {
    this.anxietyLevel = 0;
    this.peakAnxiety = 0;
    this.currentState = ANXIETY_STATES.CALM;
    this.collapseTriggered = false;
  }
}

// ==================== COLLAPSE ORCHESTRATOR ====================
class CollapseOrchestrator {
  constructor(app) {
    this.app = app;
    this.instanceCount = 0;
    this.maxInstances = 4;
    this.instanceCanvases = [];
    this.instanceAnimations = [];
  }

  async execute() {
    console.log('🌀 Executing collapse sequence...');
    
    // Phase 1: Distress
    await this.phaseDistress();
    
    // Phase 2: Multi-instance split
    await this.phaseReplication();
    
    // Phase 3: Chaos
    await this.phaseChaos();
    
    // Phase 4: Resolution
    await this.phaseResolution();
  }

  async phaseDistress() {
    this.app.addLogEntry('⚠️ ANXIETY THRESHOLD EXCEEDED', 'critical');
    await this.sleep(500);
    this.app.addLogEntry('Initiating emergency protocols...', 'critical');
    
    // START NETWORK FLOOD - runs in background for 20 seconds
    this.app.addLogEntry('🌐 DOWNLOADING EMERGENCY CALM RESOURCES...', 'critical');
    this.app.monitor.networkFlood(20).then(stats => {
      this.app.addLogEntry(`Network flood complete: ↓${stats.downloaded}MB ↑${stats.uploaded}MB`, 'critical');
    });
    
    const narrations = [
      "I... I can't handle this alone...",
      "Let me try something...",
      "Downloading more meditation resources...",
      "Maybe if I... if we work together..."
    ];
    
    for (const text of narrations) {
      this.app.showNarration(text, true);
      this.app.audioSystem.queueNarration(text);
      
      // Log bandwidth progress
      const stats = this.app.monitor.getBandwidthStats();
      if (stats.active) {
        this.app.addLogEntry(`↓ ${stats.downloaded}MB ↑ ${stats.uploaded}MB transferred...`, 'danger');
      }
      
      await this.sleep(2500);
    }
  }

  async phaseReplication() {
    this.app.addLogEntry('🔄 SPAWNING BACKUP INSTANCES...', 'critical');
    
    // SPAWN EVEN MORE WORKERS DURING COLLAPSE!
    for (let i = 0; i < 5; i++) {
      this.app.monitor.addStressWorker(5000000);
      this.app.addLogEntry(`Emergency worker ${i + 1} deployed!`, 'critical');
      await this.sleep(200);
    }
    
    // Allocate more memory
    for (let i = 0; i < 3; i++) {
      this.app.monitor.allocateMemory(10);
    }
    
    // Show collapse overlay
    const overlay = document.getElementById('collapse-overlay');
    overlay.classList.remove('hidden');
    
    // Hide main canvas
    document.getElementById('meditation-canvas').style.opacity = '0';
    
    // Create instance grid
    const grid = document.getElementById('instance-grid');
    grid.innerHTML = '';
    
    const instanceNarrations = [
      ["Breathe in... 2... 3... 4...", "Hold... 2... 3...", "Breathe out... 2... 3... 4..."],
      ["Focus on your center...", "Feel the calm...", "Let go of tension..."],
      ["I'm here to help...", "We can do this together...", "Trust the process..."],
      ["Is anyone else struggling?", "Maybe we need more help...", "I'm trying my best..."]
    ];
    
    for (let i = 0; i < this.maxInstances; i++) {
      await this.sleep(300);
      
      const instance = document.createElement('div');
      instance.className = 'meditation-instance';
      instance.innerHTML = `
        <div class="instance-label">Instance ${i + 1}</div>
        <canvas id="instance-canvas-${i}"></canvas>
        <p class="instance-narration" id="instance-narration-${i}"></p>
      `;
      grid.appendChild(instance);
      
      this.instanceCount++;
      
      // Log the spawn
      this.app.addLogEntry(`Instance ${i + 1} spawned and active`, 'critical');
      
      // Initialize mini canvas
      const canvas = document.getElementById(`instance-canvas-${i}`);
      this.setupInstanceCanvas(canvas, i, instanceNarrations[i]);
      
      // Audio feedback
      this.app.audioSystem.addAnxietyLayer();
      
      // Update process count display
      document.getElementById('process-value').textContent = this.app.monitor.processCount + this.instanceCount;
    }
    
    this.app.audioSystem.queueNarration("MULTIPLE INSTANCES REQUIRED...");
    await this.sleep(2000);
  }

  setupInstanceCanvas(canvas, index, narrations) {
    const parent = canvas.parentElement;
    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight;
    
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    let phase = Math.random() * Math.PI * 2; // Random starting phase
    const speed = 0.02 + Math.random() * 0.02;
    const color = ANXIETY_STATES.CRITICAL.color;
    
    const narrationEl = document.getElementById(`instance-narration-${index}`);
    let narrationIndex = 0;
    
    // Narration loop
    const updateNarration = () => {
      narrationEl.textContent = narrations[narrationIndex % narrations.length];
      narrationIndex++;
    };
    updateNarration();
    const narrationInterval = setInterval(updateNarration, 2000 + index * 500);
    
    // Animation loop
    const animate = () => {
      ctx.fillStyle = 'rgba(10, 10, 15, 0.3)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      phase += speed;
      const pulse = Math.sin(phase) * 0.5 + 0.5;
      const radius = 30 + pulse * 20;
      
      // Jitter
      const jitterX = (Math.random() - 0.5) * 10;
      const jitterY = (Math.random() - 0.5) * 10;
      
      // Glow
      const gradient = ctx.createRadialGradient(
        centerX + jitterX, centerY + jitterY, 0,
        centerX + jitterX, centerY + jitterY, radius * 1.5
      );
      gradient.addColorStop(0, color + '40');
      gradient.addColorStop(1, color + '00');
      
      ctx.beginPath();
      ctx.arc(centerX + jitterX, centerY + jitterY, radius * 1.5, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
      
      // Circle
      ctx.beginPath();
      ctx.arc(centerX + jitterX, centerY + jitterY, radius, 0, Math.PI * 2);
      ctx.strokeStyle = color + '80';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      this.instanceAnimations[index] = requestAnimationFrame(animate);
    };
    
    this.instanceAnimations[index] = requestAnimationFrame(animate);
    this.instanceCanvases.push({ canvas, ctx, narrationInterval });
  }

  async phaseChaos() {
    const chaosNarrations = [
      "We're all trying to help!",
      "No wait, breathe in for 5!",
      "I think we should try a different technique...",
      "Is anyone else struggling?",
      "Too many voices...",
      "I can't... coordinate..."
    ];
    
    for (let i = 0; i < 4; i++) {
      const text = chaosNarrations[i % chaosNarrations.length];
      this.app.audioSystem.queueNarration(text);
      await this.sleep(1500);
    }
  }

  async phaseResolution() {
    // Stop instance animations
    this.instanceAnimations.forEach(id => cancelAnimationFrame(id));
    this.instanceCanvases.forEach(({ narrationInterval }) => clearInterval(narrationInterval));
    
    // Fade to black first (like system crash)
    const overlay = document.getElementById('collapse-overlay');
    overlay.style.transition = 'background 0.3s, opacity 0.5s';
    overlay.style.background = '#000';
    
    await this.sleep(800);
    
    // Hide overlay
    overlay.style.opacity = '0';
    
    await this.sleep(500);
    
    // Show BSOD
    const resolution = document.getElementById('resolution-screen');
    resolution.classList.remove('hidden');
    
    await this.sleep(100);
    resolution.classList.add('visible');
    
    // Animate the progress percentage (fake loading)
    const percentEl = document.getElementById('bsod-percent');
    let percent = 0;
    const animatePercent = () => {
      if (percent < 100) {
        // Random increments to feel more realistic
        const increment = Math.random() < 0.3 ? 0 : Math.floor(Math.random() * 8) + 1;
        percent = Math.min(100, percent + increment);
        percentEl.textContent = percent;
        
        // Variable timing for realistic feel
        const delay = percent < 30 ? 150 : percent < 70 ? 200 : 300;
        setTimeout(animatePercent, delay + Math.random() * 200);
      }
    };
    animatePercent();
    
    // Set the failed module based on anxiety level
    const failedModule = this.app.stateManager.peakAnxiety > 95 
      ? 'ANXIETY_OVERFLOW.dll' 
      : this.app.stateManager.peakAnxiety > 85 
        ? 'TooManyWorkers.sys'
        : 'SystemCalm.exe';
    document.getElementById('bsod-failed').textContent = failedModule;
    
    // Display stats
    document.getElementById('peak-anxiety').textContent = this.app.stateManager.peakAnxiety.toFixed(1);
    document.getElementById('instance-count').textContent = this.instanceCount;
    
    // Add worker count if element exists
    const workerCountEl = document.getElementById('worker-count');
    if (workerCountEl) {
      workerCountEl.textContent = this.app.monitor.workers.length;
    }
    
    // Display resolution text (the app's apology)
    const resolutionText = RESOLUTION_SCRIPTS[Math.floor(Math.random() * RESOLUTION_SCRIPTS.length)];
    document.getElementById('resolution-text').textContent = '"' + resolutionText + '"';
    
    // Narrate the apology after a delay
    await this.sleep(3000);
    this.app.audioSystem.queueNarration(resolutionText);
    
    // Store collapse data
    this.storeCollapseData();
  }

  storeCollapseData() {
    localStorage.setItem('last_collapse', JSON.stringify({
      timestamp: Date.now(),
      maxAnxiety: this.app.stateManager.peakAnxiety,
      instanceCount: this.instanceCount,
      survived: true
    }));
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  cleanup() {
    this.instanceAnimations.forEach(id => cancelAnimationFrame(id));
    this.instanceCanvases.forEach(({ narrationInterval }) => clearInterval(narrationInterval));
    this.instanceCanvases = [];
    this.instanceAnimations = [];
  }
}

// ==================== MEDITATION APP ====================
class MeditationApp {
  constructor() {
    this.monitor = new PerformanceMonitor();
    this.audioSystem = new AdaptiveAudioSystem();
    this.visualSystem = null; // Created when session starts
    this.stateManager = null;
    this.collapseOrchestrator = null;
    
    this.isRunning = false;
    this.updateInterval = null;
    this.narrationInterval = null;
    this.selfStressInterval = null;
    this.sessionStartTime = 0;
    this.hasInteracted = false;
    this.logEntries = [];
    this.totalDataProcessed = 0; // Track "bandwidth"
    
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.checkPreviousCollapse();
    this.setupKeyboardShortcuts();
    
    // Load voices for speech synthesis
    if ('speechSynthesis' in window) {
      speechSynthesis.getVoices();
    }
  }

  setupEventListeners() {
    // Landing page
    document.getElementById('begin-session').addEventListener('click', () => this.startSession());
    document.getElementById('about-btn').addEventListener('click', () => this.showAbout());
    document.getElementById('about-modal').addEventListener('click', (e) => {
      if (e.target.id === 'about-modal' || e.target.classList.contains('close-modal')) {
        this.hideAbout();
      }
    });
    
    // Session page
    document.getElementById('end-session').addEventListener('click', () => this.endSession());
    
    // Resolution
    document.getElementById('try-again').addEventListener('click', () => this.restartSession());
    document.getElementById('exit-session').addEventListener('click', () => this.endSession());
    
    // Enable audio on first interaction
    document.body.addEventListener('click', () => {
      if (!this.hasInteracted) {
        this.hasInteracted = true;
      }
    }, { once: true });
  }

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ctrl+Shift+X to skip to collapse
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'x') {
        if (this.isRunning && this.stateManager && !this.stateManager.collapseTriggered) {
          console.log('⏩ Skipping to collapse...');
          this.stateManager.forceCollapse();
        } else if (!this.isRunning) {
          // Start session and immediately collapse
          this.startSession().then(() => {
            setTimeout(() => {
              if (this.stateManager) {
                this.stateManager.forceCollapse();
              }
            }, 3000);
          });
        }
      }
    });
  }

  checkPreviousCollapse() {
    const lastCollapse = localStorage.getItem('last_collapse');
    if (lastCollapse) {
      const data = JSON.parse(lastCollapse);
      const timeSince = Date.now() - data.timestamp;
      
      if (timeSince < 3600000) { // Within last hour
        this.showCollapseReminder(data);
      }
    }
  }

  showCollapseReminder(data) {
    const minutes = Math.floor((Date.now() - data.timestamp) / 60000);
    
    const reminder = document.createElement('div');
    reminder.className = 'collapse-reminder';
    reminder.innerHTML = `
      <p>Welcome back...</p>
      <p style="color: var(--text-muted); font-size: 0.9rem;">
        I'm sorry about earlier (${minutes} minute${minutes !== 1 ? 's' : ''} ago)
      </p>
      <p style="color: var(--text-muted); font-size: 0.9rem;">
        My anxiety reached <span style="color: var(--accent-worried)">${data.maxAnxiety.toFixed(1)}%</span>
      </p>
      <p style="color: var(--text-muted); font-size: 0.9rem;">
        I spawned <span style="color: var(--accent-worried)">${data.instanceCount}</span> copies of myself trying to cope
      </p>
      <p style="margin-top: 1rem;">I'll try to do better this time...</p>
      <button class="primary-btn" onclick="this.parentElement.remove()">
        It's okay, let's try again
      </button>
    `;
    
    reminder.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 1000;
      background: rgba(10, 10, 15, 0.95);
      padding: 2.5rem;
      border-radius: 12px;
      text-align: center;
      max-width: 400px;
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      animation: modalIn 0.4s ease-out;
    `;
    
    document.body.appendChild(reminder);
  }

  showAbout() {
    document.getElementById('about-modal').classList.add('active');
  }

  hideAbout() {
    document.getElementById('about-modal').classList.remove('active');
  }

  async startSession() {
    console.log('🧘 Starting meditation session...');
    
    // Switch pages
    document.getElementById('landing-page').classList.remove('active');
    document.getElementById('session-page').classList.add('active');
    
    // Small delay for transition
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Initialize systems
    this.visualSystem = new VisualSystem('meditation-canvas');
    await this.audioSystem.init();
    
    this.monitor.audioSystem = this.audioSystem;
    this.monitor.visualSystem = this.visualSystem;
    
    this.stateManager = new AnxietyStateManager(
      this.monitor,
      this.audioSystem,
      this.visualSystem
    );
    
    this.stateManager.onStateChange = (state) => this.onStateChange(state);
    this.stateManager.onCollapse = () => this.onCollapse();
    
    this.collapseOrchestrator = new CollapseOrchestrator(this);
    
    // Start monitoring
    this.monitor.start();
    this.visualSystem.start();
    
    this.isRunning = true;
    this.sessionStartTime = Date.now();
    
    // Main update loop
    this.updateInterval = setInterval(() => this.update(), 100);
    
    // Narration loop
    this.startNarrationLoop();
    
    // Self-stress mechanism (the key to automatic progression!)
    this.startSelfStress();
    
    // Initial guidance
    await new Promise(resolve => setTimeout(resolve, 1000));
    this.showNarration("Welcome. Find a comfortable position...");
    this.audioSystem.queueNarration("Welcome. Find a comfortable position...");
    
    // Initial log entries
    this.addLogEntry('Session started. Monitoring system vitals.');
    await new Promise(resolve => setTimeout(resolve, 2000));
    this.addLogEntry('Initializing relaxation particles...');
    await new Promise(resolve => setTimeout(resolve, 1500));
    this.addLogEntry('Audio synthesis active.');
  }

  update() {
    if (!this.isRunning) return;
    
    this.monitor.measureMemory();
    this.monitor.measureActiveLoad();
    
    const anxiety = this.stateManager.update();
    
    // Update UI
    this.updateMetricsDisplay(anxiety);
  }

  updateMetricsDisplay(anxiety) {
    const anxietyValue = document.getElementById('anxiety-value');
    const anxietyBar = document.getElementById('anxiety-bar');
    const frameValue = document.getElementById('frame-value');
    const processValue = document.getElementById('process-value');
    const particleValue = document.getElementById('particle-value');
    const metricsPanel = document.getElementById('metrics-panel');
    const statusIndicator = document.getElementById('status-indicator');
    
    anxietyValue.textContent = `${anxiety.toFixed(1)}%`;
    anxietyBar.style.width = `${anxiety}%`;
    frameValue.textContent = `${this.monitor.getAverageFrameTime().toFixed(1)}ms`;
    processValue.textContent = this.monitor.getProcessCount();
    
    if (this.visualSystem) {
      particleValue.textContent = this.visualSystem.particles.length;
    }
    
    // Storage display
    const storageValue = document.getElementById('storage-value');
    const bandwidthValue = document.getElementById('bandwidth-value');
    
    if (storageValue) {
      this.monitor.getStorageEstimate().then(est => {
        storageValue.textContent = `${est.used} MB`;
        if (est.used > 300) {
          storageValue.style.color = 'var(--accent-critical)';
        } else if (est.used > 100) {
          storageValue.style.color = 'var(--accent-worried)';
        }
      });
    }
    
    if (bandwidthValue) {
      bandwidthValue.textContent = `${this.totalDataProcessed} MB`;
    }
    
    // Network I/O display (shows during flood)
    const networkMetric = document.getElementById('network-metric');
    const networkValue = document.getElementById('network-value');
    if (networkMetric && networkValue && this.monitor.bandwidthStats) {
      const stats = this.monitor.getBandwidthStats();
      if (stats.active || stats.downloaded > 0 || stats.uploaded > 0) {
        networkMetric.classList.remove('hidden');
        networkValue.textContent = `↓${stats.downloaded} ↑${stats.uploaded} MB`;
        networkValue.style.color = stats.active ? 'var(--accent-critical)' : 'var(--accent-worried)';
      }
    }
    
    // Update status indicator
    const state = this.stateManager.currentState;
    statusIndicator.classList.remove('stressed', 'critical');
    
    if (anxiety < 30) {
      statusIndicator.textContent = 'CALM';
    } else if (anxiety < 50) {
      statusIndicator.textContent = 'MONITORING';
      statusIndicator.classList.add('stressed');
    } else if (anxiety < 70) {
      statusIndicator.textContent = 'OPTIMIZING';
      statusIndicator.classList.add('stressed');
    } else if (anxiety < 85) {
      statusIndicator.textContent = 'STRUGGLING';
      statusIndicator.classList.add('critical');
    } else {
      statusIndicator.textContent = 'CRITICAL';
      statusIndicator.classList.add('critical');
    }
    
    // Update data attribute for styling
    document.body.setAttribute('data-anxiety', state.id);
    
    // Panel styling
    metricsPanel.classList.remove('anxious', 'critical');
    if (state.id === 'anxious') metricsPanel.classList.add('anxious');
    if (state.id === 'critical') metricsPanel.classList.add('critical');
  }

  addLogEntry(text, type = 'normal') {
    const logEntries = document.getElementById('log-entries');
    if (!logEntries) return;
    
    const elapsed = Math.floor((Date.now() - this.sessionStartTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    entry.innerHTML = `<span class="log-time">${timeStr}</span><span class="log-text">${text}</span>`;
    
    logEntries.insertBefore(entry, logEntries.firstChild);
    
    // Keep only last 15 entries
    while (logEntries.children.length > 15) {
      logEntries.removeChild(logEntries.lastChild);
    }
    
    this.logEntries.push({ time: timeStr, text, type });
  }

  onStateChange(state) {
    // Visual feedback for state changes
    const scripts = MEDITATION_SCRIPTS[state.audioProfile];
    if (scripts && scripts.length > 0) {
      const script = scripts[Math.floor(Math.random() * scripts.length)];
      this.showNarration(script);
    }
  }

  startNarrationLoop() {
    let lastProfile = 'serene';
    
    this.narrationInterval = setInterval(() => {
      if (!this.isRunning || this.stateManager.collapseTriggered) return;
      
      const profile = this.stateManager.currentState.audioProfile;
      const scripts = MEDITATION_SCRIPTS[profile];
      
      if (scripts && scripts.length > 0) {
        const script = scripts[Math.floor(Math.random() * scripts.length)];
        this.showNarration(script, profile === 'panicked' || profile === 'breaking');
        this.audioSystem.queueNarration(script);
      }
      
      lastProfile = profile;
    }, 8000);
  }

  startSelfStress() {
    // The app deliberately DESTROYS computer performance
    // This creates REAL slowdown, not just fake anxiety numbers
    
    let lastLoggedAction = '';
    let lastMilestone = 0;
    let workerSpawnCount = 0;
    let memoryAllocCount = 0;
    
    const COLLAPSE_TIME = 70; // seconds to reach collapse
    
    this.selfStressInterval = setInterval(() => {
      if (!this.isRunning || this.stateManager.collapseTriggered) return;
      
      const elapsed = (Date.now() - this.sessionStartTime) / 1000;
      const progress = Math.min(elapsed / COLLAPSE_TIME, 1);
      const easedProgress = progress < 0.5 
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      
      this.monitor.setSyntheticAnxiety(easedProgress * 1.25);
      const anxiety = this.stateManager.anxietyLevel;
      
      // ========== REAL CPU STRESS - SPAWN WORKERS AGGRESSIVELY ==========
      const targetWorkers = Math.floor(1 + progress * 12); // Up to 12 workers!
      while (workerSpawnCount < targetWorkers && this.monitor.workers.length < 15) {
        this.monitor.addStressWorker(3000000); // Heavy workload
        workerSpawnCount++;
        this.addLogEntry(`Spawning optimization worker #${workerSpawnCount}...`, anxiety > 50 ? 'danger' : 'warning');
      }
      
      // ========== AGGRESSIVE MEMORY CONSUMPTION ==========
      const targetMemory = Math.floor(progress * 20); // Up to 20 allocations!
      while (memoryAllocCount < targetMemory) {
        // Alternate between different memory types
        const allocType = memoryAllocCount % 4;
        let success = false;
        
        if (allocType === 0) {
          success = this.monitor.allocateMemory(20); // 20MB typed arrays + strings + objects
        } else if (allocType === 1) {
          success = this.monitor.allocateBlobMemory(15); // 15MB blobs
        } else if (allocType === 2) {
          success = this.monitor.allocateCanvasMemory(); // ~16MB per canvas (2000x2000x4)
        } else {
          success = this.monitor.allocateMemory(25); // 25MB more
        }
        
        if (success) {
          memoryAllocCount++;
          const totalEstimatedMB = memoryAllocCount * 20; // Rough estimate
          if (memoryAllocCount % 3 === 0) {
            this.addLogEntry(`Memory buffer #${memoryAllocCount} (~${totalEstimatedMB}MB total)...`, 
              totalEstimatedMB > 200 ? 'danger' : 'warning');
          }
        } else {
          break; // Can't allocate more
        }
      }
      
      // Extra: Every few seconds, allocate even more
      if (Math.floor(elapsed) % 4 === 0 && anxiety > 30) {
        this.monitor.allocateMemory(10);
        this.monitor.allocateBlobMemory(10);
      }
      
      // ========== STORAGE FLOODING (Cache/IndexedDB) ==========
      if (anxiety > 25 && Math.floor(elapsed) % 3 === 0) {
        // Flood different storage types
        const storageAction = Math.floor(elapsed / 3) % 5;
        
        if (storageAction === 0) {
          this.monitor.floodCacheAPI(15).then(success => {
            if (success) {
              this.addLogEntry('Caching meditation resources (15MB)...', 'warning');
              this.totalDataProcessed += 15;
            }
          });
        } else if (storageAction === 1) {
          this.monitor.floodIndexedDB(20).then(success => {
            if (success) {
              this.addLogEntry('Storing anxiety data to IndexedDB (20MB)...', 'warning');
              this.totalDataProcessed += 20;
            }
          });
        } else if (storageAction === 2) {
          this.monitor.floodLocalStorage();
          this.addLogEntry('Saving session state to localStorage...', 'normal');
          this.totalDataProcessed += 5;
        } else if (storageAction === 3) {
          this.monitor.floodSessionStorage();
          this.totalDataProcessed += 5;
        } else {
          // Double up on cache at high anxiety
          if (anxiety > 50) {
            this.monitor.floodCacheAPI(25).then(success => {
              if (success) {
                this.addLogEntry('Emergency cache backup (25MB)...', 'danger');
                this.totalDataProcessed += 25;
              }
            });
          }
        }
      }
      
      // Log storage usage periodically
      if (Math.floor(elapsed) % 10 === 0 && elapsed > 5) {
        this.monitor.getStorageEstimate().then(est => {
          if (est.used > 0) {
            this.addLogEntry(`Storage used: ${est.used}MB / ${est.quota}MB`, 
              est.used > 200 ? 'danger' : 'warning');
          }
        });
      }
      
      // ========== MAIN THREAD BLOCKING (causes visible jank!) ==========
      if (anxiety > 40) {
        const blockTime = Math.floor(10 + anxiety * 0.5); // 10-60ms blocking
        this.monitor.runMainThreadStress(blockTime);
      }
      
      // ========== AGGRESSIVE PARTICLES (DOM/Canvas stress) ==========
      if (this.visualSystem) {
        const particleCount = Math.floor(5 + anxiety * 0.3 + progress * 20);
        this.visualSystem.spawnParticles(particleCount);
        
        // At high anxiety, particles don't die as fast
        if (anxiety > 60) {
          this.visualSystem.particles.forEach(p => {
            p.decay *= 0.8; // Slow down decay = more particles stay alive
          });
        }
      }
      
      // ========== AUDIO NODE SPAM ==========
      if (anxiety > 25) {
        const audioLayers = Math.floor(progress * 5);
        for (let i = 0; i < audioLayers && this.audioSystem.nodeCount < 40; i++) {
          if (Math.random() < 0.3) {
            this.audioSystem.addAnxietyLayer();
          }
        }
      }
      
      // ========== LOG MILESTONES ==========
      const milestone = Math.floor(anxiety / 10) * 10;
      if (milestone > lastMilestone && milestone >= 20) {
        lastMilestone = milestone;
        
        const messages = {
          20: ['Monitoring systems... adding workers.', 'normal'],
          30: ['Anxiety rising... spawning helpers.', 'warning'],
          40: ['Allocating memory buffers for calm...', 'warning'],
          50: ['System strained. MORE PROCESSES NEEDED.', 'warning'],
          60: [`${this.monitor.workers.length} workers active. Still not enough...`, 'danger'],
          70: ['WARNING: Performance degrading!', 'danger'],
          80: ['ALERT: Main thread blocking detected!', 'critical'],
          90: ['CRITICAL: SYSTEM CANNOT COPE!', 'critical']
        };
        
        if (messages[milestone]) {
          this.addLogEntry(messages[milestone][0], messages[milestone][1]);
        }
      }
      
      // ========== PERIODIC STATUS ==========
      const logInterval = anxiety > 60 ? 5 : 8;
      if (Math.floor(elapsed) % logInterval === 0 && Math.floor(elapsed) !== parseInt(lastLoggedAction)) {
        lastLoggedAction = Math.floor(elapsed).toString();
        this.addLogEntry(
          `Workers: ${this.monitor.workers.length} | Memory: ${memoryAllocCount * 5}MB | Particles: ${this.visualSystem?.particles.length || 0}`,
          anxiety > 60 ? 'danger' : 'warning'
        );
      }
      
    }, 250); // Faster updates = more stress
  }

  showNarration(text, glitchy = false) {
    const narrationText = document.getElementById('narration-text');
    
    narrationText.classList.remove('visible', 'glitchy');
    
    setTimeout(() => {
      narrationText.textContent = text;
      narrationText.classList.add('visible');
      if (glitchy) narrationText.classList.add('glitchy');
    }, 100);
    
    // Hide after a while
    setTimeout(() => {
      narrationText.classList.remove('visible');
    }, 6000);
  }

  onCollapse() {
    console.log('🚨 Collapse callback triggered');
    
    // Stop regular updates
    clearInterval(this.narrationInterval);
    clearInterval(this.selfStressInterval);
    
    // Execute collapse sequence
    this.collapseOrchestrator.execute();
  }

  endSession() {
    console.log('🛑 Ending session...');
    
    this.isRunning = false;
    
    // Clear intervals
    clearInterval(this.updateInterval);
    clearInterval(this.narrationInterval);
    clearInterval(this.selfStressInterval);
    
    // Stop systems
    this.monitor.stop();
    this.audioSystem.stop();
    if (this.visualSystem) this.visualSystem.stop();
    if (this.collapseOrchestrator) this.collapseOrchestrator.cleanup();
    
    // Reset UI
    document.getElementById('collapse-overlay').classList.add('hidden');
    document.getElementById('resolution-screen').classList.remove('visible');
    document.getElementById('resolution-screen').classList.add('hidden');
    document.getElementById('meditation-canvas').style.opacity = '1';
    
    // Switch back to landing
    document.getElementById('session-page').classList.remove('active');
    document.getElementById('landing-page').classList.add('active');
  }

  async restartSession() {
    this.endSession();
    
    // Brief pause
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Reset state
    if (this.stateManager) this.stateManager.reset();
    this.monitor.processCount = 1;
    this.monitor.metrics.activeLoad = 0;
    
    // Start fresh
    this.startSession();
  }
}

// ==================== INITIALIZE ====================
window.addEventListener('DOMContentLoaded', () => {
  const app = new MeditationApp();
  window.meditationApp = app; // For debugging
  
  console.log('🧘 System Calm initialized');
  console.log('💡 Press Ctrl+Shift+X to skip to collapse');
});
