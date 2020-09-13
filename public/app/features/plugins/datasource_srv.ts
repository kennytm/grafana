// Libraries
import _ from 'lodash';
import coreModule from 'app/core/core_module';

// Types
import { DataSourceApi, ScopedVars } from '@grafana/ui/src/types';

export class DatasourceSrv {
  datasource: DataSourceApi;

  /** @ngInject */
  constructor() {
    this.datasource = {
      async testDatasource() {
        return { status: 'success', message: 'Data source is working' };
      },
      async query() {
        return { data: [] };
      },
      meta: {
        id: 'dummy',
        name: 'Dummy Datasource',
        info: null,
        includes: [],
      },
    };
  }

  init() {}

  get(name?: string, scopedVars?: ScopedVars): Promise<DataSourceApi> {
    return Promise.resolve(this.datasource);
  }

  getAll() {
    return [this.datasource];
  }

  getExternal() {
    const datasources = this.getAll().filter(ds => !ds.meta.builtIn);
    return _.sortBy(datasources, ['name']);
  }

  getMetricSources(options?) {
    return this.getExternal();
  }
}

let singleton: DatasourceSrv;

export function setDatasourceSrv(srv: DatasourceSrv) {
  singleton = srv;
}

export function getDatasourceSrv(): DatasourceSrv {
  return singleton;
}

coreModule.service('datasourceSrv', DatasourceSrv);
export default DatasourceSrv;
