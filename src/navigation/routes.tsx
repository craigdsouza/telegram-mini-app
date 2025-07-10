import type { ComponentType, JSX } from 'react';

import { HomePage } from '@/pages/HomePage';

import { WelcomePage } from '@/pages/WelcomePage';

interface Route {
  path: string;
  Component: ComponentType;
  title?: string;
  icon?: JSX.Element;
}

export const routes: Route[] = [
  { path: '/', Component: WelcomePage },
  { path: '/home', Component: HomePage, title: 'Home' },
  
];
