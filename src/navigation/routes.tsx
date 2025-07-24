import type { ComponentType, JSX } from 'react';

import { HomePage } from '@/pages/Home/HomePage';
import { WelcomePage } from '@/pages/Welcome/WelcomePage';
import { PledgePage } from '@/pages/Pledge/PledgePage';

interface Route {
  path: string;
  Component: ComponentType;
  title?: string;
  icon?: JSX.Element;
}

export const routes: Route[] = [
  { path: '/', Component: WelcomePage },
  { path: '/home', Component: HomePage, title: 'Home' },
  { path: '/pledge', Component: PledgePage, title: 'Take the Pledge' },
];
