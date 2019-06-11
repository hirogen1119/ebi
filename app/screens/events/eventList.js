import React from 'react';
import {
  FlatList,
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  AsyncStorage,
  ScrollView,
  Alert,
  Image,
  Platform
} from 'react-native';
import _ from 'lodash';
import {
  RkStyleSheet,
  RkText,
  RkTextInput
} from 'react-native-ui-kitten';
import {
  AdMobBanner,
  AdMobInterstitial,
  PublisherBanner,
  AdMobRewarded,
  Notifications, Permissions
} from 'expo';
import {Avatar} from '../../components';
import {FontAwesome} from '../../assets/icons';
import { Foundation, Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import {scale, base_url, img_url, client_secret} from '../../utils/scale';
import { createMaterialTopTabNavigator, createStackNavigator, NavigationActions, StackActions } from 'react-navigation';
import { EventInfo } from './eventInfo';
import { Footer } from '../other';
import pushMsg from '../../utils/pushMsg';

let moment = require('moment');
const image = img_url + 'event/event.png';

let allEvents = null;
let joinEvents = null;
let watchEvents = null;

async function registerForPushNotificationsAsync() {

  //warningがでるのを防ぐためにtry catchを入れる
  try {

    const { status: existingStatus } = await Permissions.getAsync(
      Permissions.NOTIFICATIONS
    );
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return;
    }

    let token = await Notifications.getExpoPushTokenAsync();

    //コンソールに出力
    console.log(token);

  } catch (error) {
    console.log(error);
  }
}
export class EventList extends React.Component {
  static navigationOptions = {
    header: null,
  };
  
  constructor(props) {
    super(props);
    // this.renderItem = this._renderItem.bind(this);
    console.log('######### constructor ##################')
    this.state = {
      data: [],
      isVisible1: false,
      data1: [new Date('2018','6','4'),new Date('2018','6','12')],
      is_trader: 0
    }
    this.addNewMathItem = this.addNewMathItem.bind(this);
    this.setNavigation = this.setNavigation.bind(this)
  }

  _handleNotification = (notification) => {
    if(notification.origin === 'selected'){
      // バックグラウンドで起動中に通知がタップされたとき
    }else if(notification.origin === 'received'){
      // アプリ起動中に通知を受け取った
    }
  };
  componentDidMount() {
    // AsyncStorage.clear();

    // registerForPushNotificationsAsync();
    // let ptoken = await Notifications.getExpoPushTokenAsync();
    // アプリ起動中に受信、選択されたプッシュ通知をハンドリング
    this._notificationSubscription = Notifications.addListener(this._handleNotification);
    AsyncStorage.getItem("token_data").then((token_data) => {

      if(token_data !== null){
        let token = JSON.parse(token_data)
        let user = JSON.parse(token.user)
        console.log('######### user data ##################')
        console.log(user)
        this.setState({is_trader: user.is_trader, user_pushtoken: user.push_token})
        console.log(this.state)
        let url = base_url + 'api/events/eventList';

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
            Alert.alert('ログインエラー','再度、ログインして下さい。')
            this.setState({
              isLoading: false,
            })
          } else {
            allEvents = data.allEvents
            joinEvents = data.joinEvents
            watchEvents = data.watchEvents

            if(data.approvalUserCnt > 0){

              Alert.alert(
                '承認確認',
                '登録されたユーザーで未承認のユーザーがいらっしゃいます。\n 承認するユーザーを確認しますか？',
                [
                  {text: 'いいえ'},
                  {text: 'はい', onPress: () =>
                  this.props.navigation.dispatch(StackActions.reset({
                    index: 0,
                    actions: [
                      NavigationActions.navigate({
                        routeName: 'UserApproval',
                      }),
                    ],}))
                  },
                ],
                { cancelable: false }
              )
            }
            this.setState({
              isLoading: false,
              apartment_name: data.apartment.name,
              approval_cnt: data.approvalUserCnt,
              user_id: user.id,
              token: token
            })
          }
        })
        .catch((error) => {
          console.log(error);
          Alert.alert('ログイン例外エラー', JSON.stringify(error));
          this.setState({
            isLoading: false,
          })
        })

      } else {
        this.setState({ isLoading: false })
      }
    })
  }

  _testPush(){
        
    console.log('######### _testPush ##################')
    let msg_data = {
        msg_type: 'testMsg',
        message: 'testメッセージです',
    }
    let token = this.state.user_pushtoken
    pushMsg(
      'エビハゼからのメッセージです',
      'プッシュ通知のテストです',
      msg_data,
      token
    )
}

  componentWillReceiveProps(){
    console.log('######### componentWillReceiveProps ##################')
    AsyncStorage.getItem("token_data").then((token_data) => {

      if(token_data !== null){
        let token = JSON.parse(token_data)
        let user = JSON.parse(token.user)
        this.setState({is_trader: user.is_trader})
        let url = base_url + 'api/events/eventList';

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
            Alert.alert('ログインエラー','再度、ログインして下さい。')
            this.setState({
              isLoading: false,
            })
          } else {
            allEvents = data.allEvents
            joinEvents = data.joinEvents
            watchEvents = data.watchEvents

            if(data.approvalUserCnt > 0){

              Alert.alert(
                '承認確認',
                '登録されたユーザーで未承認のユーザーがいらっしゃいます。\n 承認するユーザーを確認しますか？',
                [
                  {text: 'いいえ'},
                  {text: 'はい', onPress: () =>
                  this.props.navigation.dispatch(StackActions.reset({
                    index: 0,
                    actions: [
                      NavigationActions.navigate({
                        routeName: 'UserApproval',
                      }),
                    ],}))
                  },
                ],
                { cancelable: false }
              )
            }
            this.setState({
              isLoading: false,
              apartment_name: data.apartment.name,
              approval_cnt: data.approvalUserCnt,
              user_id: user.id,
              token: token
            })
          }
        })
        .catch((error) => {
          console.log(error);
          Alert.alert('ログイン例外エラー', JSON.stringify(error));
          this.setState({
            isLoading: false,
          })
        })

      } else {
        this.setState({ isLoading: false })
      }
    })
  }

  componentWillUnmount() {
    this._notificationSubscription && this._notificationSubscription.remove();
  }

  _visibledPick1 = () => this.setState({ isVisible1: true });
  _hidePick1 = () => this.setState({ isVisible1: false });

  addNewMathItem(id, star) {
    this.props.navigation.dispatch(StackActions.reset({
      index: 0,
      actions: [
        NavigationActions.navigate({
          routeName: 'EventInfo',
          params: {event_id: id, star: star}
        }),
      ],}))
    
  }

  setNavigation(click,navi, params){
    if(click){
      if(params !== null){
        this.props.navigation.dispatch(StackActions.reset({
          index: 0,
          actions: [
            NavigationActions.navigate({
              routeName: navi,
              params: {params: params}
            }),
          ],}))
      } else {
        this.props.navigation.dispatch(StackActions.reset({
          index: 0,
          actions: [
            NavigationActions.navigate({
              routeName: navi,
            }),
          ],}))
      }
    }
  }

  _renderEventAdd(){
    if(this.state.is_trader === 0){
      return (
        <TouchableOpacity onPress={() => 
          this.props.navigation.dispatch(StackActions.reset({
            index: 0,
            actions: [
              NavigationActions.navigate({
                routeName: 'EventAdd',
              }),
            ],}))}>
          <MaterialIcons name="playlist-add" size={34} color="#fff" />
        </TouchableOpacity>
      )
    }
  }

  bannerError(){
    console.log("An error");
    return;
  }

  _renderEventList(){
    if(this.state.is_trader > 0){
      return (
        <ScrollView style={styles.tabPage}>
          <FlatList
            style={styles.root}
            data={allEvents}
            extraData={allEvents}
            keyExtractor={(item, index) => item.id}
            renderItem={({ item, index }) => {
              if(index !== 0 && (index % 5) === 0){
                return (
                  <AdMobBanner
                    style={styles.bottomBanner}
                    bannerSize="fullBanner"
                    adUnitID="ca-app-pub-1546737018311510/3827609738"
                    // Test ID, Replace with your-admob-unit-id
                    didFailToReceiveAdWithError={this.bannerError}
                  />
                  // <AdMobBanner
                  //   bannerSize="banner"
                  //   adUnitID="ca-app-pub-1546737018311510~4673378420" // Test ID, Replace with your-admob-unit-id
                    
                  //   onDidFailToReceiveAdWithError={this.bannerError} />
                  // <TouchableOpacity onPress={() => screenProps.addNewMathItem(0,0)}>
                  //   <View style={[styles.container,styles.tabBoxListItem, {backgroundColor: '#fff' }]}>
                      
                  //   <RkText rkType='header5'>サンプル</RkText>
                  //   </View>
                  // </TouchableOpacity>
                )
              } else {
                return (
                  <TouchableOpacity onPress={() => this.addNewMathItem(item.id,item.star)}>
                    <View style={[styles.container,styles.tabBoxListItem, {backgroundColor: item.backgroundColor }]}>
                      <View>
                        <View style={{flexDirection: 'row'}}>
                        <Image source={{ uri: img_url + item.icon_path }}
                          style={{
                            borderRadius: icon_radius,
                            overflow: 'hidden',
                            width: icon_width,
                            height: icon_height }} />
                          <View style={styles.content}>
                            <View style={styles.contentHeader}>
                              <RkText rkType='header5'>{item.name}</RkText>
                            </View>
                            <RkText numberOfLines={2} rkType='primary3 mediumLine' style={{paddingTop: 5}}>{item.content}</RkText>
                          </View>
                        </View>
                      </View>
                      <View style={{flexDirection: 'row', marginTop: 10}}>
                        <RkText rkType='secondary4 hintColor'>
                          {item.sub_category + '  '}
                        </RkText>
                        <RkText rkType='secondary4 hintColor'>
                            {item.start_dt + ' ~ ' + item.end_dt}
                        </RkText>
                      </View>
                    </View>
                  </TouchableOpacity>
                )
              }
            }}
          />
        </ScrollView>
      )
    } else {
      return (
        <TabNavi
        screenProps={{ addNewMathItem: this.addNewMathItem }} />
      )
    }
  }

  _renderFooterMenu(){
    if(this.state.is_trader === 0){
      return (
        <View style={{ backgroundColor: '#000', flexDirection: 'row', height: 70,paddingTop: 10}}>
          <View style={{flex: 1, alignItems: 'center'}}>
          <TouchableOpacity style={{alignItems: 'center'}} onPress={this._testPush.bind(this)}>
            <Feather name="menu" size={34} color="#fff" />
            <Text style={{color: '#fff',fontSize: 12}}>Menu</Text>
          </TouchableOpacity>
          </View>
          <View style={{flex: 1, alignItems: 'center'}}>
          <TouchableOpacity style={{alignItems: 'center'}} onPress={() => 
                            this.props.navigation.dispatch(StackActions.reset({
                                index: 0,
                                actions: [
                                  NavigationActions.navigate({
                                    routeName: 'EventList',
                                  }),
                                ],}))}>
            <MaterialIcons name="event-note" size={34} color="#fff" />
            <Text style={{color: '#fff',fontSize: 12}}>案件一覧</Text>
          </TouchableOpacity>
          </View>
          <View style={{flex: 1, alignItems: 'center'}}>
            <TouchableOpacity style={{alignItems: 'center'}} onPress={() => 
                            this.props.navigation.dispatch(StackActions.reset({
                                index: 0,
                                actions: [
                                  NavigationActions.navigate({
                                    routeName: 'ApRanking',
                                  }),
                                ],}))}>
              <Ionicons name="md-checkbox-outline" size={34} color="#fff" />
              <Text style={{color: '#fff',fontSize: 12}}>ランク</Text>
            </TouchableOpacity>
          </View>
          <View style={{flex: 1, alignItems: 'center'}}>
            <TouchableOpacity style={{alignItems: 'center'}} onPress={this._flyersClick.bind(this)}>
              <MaterialIcons name="wallpaper" size={34} color="#fff" />
              <Text style={{color: '#fff',fontSize: 12}}>チラシ</Text>
            </TouchableOpacity>
          </View>
        </View>
      )
    } else {
      return (
        <View style={{ backgroundColor: '#000', flexDirection: 'row', height: 70,paddingTop: 10}}>
          <View style={{flex: 1, alignItems: 'center'}}>
          <TouchableOpacity style={{alignItems: 'center'}} onPress={() => 
                            this.props.navigation.dispatch(StackActions.reset({
                                index: 0,
                                actions: [
                                  NavigationActions.navigate({
                                    routeName: 'SideMenu',
                                  }),
                                ],}))}>
            <Feather name="menu" size={34} color="#fff" />
            <Text style={{color: '#fff',fontSize: 12}}>Menu</Text>
          </TouchableOpacity>
          </View>
          <View style={{flex: 1, alignItems: 'center'}}>
          <TouchableOpacity style={{alignItems: 'center'}} onPress={() => 
                            this.props.navigation.dispatch(StackActions.reset({
                                index: 0,
                                actions: [
                                  NavigationActions.navigate({
                                    routeName: 'EventList',
                                  }),
                                ],}))}>
            <MaterialIcons name="event-note" size={34} color="#fff" />
            <Text style={{color: '#fff',fontSize: 12}}>案件一覧</Text>
          </TouchableOpacity>
          </View>
        </View>
      )
    }
  }

  _flyersClick(){

    let url = base_url + 'api/flyers/get-flyers?user_id=' + this.state.user_id;

    this.setState({ isLoading: true })
    fetch( url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: 'Bearer ' + this.state.token.access_token,
      },
    })
    .then((response) => response.json())
    .then((responseJson) => {
      var data = responseJson;
      
      if(data.message){
          Alert.alert('','チラシの取得に失敗しました。')
          this.setState({
          isLoading: false,
          })
      } else {
        let params = {
          user_id: this.props.user_id,
          flyers: data.flyers,
          apartment: data.apartment
        }
        if(data.flyers.length > 0){
          this.setState({ isLoading: false })
          this.props.navigation.dispatch(StackActions.reset({
              index: 0,
              actions: [
                NavigationActions.navigate({
                  routeName: 'Flyers',
                  params: {params: params}
                }),
              ],}))
        } else {
          this.setState({ isLoading: false })
          Alert.alert('登録されているチラシがありません。')
        }
      }
    })
    .catch((error) => {
        console.log(error);
        Alert.alert('チラシ例外エラー', JSON.stringify(error));
        this.setState({
            isLoading: false,
        })
    })
  }

  render() {
    const { navigation } = this.props;
    return (
      <View style={{flex: 1, backgroundColor: '#000',paddingTop: (Platform.OS === 'android' ? 0 : 24),paddingBottom: (Platform.OS === 'android' ? 0 : 24)}}>
      <View style={{flex: 1, backgroundColor: '#fff0d1'}}>
        <View style={{ paddingBottom: 0, backgroundColor: '#000', flexDirection: 'row', height: 55,paddingTop: 10}}>
          <View style={{flex: 1, alignItems: 'center', marginBottom: 0}}>
          {this._renderEventAdd()}
          </View>
          <View style={{flex: 4, alignItems: 'center', marginBottom: 0}}>
            <Text style={{color: '#fff', fontSize: 18}}>{this.state.apartment_name}</Text>
            <Text style={{color: '#fff', fontSize: 12}}>案件一覧</Text>
          </View>
          <View style={{flex: 1, alignItems: 'center', marginBottom: 0}}>
          </View>
        </View>

        {this._renderEventList()}
        {this._renderFooterMenu()}
      </View>
      </View>
    )
  }
}

const AllEvents = ({ screenProps }) => (
  <ScrollView style={styles.tabPage}>
    <FlatList
      style={styles.root}
      data={allEvents}
      extraData={allEvents}
      keyExtractor={(item, index) => item.id}
      renderItem={({ item, index }) => {
        let icon_radius = 30
        let icon_width = 60
        let icon_height = 60
        if(item.icon_type === 0){
          icon_radius = 0
          icon_width = 40
          icon_height = 40
        }
        if((index % 5) === 0){
          return (
            <View style={{ backgroundColor: '#fff0d1'}}>
            <View style={{padding: 20, paddingTop: index === 0 ? 5: 20,backgroundColor: '#fff0d1'}}>
            <AdMobBanner
              bannerSize="largeBanner"
              adUnitID="ca-app-pub-3940256099942544/6300978111" // Test ID, Replace with your-admob-unit-id
              onDidFailToReceiveAdWithError={this.bannerError} />
            </View>
            <TouchableOpacity onPress={() => screenProps.addNewMathItem(item.id,item.star)}>
              <View style={[styles.container,styles.tabBoxListItem, {backgroundColor: item.backgroundColor }]}>
                <View>
                  <View style={{flexDirection: 'row'}}>
                    <View style={styles.image_box}>
                        <Image source={{ uri: img_url + item.icon_path }}
                          style={{
                            borderRadius: icon_radius,
                            overflow: 'hidden',
                            width: icon_width,
                            height: icon_height }} />
                    </View>
                    <View style={styles.content}>
                      <View style={styles.contentHeader}>
                        <RkText rkType='header5'>{item.name}</RkText>
                      </View>
                      <RkText numberOfLines={2} rkType='primary3 mediumLine' style={{paddingTop: 5}}>{item.content}</RkText>
                    </View>
                  </View>
                </View>
                <View style={{flexDirection: 'row', marginTop: 10}}>
                  <RkText rkType='secondary4 hintColor'>
                    {item.sub_category + '  '}
                  </RkText>
                  <RkText rkType='secondary4 hintColor'>
                      {item.start_dt + ' ~ ' + item.end_dt}
                  </RkText>
                </View>
                <View style={{flexDirection: 'row', marginTop: 10}}>
                  <RkText rkType='secondary4 hintColor'>
                    {'登録日時 ' + item.created_at + '  '}
                  </RkText>
                </View>
              </View>
            </TouchableOpacity>
            </View>
          )
        } else {
          return (
            <TouchableOpacity onPress={() => screenProps.addNewMathItem(item.id,item.star)}>
              <View style={[styles.container,styles.tabBoxListItem, {backgroundColor: item.backgroundColor }]}>
                <View>
                  <View style={{flexDirection: 'row'}}>
                    <View style={styles.image_box}>
                        <Image source={{ uri: img_url + item.icon_path }}
                          style={{
                            borderRadius: icon_radius,
                            overflow: 'hidden',
                            width: icon_width,
                            height: icon_height }} />
                    </View>
                    <View style={styles.content}>
                      <View style={styles.contentHeader}>
                        <RkText rkType='header5'>{item.name}</RkText>
                      </View>
                      <RkText numberOfLines={2} rkType='primary3 mediumLine' style={{paddingTop: 5}}>{item.content}</RkText>
                    </View>
                  </View>
                </View>
                <View style={{flexDirection: 'row', marginTop: 10}}>
                  <RkText rkType='secondary4 hintColor'>
                    {item.sub_category + '  '}
                  </RkText>
                  <RkText rkType='secondary4 hintColor'>
                      {item.start_dt + ' ~ ' + item.end_dt}
                  </RkText>
                </View>
                <View style={{flexDirection: 'row', marginTop: 10}}>
                  <RkText rkType='secondary4 hintColor'>
                    {'登録日時 ' + item.created_at + '  '}
                  </RkText>
                </View>
              </View>
            </TouchableOpacity>
          )
        }
      }}
    />
  </ScrollView>
)

const WatchEvents = ({ screenProps }) => (
  <ScrollView style={styles.tabPage}>
    <FlatList
      style={styles.root}
      data={watchEvents}
      extraData={watchEvents}
      keyExtractor={(item, index) => item.id}
      renderItem={({ item, index }) => {
        let icon_radius = 30
        let icon_width = 60
        let icon_height = 60
        if(item.icon_type === 0){
          icon_radius = 0
          icon_width = 40
          icon_height = 40
        }
        if((index % 5) === 0){
          return (
            <View>
            <View style={{padding: 20, paddingTop: index === 0 ? 5: 20}}>
            <AdMobBanner
              bannerSize="largeBanner"
              adUnitID="ca-app-pub-3940256099942544/6300978111" // Test ID, Replace with your-admob-unit-id
              onDidFailToReceiveAdWithError={this.bannerError} />
            </View>
            <TouchableOpacity onPress={() => screenProps.addNewMathItem(item.id,item.star)}>
              <View style={[styles.container,styles.tabBoxListItem, {backgroundColor: item.backgroundColor }]}>
                <View>
                  <View style={{flexDirection: 'row'}}>
                    <View style={styles.image_box}>
                        <Image source={{ uri: img_url + item.icon_path }}
                          style={{
                            borderRadius: icon_radius,
                            overflow: 'hidden',
                            width: icon_width,
                            height: icon_height }} />
                    </View>
                    <View style={styles.content}>
                      <View style={styles.contentHeader}>
                        <RkText rkType='header5'>{item.name}</RkText>
                      </View>
                      <RkText numberOfLines={2} rkType='primary3 mediumLine' style={{paddingTop: 5}}>{item.content}</RkText>
                    </View>
                  </View>
                </View>
                <View style={{flexDirection: 'row', marginTop: 10}}>
                  <RkText rkType='secondary4 hintColor'>
                    {item.sub_category + '  '}
                  </RkText>
                  <RkText rkType='secondary4 hintColor'>
                      {item.start_dt + ' ~ ' + item.end_dt}
                  </RkText>
                </View>
                <View style={{flexDirection: 'row', marginTop: 10}}>
                  <RkText rkType='secondary4 hintColor'>
                    {'登録日時 ' + item.created_at + '  '}
                  </RkText>
                </View>
              </View>
            </TouchableOpacity>
            </View>
          )
        } else {
          return (
            <TouchableOpacity onPress={() => screenProps.addNewMathItem(item.id,item.star)}>
              <View style={[styles.container,styles.tabBoxListItem, {backgroundColor: item.backgroundColor }]}>
                <View>
                  <View style={{flexDirection: 'row'}}>
                    <View style={styles.image_box}>
                        <Image source={{ uri: img_url + item.icon_path }}
                          style={{
                            borderRadius: icon_radius,
                            overflow: 'hidden',
                            width: icon_width,
                            height: icon_height }} />
                    </View>
                    <View style={styles.content}>
                      <View style={styles.contentHeader}>
                        <RkText rkType='header5'>{item.name}</RkText>
                      </View>
                      <RkText numberOfLines={2} rkType='primary3 mediumLine' style={{paddingTop: 5}}>{item.content}</RkText>
                    </View>
                  </View>
                </View>
                <View style={{flexDirection: 'row', marginTop: 10}}>
                  <RkText rkType='secondary4 hintColor'>
                    {item.sub_category + '  '}
                  </RkText>
                  <RkText rkType='secondary4 hintColor'>
                      {item.start_dt + ' ~ ' + item.end_dt}
                  </RkText>
                </View>
                <View style={{flexDirection: 'row', marginTop: 10}}>
                  <RkText rkType='secondary4 hintColor'>
                    {'登録日時 ' + item.created_at + '  '}
                  </RkText>
                </View>
              </View>
            </TouchableOpacity>
          )
        }
      }}
    />
  </ScrollView>
)

const RelationEvents = ({ screenProps }) => (
  <ScrollView style={styles.tabPage}>
    <FlatList
      style={styles.root}
      data={joinEvents}
      extraData={joinEvents}
      keyExtractor={(item, index) => item.id}
      renderItem={({ item, index }) => {
        let icon_radius = 30
        let icon_width = 60
        let icon_height = 60
        if(item.icon_type === 0){
          icon_radius = 0
          icon_width = 40
          icon_height = 40
        }
        if((index % 5) === 0){
          return (
            <View>
            <View style={{padding: 20, paddingTop: index === 0 ? 5: 20}}>
            <AdMobBanner
              bannerSize="largeBanner"
              adUnitID="ca-app-pub-3940256099942544/6300978111" // Test ID, Replace with your-admob-unit-id
              onDidFailToReceiveAdWithError={this.bannerError} />
            </View>
            <TouchableOpacity onPress={() => screenProps.addNewMathItem(item.id,item.star)}>
              <View style={[styles.container,styles.tabBoxListItem, {backgroundColor: item.backgroundColor }]}>
                <View>
                  <View style={{flexDirection: 'row'}}>
                    <View style={styles.image_box}>
                        <Image source={{ uri: img_url + item.icon_path }}
                          style={{
                            borderRadius: icon_radius,
                            overflow: 'hidden',
                            width: icon_width,
                            height: icon_height }} />
                    </View>
                    <View style={styles.content}>
                      <View style={styles.contentHeader}>
                        <RkText rkType='header5'>{item.name}</RkText>
                      </View>
                      <RkText numberOfLines={2} rkType='primary3 mediumLine' style={{paddingTop: 5}}>{item.content}</RkText>
                    </View>
                  </View>
                </View>
                <View style={{flexDirection: 'row', marginTop: 10}}>
                  <RkText rkType='secondary4 hintColor'>
                    {item.sub_category + '  '}
                  </RkText>
                  <RkText rkType='secondary4 hintColor'>
                      {item.start_dt + ' ~ ' + item.end_dt}
                  </RkText>
                </View>
                <View style={{flexDirection: 'row', marginTop: 10}}>
                  <RkText rkType='secondary4 hintColor'>
                    {'登録日時 ' + item.created_at + '  '}
                  </RkText>
                </View>
              </View>
            </TouchableOpacity>
            </View>
          )
        } else {
          return (
            <TouchableOpacity onPress={() => screenProps.addNewMathItem(item.id,item.star)}>
              <View style={[styles.container,styles.tabBoxListItem, {backgroundColor: item.backgroundColor }]}>
                <View>
                  <View style={{flexDirection: 'row'}}>
                    <View style={styles.image_box}>
                        <Image source={{ uri: img_url + item.icon_path }}
                          style={{
                            borderRadius: icon_radius,
                            overflow: 'hidden',
                            width: icon_width,
                            height: icon_height }} />
                    </View>
                    <View style={styles.content}>
                      <View style={styles.contentHeader}>
                        <RkText rkType='header5'>{item.name}</RkText>
                      </View>
                      <RkText numberOfLines={2} rkType='primary3 mediumLine' style={{paddingTop: 5}}>{item.content}</RkText>
                    </View>
                  </View>
                </View>
                <View style={{flexDirection: 'row', marginTop: 10}}>
                  <RkText rkType='secondary4 hintColor'>
                    {item.sub_category + '  '}
                  </RkText>
                  <RkText rkType='secondary4 hintColor'>
                      {item.start_dt + ' ~ ' + item.end_dt}
                  </RkText>
                </View>
                <View style={{flexDirection: 'row', marginTop: 10}}>
                  <RkText rkType='secondary4 hintColor'>
                    {'登録日時 ' + item.created_at + '  '}
                  </RkText>
                </View>
              </View>
            </TouchableOpacity>
          )
        }
      }}
    />
  </ScrollView>
)

const HomeStack = createStackNavigator({
  AllEvents: {
    screen: AllEvents,
    navigationOptions: { header: null, }
  },
  EventInfo: {
    screen: EventInfo,
  },
})

const TabNavi = createMaterialTopTabNavigator({
  AllEvents: {
    screen: AllEvents,
    navigationOptions: { title: '案件一覧' }
  },
  RelationEvents: {
    screen: RelationEvents,
    navigationOptions: { title: '参加一覧' }
  },
  WatchEvents: {
    screen: WatchEvents,
    navigationOptions: { title: 'ウォッチ一覧' }
  }
},{
  tabBarOptions: {
    // ...createMaterialTopTabNavigator.Presets.AndroidTopTabs,
    indicatorStyle: {
        backgroundColor:'#000',
    },
    activeTintColor: 'orange',
    activeBackgroundColor: '#000',
    inactiveTintColor: 'white',
    inactiveBackgroundColor: 'black',
    tabStyle: {
      borderWidth: 1,
      borderColor: '#ddd',
      paddingTop: Platform.OS === 'android' ? 10 : 0,
      paddingBottom: 0,
      height: 50,
      paddingTop: 10,
    },
    style: {
      backgroundColor: '#000',
      height: 50,
    },
    labelStyle: {
      fontSize: 16,fontWeight: 'bold'
    },
    labelStyles:{ fontSize:24 } 
  },
  tabBarPosition: "top",});

let styles = RkStyleSheet.create(theme => ({
  root: {
    backgroundColor: '#fff0d1',
    paddingTop: 0,
    marginBottom: 20,
  },
  container: {
    paddingLeft: 19,
    paddingRight: 16,
    paddingBottom: 12,
    paddingTop: 7,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: "#ddd",
    marginBottom: 20
  },
  content: {
    marginLeft: 16,
    flex: 1,
  },
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  avatar: {
  },
  tabPage: {
    marginBottom: 0,
    paddingBottom: 0,
    backgroundColor: '#fff0d1',
    paddingTop: 20
  },
  tabBoxListItem: {
    marginLeft: 15,
    marginRight: 15,
    marginTop: 5,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  image_box: {
      borderRadius: 100,
      width: 60,
      height: 60,
      backgroundColor: '#fff',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#ddd'
  },
}));