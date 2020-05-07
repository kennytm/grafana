import { DashboardModel, PanelModel } from '../../../state';
import { PanelData } from '@grafana/data';
import { ThunkResult } from 'app/types';
import {
  closeCompleted,
  PANEL_EDITOR_UI_STATE_STORAGE_KEY,
  PanelEditorUIState,
  setEditorPanelData,
  setPanelEditorUIState,
  updateEditorInitState,
} from './reducers';
import { cleanUpEditPanel, dashboardCollection, panelModelAndPluginReady } from '../../../state/reducers';
import store from '../../../../../core/store';
import { toCollectionAction } from '../../../../../core/reducers/createCollection';
import { getDashboardUid } from '../../../utils/getDashboardUid';

export function initPanelEditor(sourcePanel: PanelModel, dashboard: DashboardModel): ThunkResult<void> {
  return dispatch => {
    const panel = dashboard.initEditPanel(sourcePanel);

    const queryRunner = panel.getQueryRunner();
    const querySubscription = queryRunner.getData(false).subscribe({
      next: (data: PanelData) => dispatch(setEditorPanelData(data)),
    });

    dispatch(
      updateEditorInitState({
        panel,
        sourcePanel,
        querySubscription,
      })
    );
  };
}

export function panelEditorCleanUp(): ThunkResult<void> {
  return (dispatch, getStore) => {
    const dashboardUid = getDashboardUid(getStore());
    const dashboard = dashboardCollection.selector(getStore(), dashboardUid).getModel();
    const { getPanel, getSourcePanel, querySubscription, shouldDiscardChanges } = getStore().panelEditor;

    if (!shouldDiscardChanges) {
      const panel = getPanel();
      const modifiedSaveModel = panel.getSaveModel();
      const sourcePanel = getSourcePanel();
      const panelTypeChanged = sourcePanel.type !== panel.type;

      // restore the source panel id before we update source panel
      modifiedSaveModel.id = sourcePanel.id;

      sourcePanel.restoreModel(modifiedSaveModel);

      // Loaded plugin is not included in the persisted properties
      // So is not handled by restoreModel
      sourcePanel.plugin = panel.plugin;

      if (panelTypeChanged) {
        dispatch(
          toCollectionAction(panelModelAndPluginReady({ panelId: sourcePanel.id, plugin: panel.plugin! }), dashboardUid)
        );
      }

      // Resend last query result on source panel query runner
      // But do this after the panel edit editor exit process has completed
      setTimeout(() => {
        sourcePanel.getQueryRunner().useLastResultFrom(panel.getQueryRunner());
      }, 20);
    }

    if (dashboard) {
      dashboard.exitPanelEditor();
    }

    if (querySubscription) {
      querySubscription.unsubscribe();
    }

    dispatch(cleanUpEditPanel());
    dispatch(closeCompleted());
  };
}

export function updatePanelEditorUIState(uiState: Partial<PanelEditorUIState>): ThunkResult<void> {
  return (dispatch, getStore) => {
    const nextState = { ...getStore().panelEditor.ui, ...uiState };
    dispatch(setPanelEditorUIState(nextState));
    try {
      store.setObject(PANEL_EDITOR_UI_STATE_STORAGE_KEY, nextState);
    } catch (error) {
      console.error(error);
    }
  };
}
