import React from 'react';
import {
  DrawerNavigator,
  createStackNavigator,
  createBottomTabNavigator,
  createSwitchNavigator
} from 'react-navigation';
import {withRkTheme} from 'react-native-ui-kitten';
import * as Screens from './screens';
import {bootstrap} from './config/bootstrap';
import track from './config/analytics';
import {AppLoading, Font} from 'expo';
import {View, Text} from "react-native";

console.disableYellowBox = true;
bootstrap();

function getCurrentRouteName(navigationState) {
  if (!navigationState) {
    return null;
  }
  const route = navigationState.routes[navigationState.index];
  if (route.routes) {
    return getCurrentRouteName(route);
  }
  return route.routeName;
}

let SideMenu = withRkTheme(Screens.SideMenu);
const KittenApp = createStackNavigator({
  First: { screen: Screens.SplashScreen },
  Login: { screen: Screens.Login },
  Certificate: { screen: Screens.Certificate },
  CreateUser: { screen: Screens.CreateUser },
  UserAdd: { screen: Screens.UserAdd },
  UserEdit: { screen: Screens.UserEdit },
  UserInfo: { screen: Screens.UserInfo },
  UserList: { screen: Screens.UserList},
  AccountList: { screen: Screens.AccountList},
  ApartmentInvitationAdd: { screen: Screens.ApartmentInvitationAdd},
  AccountAdd: { screen: Screens.AccountAdd},
  AccountEdit: { screen: Screens.AccountEdit},
  UserApproval: { screen: Screens.UserApproval},
  UserInvitation: { screen: Screens.UserInvitation},
  ApartmentAdd: { screen: Screens.ApartmentAdd },
  ApartmentEdit: { screen: Screens.ApartmentEdit },
  ApartmentChange: { screen: Screens.ApartmentChange},
  ApartmentList: { screen: Screens.ApartmentList},
  ApartmentInfo: { screen: Screens.ApartmentInfo},
  InsuranceAdd: { screen: Screens.InsuranceAdd },
  TraderCreate: { screen: Screens.TraderCreate },
  TraderAdd: { screen: Screens.TraderAdd },
  TraderEdit: { screen: Screens.TraderEdit },
  TraderInfo: { screen: Screens.TraderInfo },
  TraderList: { screen: Screens.TraderList},
  EventAdd: { screen: Screens.EventAdd },
  EventMemberSelect: { screen: Screens.EventMemberSelect },
  EventEdit: { screen: Screens.EventEdit },
  Chat: { screen: Screens.Chat },
  SideMenu: { screen: Screens.SideMenu},
  EventList: { screen: Screens.EventList},
  ApRanking: { screen: Screens.ApRanking},
  TdRanking: { screen: Screens.TdRanking},
  EventInfo: { screen: Screens.EventInfo},
  EventDone: { screen: Screens.EventDone},
  Contact: { screen: Screens.Contact},
  Emergency: { screen: Screens.Emergency},
  Flyers: { screen: Screens.Flyers},
  RegistFlyers: { screen: Screens.RegistFlyers},
  Privacy: { screen: Screens.Privacy},
  TermsService: { screen: Screens.TermsService},
  EmergencyResult: { screen: Screens.EmergencyResult},
  })

export default class App extends React.Component {
  state = {
    loaded: false
  };

  componentWillMount() {
    this._loadAssets();
  }

  _loadAssets = async() => {
    await Font.loadAsync({
      'fontawesome': require('./assets/fonts/fontawesome.ttf'),
      'icomoon': require('./assets/fonts/icomoon.ttf'),
      'Righteous-Regular': require('./assets/fonts/Righteous-Regular.ttf'),
      'Roboto-Bold': require('./assets/fonts/Roboto-Bold.ttf'),
      'Roboto-Medium': require('./assets/fonts/Roboto-Medium.ttf'),
      'Roboto-Regular': require('./assets/fonts/Roboto-Regular.ttf'),
      'Roboto-Light': require('./assets/fonts/Roboto-Light.ttf'),
      'Arial': require('./assets/fonts/Arial.ttf'),
    });
    this.setState({loaded: true});
  };

  render() {
    if (!this.state.loaded) {
      // return <AppLoading />;
      return (
        <AppLoading
          startAsync={this._cacheResourcesAsync}
          onFinish={() => this.setState({ loaded: true })}
          onError={console.warn}
        />
      );
    }

    return (
        <KittenApp
          onNavigationStateChange={(prevState, currentState) => {
            const currentScreen = getCurrentRouteName(currentState);
            const prevScreen = getCurrentRouteName(prevState);

            if (prevScreen !== currentScreen) {
              track(currentScreen);
            }
          }}
        />
    );
  }

  async _cacheResourcesAsync() {
    const images = [
      require('./assets/images/splash.png'),
    ];

    const cacheImages = images.map((image) => {
      return Asset.fromModule(image).downloadAsync();
    });
    return Promise.all(cacheImages)

  }
}

Expo.registerRootComponent(App);
