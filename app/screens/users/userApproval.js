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
  CheckBox,
  Alert,
  Platform
} from 'react-native';
import _ from 'lodash';
import {
  RkStyleSheet,
  RkText,
  RkCard,
  RkTextInput
} from 'react-native-ui-kitten';
import {Avatar, SocialBar} from '../../components';
import {FontAwesome} from '../../assets/icons';
import { Foundation, Feather, Ionicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import {scale, base_url, img_url} from '../../utils/scale';
import pushMsg from '../../utils/pushMsg';
import { NavigationActions, StackActions } from 'react-navigation';

let moment = require('moment');
const image = img_url + 'event/event.png';

export class UserApproval extends React.Component {
  static navigationOptions = {
    header: null,
  };
  
  constructor(props) {
    super(props);
    // this.renderItem = this._renderItem.bind(this);
    this.state = {
      datas: [],
      isVisible1: false,
      data1: [new Date('2018','6','4'),new Date('2018','6','12')],
      user_role: 0,
      checked: false,
    }
  }

  componentDidMount() {
    AsyncStorage.getItem("token_data").then((token_data) => {

      if(token_data !== null){
        let token = JSON.parse(token_data)
        let user = JSON.parse(token.user)
        let url = base_url + 'api/users/getApproval?user_id=' + user.id;

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
            let apartment = data.apartment_data
            let room = data.room
            this.setState({
              datas: data.users,
              user_id: user.id,
              is_trader: user.is_trader,
              apartment_name: apartment.name
            });
          }
        })
        .catch((error) => {
          Alert.alert('情報取得例外エラー', JSON.stringify(error));
          this.setState({
            isLoading: false,
          })
        })
      }
    })
  }
  _keyExtractor(item, index) {
    return item.id;
  }

  _renderSeparator() {
    return (
      <View style={styles.separator}/>
    )
  }

  _visibledPick1 = () => this.setState({ isVisible1: true });
  _hidePick1 = () => this.setState({ isVisible1: false });

  _invitationUp(index,item){

    let url = base_url + 'api/users/invitation';
    fetch( url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: item.id
      }),
    })
    .then((response) => response.json())
    .then((responseJson) => {
      let data = responseJson;
      let datas = this.state.datas
      if(data.message){
        this.setState({isReading: false})
        Alert.alert('', data.message);
      } else {
        let msg_data = {
          msg_type: 'invitation',
          message: ''
        }
        pushMsg(
          'エビハゼからのメッセージです',
          'アカウントが承認されました。',
          msg_data,
          item.push_token
        )

        datas[index].invitation = 0
        datas[index].room_approval = 0
        this.setState({
          datas: datas
        })
      }
    })
    .catch((error) => {
      this.setState({isReading: false})
      Alert.alert('承認例外エラー', JSON.stringify(error));
    });
  }

  _invitationClick(index,item){
    Alert.alert(
      '',
      '対象のユーザーを承認しますか？',
      [
        {text: 'いいえ'},
        {text: 'はい', onPress: () => 
          this._invitationUp(index,item)},
      ],
      { cancelable: false }
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
        Alert.alert('チラシ例外エラー', JSON.stringify(error));
        this.setState({
            isLoading: false,
        })
    })
  }

  _renderFooterMenu(){
    if(this.state.is_trader === 0){
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

  render() {
    return (
      <View style={{flex: 1, backgroundColor: '#000',paddingTop: (Platform.OS === 'android' ? 0 : 24),paddingBottom: (Platform.OS === 'android' ? 0 : 24)}}>
      <View style={{flex: 1, backgroundColor: '#fff0d1'}}>
        <View style={{ paddingBottom: 0, backgroundColor: '#000', flexDirection: 'row', height: 55,paddingTop: 10}}>
          <View style={{flex: 1, alignItems: 'center', marginBottom: 0}}>
          <TouchableOpacity onPress={()=> this.props.navigation.goBack()}>
              <MaterialIcons name="chevron-left" size={34} color="#fff" />
          </TouchableOpacity>
          </View>
          <View style={{flex: 4, alignItems: 'center', marginBottom: 0}}>
            <Text style={{color: '#fff', fontSize: 18}}>{this.state.apartment_name}</Text>
            <Text style={{color: '#fff', fontSize: 12}}>未承認一覧</Text>
          </View>
          <View style={{flex: 1, alignItems: 'center', marginBottom: 0}}>
          </View>
        </View>
        <ScrollView style={{marginTop: 20}}>
          <FlatList
            style={styles.root}
            data={this.state.datas}
            extraData={this.state}
            ItemSeparatorComponent={this._renderSeparator}
            keyExtractor={this._keyExtractor}
            renderItem={({item,index}) => {
              let name = `${item.nick_name}`;
              if(item.area === null){
                item.area = ""
              }
              
              let text = ''
              if(item.is_trader > 0){
                text = ' '
              } else {
                text = `${item.room_floor}` + 'F ' + `${item.room_num}` + '号室'
              }
              let image_path = ""

              if(item.icon_path === ""){
                image_path = base_url + 'img/no_image.png'
              } else {
                image_path = img_url + item.icon_path
              }

              return (
                <View style={[styles.container,styles.tabBoxListItem]}>
                  <Image style={styles.avatar} source={{ uri: image_path }} />
                  <View style={styles.content}>
                    <View style={styles.contentHeader}>
                      <RkText rkType='header5'>{name}</RkText>
                    </View>
                    <RkText numberOfLines={2} rkType='primary3 mediumLine' style={{paddingTop: 5}}>{text}</RkText>
                  </View>
                  {(() => {
                    if (item.invitation > 0 || item.room_approval > 0){
                      return (
                      <TouchableOpacity onPress={this._invitationClick.bind(this,index,item)}>
                        <View style={{marginTop: 15,marginRight: 10,width: 50,height: 50,borderRadius: 5,backgroundColor: '#8acec0',justifyContent: "center"}}>
                          <Text style={{color: '#fff',textAlignVertical: "center",textAlign: "center"}}>承認</Text>
                        </View>
                      </TouchableOpacity>
                      )
                    } else {
                      return (
                        <View style={{marginTop: 15,marginRight: 10,width: 50,height: 50,borderRadius: 5,justifyContent: "center"}}>
                          <MaterialCommunityIcons name="approval" size={50} color="#8acec0" />
                        </View>
                      )
                    }
                  })()}
                </View>
              )
          
            } }/>
        </ScrollView>
          {this._renderFooterMenu()}
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
    alignItems: 'center'
  },
  container: {
    padding: 0,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: "#ddd"
  },
  content: {
    margin: 16,
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
    marginTop: 20,
    marginLeft: 10,
    padding: 0,
    width: 50,
    height: 50,
    borderRadius:25,
  },
  tabPage: {
    paddingTop: 20
  },
  tabBoxListItem: {
    marginLeft: 15,
    marginRight: 15,
    marginTop: 5,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 0,
  },
  checkText: {
    backgroundColor: 'red',
    padding: 5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'red',
    color: '#fff'
  },
  card: {
    marginVertical: 8,
    margin: 10,
    height: 80
  },
  post: {
    marginTop: 13
  }
}));