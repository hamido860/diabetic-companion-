import {AppRegistry} from 'react-native';
import React from 'react';
import App from './App';
import {name as appName} from './app.json';
import {LocalizationProvider} from './contexts/LocalizationContext';

const Root = () => (
  <LocalizationProvider>
    <App />
  </LocalizationProvider>
);

AppRegistry.registerComponent(appName, () => Root);
