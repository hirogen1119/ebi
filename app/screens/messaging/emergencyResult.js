import React from 'react';
import {
  View,
  Image,
  Keyboard,
  Alert,
  AsyncStorage,
  TouchableOpacity,
  Text,
  TextInput,
  ScrollView,
  FlatList,
  BackHandler,
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
import { Feather, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import pushMsg from '../../utils/pushMsg';
import { NavigationActions, StackActions } from 'react-navigation';

export class EmergencyResult extends React.Component {
  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);
    const navParams = this.props.navigation.state.params;
    this.state = {
      msg_id: navParams.msg_id,
      apartment_id: navParams.apartment_id,
      sel_msg_type: navParams.sel_msg_type,
      user_id: navParams.user_id,
      message: ''
    }
  }

  componentDidMount() {

    BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
    AsyncStorage.getItem("token_data").then((token_data) => {

      if(token_data !== null){
        let token = JSON.parse(token_data)
        let user = JSON.parse(token.user)
        this.setState({user: user,token: token})
      }
    })
  }

  handleBackPress = () => {
    BackHandler.exitApp()
    return true;
  }

  _emergencyReply(type){

    let dateTime = this.toLocaleString(new Date())
    let message = ''
    switch(type){
      case 0:
        message = 'やばいです。\n' + this.state.message
        break
      case 1:
        message = '見ました。'
        break
      case 2:
        message = '安全です'
        break
    }
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

    let url = base_url + 'api/comments/emergency_result_push';
    fetch( url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        comment: msg,
        type_id: this.state.msg_id,
        msg_type: 'emergency',
      }),
    })
    .then(response => {
        return response.json()})
    .then((responseJson) => {
      var data = responseJson;
      if(data.message){
          Alert.alert('コメントエラー', data.message)
      } else {
        
        for(u_key in data.users){
          let user = data.users[u_key]
          let push_datas = {
            type_id: this.state.msg_id,
            msg_type: 'emergency',
            apartment_id: this.state.apartment_id,
            user_id: user.id,
          }
          let title = '安否確認・緊急連絡網'
          let body = '返信されましたので確認お願いします。'
          let msg_data = {
              msg_type: 'emergencyCheck',
              message: '返信されましたので確認お願いします。',
              push_datas: push_datas
          }
          pushMsg(
            title,
            body,
            msg_data,
            user.push_token
          )
        }
        this.props.navigation.dispatch(StackActions.reset({
            index: 0,
            actions: [
              NavigationActions.navigate({
                routeName: 'EventList',
              }),
            ],}))
      }
    })
    .catch((error) => {
        console.log(error);
        Alert.alert('コメント例外エラー', JSON.stringify(error));
    })
  }

  _renderMsgSelect(){
    if(this.state.result_msg_type === 3){
      return (
        <View style={{paddingLeft: 10,paddingRight: 10}}>
          <TextInput
            style={styles.textContact}
            multiline = {true}
            maxLength = {100}
            underlineColorAndroid = 'transparent'
            onChangeText={(message) => this.setState({message: message})}
          />
          <RkButton onPress={this._emergencyReply.bind(this,0)}
            rkType='medium large stretch'
            contentStyle={{color: '#fff', fontSize: 20}} style={styles.save}>メッセージ送信</RkButton>
        </View>
      )
    }
  }

  _renderView(){

    if(this.state.sel_msg_type === 1){
      return (
        <View>
          <View style={{padding: 10}} >
            <TextInput
              style={styles.textContact}
              multiline = {true}
              maxLength = {100}
              underlineColorAndroid = 'transparent'
              onChangeText={(message) => this.setState({message: message})}
            />
          </View>
          <View style={{flex: 1,margin: 10}} >
            <TouchableOpacity onPress={this._emergencyReply.bind(this,0)}>
              <View style={{height: 80, flexDirection: 'row', borderRadius: 10, backgroundColor: '#3f73c6', justifyContent: 'center', alignItems: 'center', marginBottom: 0}}>
                <Feather name="message-circle" size={34} color="#fff" />
                <Text style={{color: '#fff', fontSize: 22}}> 見ました(送信)</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      )
    } else {
      return (
        <View>
          <View style={{flex: 1,margin: 10}} >
            <TouchableOpacity onPress={this._emergencyReply.bind(this,1)}>
              <View style={{height: 80, flexDirection: 'row', borderRadius: 10, backgroundColor: '#3f73c6', justifyContent: 'center', alignItems: 'center', marginBottom: 0}}>
                <Feather name="message-circle" size={34} color="#fff" />
                <Text style={{color: '#fff', fontSize: 18}}> 見ました</Text>
              </View>
            </TouchableOpacity>
          </View>
          <View style={{flex: 1,margin: 10}} >
            <TouchableOpacity onPress={this._emergencyReply.bind(this,2)}>
              <View style={{height: 80, flexDirection: 'row', borderRadius: 10, backgroundColor: '#3f73c6', justifyContent: 'center', alignItems: 'center', marginBottom: 0}}>
                <Feather name="message-circle" size={34} color="#fff" />
                <Text style={{color: '#fff', fontSize: 14}}> 安全です</Text>
              </View>
            </TouchableOpacity>
          </View>
          <View style={{flex: 1,margin: 10}} >
            <TouchableOpacity onPress={()=>this.setState({result_msg_type: 3})}>
              <View style={{height: 80, flexDirection: 'row', borderRadius: 10, backgroundColor: '#3f73c6', justifyContent: 'center', alignItems: 'center', marginBottom: 0}}>
                <MaterialCommunityIcons name="message-reply-text" size={34} color="#fff" />
                <Text style={{color: '#fff', fontSize: 14}}> やばいです（コメント入力）</Text>
              </View>
            </TouchableOpacity>
          </View>
          <View style={{paddingTop: 10}} >
            {this._renderMsgSelect()}
          </View>
        </View>
      )
    }

  }
  
  render() {

    return (
      <View style={{flex: 1, backgroundColor: '#000',paddingTop: (Platform.OS === 'android' ? 0 : 24),paddingBottom: (Platform.OS === 'android' ? 0 : 24)}}>
      <View style={{flex: 1, backgroundColor: '#fff0d1'}}>
        <View style={{ paddingBottom: 0, backgroundColor: 'red', flexDirection: 'row', height: 55,paddingTop: 10}}>
          <View style={{flex: 1, alignItems: 'center', marginBottom: 0}}>
          </View>
          <View style={{flex: 4, alignItems: 'center', marginBottom: 0}}>
            <Text style={{color: '#fff', fontSize: 20}}>安否確認・緊急連絡網</Text>
          </View>
          <View style={{flex: 1, alignItems: 'center', marginBottom: 0}}>
            <TouchableOpacity onPress={() => BackHandler.exitApp()}>
              <MaterialIcons name="close" size={34} color="#fff" />
            </TouchableOpacity>
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
      fontSize: 18,
      paddingLeft: 0,
      paddingRight: 0,
      borderRadius: 5
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