import React from 'react';
import _ from 'lodash';
import {createStackNavigator} from 'react-navigation'
import {withRkTheme} from 'react-native-ui-kitten'
import {NavBar} from '../../components/index';
import transition from './transitions';
import {
  MainRoutes,
  MenuRoutes
} from './routes';

let main = {};
let flatRoutes = {};
(MainRoutes).map(function (route, index) {

  let wrapToRoute = (route) => {
    return {
      screen: withRkTheme(route.screen),
      title: route.title
    }
  };

  flatRoutes[route.id] = wrapToRoute(route);
  main[route.id] = wrapToRoute(route);
});

let ThemedNavigationBar = withRkTheme(NavBar);

const DrawerRoutes = Object.keys(main).reduce((routes, name) => {
  let stack_name = name;
  routes[stack_name] = {
    name: stack_name,
    screen: createStackNavigator(flatRoutes, {
      initialRouteName: name,
      headerMode: 'screen',
      cardStyle: {backgroundColor: '#000'},
      transitionConfig: transition,
      navigationOptions: ({navigation, screenProps}) => ({
        gesturesEnabled: false,
        header: (headerProps) => {
          return <ThemedNavigationBar style={{backgroundColor: '#000'}}/>
        }
      })
    })
  };
  return routes;
}, {});

export const AppRoutes = DrawerRoutes;
