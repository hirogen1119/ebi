import React from 'react';
import {
  View,
  Image,
  Dimensions,
  Keyboard,
  Alert,
  AsyncStorage,
  TouchableOpacity,
  Text,
  TextInput,
  ScrollView,
  FlatList,
  Platform
} from 'react-native';
import {
  RkButton,
  RkText,
  RkTextInput,
  RkAvoidKeyboard,
  RkStyleSheet,
  RkTheme
} from 'react-native-ui-kitten';
import {width,base_url, img_url, scale, scaleModerate, scaleVertical} from '../../utils/scale';
import Spinner from 'react-native-loading-spinner-overlay';
import { Foundation, Feather, MaterialIcons, MaterialCommunityIcons, FontAwesome, SimpleLineIcons } from '@expo/vector-icons';
import pushMsg from '../../utils/pushMsg';
import { NavigationActions, StackActions } from 'react-navigation';

export class Emergency extends React.Component {
  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);
    this.state = {
      selectMsgType: 1,
      message: "",
      isLoading: true,
    }
  }

  componentDidMount() {
    AsyncStorage.getItem("token_data").then((token_data) => {

      if(token_data !== null){
        let token = JSON.parse(token_data)
        let user = JSON.parse(token.user)
        let url = base_url + 'api/emergencies/get-info?user_id=' + user.id;

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
            Alert.alert('','情報取得エラー')
          } else {
            
            this.setState({
              user_id: user.id,
              user_name: user.nick_name,
              apartment_id: data.apartment.id,
              apartment: data.apartment,
              emergencies: data.emergencies,
              isLoading: false,
              user_role: data.user_role
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

  _send(){
    if(Platform.OS !== 'ios'){this.setState({isReading: true})}
    if(this.state.selectMsgType === 1 && !this.state.message) {
      this.setState({isReading: false})
      Alert.alert("入力チェックエラー","メッセージ登録の場合は、メッセージを必ず入力して下さい。");
    } else {

      let dateTime = this.toLocaleString(new Date())
      let message = ''
      if(this.state.selectMsgType === 1){
        message = this.state.message
      } else {
        message = '至急、状況確認お願いします。'
      }
      let msg = {
        comment_dt: dateTime,
        message: message,
        count: 1,
        imageUri: '',
        is_image: 0,
        user_name: this.state.user_name,
        user_id: this.state.user_id,
        apartment_id: this.state.apartment_id,
        select_msg_type: this.state.selectMsgType
      }
      let url = base_url + 'api/comments/emergency_push';
      let type_id = this.state.emergency_cnt + 1
      fetch( url, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          comment: msg,
          type_id: type_id,
          msg_type: 'emergency',
          sel_msg_type: this.state.selectMsgType
        }),
      })
      .then(response => {
          return response.json()})
      .then((responseJson) => {
        this.setState({isReading: false})
          var data = responseJson;
          if(data.message){
              Alert.alert('コメントエラー', data.message);
              this.setState({isReading: false})
          } else {
  
            for(key in data.users){
              let user = data.users[key]
              let sel_msg = 'emergency'
              let push_msg = '安否確認の緊急連絡です。メッセージの確認をお願いします。'
              if(this.state.selectMsgType === 1){
                push_msg = message
              }
              
              let push_datas = {
                type_id: data.type_id,
                message: message,
                apartment_id: this.state.apartment_id,
                messanger_push_token: '',
                user_id: user.id,
                sel_msg_type: this.state.selectMsgType
              }
              let msg_data = {
                  msg_type: sel_msg,
                  message: push_msg,
                  push_datas: push_datas
              }
              let token = user.push_token
              pushMsg(
                '安否確認・緊急連絡網',
                push_msg,
                msg_data,
                token
              )
            }

            Alert.alert(
              '',
              '緊急連絡の安否確認メッセージを送信しました。',
              [
                {text: 'Ok', onPress: () =>
                this.props.navigation.dispatch(StackActions.reset({
                    index: 0,
                    actions: [
                      NavigationActions.navigate({
                        routeName: 'EventList',
                      }),
                    ],}))
                  },
              ],
              { cancelable: false }
            )
            this.setState({isReading: false})
          }
      })
      .catch((error) => {
          console.log(error);
          Alert.alert('コメント例外エラー', JSON.stringify(error));
      })
    }
  }

  _emergencyClick(item){
    if(Platform.OS !== 'ios'){this.setState({isReading: true})}
    AsyncStorage.getItem("token_data").then((token_data) => {

      let token = JSON.parse(token_data)
      let url = base_url + 'api/comments/get-params?msg_type=emergency&type_id=' + item.id + '&user_id=' + this.state.user_id + '&apartment_id=' + this.state.apartment_id
      
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

            for(key in data.msgs.messages){
              let m = data.msgs.messages[key];
              if(m.is_image > 0){
                m.image_uri = base_url + m.file_name
              }
              m.icon_path = img_url + m.icon_path
              msgs.push(m)
          }
          data.msgs.messages = msgs
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
                    data: JSON.stringify(data.msgs),
                    title: '安否確認・緊急連絡網',
                    max_count: data.max_count,
                    apartment_name: this.state.apartment.name,
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
  }
  _renderMsgSelect(){
    if(this.state.user_role < 4){
      if(this.state.selectMsgType === 1){
        return (
          <View style={{paddingLeft: 20,paddingRight: 20}}>
            <TextInput
              style={styles.textContact}
              multiline = {true}
              maxLength = {100}
              underlineColorAndroid = 'transparent'
              onChangeText={(message) => this.setState({message: message})}
            />
            <RkButton onPress={ this._send.bind(this) }
              rkType='medium large stretch'
              contentStyle={{color: '#fff', fontSize: 20}} style={styles.save}>送信</RkButton>
          </View>
        )
      } else if(this.state.selectMsgType === 2){
        return (
          <View style={{paddingLeft: 20,paddingRight: 20}}>
            <Text style={[styles.textContact,{backgroundColor: 'transparent'}]} >
              送信ボタンをクリックすると状況確認メッセージを送信します。
            </Text>
            <RkButton onPress={ this._send.bind(this) }
              rkType='medium large stretch'
              contentStyle={{color: '#fff', fontSize: 20}} style={styles.save}>送信</RkButton>
          </View>
        )
      }
    }
  }

  _renderView(){
    if(this.state.user_role < 4){
      return (
        <View>
          <View style={{flex: 1,paddingTop: 10, flexDirection: 'row'}} >
            <View style={{flex: 1,margin: 10}} >
              <TouchableOpacity onPress={()=> this.setState({selectMsgType: 1})}>
                <View style={{height: 80, borderRadius: 10, backgroundColor: '#3f73c6', justifyContent: 'center', alignItems: 'center', marginBottom: 0}}>
                  <Feather name="message-circle" size={34} color="#fff" />
                  <Text style={{color: '#fff', fontSize: 18}}>メッセージ登録</Text>
                </View>
              </TouchableOpacity>
            </View>
            <View style={{flex: 1,margin: 10}} >
              <TouchableOpacity onPress={()=> this.setState({selectMsgType: 2})}>
                <View style={{height: 80, borderRadius: 10, backgroundColor: '#3f73c6', justifyContent: 'center', alignItems: 'center', marginBottom: 0}}>
                  <MaterialCommunityIcons name="message-reply-text" size={34} color="#fff" />
                  <Text style={{color: '#fff', fontSize: 14}}>状況確認（返事選択）</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
          <View style={{paddingTop: 10}} >
            {this._renderMsgSelect()}
            <FlatList
              style={styles.root}
              data={this.state.emergencies}
              extraData={this.state}
              ItemSeparatorComponent={this._renderSeparator}
              keyExtractor={this._keyExtractor}
              renderItem={({ item, index }) => {
                return (
                  <TouchableOpacity onPress={this._emergencyClick.bind(this,item)}>
                    <View style={styles.tabBoxListItem}>
                      <View style={styles.content}>
                        <View style={styles.contentHeader}>
                          <RkText rkType='header4' style={{color: '#e51445'}}>{item.msg_type_view}</RkText>
                          <RkText rkType='header5'>{item.emergency_date_view}</RkText>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                )
              }}
              />
          </View>
        </View>
      )
    } else {
      return (
        <FlatList
          style={styles.root}
          data={this.state.emergencies}
          extraData={this.state}
          ItemSeparatorComponent={this._renderSeparator}
          keyExtractor={this._keyExtractor}
          renderItem={({ item, index }) => {
            return (
              <TouchableOpacity onPress={this._emergencyClick.bind(this,item)}>
                <View style={styles.tabBoxListItem}>
                  <View style={styles.content}>
                    <View style={styles.contentHeader}>
                      <RkText rkType='header4' style={{color: '#e51445'}}>{item.msg_type_view}</RkText>
                      <RkText rkType='header5'>{item.emergency_date_view}</RkText>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            )
          }}
        />
      )
    }
  }
  
  render() {

    return (
      <View style={{flex: 1, backgroundColor: '#000',paddingTop: (Platform.OS === 'android' ? 0 : 24),paddingBottom: (Platform.OS === 'android' ? 0 : 24)}}>
      <View style={{flex: 1, backgroundColor: '#fff0d1'}}>
        <View style={{ paddingBottom: 0, backgroundColor: 'red', flexDirection: 'row', height: 55,paddingTop: 10}}>
          <View style={{flex: 1, alignItems: 'center', marginBottom: 0}}>
            <TouchableOpacity onPress={() => 
          this.props.navigation.dispatch(StackActions.reset({
              index: 0,
              actions: [
                NavigationActions.navigate({
                  routeName: 'EventList',
                }),
              ],}))}>
              <MaterialIcons name="chevron-left" size={34} color="#fff" />
            </TouchableOpacity>
          </View>
          <View style={{flex: 4, alignItems: 'center', marginBottom: 0}}>
            <Text style={{color: '#fff', fontSize: 20}}>安否確認・緊急連絡網</Text>
          </View>
          <View style={{flex: 1, alignItems: 'center', marginBottom: 0}}>
          </View>
        </View>
        <ScrollView style={{marginTop: 20}}>
          {this._renderView()}
          <Spinner
            visible={this.state.isReading}
            textContent="Connecting・・・"
            textStyle={{ color: 'white' }}
            />
        </ScrollView>
      </View>
      </View>
    )
  }
}

let styles = RkStyleSheet.create(theme => ({
  screen: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#fff0d1'
  },
  image: {
    resizeMode: 'cover',
    marginBottom: scaleVertical(0),
  },
  container: {
    paddingHorizontal: 17,
    paddingBottom: 15,
    flex: 1,
    backgroundColor: '#fff0d1',
    marginBottom: 10
  },
  footer: {
    justifyContent: 'flex-end',
    flex: 1
  },
  buttons: {
    flexDirection: 'row',
    marginBottom: scaleVertical(24)
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
      backgroundColor: '#fff',
      borderWidh: 1,
      borderColor: '#ddd'
  },
  textContact: {
      marginTop: 10,
      marginBottom: 15,
      height: 150,
      backgroundColor: '#fff',
      borderWidh: 1,
      borderColor: '#ddd',
      textAlignVertical: 'top',
      padding: 10,
      fontSize: 18
  },
  textRow: {
    justifyContent: 'center',
    flexDirection: 'row',
  },
  tabBoxListItem: {
    marginLeft: 0,
    marginRight: 0,
    marginTop: 5,
    marginBottom: 5,
    borderWidth: 1,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: "#ddd",
    borderColor: '#ddd',
    paddingLeft: 10,
    paddingRight: 5,
    paddingBottom: 10,
    paddingTop: 10,
  },
  root: {
    backgroundColor: '#fff0d1',
    paddingLeft: 20,
    paddingRight: 20
  },
}));