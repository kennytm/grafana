import angular from 'angular';
import _ from 'lodash';

import config from 'app/core/config';
import coreModule from 'app/core/core_module';

import { DataSourceApi } from '@grafana/data';
import { importPanelPlugin } from './plugin_loader';

/** @ngInject */
function pluginDirectiveLoader(
  $compile: any,
) {
  function getTemplate(component: { template: any }) {
    if (component.template) {
      return Promise.resolve(component.template);
    }
    return Promise.reject(`cannot dynamically load a template from ${component}`);
  }

  function getPluginComponentDirective(options: any) {
    return () => {
      return {
        template: options.Component.template,
        restrict: 'E',
        controller: options.Component,
        controllerAs: 'ctrl',
        bindToController: true,
        scope: options.bindings,
        link: (scope: any, elem: any, attrs: any, ctrl: any) => {
          if (ctrl.link) {
            ctrl.link(scope, elem, attrs, ctrl);
          }
          if (ctrl.init) {
            ctrl.init();
          }
        },
      };
    };
  }

  function loadPanelComponentInfo(scope: any, attrs: any) {
    const componentInfo: any = {
      name: 'panel-plugin-' + scope.panel.type,
      bindings: { dashboard: '=', panel: '=', row: '=' },
      attrs: {
        dashboard: 'dashboard',
        panel: 'panel',
        class: 'panel-height-helper',
      },
    };

    const panelInfo = config.panels[scope.panel.type];
    return importPanelPlugin(panelInfo.id).then(panelPlugin => {
      const PanelCtrl = panelPlugin.angularPanelCtrl;
      componentInfo.Component = PanelCtrl;

      if (!PanelCtrl || PanelCtrl.registered) {
        return componentInfo;
      }

      if (PanelCtrl.templatePromise) {
        return PanelCtrl.templatePromise.then((res: any) => {
          return componentInfo;
        });
      }

      PanelCtrl.templatePromise = getTemplate(PanelCtrl).then((template: any) => {
        PanelCtrl.templateUrl = null;
        PanelCtrl.template = `<grafana-panel ctrl="ctrl" class="panel-height-helper">${template}</grafana-panel>`;
        return componentInfo;
      });

      return PanelCtrl.templatePromise;
    });
  }

  function getModule(scope: any, attrs: any): any {
    switch (attrs.type) {
      // QueryCtrl
      case 'query-ctrl': {
        const ds: DataSourceApi = scope.ctrl.datasource as DataSourceApi;

        return Promise.resolve({
          baseUrl: ds.meta.baseUrl,
          name: 'query-ctrl-' + ds.meta.id,
          bindings: { target: '=', panelCtrl: '=', datasource: '=' },
          attrs: {
            target: 'ctrl.target',
            'panel-ctrl': 'ctrl',
            datasource: 'ctrl.datasource',
          },
          Component: ds.components.QueryCtrl,
        });
      }
      // Panel
      case 'panel': {
        return loadPanelComponentInfo(scope, attrs);
      }
      default: {
        return Promise.reject({
          message: 'Could not find component type: ' + attrs.type,
        });
      }
    }
  }

  function appendAndCompile(scope: any, elem: JQuery, componentInfo: any) {
    const child = angular.element(document.createElement(componentInfo.name));
    _.each(componentInfo.attrs, (value, key) => {
      child.attr(key, value);
    });

    $compile(child)(scope);
    elem.empty();

    // let a binding digest cycle complete before adding to dom
    setTimeout(() => {
      scope.$applyAsync(() => {
        elem.append(child);
        setTimeout(() => {
          scope.$applyAsync(() => {
            scope.$broadcast('component-did-mount');
          });
        });
      });
    });
  }

  function registerPluginComponent(scope: any, elem: JQuery, attrs: any, componentInfo: any) {
    if (componentInfo.notFound) {
      elem.empty();
      return;
    }

    if (!componentInfo.Component) {
      throw {
        message: 'Failed to find exported plugin component for ' + componentInfo.name,
      };
    }

    if (!componentInfo.Component.registered) {
      const directiveName = attrs.$normalize(componentInfo.name);
      const directiveFn = getPluginComponentDirective(componentInfo);
      coreModule.directive(directiveName, directiveFn);
      componentInfo.Component.registered = true;
    }

    appendAndCompile(scope, elem, componentInfo);
  }

  return {
    restrict: 'E',
    link: (scope: any, elem: JQuery, attrs: any) => {
      getModule(scope, attrs)
        .then((componentInfo: any) => {
          registerPluginComponent(scope, elem, attrs, componentInfo);
        })
        .catch((err: any) => {
          console.log('Plugin component error', err);
        });
    },
  };
}

coreModule.directive('pluginComponent', pluginDirectiveLoader);
