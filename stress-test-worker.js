// Web Worker for AGGRESSIVE stress testing
// This worker is designed to actually slow down the computer

// AGGRESSIVE memory allocation in worker
let memoryHog = [];
let stringHog = [];
let objectHog = [];

// Immediately allocate some memory when worker starts
try {
  memoryHog.push(new Array(2000000).fill(Math.random()));
  stringHog.push('RAM_CONSUMER_'.repeat(500000));
} catch(e) {}

self.onmessage = function(e) {
  const { type, iterations, id } = e.data;
  
  switch(type) {
    case 'ping':
      self.postMessage({ type: 'pong', id });
      break;
      
    case 'stress':
      // HEAVY CPU load + MEMORY consumption
      const workload = iterations || 3000000;
      let dummy = 0;
      
      // Aggressively allocate memory in each worker
      if (memoryHog.length < 10) {
        try {
          // Large typed array
          memoryHog.push(new Float64Array(1000000)); // ~8MB
          // Large string
          stringHog.push('MEDITATION_DATA_'.repeat(300000)); // ~5MB
          // Object with many keys
          const obj = {};
          for (let j = 0; j < 50000; j++) {
            obj['k' + j] = Math.random();
          }
          objectHog.push(obj);
        } catch(e) {}
      }
      
      // Do expensive math operations
      for (let i = 0; i < workload; i++) {
        // Multiple expensive operations per iteration
        dummy += Math.sqrt(i) * Math.sin(i) * Math.cos(i * 0.001);
        dummy += Math.tan(i * 0.0001) * Math.log(i + 1);
        dummy += Math.pow(Math.random(), Math.random());
        
        // Occasionally trigger garbage collection pressure
        if (i % 100000 === 0) {
          const temp = new Array(10000).fill(dummy);
          dummy += temp.reduce((a, b) => a + b, 0) * 0.000001;
        }
      }
      
      self.postMessage({ 
        type: 'stress_complete', 
        result: dummy,
        id 
      });
      break;
      
    case 'meditation_instance':
      const duration = e.data.duration || 5000;
      const startTime = Date.now();
      
      const meditate = () => {
        const elapsed = Date.now() - startTime;
        
        if (elapsed < duration) {
          // Heavy meditation calculations
          let breathScore = 0;
          for (let i = 0; i < 50000; i++) {
            breathScore += Math.sin(elapsed / 1000 + i * 0.001) * Math.cos(i * 0.002);
          }
          
          self.postMessage({
            type: 'meditation_update',
            elapsed,
            breathScore,
            id
          });
          
          setTimeout(meditate, 50); // More frequent = more CPU
        } else {
          self.postMessage({
            type: 'meditation_complete',
            id
          });
        }
      };
      
      meditate();
      break;
      
    case 'allocate':
      // Direct memory allocation request - GO BIG
      try {
        const sizeMB = e.data.size || 10;
        // Typed array
        memoryHog.push(new Float64Array(sizeMB * 125000)); // sizeMB in MB
        // String
        stringHog.push('X'.repeat(sizeMB * 500000));
        // Nested objects
        const bigObj = {};
        for (let j = 0; j < sizeMB * 5000; j++) {
          bigObj['prop_' + j] = { value: Math.random(), nested: { deep: Math.random() } };
        }
        objectHog.push(bigObj);
        
        self.postMessage({ 
          type: 'allocated', 
          arrays: memoryHog.length,
          strings: stringHog.length,
          objects: objectHog.length
        });
      } catch(err) {
        self.postMessage({ type: 'allocation_failed' });
      }
      break;
  }
};
