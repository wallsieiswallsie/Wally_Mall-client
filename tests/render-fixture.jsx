import React from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
import App from '../src/App';
export function renderRoute(path) {
  return renderToString(<MemoryRouter initialEntries={[path]}><App/></MemoryRouter>);
}
