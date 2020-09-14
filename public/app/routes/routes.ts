import './ReactContainer';
import { applyRouteRegistrationHandlers } from './registry';

// Pages
import DashboardPage from '../features/dashboard/containers/DashboardPage';

// Types
import { DashboardRouteInfo } from 'app/types';

/** @ngInject */
export function setupAngularRoutes($routeProvider, $locationProvider) {
  $routeProvider
    .when('/', {
      template: '<react-container />',
      pageClass: 'page-dashboard',
      routeInfo: DashboardRouteInfo.Normal,
      reloadOnSearch: false,
      resolve: {
        component: () => DashboardPage,
      },
    })
    .otherwise({
      templateUrl: 'public/app/partials/error.html',
      controller: 'ErrorCtrl',
    });

  applyRouteRegistrationHandlers($routeProvider);
}
