import 'core-js';
import 'core-js/es/reflect';
import hasDependency from '../hasDependency';
import configure from '../configure';
import type { Loader } from '../Loader';
import type { StoryshotsOptions } from '../../api/StoryshotsOptions';

function setupAngularJestPreset() {
  // Needed to prevent "Zone.js has detected that ZoneAwarePromise `(window|global).Promise` has been overwritten."
  jest.requireActual('core-js');
  jest.requireActual('core-js/modules/es.promise');
  // jest.requireActual('core-js/es6/reflect');
  // jest.requireActual('core-js/es7/reflect');

  // Angular + Jest + Storyshots = Crazy Shit:
  // We need to require 'jest-preset-angular/build/setupJest' before any storybook code
  // is running inside jest -  one of the things that `jest-preset-angular/build/setupJest` does is
  // extending the `window.Reflect` with all the needed metadata functions, that are required
  // for emission of the TS decorations like 'design:paramtypes'
  try {
    jest.requireActual('jest-preset-angular/build/setupJest');
  } catch (e) {
    jest.requireActual('jest-preset-angular/build/setup-jest');
  }
}

function test(options: StoryshotsOptions): boolean {
  return (
    options.framework === 'angular' || (!options.framework && hasDependency('@storybook/angular'))
  );
}

function load(options: StoryshotsOptions) {
  setupAngularJestPreset();

  const storybook = jest.requireActual('@storybook/angular');
  const clientAPI = jest.requireActual('@storybook/client-api');

  const api = {
    ...clientAPI,
    ...storybook,
  };

  configure({
    ...options,
    storybook: api,
  });

  return {
    framework: 'angular' as const,
    renderTree: jest.requireActual('./renderTree').default,
    renderShallowTree: () => {
      throw new Error('Shallow renderer is not supported for angular');
    },
    storybook: api,
  };
}

const angularLoader: Loader = {
  load,
  test,
};

export default angularLoader;
