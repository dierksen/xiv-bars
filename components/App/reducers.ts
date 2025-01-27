import { buildHotbars, buildCrossHotbars } from 'lib/xbars';
import type { AppState, AppDispatchActions } from 'types/App';
import { setActionToSlot, setActionsToSlots, mergeParamsToView } from 'lib/utils/slots';
import { defaultState } from 'components/App/defaultState';
import { appActions } from 'components/App/actions';

export function AppReducer(state:AppState, action: AppDispatchActions) {
  const { layout } = state.viewData || {};
  const { type, payload } = action;

  switch (type) {
    case appActions.LOAD_VIEW_DATA: {
      // Load data from getServerSideProps and initialize the app state
      if (payload?.viewData) {
        const readOnly = payload.viewAction === 'show';
        // Merge url params if any into the viewData state prop
        const viewData = mergeParamsToView({
          params: payload.urlParams,
          viewData: payload.viewData
        });

        // Build XHB/HB template, this generates a JSON to represtent the
        // hotbar slots states and their associated actions
        const layoutTemplates = setActionsToSlots({
          encodedSlots: viewData.encodedSlots as string,
          layout: viewData.layout as number,
          actions: payload.actions,
          roleActions: payload.roleActions,
        });

        // Construct the updated state
        const newState = {
          ...state,
          ...payload,
          ...layoutTemplates,
          viewData,
          readOnly
        };

        return newState;
      }

      return state;
    }

    case appActions.SLOT_ACTIONS: {
      // Merge url params if any into the viewData state prop
      const viewData = mergeParamsToView({
        params: payload?.urlParams,
        viewData: state.viewData
      });

      // Generate an updated JSON template from the encodedSlots payload
      const slottedActions = (payload?.viewData?.encodedSlots)
        ? setActionsToSlots({
          encodedSlots: payload.viewData.encodedSlots,
          layout: payload.viewData.layout || defaultState.viewData.layout,
          actions: state.actions,
          roleActions: state.roleActions
        })
        : undefined;

      return { ...state, ...slottedActions, viewData };
    }

    case appActions.SLOT_ACTION: {
      if (payload?.slotID) {
        // Updated the encoded slots string with the given actionID
        const encodedSlots = setActionToSlot({
          action: payload.action,
          slotID: payload.slotID,
          encodedSlots: state.viewData?.encodedSlots,
          layout,
          actions: state.actions,
          roleActions: state.roleActions
        });

        return { ...state, viewData: { ...state.viewData, encodedSlots } };
      }

      return state;
    }

    case appActions.TOGGLE_TITLES: {
      return { ...state, showTitles: !state.showTitles };
    }

    case appActions.TOGGLE_LVLS: {
      return { ...state, showAllLvl: !state.showAllLvl };
    }

    case appActions.TOGGLE_DETAILS: {
      return { ...state, showDetails: !state.showDetails };
    }

    case appActions.EDIT_LAYOUT: {
      return { ...state, readOnly: false, viewAction: 'edit' };
    }

    case appActions.PUBLISH_LAYOUT: {
      return { ...state, readOnly: true, viewAction: 'show' };
    }

    case appActions.CANCEL_EDITS: {
      return { ...state, readOnly: true, viewAction: 'show' };
    }

    case appActions.UPDATE_VIEW: {
      return {
        ...state,
        readOnly: true,
        viewData: { ...state.viewData, ...action.payload },
        viewAction: 'show'
      };
    }

    case appActions.INITIALIZE: {
      return {
        ...state,
        ...payload,
        viewData: defaultState.viewData,
        chotbar: buildCrossHotbars(),
        hotbar: buildHotbars()
      };
    }

    case appActions.LOAD_JOBACTIONS: {
      return {
        ...state,
        actions: action.payload?.actions,
        roleActions: action.payload?.roleActions
      };
    }

    case appActions.VIEW_LIST: {
      return {
        ...state,
        viewData: {},
        viewAction: 'list'
      };
    }

    case appActions.SET_STATE: {
      return {
        ...state,
        ...payload
      };
    }

    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}

export default AppReducer;
