import {FontIcons} from '../../assets/icons';
import * as Screens from '../../screens/index';
import _ from 'lodash';

export const MainRoutes = [
  {
    id: 'EvnetAdd',
    title: '案件登録',
    icon: FontIcons.login,
    screen: Screens.Login
  },
  {
    id: 'EventList',
    title: '案件一覧',
    icon: FontIcons.login,
    screen: Screens.EventList
  },
  {
    id: 'EvnetAdd',
    title: '業者登録',
    icon: FontIcons.login,
    screen: Screens.Login
  },
  {
    id: 'TdRanking',
    title: '業者ランキング',
    icon: FontIcons.login,
    screen: Screens.TdRanking
  },
  {
    id: 'EvnetAdd',
    title: '業者一覧',
    icon: FontIcons.login,
    screen: Screens.Login
  },
  {
    id: 'UserList',
    title: 'ユーザー一覧',
    icon: FontIcons.login,
    screen: Screens.UserList
  },
  {
    id: 'EvnetAdd',
    title: 'ユーザー招待',
    icon: FontIcons.login,
    screen: Screens.Login
  },
  {
    id: 'EvnetAdd',
    title: 'マンション情報表示',
    icon: FontIcons.login,
    screen: Screens.Login
  },
  {
    id: 'EvnetAdd',
    title: 'マンションランク表示',
    icon: FontIcons.login,
    screen: Screens.Login
  },
  {
    id: 'EvnetAdd',
    title: 'マンション一覧',
    icon: FontIcons.login,
    screen: Screens.Login
  },
  {
    id: 'AccountList',
    title: '口座残高',
    icon: FontIcons.login,
    screen: Screens.AccountList
  },
  {
    id: 'EvnetAdd',
    title: 'マンションを切り替える',
    icon: FontIcons.login,
    screen: Screens.Login
  },
  {
    id: 'EvnetAdd',
    title: 'お問い合わせ',
    icon: FontIcons.login,
    screen: Screens.Login
  },
  {
    id: 'EvnetAdd',
    title: 'プライバシポリシー',
    icon: FontIcons.login,
    screen: Screens.Login
  },
  {
    id: 'EvnetAdd',
    title: 'ご利用規約',
    icon: FontIcons.login,
    screen: Screens.Login
  },
  {
    id: 'EvnetAdd',
    title: '緊急連絡',
    icon: FontIcons.login,
    screen: Screens.Login
  },
];

let menuRoutes = _.cloneDeep(MainRoutes);
menuRoutes.unshift({
  id: 'GridV2',
  title: 'Start',
  screen: Screens.GridV2,
  children: []
},);

export const MenuRoutes = menuRoutes;