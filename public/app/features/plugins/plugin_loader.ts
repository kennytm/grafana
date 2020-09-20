import config from 'app/core/config';
import { PanelPlugin, PluginType } from '@grafana/data';
import builtInPlugins from './built_in_plugins';

export async function importPluginModule(path: string): Promise<any> {
  const builtIn = builtInPlugins[path];
  if (builtIn) {
    // for handling dynamic imports
    if (typeof builtIn === 'function') {
      return await builtIn();
    } else {
      return Promise.resolve(builtIn);
    }
  }
  return Promise.reject('cannot import third-party plugins');
}

import { getPanelPluginLoadError, getPanelPluginNotFound } from '../dashboard/dashgrid/PanelPluginError';

interface PanelCache {
  [key: string]: Promise<PanelPlugin>;
}
const panelCache: PanelCache = {};

export function importPanelPlugin(id: string): Promise<PanelPlugin> {
  const loaded = panelCache[id];

  if (loaded) {
    return loaded;
  }

  const meta = config.panels[id];

  if (!meta) {
    return Promise.resolve(getPanelPluginNotFound(id));
  }

  panelCache[id] = importPluginModule(meta.module)
    .then(pluginExports => {
      if (pluginExports.plugin) {
        return pluginExports.plugin as PanelPlugin;
      } else if (pluginExports.PanelCtrl) {
        const plugin = new PanelPlugin(null);
        plugin.angularPanelCtrl = pluginExports.PanelCtrl;
        return plugin;
      }
      throw new Error('missing export: plugin or PanelCtrl');
    })
    .then(plugin => {
      plugin.meta = meta;
      return plugin;
    })
    .catch(err => {
      // TODO, maybe a different error plugin
      console.warn('Error loading panel plugin: ' + id, err);
      return getPanelPluginLoadError(meta, err);
    });

  return panelCache[id];
}

export function initializeBuiltinPlugins() {
  for (const module in builtInPlugins) {
    const m = /^app\/plugins\/panel\/([^/]+)\/module$/.exec(module);
    if (m) {
      const id = m[1];
      config.panels[id] = {
        module,
        id,
        name: id,
        type: PluginType.panel,
        baseUrl: '',
        sort: 0,
        info: {
          author: {name: ''},
          description: id,
          links: [],
          logos: {
            large: '',
            small: '',
          },
          screenshots: [],
          updated: '',
          version: '',
        },
      }
    }
  }
}
