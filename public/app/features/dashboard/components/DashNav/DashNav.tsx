// Libaries
import React, { PureComponent, FC, ReactNode } from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
// Utils & Services
import { appEvents } from 'app/core/app_events';
// Components
import { DashNavButton } from './DashNavButton';
import { DashNavTimeControls } from './DashNavTimeControls';
import { BackButton } from 'app/core/components/BackButton/BackButton';
// State
import { updateLocation } from 'app/core/actions';
// Types
import { DashboardModel } from '../../state';
import { CoreEvents, StoreState } from 'app/types';
import { FileUpload } from '@grafana/ui';

export interface OwnProps {
  dashboard: DashboardModel;
  isFullscreen: boolean;
  $injector: any;
  onUploadSnapshot: (snapshot: string) => void;
}

interface DispatchProps {
  updateLocation: typeof updateLocation;
}

interface DashNavButtonModel {
  show: (props: Props) => boolean;
  component: FC<Partial<Props>>;
  index?: number | 'end';
}

const customLeftActions: DashNavButtonModel[] = [];
const customRightActions: DashNavButtonModel[] = [];

export function addCustomLeftAction(content: DashNavButtonModel) {
  customLeftActions.push(content);
}

export function addCustomRightAction(content: DashNavButtonModel) {
  customRightActions.push(content);
}

export interface StateProps {
  location: any;
}

type Props = StateProps & OwnProps & DispatchProps;

class DashNav extends PureComponent<Props> {
  onClose = () => {
    this.props.updateLocation({
      query: { viewPanel: null },
      partial: true,
    });
  };

  onToggleTVMode = () => {
    appEvents.emit(CoreEvents.toggleKioskMode);
  };

  onFileUpload = (e: React.FormEvent<HTMLInputElement>) => {
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

  addCustomContent(actions: DashNavButtonModel[], buttons: ReactNode[]) {
    actions.map((action, index) => {
      const Component = action.component;
      const element = <Component {...this.props} key={`button-custom-${index}`} />;
      typeof action.index === 'number' ? buttons.splice(action.index, 0, element) : buttons.push(element);
    });
  }

  renderLeftActionsButton() {
    const buttons: ReactNode[] = [];
    this.addCustomContent(customLeftActions, buttons);
    return buttons;
  }

  renderBackButton() {
    return (
      <div className="navbar-edit">
        <BackButton surface="dashboard" onClick={this.onClose} />
      </div>
    );
  }

  renderRightActionsButton() {
    const buttons: ReactNode[] = [];

    this.addCustomContent(customRightActions, buttons);
    return buttons;
  }

  render() {
    const { dashboard, location, isFullscreen } = this.props;

    return (
      <div className="navbar">
        {isFullscreen && this.renderBackButton()}

        <div className="navbar-buttons navbar-buttons--actions">
          <FileUpload accept="application/json" onFileUpload={this.onFileUpload}>
            Open snapshot
          </FileUpload>
        </div>

        <div className="navbar__spacer" />

        <div className="navbar-buttons navbar-buttons--actions">{this.renderRightActionsButton()}</div>

        <div className="navbar-buttons navbar-buttons--tv">
          <DashNavButton tooltip="Cycle view mode" classSuffix="tv" icon="monitor" onClick={this.onToggleTVMode} />
        </div>

        {!dashboard.timepicker.hidden && (
          <div className="navbar-buttons">
            <DashNavTimeControls
              dashboard={dashboard}
              location={location}
            />
          </div>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state: StoreState) => ({
  location: state.location,
});

const mapDispatchToProps: MapDispatchToProps<DispatchProps, OwnProps> = {
  updateLocation,
};

export default connect(mapStateToProps, mapDispatchToProps)(DashNav);
