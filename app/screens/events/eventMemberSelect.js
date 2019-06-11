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
  Picker,
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
  AdMobRewarded
} from 'expo';

import {Avatar} from '../../components';
import {FontAwesome} from '../../assets/icons';
import { Foundation, Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import {scale, base_url, img_url, client_secret} from '../../utils/scale';
import { EventInfo } from './eventInfo';
import { Footer } from '../other';
import Modal from "react-native-modal";
import pushMsg from '../../utils/pushMsg';
import { NavigationActions, StackActions } from 'react-navigation';

let moment = require('moment');
const image = img_url + 'event/event.png';

let allEvents = null;
let joinEvents = null;
let watchEvents = null;

export class EventMemberSelect extends React.Component {
  static navigationOptions = {
    header: null,
  };
  
  constructor(props) {
    super(props);
    const navParams = this.props.navigation.state.params
    this.state = {
      isLoading: true,
      isSearchModalVisible: false,
      owned: 0,
      role_check1: true,
      role_check2: false,
      role_check3: false,
      searchFloor: '',
      traders: navParams.traders,
      event_id: navParams.event_id
    }
  }

  componentDidMount() {

    AsyncStorage.getItem("token_data").then((token_data) => {

      if(token_data !== null){
        let token = JSON.parse(token_data)
        let user = JSON.parse(token.user)
        
        this.setState({token_data: token_data, user: user})

        let url = base_url + 'api/events/getMemberList';

        fetch( url, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            searchFlg: false,
            searchItems: null,
            event_id: this.state.event_id,
            user_id: user.id
          }),
        })
        .then((response) => response.json())
        .then((responseJson) => {
          var data = responseJson;
          
          if(data.message){
            Alert.alert('ユーザー情報取得エラー','ユーザー情報の取得に失敗しました。')
            this.setState({
              isLoading: false,
            })
          } else {
            this.setState({
              isLoading: false,
              apartment_name: data.apartment.name,
              user_datas: data.users,
              oldUsers: data.users
            })
          }
        })
        .catch((error) => {
          console.log(error);
          Alert.alert('ユーザー情報取得例外エラー', JSON.stringify(error));
          this.setState({
            isLoading: false,
          })
        })

      } else {
        this.setState({ isLoading: false })
      }
    })
  }

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

  _userClick = (hey) => {
    if(hey.regist){
      Alert.alert('登録者は関係者から外すことは出来ません。')
    } else {
      let datas = this.state.user_datas
      let user_datas = []
      for(key in datas){
          let u = datas[key]
          if (u.id === hey.id) {
              u.check = !u.check
          }
          user_datas.push(u)
      }
      this.setState({user_datas: user_datas, fakeContact: this.state.fakeContact})
    }
}

_roleCheck(role){
  if(role === 1){
    this.setState({
      role_check1: true,
      role_check2: false,
      role_check3: false,
    })
  } else  if(role === 2){
    this.setState({
      role_check1: false,
      role_check2: true,
      role_check3: false,
    })
  } else  if(role === 3){
    this.setState({
      role_check1: false,
      role_check2: false,
      role_check3: true,
    })
  }
}
  _renderMemberList(){
    
    return (
      <ScrollView style={styles.tabPage}>
        <FlatList
          style={styles.root}
          data={this.state.user_datas}
          extraData={allEvents}
          keyExtractor={(item, index) => item.id}
          renderItem={({ item, index }) => {
              return (
                <TouchableOpacity onPress={()=>this._userClick(item, index)}>
                  <View style={[styles.container,styles.tabBoxListItem, {backgroundColor: '#fff' }]}>
                    <View>
                      <View style={{flexDirection: 'row'}}>
                      <Image source={{ uri: img_url + item.icon_path }} style={{ borderRadius: 100,overflow: 'hidden', width: 30, height: 30 }} />
                        <View style={styles.content}>
                          <View style={styles.contentHeader}>
                            <RkText rkType='header5'>{item.nick_name}</RkText>
                          </View>
                        </View>
                        <View>
                        {item.check ? (
                          <Ionicons name="ios-checkbox" size={30} color={'orange'}></Ionicons>
                        )
                        : (
                          <Ionicons name="ios-square-outline" size={30} color={'orange'}></Ionicons>
                        )}
                        </View>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              )
          }}
        />
      </ScrollView>
    )
  }

  _renderFooterMenu(){
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
          this.props.navigation.navigate.goBack()
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
                  params: { params: params }
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

  _searchModal(){
    this.setState({ isSearchModalVisible: !this.state.isSearchModalVisible })
  }

  _searchModalClose(){
    this._searchModal()
  }

  _search(){

    let url = base_url + 'api/events/getMemberList';

    let search_role = 0
    if(this.state.role_check1){
      search_role = 0
    } else if(this.state.role_check2){
      search_role = 1
    } else if(this.state.role_check3){
      search_role = 2
    }
    let searchItems = {
      search_role: search_role,
      search_floor: this.state.searchFloor,
      search_owned: this.state.owned
    }
    fetch( url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        searchFlg: true,
        searchItems: searchItems,
        event_id: this.state.event_id,
        user_id: this.state.user.id
      }),
    })
    .then((response) => response.json())
    .then((responseJson) => {
      var data = responseJson;
      
      if(data.message){
        Alert.alert('ユーザー情報取得エラー','ユーザー情報の取得に失敗しました。')
        this.setState({
          isLoading: false,
        })
      } else {
        this.setState({
          isLoading: false,
          apartment_name: data.apartment.name,
          user_datas: data.users,
          isSearchModalVisible: false
        })
      }
    })
    .catch((error) => {
      console.log(error);
      Alert.alert('ユーザー情報取得例外エラー', JSON.stringify(error));
      this.setState({
        isLoading: false,
      })
    })

  }

  _send(){

    let residents = []
    let selectUsers = []
    let users = this.state.user_datas
    
    for(key in users){
      let user = users[key]
      if(user.check){
        residents.push(user.id)
        selectUsers.push(user)
      }
    }

    let url = base_url + 'api/events/memberAdd';
    fetch( url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        residents: residents,
        event_id: this.state.event_id,
        user_id: this.state.user.id
      }),
    })
    .then(response => {
        return response.json()})
    .then((responseJson) => {
        var data = responseJson;
        
        if(data.exception || data.result === 1){
            Alert.alert('案件情報登録エラー', data.message);
        } else {

            let msgs = []
            let title = 'エビハゼからのメッセージです'
            let body = '新しい案件の関係者に追加されましたので確認して下さい。'
            let msg_data = {
                msg_type: 'eventAdd',
                message: '',
                event_id: this.state.event_id
            }
            let oldUsers = this.state.oldUsers
            let nowUsers = selectUsers
            for(key in oldUsers){
              let oldUser = oldUsers[key]
              if(!oldUser.old_check){
                for(o_key in nowUsers){
                  let nowUser = nowUsers[o_key]
                  if(nowUser.id === oldUser.id && nowUser.check){
                    let token = nowUser.push_token
                    
                    let result =pushMsg(
                      'エビハゼからのメッセージです',
                      '新しい案件の関係者に'+nowUser.nick_name+'様が追加されましたので確認して下さい。',
                      msg_data,
                      token
                    )
                  }
                }
              }
            }

            for(key in oldUsers){
              let oldUser = oldUsers[key]
              if(oldUser.old_check){
                for(n_key in nowUsers){
                  let nowUser = nowUsers[n_key]
                  if(nowUser.id === oldUser.id && !nowUser.check){
                    let token = nowUser.push_token
                    
                    pushMsg(
                      'エビハゼからのメッセージです',
                      '新しい案件の関係者から外されました。',
                      msg_data,
                      token
                    )
                  }
                }
              }
            }
            this.props
            .navigation
            .dispatch(StackActions.reset({
              index: 0,
              actions: [
                NavigationActions.navigate({
                  routeName: 'EventList'
                }),
              ],
            }))
        }
    })
    .catch((error) => {
        console.log(error);
        Alert.alert('案件情報の登録例外エラー', JSON.stringify(error));
    })
  }

  render() {
    const { navigation } = this.props;
    return (
      <View style={{flex: 1, backgroundColor: '#000',paddingTop: (Platform.OS === 'android' ? 0 : 24),paddingBottom: (Platform.OS === 'android' ? 0 : 24)}}>
      <View style={{flex: 1, backgroundColor: '#fff0d1'}}>
        <View style={{ paddingBottom: 0, backgroundColor: '#000', flexDirection: 'row', height: 55,paddingTop: 10}}>
          <View style={{flex: 1, alignItems: 'center', marginBottom: 0}}>
          </View>
          <View style={{flex: 4, alignItems: 'center', marginBottom: 0}}>
            <Text style={{color: '#fff', fontSize: 18}}>{this.state.apartment_name}</Text>
            <Text style={{color: '#fff', fontSize: 12}}>案件一覧</Text>
          </View>
          <View style={{flex: 1, alignItems: 'center', marginBottom: 10}}>

          </View>
        </View>
        <View style={{margin: 10, marginLeft: 15, marginRight: 15}}>
          <View style={{justifyContent: 'center',flexDirection: 'row'}}>
              <TouchableOpacity style={{ padding: 10, backgroundColor: 'green', flex: 1, marginLeft: 5, marginRight: 5 }} onPress={this._searchModal.bind(this)}>
                  <Text style={{color: '#fff',fontSize:16,textAlign: 'center'}}>検索条件変更</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ padding: 10, backgroundColor: 'orange', flex: 1, marginLeft: 5, marginRight: 5 }} onPress={this._send.bind(this)}>
                  <Text style={{color: '#fff',fontSize:16,textAlign: 'center'}}>案件情報登録</Text>
              </TouchableOpacity>
          </View>
        </View>
        {this._renderMemberList()}
        {this._renderFooterMenu()}
        <Modal
            isVisible={this.state.isSearchModalVisible}
            animationInTiming={800}
            animationOutTiming={800}
            backdropTransitionInTiming={800}
            backdropTransitionOutTiming={800}
            >
            <View style={styles.container_item}>
                <View style={{flexDirection: 'row', marginBottom: 15}}>
                    <View style={{ flex: 7,alignItems: 'flex-start',justifyContent: 'center',alignContent: 'center'}}>
                        <Text style={{fontSize: 20}}>検索条件を設定して下さい</Text>
                    </View>
                    <View style={{flex: 1,alignItems: 'flex-end',justifyContent: 'center'}}>
                        <TouchableOpacity style={{ padding: 0 }} onPress={this._searchModalClose.bind(this)}>
                            <Ionicons name="md-close" size={30} color="black"></Ionicons>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.storyContainer}>
                  <View style={{flexDirection: 'row'}}>
                    <TouchableOpacity onPress={this._roleCheck.bind(this,1)}>
                      {this.state.role_check1 ? (
                          <Ionicons name="md-radio-button-on" size={26} color={'orange'}></Ionicons>
                      )
                      : (
                        <Ionicons name="md-radio-button-off" size={26} color={'orange'}></Ionicons>
                      )}
                    </TouchableOpacity>
                    <Text style={{color: 'black', fontSize: 16, marginLeft: 5}}>全て</Text>
                  </View>
                  <View style={{flexDirection: 'row'}}>
                    <TouchableOpacity onPress={this._roleCheck.bind(this,2)}>
                      {this.state.role_check2 ? (
                          <Ionicons name="md-radio-button-on" size={26} color={'orange'}></Ionicons>
                      )
                      : (
                        <Ionicons name="md-radio-button-off" size={26} color={'orange'}></Ionicons>
                      )}
                    </TouchableOpacity>
                    <Text style={{color: 'black', fontSize: 16, marginLeft: 5}}>役員</Text>
                  </View>
                  <View style={{flexDirection: 'row', marginLeft: 15}}>
                  <TouchableOpacity onPress={this._roleCheck.bind(this,3)}>
                    {this.state.role_check3 ? (
                          <Ionicons name="md-radio-button-on" size={26} color={'orange'}></Ionicons>
                      )
                      : (
                        <Ionicons name="md-radio-button-off" size={26} color={'orange'}></Ionicons>
                      )}
                  </TouchableOpacity>
                    <Text style={{color: 'black', fontSize: 16, marginLeft: 5}}>一般</Text>
                  </View>
                </View>
                <View>
                  <RkText style={{fontSize: 18,marginTop: 15}}>階層</RkText>
                  <RkTextInput
                      keyboardType={'numeric'}
                      onChangeText={(searchFloor) => this.setState({searchFloor: searchFloor})}
                      style={styles.text}
                      value={this.state.text}
                      />
                </View>
                <View>
                  <RkText style={{marginBottom: 10}}>所有形態(部屋)</RkText>
                  <Picker
                      selectedValue={this.state.owned}
                      style={styles.select_picker}
                      onValueChange={(itemValue, itemIndex) => this.setState({owned: itemValue})}>
                      
                      <Picker.Item label="全て" value={0} />
                      <Picker.Item label="オーナー（居住）" value={1} />
                      <Picker.Item label="オーナー（貸出）" value={2} />
                      <Picker.Item label="入居（賃借）" value={3} />
                  </Picker>
                </View>
                <View style={{marginTop: 25}}>
                    <View style={styles.containerFooter}>
                        <View style={{justifyContent: 'center'}}>
                            <TouchableOpacity style={{ padding: 10, backgroundColor: 'orange' }} onPress={this._search.bind(this)}>
                                <Text style={{color: '#fff',fontSize:20,textAlign: 'center'}}>検索</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
      </View>
      </View>
    )
  }
}

let styles = RkStyleSheet.create(theme => ({
  root: {
    backgroundColor: '#fff0d1',
    paddingTop: 20,
    marginBottom: 20,
  },
  searchContainer: {
    backgroundColor: theme.colors.screen.bold,
    paddingHorizontal: 16,
    paddingVertical: 10,
    height: 60,
    alignItems: 'center'
  },
  container: {
    paddingLeft: 10,
    paddingRight: 16,
    paddingBottom: 10,
    paddingTop: 10,
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
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: theme.colors.border.base
  },
  avatar: {
  },
  tabPage: {
    marginBottom: 0,
    paddingBottom: 0,
    marginTop: 0
  },
  tabBoxListItem: {
    marginLeft: 15,
    marginRight: 15,
    marginTop: 5,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: '#ddd'
  },
  modal_text: {
      fontSize: 20,
      marginLeft: 10
  },
  modal_flat: {
      padding: 8,
  },
  modal_view: {
      padding: 10,
      borderColor: "#ddd",
      borderWidth: 2,
      borderRadius: 5,
      marginBottom: 10,
      fontSize: 30,
      flexDirection: 'row'
  },
  modal_button: {
      padding: 10,
      borderColor: "#ddd",
      borderWidth: 2,
      borderRadius: 5,
      marginBottom: 10,
      fontSize: 30,
      backgroundColor: '#abc7f4',
      alignItems: 'center',
      marginLeft: 10,
      marginRight: 10,
      width: 120,
  },
  container_modal: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center"
  },
  container_item: {
    backgroundColor: '#fff0d1',
    paddingVertical: 8,
    padding: 10,
  },
  modalContent: {
    backgroundColor: "white",
    padding: 22,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4,
    borderColor: "rgba(0, 0, 0, 0.1)",
  },
  header: {
      backgroundColor: '#000',
      padding: 15,
      flexDirection: 'row',
  },
  title: {
      flex: 5,
      color: '#fff',
      fontSize: 20
  },
  back_icon: {
      flex: 1,
      color: '#fff',
      fontSize: 20
  },
  storyContainer: {
    flexDirection: 'row'
  },
  text: {
      marginTop: 10,
      marginBottom: 15,
      height: 50,
      backgroundColor: '#fff',
  },
  select_picker: {
    backgroundColor: '#fff'
  }
}));