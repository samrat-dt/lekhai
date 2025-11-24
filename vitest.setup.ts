import '@testing-library/jest-dom';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock Next.js router
vi.mock('next/router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
    back: vi.fn(),
    reload: vi.fn(),
  }),
}));

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: (props: any) => {
    const img = document.createElement('img');
    Object.keys(props).forEach((key) => {
      if (key !== 'alt') {
        img.setAttribute(key, props[key]);
      }
    });
    return img;
  },
}));

// Setup environment variables for tests
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3005';
