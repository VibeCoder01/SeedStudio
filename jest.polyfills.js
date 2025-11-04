// jest.polyfills.js
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => `mock-uuid-${Math.random()}`,
  },
});
