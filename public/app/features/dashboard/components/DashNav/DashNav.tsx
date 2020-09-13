// Libaries
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

// Utils & Services
import { AngularComponent, getAngularLoader } from 'app/core/services/AngularLoader';
import { appEvents } from 'app/core/app_events';

// Components
import { DashNavButton } from './DashNavButton';
import { Tooltip } from '@grafana/ui';

// State
import { updateLocation } from 'app/core/actions';

// Types
import { DashboardModel } from '../../state';

export interface Props {
  dashboard: DashboardModel;
  editview: string;
  isEditing: boolean;
  isFullscreen: boolean;
  $injector: any;
  updateLocation: typeof updateLocation;
  onUploadSnapshot: (snapshot: string) => void;
}

export class DashNav extends PureComponent<Props> {
  timePickerEl: HTMLElement;
  timepickerCmp: AngularComponent;

  constructor(props: Props) {
    super(props);
  }

  componentDidMount() {
    const loader = getAngularLoader();

    const template =
      '<gf-time-picker class="gf-timepicker-nav" dashboard="dashboard" ng-if="!dashboard.timepicker.hidden" />';
    const scopeProps = { dashboard: this.props.dashboard };

    this.timepickerCmp = loader.load(this.timePickerEl, scopeProps, template);
  }

  componentWillUnmount() {
    if (this.timepickerCmp) {
      this.timepickerCmp.destroy();
    }
  }

  onClose = () => {
    if (this.props.editview) {
      this.props.updateLocation({
        query: { editview: null },
        partial: true,
      });
    } else {
      this.props.updateLocation({
        query: { panelId: null, edit: null, fullscreen: null, tab: null },
        partial: true,
      });
    }
  };

  onToggleTVMode = () => {
    appEvents.emit('toggle-kiosk-mode');
  };

  onUploadSnapshot = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (!files || files.length === 0) {
      return;
    }
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.props.onUploadSnapshot(JSON.parse(e.target.result));
    };
    reader.readAsText(files[0]);
  };

  get isInFullscreenOrSettings() {
    return this.props.editview || this.props.isFullscreen;
  }

  renderBackButton() {
    return (
      <div className="navbar-edit">
        <Tooltip content="Go back (Esc)">
          <button className="navbar-edit__back-btn" onClick={this.onClose}>
            <i className="fa fa-arrow-left" />
          </button>
        </Tooltip>
      </div>
    );
  }

  render() {
    return (
      <div className="navbar">
        {this.isInFullscreenOrSettings && this.renderBackButton()}

        <div className="navbar-buttons navbar-buttons--actions">
          <input
            type="file"
            id="snapUpload"
            name="snapUpload"
            className="hide"
            onChange={this.onUploadSnapshot}
            accept="application/json"
          />
          <label className="btn btn-secondary" htmlFor="snapUpload">
            <i className="fa fa-upload" />
            &nbsp;Open snapshot
          </label>
        </div>

        <div className="navbar__spacer" />
        <div className="navbar-buttons navbar-buttons--tv">
          <DashNavButton
            tooltip="Cycle view mode"
            classSuffix="tv"
            icon="fa fa-desktop"
            onClick={this.onToggleTVMode}
          />
        </div>

        <div className="gf-timepicker-nav" ref={element => (this.timePickerEl = element)} />
      </div>
    );
  }
}

const mapStateToProps = () => ({});

const mapDispatchToProps = {
  updateLocation,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DashNav);
