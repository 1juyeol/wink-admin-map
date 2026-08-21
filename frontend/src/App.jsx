import React from 'react';
import { PermissionSimulator } from './components/PermissionSimulator';
import { AppProviders } from './contexts/AppProviders';

function App() {
  return (
    <AppProviders>
      <PermissionSimulator />
    </AppProviders>
  );
}

export default App;
