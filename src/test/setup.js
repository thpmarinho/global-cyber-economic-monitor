import '@testing-library/jest-dom/vitest';
import React from 'react';
import { vi } from 'vitest';

// Shim para ResizeObserver que o Recharts utiliza
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock para window.scrollTo
window.scrollTo = () => {};

// Mock para ResponsiveContainer do Recharts para evitar warnings de container width/height em jsdom
vi.mock('recharts', async (importOriginal) => {
  const original = await importOriginal();
  return {
    ...original,
    ResponsiveContainer: ({ children }) =>
      React.createElement('div', { style: { width: 800, height: 300 } }, children),
  };
});
