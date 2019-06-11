import React from 'react';
import {
  FlatList,
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ScrollView,
  AsyncStorage,
  Image,
  Alert,
  Linking,
  Platform
} from 'react-native';
import _ from 'lodash';
import {
  RkStyleSheet,
  RkText,
  RkTextInput
} from 'react-native-ui-kitten';
import {Avatar} from '../../components';
import { Foundation, FontAwesome, Feather, Ionicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import {scale, base_url, img_url, test_flg} from '../../utils/scale';
import { Rating } from 'react-native-elements';
import { NavigationActions, StackActions } from 'react-navigation';

let moment = require('moment');
const image = img_url + 'event/event.png';

export class SideMenu extends React.Component {
  static navigationOptions = {
    header: null,
  };
  
  constructor(props) {
    super(props);
    this.state = {
    }
  }

  componentDidMount() {
    AsyncStorage.getItem("token_data").then((token_data) => {

      if(token_data !== null){
        let token = JSON.parse(token_data)
        let user = JSON.parse(token.user)
        let url = base_url + 'api/users/getInfo?user_id=' + user.id;

        fetch( url, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            Authorization: 'Bearer ' + token.access_token,
          },
        })
        .then((response) => response.json())
        .then((responseJson) => {
          var data = responseJson;
          
          if(data.message){
            Alert.alert('','情報取得エラー')
          } else {
            let user_data = data.user_data
            let ap_data = data.apartment_data
            let room_data = data.room_data
            let user_img_data = data.user_img_data
            let room_name = ""
            let user_role = 0
            if(user_data.is_trader === 0){
              room_name = room_data.floor + 'F ' + room_data.num + '号室'
              user_role = room_data.role_id
            } else {
              room_name = '業務内容 : ' + user_data.trader_type.name
            }
            this.setState({
              user_id: user_data.id,
              nick_name: user_data.nick_name,
              apartment_name: ap_data.name,
              apartment_id: ap_data.id,
              room_name: room_name,
              user_role: user_role,
              ap_cnt: data.ap_cnt,
              is_trader: user_data.is_trader,
              user_icon_uri: img_url + user_data.icon_path,
              star: ap_data.star
            })
          }
        })
        .catch((error) => {
          console.log(error);
          Alert.alert('情報取得例外エラー', JSON.stringify(error));
          this.setState({
            isLoading: false,
          })
        })
      }
    })
  }

  _renderEvent(){
    if(this.state.is_trader > 0){
      return (
        <View>
          <View style={{marginBottom: 15}}>
            <RkText rkType='primary3 mediumLine' style={styles.tabBoxSubTitle}>案件</RkText>
          </View>
          <TouchableOpacity onPress={() => 
          this.props.navigation.dispatch(StackActions.reset({
              index: 0,
              actions: [
                NavigationActions.navigate({
                  routeName: 'EventList',
                }),
              ],}))}>
            <View style={[styles.container,styles.tabBoxListItem]}>
            <MaterialIcons name="event-note" style={styles.icon} size={34} color="orange" />
              <View style={styles.content}>
                <View style={styles.contentHeader}>
                  <RkText rkType='header5'>案件一覧</RkText>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      )
    } else {
      return (
        <View>
          <View style={{marginBottom: 15}}>
            <RkText rkType='primary3 mediumLine' style={styles.tabBoxSubTitle}>案件</RkText>
          </View>

          {this._reanderEventAdd()}

          <TouchableOpacity onPress={() => 
          this.props.navigation.dispatch(StackActions.reset({
              index: 0,
              actions: [
                NavigationActions.navigate({
                  routeName: 'EventList',
                }),
              ],}))}>
            <View style={[styles.container,styles.tabBoxListItem]}>
            <MaterialIcons name="event-note" style={styles.icon} size={34} color="orange" />
              <View style={styles.content}>
                <View style={styles.contentHeader}>
                  <RkText rkType='header5'>案件一覧</RkText>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      )
    }
  }

  _reanderTraderAdd(){

    if (this.state.user_role < 3){
      return (
        <TouchableOpacity onPress={() => 
          this.props.navigation.dispatch(StackActions.reset({
              index: 0,
              actions: [
                NavigationActions.navigate({
                  routeName: 'TraderCreate',
                  params: {user_id: this.state.user_id}
                }),
              ],}))}>
          <View style={[styles.container,styles.tabBoxListItem]}>
            <FontAwesome name="user-plus" style={styles.icon} size={28} color="orange" />
            <View style={styles.content}>
              <View style={styles.contentHeader}>
                <RkText rkType='header5'>業者登録</RkText>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      )
    }
  }

  _reanderEventAdd(){

    if (this.state.user_role < 5){
      return (
        <TouchableOpacity onPress={() => 
          this.props.navigation.dispatch(StackActions.reset({
              index: 0,
              actions: [
                NavigationActions.navigate({
                  routeName: 'EventAdd',
                }),
              ],}))}>
          <View style={[styles.container,styles.tabBoxListItem]}>
            <MaterialIcons name="event" style={styles.icon} size={34} color="orange" />
            <View style={styles.content}>
              <View style={styles.contentHeader}>
                <RkText rkType='header5'>案件登録</RkText>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      )
    }
  }

  _reanderApChange(){

    if (this.state.ap_cnt > 1){
      return (
        <TouchableOpacity onPress={() => 
          this.props.navigation.dispatch(StackActions.reset({
              index: 0,
              actions: [
                NavigationActions.navigate({
                  routeName: 'ApartmentChange',
                }),
              ],}))}>
          <View style={[styles.container,styles.tabBoxListItem]}>
          <FontAwesome name="exchange" style={styles.icon} size={34} color="orange" />
            <View style={styles.content}>
              <View style={styles.contentHeader}>
                <RkText rkType='header5'>マンション切り替え</RkText>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      )
    }
  }

  _renderTrader(){
    if(this.state.is_trader === 0){
      return (
        <View>
          <View style={{marginBottom: 15}}>
            <RkText rkType='primary3 mediumLine' style={styles.tabBoxSubTitle}>業者</RkText>
          </View>

          {this._reanderTraderAdd()}

          <TouchableOpacity onPress={() => 
          this.props.navigation.dispatch(StackActions.reset({
              index: 0,
              actions: [
                NavigationActions.navigate({
                  routeName: 'TraderList',
                }),
              ],}))}>
            <View style={[styles.container,styles.tabBoxListItem]}>
            <FontAwesome name="users" style={styles.icon} size={28} color="orange" />
              <View style={styles.content}>
                <View style={styles.contentHeader}>
                  <RkText rkType='header5'>業者一覧</RkText>
                </View>
              </View>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => 
          this.props.navigation.dispatch(StackActions.reset({
              index: 0,
              actions: [
                NavigationActions.navigate({
                  routeName: 'TdRanking',
                }),
              ],}))}>
            <View style={[styles.container,styles.tabBoxListItem]}>
            <FontAwesome name="users" style={styles.icon} size={28} color="orange" />
              <View style={styles.content}>
                <View style={styles.contentHeader}>
                  <RkText rkType='header5'>業者ランキング</RkText>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      )
    }
  }
  
  _renderUser(){
    if(this.state.is_trader === 0){
      return (
        <View>
          <View style={{marginBottom: 15}}>
            <RkText rkType='primary3 mediumLine' style={styles.tabBoxSubTitle}>ユーザー</RkText>
          </View>
          <TouchableOpacity onPress={() => 
          this.props.navigation.dispatch(StackActions.reset({
              index: 0,
              actions: [
                NavigationActions.navigate({
                  routeName: 'UserInvitation',
                }),
              ],}))}>
            <View style={[styles.container,styles.tabBoxListItem]}>
            <FontAwesome name="user-plus" style={styles.icon} size={28} color="orange" />
              <View style={styles.content}>
                <View style={styles.contentHeader}>
                  <RkText rkType='header5'>ユーザー招待</RkText>
                </View>
              </View>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => 
          this.props.navigation.dispatch(StackActions.reset({
              index: 0,
              actions: [
                NavigationActions.navigate({
                  routeName: 'UserList',
                }),
              ],}))}>
            <View style={[styles.container,styles.tabBoxListItem]}>
            <FontAwesome name="users" style={styles.icon} size={28} color="orange" />
              <View style={styles.content}>
                <View style={styles.contentHeader}>
                  <RkText rkType='header5'>ユーザー一覧</RkText>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      )
    }
  }
  
  _renderApartment(){
    if(this.state.is_trader > 0){
      return (
        <View>
          <View style={{marginBottom: 15}}>
            <RkText rkType='primary3 mediumLine' style={styles.tabBoxSubTitle}>マンション</RkText>
          </View>
          <TouchableOpacity onPress={() => 
          this.props.navigation.dispatch(StackActions.reset({
              index: 0,
              actions: [
                NavigationActions.navigate({
                  routeName: 'ApartmentInfo',
                  params: {apartment_id: this.state.apartment_id, star: this.state.star}
                }),
              ],}))}>
            <View style={[styles.container,styles.tabBoxListItem]}>
              <FontAwesome name="building" style={[styles.icon, {marginLeft:5}]} size={34} color="orange" />
              <View style={styles.content}>
                <View style={styles.contentHeader}>
                  <RkText rkType='header5'>マンション情報表示</RkText>
                </View>
              </View>
            </View>
          </TouchableOpacity>

          {this._reanderApChange()}

        </View>
      )
    } else {
      return (
        <View>
          <View style={{marginBottom: 15}}>
            <RkText rkType='primary3 mediumLine' style={styles.tabBoxSubTitle}>マンション</RkText>
          </View>
          <TouchableOpacity onPress={() => 
          this.props.navigation.dispatch(StackActions.reset({
              index: 0,
              actions: [
                NavigationActions.navigate({
                  routeName: 'ApartmentInfo',
                  params: {apartment_id: this.state.apartment_id, star: this.state.star}
                }),
              ],}))}>
            <View style={[styles.container,styles.tabBoxListItem]}>
              <FontAwesome name="building" style={[styles.icon, {marginLeft:5}]} size={34} color="orange" />
              <View style={styles.content}>
                <View style={styles.contentHeader}>
                  <RkText rkType='header5'>マンション情報表示</RkText>
                </View>
              </View>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => 
          this.props.navigation.dispatch(StackActions.reset({
              index: 0,
              actions: [
                NavigationActions.navigate({
                  routeName: 'ApartmentList',
                }),
              ],}))}>
            <View style={[styles.container,styles.tabBoxListItem]}>
            <MaterialIcons name="event-note" style={styles.icon} size={34} color="orange" />
              <View style={styles.content}>
                <View style={styles.contentHeader}>
                  <RkText rkType='header5'>マンション一覧</RkText>
                </View>
              </View>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => 
          this.props.navigation.dispatch(StackActions.reset({
              index: 0,
              actions: [
                NavigationActions.navigate({
                  routeName: 'AccountList',
                  params: {role_id: this.state.user_role}
                }),
              ],}))}>
            <View style={[styles.container,styles.tabBoxListItem]}>
            <FontAwesome name="jpy" style={[styles.icon, {marginLeft:5,marginRight: 10}]} size={34} color="orange" />
              <View style={styles.content}>
                <View style={styles.contentHeader}>
                  <RkText rkType='header5'>口座残高</RkText>
                </View>
              </View>
            </View>
          </TouchableOpacity>

          {this._reanderApChange()}

        </View>
      )
    }
  }

  _loginUserReset(){
    AsyncStorage.clear()
    setTimeout(() => {
      this.props.navigation.dispatch(StackActions.reset({
          index: 0,
          actions: [
            NavigationActions.navigate({
              routeName: 'Login',
            }),
          ],}))
    }, 500)
  }
  
  _renderTestMode(){
    if(test_flg){
      return (
        <View>
          <View style={{marginBottom: 15}}>
            <RkText rkType='primary3 mediumLine' style={styles.tabBoxSubTitle}>テストモードメニュー</RkText>
          </View>
          <TouchableOpacity onPress={this._loginUserReset.bind(this)}>
            <View style={[styles.container,styles.tabBoxListItem]}>
            <FontAwesome name="user-plus" style={styles.icon} size={28} color="orange" />
              <View style={styles.content}>
                <View style={styles.contentHeader}>
                  <RkText rkType='header5'>ログインユーザーリセット</RkText>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      )
    }
  }
  
  _renderEmergency(){
    if(this.state.is_trader === 0){
      return (
        <View style={{ backgroundColor: 'red', height: 50,padding: 10}}>
          <View style={{flex: 1, alignItems: 'center'}}>
          <TouchableOpacity
            style={{alignItems: 'center', flexDirection: 'row'}}
            onPress={() => 
              this.props.navigation.dispatch(StackActions.reset({
                  index: 0,
                  actions: [
                    NavigationActions.navigate({
                      routeName: 'Emergency',
                    }),
                  ],}))}>
            <Feather name="phone-call" size={30} color="#fff" />
            <Text style={{color: '#fff',fontSize: 22,marginLeft: 10}}>安否確認・緊急連絡網</Text>
          </TouchableOpacity>
          </View>
        </View>
      )
    }
  }

  render() {
    return (
      <View style={{flex: 1, backgroundColor: '#000',paddingTop: (Platform.OS === 'android' ? 0 : 24),paddingBottom: (Platform.OS === 'android' ? 0 : 24)}}>
      <View style={{flex: 1, backgroundColor: '#fff0d1'}}>
        <View style={{ paddingBottom: 0, marginBottom: 20, backgroundColor: '#000', flexDirection: 'row', height: 55,paddingTop: 10}}>
          <View style={{flex: 1, alignItems: 'center', marginBottom: 0}}>
          <TouchableOpacity onPress={() => 
            this.props.navigation.dispatch(StackActions.reset({
                index: 0,
                actions: [
                  NavigationActions.navigate({
                    routeName: 'EventList',
                  }),
                ],}))}>
            <MaterialIcons name="home" size={34} color="#fff" />
          </TouchableOpacity>
          </View>
          <View style={{flex: 4, alignItems: 'center', marginBottom: 0}}>
            <Text style={{color: '#fff', fontSize: 14}}>{this.state.apartment_name}</Text>
            <Text style={{color: '#fff', fontSize: 12}}>メニュー</Text>
          </View>
          <View style={{flex: 1, alignItems: 'center', marginBottom: 0}}>
          </View>
        </View>

        <ScrollView style={{flex:1, padding: 5}}>
          <TouchableOpacity onPress={() => 
            this.props.navigation.dispatch(StackActions.reset({
                index: 0,
                actions: [
                  NavigationActions.navigate({
                    routeName: 'UserEdit',
                    params: {user_id: this.state.user_id}
                  }),
                ],}))}>
            <View style={[styles.container,styles.tabBoxListItem]}>
              <Image style={styles.avatar} source={{ uri: this.state.user_icon_uri }} />
              <View style={styles.content}>
                <View style={styles.contentHeader}>
                  <RkText rkType='header4'>{this.state.nick_name}</RkText>
                </View>
                  <RkText style={{fontSize: 16}}>{this.state.room_name}</RkText>
              </View>
            </View>
          </TouchableOpacity>

          {this._renderEvent()}

          {this._renderTrader()}

          {this._renderUser()}

          {this._renderApartment()}

          <View style={{marginBottom: 15}}>
            <RkText rkType='primary3 mediumLine' style={styles.tabBoxSubTitle}></RkText>
          </View>
          <TouchableOpacity onPress={() => 
            Linking.openURL('http://lp.ebihaze.com/list').catch(err => console.error('URLを開けませんでした。', err))}>
            <View style={[styles.container,styles.tabBoxListItem]}>
            <MaterialIcons name="security" style={styles.icon} size={34} color="orange" />
              <View style={styles.content}>
                <View style={styles.contentHeader}>
                  <RkText rkType='header5'>使い方</RkText>
                </View>
              </View>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => 
            this.props.navigation.dispatch(StackActions.reset({
                index: 0,
                actions: [
                  NavigationActions.navigate({
                    routeName: 'Privacy',
                    params: {apartment_name: this.state.apartment_name,is_trader: this.state.is_trader}
                  }),
                ],}))}>
            <View style={[styles.container,styles.tabBoxListItem]}>
            <MaterialIcons name="security" style={styles.icon} size={34} color="orange" />
              <View style={styles.content}>
                <View style={styles.contentHeader}>
                  <RkText rkType='header5'>プライバシーポリシー</RkText>
                </View>
              </View>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => 
            this.props.navigation.dispatch(StackActions.reset({
                index: 0,
                actions: [
                  NavigationActions.navigate({
                    routeName: 'TermsService',
                    params: {apartment_name: this.state.apartment_name,is_trader: this.state.is_trader}
                  }),
                ],}))}>
            <View style={[styles.container,styles.tabBoxListItem, {marginBottom: 20}]}>
            <MaterialIcons name="event-note" style={styles.icon} size={34} color="orange" />
              <View style={styles.content}>
                <View style={styles.contentHeader}>
                  <RkText rkType='header5'>ご利用規約</RkText>
                </View>
              </View>
            </View>
          </TouchableOpacity>

          {this._renderTestMode()}

        </ScrollView>

        {this._renderEmergency()}
      </View>
      </View>
    )
  }
}

let styles = RkStyleSheet.create(theme => ({
  root: {
    backgroundColor: '#fff0d1'
  },
  searchContainer: {
    backgroundColor: theme.colors.screen.bold,
    paddingHorizontal: 16,
    paddingVertical: 10,
    height: 60,
    alignItems: 'center',
  },
  container: {
    paddingLeft: 19,
    paddingRight: 16,
    paddingBottom: 12,
    paddingTop: 7,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: "#ddd"
  },
  content: {
    marginLeft: 16,
    flex: 8,
  },
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    marginTop: 10
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: theme.colors.border.base
  },
  avatar: {
    margin: 0,
    padding: 0,
    width: 70,
    height: 70,
    borderRadius:35,
  },
  tabPage: {
    paddingTop: 20
  },
  tabBoxListItem: {
    marginLeft: 15,
    marginRight: 15,
    borderWidth: 1,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: "#ddd",
    borderColor: '#ddd',
    paddingLeft: 10,
    paddingRight: 20,
    paddingBottom: 12,
    paddingTop: 7,
  },
  tabBoxSubTitle: {
    margin:15,
    marginBottom: 0,
    fontWeight: 'bold'
  },
  icon: {
    marginTop: 7
  },
}));