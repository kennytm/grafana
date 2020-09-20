import { react2AngularDirective } from 'app/core/utils/react2angular';
import PageHeader from './components/PageHeader/PageHeader';
import EmptyListCTA from './components/EmptyListCTA/EmptyListCTA';
import { TagFilter } from './components/TagFilter/TagFilter';
import { MetricSelect } from './components/Select/MetricSelect';
import AppNotificationList from './components/AppNotifications/AppNotificationList';
import {
  ColorPicker,
  DataSourceHttpSettings,
  GraphContextMenu,
  SeriesColorPickerPopoverWithTheme,
  UnitPicker,
  Icon,
  LegacyForms,
  DataLinksInlineEditor,
} from '@grafana/ui';
const { SecretFormField } = LegacyForms;
import { HelpModal } from './components/help/HelpModal';
import { Footer } from './components/Footer/Footer';
import { VariableEditorContainer } from '../features/variables/editor/VariableEditorContainer';
import { TimePickerSettings } from 'app/features/dashboard/components/DashboardSettings/TimePickerSettings';

export function registerAngularDirectives() {
  react2AngularDirective('footer', Footer, []);
  react2AngularDirective('icon', Icon, [
    'color',
    'name',
    'size',
    'type',
    ['onClick', { watchDepth: 'reference', wrapApply: true }],
  ]);
  react2AngularDirective('helpModal', HelpModal, []);
  react2AngularDirective('appNotificationsList', AppNotificationList, []);
  react2AngularDirective('pageHeader', PageHeader, ['model', 'noTabs']);
  react2AngularDirective('emptyListCta', EmptyListCTA, [
    'title',
    'buttonIcon',
    'buttonLink',
    'buttonTitle',
    ['onClick', { watchDepth: 'reference', wrapApply: true }],
    'proTip',
    'proTipLink',
    'proTipLinkTitle',
    'proTipTarget',
    'infoBox',
    'infoBoxTitle',
  ]);
  //Search
  react2AngularDirective('tagFilter', TagFilter, [
    'tags',
    ['onChange', { watchDepth: 'reference' }],
    ['tagOptions', { watchDepth: 'reference' }],
  ]);
  react2AngularDirective('colorPicker', ColorPicker, [
    'color',
    ['onChange', { watchDepth: 'reference', wrapApply: true }],
  ]);
  react2AngularDirective('seriesColorPickerPopover', SeriesColorPickerPopoverWithTheme, [
    'color',
    'series',
    'onColorChange',
    'onToggleAxis',
  ]);
  react2AngularDirective('unitPicker', UnitPicker, [
    'value',
    'width',
    ['onChange', { watchDepth: 'reference', wrapApply: true }],
  ]);
  react2AngularDirective('metricSelect', MetricSelect, [
    'options',
    'onChange',
    'value',
    'isSearchable',
    'className',
    'placeholder',
    ['variables', { watchDepth: 'reference' }],
  ]);
  react2AngularDirective('secretFormField', SecretFormField, [
    'value',
    'isConfigured',
    'inputWidth',
    'labelWidth',
    ['onReset', { watchDepth: 'reference', wrapApply: true }],
    ['onChange', { watchDepth: 'reference', wrapApply: true }],
  ]);
  react2AngularDirective('graphContextMenu', GraphContextMenu, [
    'x',
    'y',
    'items',
    ['onClose', { watchDepth: 'reference', wrapApply: true }],
    ['getContextMenuSource', { watchDepth: 'reference', wrapApply: true }],
    ['timeZone', { watchDepth: 'reference', wrapApply: true }],
  ]);

  // We keep the drilldown terminology here because of as using data-* directive
  // being in conflict with HTML data attributes
  react2AngularDirective('drilldownLinksEditor', DataLinksInlineEditor, [
    'value',
    'links',
    'suggestions',
    ['onChange', { watchDepth: 'reference', wrapApply: true }],
  ]);

  react2AngularDirective('datasourceHttpSettingsNext', DataSourceHttpSettings, [
    'defaultUrl',
    'showAccessOptions',
    'dataSourceConfig',
    ['onChange', { watchDepth: 'reference', wrapApply: true }],
  ]);
  react2AngularDirective('variableEditorContainer', VariableEditorContainer, []);
  react2AngularDirective('timePickerSettings', TimePickerSettings, [
    ['getDashboard', { watchDepth: 'reference', wrapApply: true }],
    ['onTimeZoneChange', { watchDepth: 'reference', wrapApply: true }],
    ['onRefreshIntervalChange', { watchDepth: 'reference', wrapApply: true }],
    ['onNowDelayChange', { watchDepth: 'reference', wrapApply: true }],
    ['onHideTimePickerChange', { watchDepth: 'reference', wrapApply: true }],
  ]);
}
