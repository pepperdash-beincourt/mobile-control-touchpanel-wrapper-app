import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { RootState } from '../../store';

interface ITouchPanel {
  online: boolean;
  mcAppUrl: string;
  panelIpAddress: string;
  customLogoUrlLight: string;
  customLogoUrlDark: string;
}

const initialState: ITouchPanel = {
  online: false,
  mcAppUrl: '',
  panelIpAddress: '',
  customLogoUrlLight: '',
  customLogoUrlDark: '',
};

export const touchPanelSlice = createSlice({
  name: 'controlSystem',
  initialState,
  reducers: {
    setControlSystemOnline: (state, action: PayloadAction<boolean>) => {
      state.online = action.payload;
      console.log(`Control System ${state.online ? 'online' : 'offline'}`);
    },
    setMcAppUrl: (state, action: PayloadAction<string>) => {
      state.mcAppUrl = action.payload;
    },
    setPanelIpAddress: (state, action: PayloadAction<string>) => {
      state.panelIpAddress = action.payload;
    },
    setCustomLogoUrlLight: (state, action: PayloadAction<string>) => {
      state.customLogoUrlLight = action.payload;
    },
    setCustomLogoUrlDark: (state, action: PayloadAction<string>) => {
      state.customLogoUrlDark = action.payload;
    },
  },
});

export const {
  setControlSystemOnline,
  setMcAppUrl,
  setPanelIpAddress,
  setCustomLogoUrlLight,
  setCustomLogoUrlDark,
} = touchPanelSlice.actions;

export const selectControlSystem = (state: RootState) => state.touchPanel;
export const selectControlSystemOnline = (state: RootState) =>
  state.touchPanel.online;
export const selectMcAppUrl = (state: RootState) => state.touchPanel.mcAppUrl;
export const selectCustomLogoUrlLight = (state: RootState) =>
  state.touchPanel.customLogoUrlLight;
export const selectCustomLogoUrlDark = (state: RootState) =>
  state.touchPanel.customLogoUrlDark;

export default touchPanelSlice.reducer;
