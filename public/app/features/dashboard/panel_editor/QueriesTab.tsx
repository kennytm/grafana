// Libraries
import React, { PureComponent } from 'react';
// Components
import { Button, CustomScrollbar, Modal, stylesFactory } from '@grafana/ui';
import { getLocationSrv, getDataSourceSrv } from '@grafana/runtime';
// Services
import { getDatasourceSrv } from 'app/features/plugins/datasource_srv';
import { backendSrv } from 'app/core/services/backend_srv';
import config from 'app/core/config';
// Types
import { PanelModel } from '../state/PanelModel';
import { DashboardModel } from '../state/DashboardModel';
import {
  DataQuery,
  DataSourceSelectItem,
  DefaultTimeRange,
  LoadingState,
  PanelData,
  DataSourceApi,
} from '@grafana/data';
import { addQuery } from 'app/core/utils/query';
import { Unsubscribable } from 'rxjs';
import { expressionDatasource, ExpressionDatasourceID } from 'app/features/expressions/ExpressionDatasource';
import { css } from 'emotion';
import { selectors } from '@grafana/e2e-selectors';

interface Props {
  panel: PanelModel;
  dashboard: DashboardModel;
}

interface State {
  dataSource?: DataSourceApi;
  dataSourceItem: DataSourceSelectItem;
  dataSourceError?: string;
  helpContent: JSX.Element;
  isLoadingHelp: boolean;
  isPickerOpen: boolean;
  isAddingMixed: boolean;
  scrollTop: number;
  data: PanelData;
}

export class QueriesTab extends PureComponent<Props, State> {
  datasources: DataSourceSelectItem[] = getDatasourceSrv().getMetricSources();
  backendSrv = backendSrv;
  querySubscription: Unsubscribable | null;

  state: State = {
    isLoadingHelp: false,
    dataSourceItem: this.findCurrentDataSource(),
    helpContent: null,
    isPickerOpen: false,
    isAddingMixed: false,
    scrollTop: 0,
    data: {
      state: LoadingState.NotStarted,
      series: [],
      timeRange: DefaultTimeRange,
    },
  };

  async componentDidMount() {
    const { panel } = this.props;
    const queryRunner = panel.getQueryRunner();

    this.querySubscription = queryRunner.getData({ withTransforms: false, withFieldConfig: false }).subscribe({
      next: (data: PanelData) => this.onPanelDataUpdate(data),
    });

    try {
      const ds = await getDataSourceSrv().get(panel.datasource);
      this.setState({ dataSource: ds });
    } catch (error) {
      const ds = await getDataSourceSrv().get();
      const dataSourceItem = this.findCurrentDataSource(ds.name);
      this.setState({ dataSource: ds, dataSourceError: error?.message, dataSourceItem });
    }
  }

  componentWillUnmount() {
    if (this.querySubscription) {
      this.querySubscription.unsubscribe();
      this.querySubscription = null;
    }
  }

  onPanelDataUpdate(data: PanelData) {
    this.setState({ data });
  }

  findCurrentDataSource(dataSourceName: string = this.props.panel.datasource): DataSourceSelectItem {
    return this.datasources.find(datasource => datasource.value === dataSourceName) || this.datasources[0];
  }

  onChangeDataSource = async (newDsItem: DataSourceSelectItem) => {
    const { panel } = this.props;
    const { dataSourceItem } = this.state;

    // switching to mixed
    if (newDsItem.meta.mixed) {
      // Set the datasource on all targets
      panel.targets.forEach(target => {
        if (target.datasource !== ExpressionDatasourceID) {
          target.datasource = panel.datasource;
          if (!target.datasource) {
            target.datasource = config.defaultDatasource;
          }
        }
      });
    } else if (dataSourceItem) {
      // if switching from mixed
      if (dataSourceItem.meta.mixed) {
        // Remove the explicit datasource
        for (const target of panel.targets) {
          if (target.datasource !== ExpressionDatasourceID) {
            delete target.datasource;
          }
        }
      } else if (dataSourceItem.meta.id !== newDsItem.meta.id) {
        // we are changing data source type, clear queries
        panel.targets = [{ refId: 'A' }];
      }
    }

    const dataSource = await getDataSourceSrv().get(newDsItem.value);

    panel.datasource = newDsItem.value;

    this.setState(
      {
        dataSourceItem: newDsItem,
        dataSource: dataSource,
        dataSourceError: undefined,
      },
      () => panel.refresh()
    );
  };

  openQueryInspector = () => {
    const { panel } = this.props;

    getLocationSrv().update({
      query: { inspect: panel.id, inspectTab: 'query' },
      partial: true,
    });
  };

  renderHelp = () => {
    return;
  };

  /**
   * Sets the queries for the panel
   */
  onUpdateQueries = (queries: DataQuery[]) => {
    this.props.panel.targets = queries;
    this.forceUpdate();
  };

  onAddQueryClick = () => {
    if (this.state.dataSourceItem.meta.mixed) {
      this.setState({ isAddingMixed: true });
      return;
    }

    this.onUpdateQueries(addQuery(this.props.panel.targets));
    this.onScrollBottom();
  };

  onAddExpressionClick = () => {
    this.onUpdateQueries(addQuery(this.props.panel.targets, expressionDatasource.newQuery()));
    this.onScrollBottom();
  };

  onScrollBottom = () => {
    this.setState({ scrollTop: 1000 });
  };

  renderTopSection(styles: QueriesTabStyls) {
    const { dataSource } = this.state;

    if (!dataSource) {
      return null;
    }

    return (
      <div>
        <div className={styles.dataSourceRow}>
          <div className={styles.dataSourceRowItem}>
            <Button
              variant="secondary"
              onClick={this.openQueryInspector}
              aria-label={selectors.components.QueryTab.queryInspectorButton}
            >
              Query inspector
            </Button>
          </div>
        </div>
      </div>
    );
  }

  onAddMixedQuery = (datasource: any) => {
    this.props.panel.targets = addQuery(this.props.panel.targets, { datasource: datasource.name });
    this.setState({ isAddingMixed: false, scrollTop: this.state.scrollTop + 10000 });
    this.forceUpdate();
  };

  onMixedPickerBlur = () => {
    this.setState({ isAddingMixed: false });
  };

  onQueryChange = (query: DataQuery, index: number) => {
    this.props.panel.changeQuery(query, index);
    this.forceUpdate();
  };

  setScrollTop = (event: React.MouseEvent<HTMLElement>) => {
    const target = event.target as HTMLElement;
    this.setState({ scrollTop: target.scrollTop });
  };

  render() {
    const { scrollTop } = this.state;
    const styles = getStyles();

    return (
      <CustomScrollbar
        autoHeightMin="100%"
        autoHide={true}
        updateAfterMountMs={300}
        scrollTop={scrollTop}
        setScrollTop={this.setScrollTop}
      >
        <div className={styles.innerWrapper}>
          {this.renderTopSection(styles)}
        </div>
      </CustomScrollbar>
    );
  }
}

const getStyles = stylesFactory(() => {
  const { theme } = config;

  return {
    innerWrapper: css`
      display: flex;
      flex-direction: column;
      height: 100%;
      padding: ${theme.spacing.md};
    `,
    dataSourceRow: css`
      display: flex;
      margin-bottom: ${theme.spacing.md};
    `,
    dataSourceRowItem: css`
      margin-right: ${theme.spacing.inlineFormMargin};
    `,
    dataSourceRowItemOptions: css`
      flex-grow: 1;
      margin-right: ${theme.spacing.inlineFormMargin};
    `,
    queriesWrapper: css`
      padding-bottom: 16px;
    `,
  };
});

type QueriesTabStyls = ReturnType<typeof getStyles>;
