import React from 'react';
import {
  View,
  Image,
  Dimensions,
  Keyboard,
  Alert,
  AsyncStorage,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import {
  RkButton,
  RkText,
  RkTextInput,
  RkAvoidKeyboard,
  RkStyleSheet,
  RkTheme
} from 'react-native-ui-kitten';
import { FontAwesome } from '../../assets/icons';
import { client_secret, client_id, base_url, img_url, scale, scaleModerate, scaleVertical} from '../../utils/scale';
import { Notifications, Permissions } from 'expo';
import pushToken from '../../utils/pushToken';
import Modal from "react-native-modal";
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { NavigationActions, StackActions } from 'react-navigation';

import pushMsg from '../../utils/pushMsg';

async function registerForPushNotificationsAsync(user_id) {
  const { status: existingStatus } = await Permissions.getAsync(
    Permissions.NOTIFICATIONS
  );
  let finalStatus = existingStatus;

  // パーミッションがまだ決定されていないかどうかのみ尋ねる
  // iOSは必ずしもユーザーに2度目のプロンプトを出すわけではありません。
  if (existingStatus !== 'granted') {
    // Androidのリモート通知許可はアプリのインストール中に付与されるため、これはiOSでのみ要求されます
    const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
    finalStatus = status;
  }

  // ユーザーが権限を付与していない場合はここで停止
  if (finalStatus !== 'granted') {
    console.log('### registerForPushNotificationsAsync ############# Stop ###########');
    return;
  }

  // このデバイスを一意に識別するトークンを取得します
  let token = await Notifications.getExpoPushTokenAsync();

  console.log('### registerForPushNotificationsAsync ############# token ###########');
  // プッシュ通知を送信するために取得できる場所から、トークンをバックエンドサーバーにPOSTします。s
  return fetch(base_url + 'api/push-tokens/add', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      token: token,
      user_id: user_id,
    }),
  });
}
export class Login extends React.Component {
  static navigationOptions = {
    header: null
  };

  constructor(props) {
    super(props);
    this.state = {
      tel: "",
      password: "",
      isLoading: true,
      title: 'You didn\'t set a title!',
      body: 'Why not enter text into the body?',
      data: {
        thisIsYourData: 'you left this empty'
      },
      isModalVisible: false,
      warningFlg: false,
    };
  }

  _togleModal = () =>
  this.setState({ isModalVisible: !this.state.isModalVisible });

  // android permissions are given on install
  async getiOSNotificationPermission () {
    
    const { status } = await Permissions.getAsync(Permissions.NOTIFICATIONS)
    if (status !== 'granted') {
      return
    }
    this._notificationSubscription = Notifications.addListener(this._handleNotification)
  }

  _handleNotification = ({ origin, data, remote }) => {
    
    console.log('########### _handleNotification ##############')
    console.log('########### data ##############')
    console.log(data)
    let type = remote ? 'Push' : 'Local'
    let info = `${type} notification ${origin} with body: ${JSON.stringify(data)}`

    // if(origin === 'selected'){
      setTimeout(() => {
        console.log('########### _handleNotification selected ##############')
        // バックグラウンドで起動中に通知がタップされたとき
        if(data.msg_type === 'invitation'){
          Alert.alert('', 'アカウントが承認されましたのでアプリをご利用できます。')
        } else if(data.msg_type === 'eventAdd'){
          
          Alert.alert(data.msg_type)
          if(data.event_id){
            
            let message = '参加可否、要望、お問い合わせなどをコメントから投稿お願いします。'
            this.props.navigation.dispatch(StackActions.reset({
                index: 0,
                actions: [
                  NavigationActions.navigate({
                    routeName: 'EventInfo',
                    params: {event_id: data.event_id, star: 0, message: message}
                  }),
                ],}))
          }
        } else if(data.msg_type === 'eventDone'){
          
          if(data.event_id){
            
            let message = '案件の完了承認依頼が来ていますので確認お願いします。'
            this.props.navigation.dispatch(StackActions.reset({
                index: 0,
                actions: [
                  NavigationActions.navigate({
                    routeName: 'EventInfo',
                    params: {event_id: data.event_id, star: 0, message: message}
                  }),
                ],}))
          }
        } else if(data.msg_type === 'emergency'){
          
          console.log('########### _handleNotification emergency ##############')
          let push_datas = data.push_datas
          this.props.navigation.dispatch(StackActions.reset({
              index: 0,
              actions: [
                NavigationActions.navigate({
                  routeName: 'EmergencyResult',
                  params: {
                    msg_id: push_datas.type_id,
                    apartment_id: push_datas.apartment_id,
                    sel_msg_type: push_datas.sel_msg_type,
                    user_id: push_datas.user_id
                  }
                }),
              ],}))
          
        } else if(data.msg_type === 'emergencyCheck'){
          
          let push_datas = data.push_datas
          
          AsyncStorage.getItem("token_data").then((token_data) => {

            let token = JSON.parse(token_data)
            let user = JSON.parse(token.user)
            let url = base_url + 'api/comments/emergency-get-params?type_id=' + push_datas.type_id + '&user_id=' + user.id + '&apartment_id=' + push_datas.apartment_id
            
            fetch( url, {
                method: 'GET',
                headers: {
                  Accept: 'application/json',
                  Authorization: 'Bearer ' + token.access_token,
                },
            })
            .then(response => {
              return response.json()})
            .then((responseJson) => {
                var data = responseJson;
                if(data.result === 1){
                  this.setState({isReading: false})
                  Alert.alert('パラメータ取得エラー', 'パラメータの取得処理に失敗しました。');
                } else {
                  let msgs = []

                  for(key in data.msgs){
                    let m = data.msgs[key];
                    if(m.is_image > 0){
                      m.image_uri = base_url + m.file_name
                    }
                    m.icon_path = img_url + m.icon_path
                    msgs.push(m)
                }
                data.messages = msgs
                this.props.navigation.dispatch(StackActions.reset({
                    index: 0,
                    actions: [
                      NavigationActions.navigate({
                        routeName: 'Chat',
                        params: {
                          type_id: this.state.event_id,
                          msg_type: 'emergency',
                          user_id: this.state.user_id,
                          user_name: data.user_name,
                          data: JSON.stringify(data),
                          title: '安否確認・緊急連絡網',
                          max_count: data.max_count,
                          apartment_name: data.apartment_name,
                          user_icon_path: img_url + data.user_icon_path
                        }
                      }),
                    ],}))
                this.setState({isReading: false})
              }
            })
            .catch((error) => {
                console.log(error);
                Alert.alert('パラメータ取得例外エラー', JSON.stringify(error));
            })
          })
        } else if(data.msg_type === 'testMsg'){
          
          console.log('########### _handleNotification testMsg ##############')
          let push_datas = data.push_datas
          
        }
      }, 500) //
    // }else if(origin === 'received'){
    //   console.log('########### received ##############')
    //   Alert.alert('received', JSON.stringify(data));
    // }
  }

  _renderImage(image) {
    let contentHeight = scaleModerate(375, 1);
    let height = Dimensions.get('window').height - contentHeight;
    let width = Dimensions.get('window').width;

      image = (<Image style={[styles.image, {height, width}]}
                      source={require('../../assets/images/top_back.png')}/>);
    return image;
  }

  _clickLogin(){
    console.log('############## login click ################')
    if(this.state.tel === "") {
      Alert.alert("入力チェックエラー","電話番号を入力して下さい。");
    } else if(this.state.password === ""){
      Alert.alert("入力チェックエラー","パスワードを入力して下さい。");
    } else {
      
    console.log('############## login passCheck ################')
      let url = base_url + 'api/users/passCheck';
      
      fetch( url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tel: this.state.tel,
          password: this.state.password,
        }),
      })
      .then(response => {
        console.log('############## login passCheck response ################')
        console.log(response)
        return response.json()})
      .then((responseJson) => {
        console.log('############## login passCheck result ################')
        var data = responseJson;
        console.log(data)
        if(data.result === 1){
          console.log('############## login passCheck Alert ################')
          Alert.alert(data.message)
        } else {
          let clients_url = base_url + 'oauth/token';

          console.log('############## login oauth/token ################')
          fetch( clients_url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              grant_type: "password",
              client_id: client_id,
              client_secret: client_secret,
              username: this.state.tel,
              password: this.state.password,
              scope: "*"
            }),
          })
          .then((response) => response.json())
          .then((responseJson) => {
            console.log('############## login oauth/token result ################')
            var data = responseJson;
            console.log(data)
            if(!data.error){
              console.log('############## login oauth/token ok ################')

              let auth_user_url = base_url + 'api/user';

              fetch( auth_user_url, {
                method: 'GET',
                headers: {
                  Accept: 'application/json',
                  Authorization: 'Bearer ' + data.access_token,
                },
              })
              .then((response) => response.json())
              .then((responseJson) => {
                var user_data = responseJson;
                let login_data = {
                  tel: this.state.tel,
                  password: this.state.password
                }
                let token_data = {
                  client_id: data.client_id,
                  client_secret: data.client_secret,
                  access_token: data.access_token,
                  refresh_token: data.refresh_token,
                  token_type: data.token_type,
                  user: JSON.stringify(user_data),
                  login_data: JSON.stringify(login_data)
                }
  
                  // プッシュトークんの登録処理
                console.log('### プッシュトークんの登録処理 #########################################');
                pushToken(user_data.id)
                
                setTimeout(() => {
                  AsyncStorage.setItem('token_data', JSON.stringify(token_data))
                  AsyncStorage.setItem('login_data', JSON.stringify(login_data))
    
                  if(user_data.approval === 1 && user_data.invitation === 1){
                    Alert.alert('', 'ログインしようとしているユーザーが未承認の為、ログインできません。')
                  } else {
                    let url = base_url + 'api/emergencies/get_emergency_result_check?user_id='+user_data.id;
                    
                    fetch( url, {
                      method: 'GET',
                      headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                      },
                    })
                    .then((response) => response.json())
                    .then((responseJson) => {
                      var data = responseJson;
                      
                      if(data.message){
                        this.props.navigation.dispatch(StackActions.reset({
                            index: 0,
                            actions: [
                              NavigationActions.navigate({
                                routeName: 'EventList',
                              }),
                            ],}))
                      } else {
                        if(data.check === 1){
                          let apartment_id = data.EmUser.apartment_id
                          let emergency_id = data.EmUser.emergency_id
                          let msg_type = data.EmUser.emergency.msg_type
                          this.setState({
                            isLoading: false,
                          })
                          this.props.navigation.dispatch(StackActions.reset({
                              index: 0,
                              actions: [
                                NavigationActions.navigate({
                                  routeName: 'EmergencyResult',
                                  params: {
                                    msg_id: emergency_id,
                                    apartment_id: apartment_id,
                                    sel_msg_type: msg_type,
                                    user_id: user_data.id
                                  }
                                }),
                              ],}))
                        } else {
                          this.setState({
                            isLoading: false,
                          })
                          this.props.navigation.dispatch(StackActions.reset({
                              index: 0,
                              actions: [
                                NavigationActions.navigate({
                                  routeName: 'EventList',
                                }),
                              ],}))
                        }
                      }
                    })
                    .catch((error) => {
                      console.log(error);
                      Alert.alert('ログイン例外エラー', JSON.stringify(error));
                      this.setState({
                        isLoading: false,
                      })
                    })
                  }
                }, 1000)
              })
              .catch((error) => {
              })

            } else {
              Alert.alert('ログイン失敗エラー', JSON.stringify(data.message));
            }
          })
          .catch((error) => {
            console.log(error);
            Alert.alert('ログイン例外エラー', JSON.stringify(error));
          });
        }
      })
      .catch((error) => {
        console.log(error);
        Alert.alert('ログイン例外エラー', JSON.stringify(error));
      });
    }
  }

  componentDidMount() {
    // AsyncStorage.clear();
    this.getiOSNotificationPermission()

    AsyncStorage.getItem("token_data").then((token_data) => {

      if(token_data !== null){
        let token = JSON.parse(token_data)
        let user = JSON.parse(token.user)
        let url = base_url + 'api/user';
        
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
            AsyncStorage.clear()
            Alert.alert('ログインエラー','再度、ログインして下さい。')
            this.setState({
              isLoading: false,
            })
          } else {

            if(user.push_token === null){
              user.push_token = data.push_token
              token.user = JSON.stringify(user)
              AsyncStorage.setItem('token_data', JSON.stringify(token))
            }
            
            this.setState({
              user_id: user.id,
              user_name: user.nickname,
              access_token: token.access_token
            })
            let url = base_url + 'api/emergencies/get_emergency_result_check?user_id='+user.id;
            
            fetch( url, {
              method: 'GET',
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
              },
            })
            .then((response) => response.json())
            .then((responseJson) => {
              var data = responseJson;
              console.log(data)
              if(data.message){
                this.props.navigation.dispatch(StackActions.reset({
                    index: 0,
                    actions: [
                      NavigationActions.navigate({
                        routeName: 'EventList',
                      }),
                    ],}))
              } else {
                if(data.check === 1){
                  let apartment_id = data.EmUser.apartment_id
                  let emergency_id = data.EmUser.emergency_id
                  let msg_type = data.EmUser.emergency.msg_type
                  this.setState({
                    isLoading: false,
                  })
                  this.props.navigation.dispatch(StackActions.reset({
                      index: 0,
                      actions: [
                        NavigationActions.navigate({
                          routeName: 'EmergencyResult',
                          params: {
                            msg_id: emergency_id,
                            apartment_id: apartment_id,
                            sel_msg_type: msg_type,
                            user_id: user.id
                          }
                        }),
                      ],}))
                } else {
                  this.setState({
                    isLoading: false,
                  })
                  this.props.navigation.dispatch(StackActions.reset({
                      index: 0,
                      actions: [
                        NavigationActions.navigate({
                          routeName: 'EventList',
                        }),
                      ],}))
                }
              }
            })
            .catch((error) => {
              console.log(error);
              Alert.alert('ログイン例外エラー', JSON.stringify(error));
              this.setState({
                isLoading: false,
              })
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

  _emergencyReply(msg_str){

    let dateTime = this.toLocaleString(new Date())
    let message = ''
    message = msg_str
    let msg = {
      comment_dt: dateTime,
      message: message,
      imageUri: '',
      is_image: 0,
      count: 0,
      user_name: this.state.user_name,
      user_id: this.state.user_id,
      apartment_id: this.state.apartment_id
    }

    console.log('##### _emergencyReply send message msg #####');
    
    let url = base_url + 'api/comments/commentPush';
    let type_id = this.state.emergency_cnt + 1
    fetch( url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        comment: msg,
        type_id: this.state.type_id,
        msg_type: 'emergency',
      }),
    })
    .then(response => {
        return response.json()})
    .then((responseJson) => {
        var data = responseJson;
        if(data.message){
            Alert.alert('コメントエラー', data.message);
        } else {

          let url = base_url
            + 'api/comments/get-params?msg_type=emergency&type_id='
            + this.state.type_id + '&user_id=' + this.state.user_id
            + '&apartment_id=' + this.state.apartment_id
            
          console.log('##### _emergencyReply get-params URL #####');
          
          fetch( url, {
              method: 'GET',
              headers: {
                Accept: 'application/json',
                Authorization: 'Bearer ' + this.state.access_token,
              },
          })
          .then(response => {
            return response.json()})
          .then((responseJson) => {
              var data = responseJson;
              if(data.result === 1){
              Alert.alert('パラメータ取得エラー', 'パラメータの取得処理に失敗しました。');
              } else {
                let msgs = []

                console.log('##### _emergencyReply send get-params data #####');
                
                for(key in data.msgs.messages){
                  let m = data.msgs.messages[key];
                  if(m.is_image > 0){
                    m.image_uri = base_url + m.file_name
                  }
                  m.icon_path = img_url + m.icon_path
                  msgs.push(m)
                }
                data.msgs.messages = msgs
                let push_datas = {
                  type_id: type_id,
                  msg_type: 'emergency',
                  user_id: this.state.user_id,
                  messanger_push_token: this.state.push_token,
                  user_name: data.user_name,
                  data: JSON.stringify(data.msgs),
                  title: this.state.name,
                  max_count: data.max_count,
                  apartment_name: data.apartment_name,
                  user_icon_path: img_url + data.user_icon_path,
                  apartment_id: this.state.apartment_id
                }
                let title = '安否確認・緊急連絡網'
                let body = '返信確認お願いします。'
                let msg_data = {
                    msg_type: 'emergencyReply',
                    message: '返信確認お願いします。',
                    push_datas: push_datas
      
                }
                pushMsg(
                  title,
                  body,
                  msg_data,
                  this.state.messanger_push_token
                )
                this.setState({isModalVisible: false})
              }
          })
          .catch((error) => {
              console.log(error);
              Alert.alert('パラメータ取得例外エラー', JSON.stringify(error));
          });
        }
    })
    .catch((error) => {
        console.log(error);
        Alert.alert('コメント例外エラー', JSON.stringify(error));
    })
  }

  _warning(){
    this.setState({ warningFlg: !this.state.warningFlg })
  }

  _renderWarning(){
    if(this.state.warningFlg){
      return (
        <View style={{padding: 15}}>
        <TextInput
          multiline={true}
          style={{borderWidth: 1, borderColor: '#ddd', borderRadius: 5, padding: 5, marginBottom: 10}}
          underlineColorAndroid = 'transparent'
          onChangeText={(message) => this.setState({message: message})}
        />
        <RkButton
          rkType='medium large stretch'
          onPress={this._emergencyReply.bind(this, this.state.message)}
          contentStyle={{color: '#fff', fontSize: 20}} style={[styles.save, {backgroundColor: 'black'}]}>送信</RkButton>
      </View>
      )
    }
  }
  render() {
    if (this.state.isLoading) {
        return (
        <View style={[styles.container_loading, styles.horizontal]}>
            <ActivityIndicator size="large" color="#ffb626" />
        </View>
        )
    } else {
      let image = this._renderImage();

      return (
        <RkAvoidKeyboard
          onStartShouldSetResponder={ (e) => true}
          onResponderRelease={ (e) => Keyboard.dismiss()}
          style={styles.screen}>
          {image}
          <View style={styles.container}>
            <RkTextInput
              style={styles.text}
              placeholder='Tel'
              onChangeText={(user_tel) => this.setState({tel: user_tel})}
              keyboardType={'numeric'}
              />
            <RkTextInput
              style={styles.text}
              placeholder='Password'
              secureTextEntry={true}
              onChangeText={(password) => this.setState({password: password})}
              />
            <RkButton onPress={ this._clickLogin.bind(this) }
              rkType='medium large stretch'
              contentStyle={{color: '#fff', fontSize: 20}} style={styles.save}>LOGIN</RkButton>
            <View style={styles.footer}>
              <View style={styles.textRow}>
                <RkText rkType='primary3'>新しく登録しますか?</RkText>
                <RkButton rkType='clear' style={{marginBottom: 20}}>
                  <RkText rkType='header6' style={{color: '#b75116'}} onPress={() => 
                this.props.navigation.dispatch(StackActions.reset({
                    index: 0,
                    actions: [
                      NavigationActions.navigate({
                        routeName: 'CreateUser',
                      }),
                    ],}))}>  新規登録</RkText>
                </RkButton>
              </View>
              <View style={styles.textRow}>
                <RkText rkType='primary3'>招待メールが届きましたか?</RkText>
                <RkButton rkType='clear'>
                  <RkText rkType='header6' style={{color: '#b75116'}} onPress={() => 
                this.props.navigation.dispatch(StackActions.reset({
                    index: 0,
                    actions: [
                      NavigationActions.navigate({
                        routeName: 'Certificate',
                      }),
                    ],}))}>  認証コード送信</RkText>
                </RkButton>
              </View>
            </View>
          </View>
          <Modal
              isVisible={this.state.isModalVisible}
              animationInTiming={800}
              animationOutTiming={800}
              backdropTransitionInTiming={800}
              backdropTransitionOutTiming={800}
              >
              <View style={styles.container_item}>
                  <View style={{flexDirection: 'row'}}>
                      <View style={{ flex: 7,alignItems: 'flex-start',justifyContent: 'center',alignContent: 'center'}}>
                          <Text style={{fontSize: 20}}>安否確認・緊急連絡網</Text>
                      </View>
                      <View style={{flex: 1,alignItems: 'flex-end',justifyContent: 'center'}}>
                          <TouchableOpacity style={{ padding: 0 }} onPress={this._togleModal}>
                              <MaterialCommunityIcons name="window-close" size={30} color="black"/>
                          </TouchableOpacity>
                      </View>
                  </View>

                  <View style={styles.storyContainer}>
                    <View style={[styles.modalBtn, {backgroundColor: 'transparent', padding: 10}]}>
                      <Text style={{color: '#000',fontSize:18,textAlign: 'left'}}>{this.state.message}</Text>
                    </View>
                    <TouchableOpacity
                      style={{ padding: 10 }}
                      onPress={this._emergencyReply.bind(this,'見ました')}
                      >
                      <View style={[styles.modalBtn, {backgroundColor: '#3f73c6'}]}>
                        <Text style={{color: '#fff',fontSize:20,textAlign: 'center'}}>見ました</Text>
                      </View>
                    </TouchableOpacity>
                    {this._renderWarning()}
                  </View>
              </View>
          </Modal>
        </RkAvoidKeyboard>
      )
    }
  }

}

let styles = RkStyleSheet.create(theme => ({
  screen: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#fff0d1'
  },
  modalBtn: {
    justifyContent: 'center',
    marginTop: 10,
    paddingBottom: 15,
    paddingTop: 15,
    borderRadius: 5
  },
  image: {
    resizeMode: 'cover',
    marginBottom: scaleVertical(0),
  },
  container_loading: {
      flex: 1,
      backgroundColor: '#fff0d1'
  },
  container: {
    paddingHorizontal: 17,
    paddingBottom: scaleVertical(22),
    alignItems: 'center',
    flex: -1,
    backgroundColor: '#fff0d1'
  },
  footer: {
    justifyContent: 'flex-end',
    flex: 1
  },
  button: {
    marginHorizontal: 14
  },
  save: {
    marginVertical: 9,
    backgroundColor: '#d67b46',
  },
  text: {
      marginTop: 10,
      marginBottom: 15,
      height: 50,
      backgroundColor: '#fff'
  },
  horizontal: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      padding: 10
  },
  textRow: {
    justifyContent: 'center',
    flexDirection: 'row',
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
    backgroundColor: theme.colors.screen.scroll,
    paddingVertical: 8,
    padding: 10,
    borderRadius: 5
  },
  modalContent: {
    backgroundColor: "white",
    padding: 22,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4,
    borderColor: "rgba(0, 0, 0, 0.1)",
  },
}));