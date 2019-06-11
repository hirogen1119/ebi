import {Platform} from 'react-native';

export class UIConstants {
  static AppbarHeight = Platform.OS === 'ios' ? 44 : 56;
  static StatusbarHeight = Platform.OS === 'ios' ? 20 : 50;
  static HeaderHeight = UIConstants.AppbarHeight + UIConstants.StatusbarHeight;
}