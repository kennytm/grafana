// Libraries
import sortBy from 'lodash/sortBy';
import coreModule from 'app/core/core_module';
// Services & Utils
import { DataSourceSrv as DataSourceService, getDataSourceSrv as getDataSourceService } from '@grafana/runtime';
// Types
import { DataSourceApi, DataSourceInstanceSettings, ScopedVars, PluginType } from '@grafana/data';

export class DatasourceSrv implements DataSourceService {
  datasource: DataSourceApi & DataSourceInstanceSettings

  /** @ngInject */
  constructor() {
    this.datasource = {
      name: '',
      id: 0,
      uid: '',
      type: PluginType.datasource,
      jsonData: {},
      meta: {
        name: '',
        id: '',
        type: PluginType.datasource,
        info: null,
        module: '',
        baseUrl: '',
      },
      async query() {
        return {data: []};
      },
      async testDatasource() {
        return {status: 'success', message: ''}
      },
    };
  }

  init() {
  }

  getDataSourceSettingsByUid(uid: string): DataSourceInstanceSettings | undefined {
    return undefined;
  }

  get(name?: string, scopedVars?: ScopedVars): Promise<DataSourceApi> {
    return Promise.resolve(this.datasource);
  }

  getAll(): DataSourceInstanceSettings[] {
    return [this.datasource];
  }

  getExternal(): DataSourceInstanceSettings[] {
    const datasources = this.getAll().filter(ds => !ds.meta.builtIn);
    return sortBy(datasources, ['name']);
  }

  getMetricSources(options?: { skipVariables?: boolean }) {
    return this.getExternal()
  }
}

export const getDatasourceSrv = (): DatasourceSrv => {
  return getDataSourceService() as DatasourceSrv;
};

coreModule.service('datasourceSrv', DatasourceSrv);
export default DatasourceSrv;
