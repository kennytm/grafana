import './ReactContainer';
import { applyRouteRegistrationHandlers } from './registry';
// Pages
import { ILocationProvider, route } from 'angular';

/** @ngInject */
export function setupAngularRoutes($routeProvider: route.IRouteProvider, $locationProvider: ILocationProvider) {
  // Routes here are guarded both here and server side for react-container routes or just on the server for angular
  // ones. That means angular ones could be navigated to in case there is a client side link some where.

  const importDashboardPage = () =>
    import(/* webpackChunkName: "DashboardPage" */ '../features/dashboard/containers/DashboardPage');

  $routeProvider
    .when('/', {
      template: '<react-container />',
      //@ts-ignore
      pageClass: 'page-dashboard',
      reloadOnSearch: false,
      resolve: {
        component: importDashboardPage,
      },
    });

  applyRouteRegistrationHandlers($routeProvider);
}
