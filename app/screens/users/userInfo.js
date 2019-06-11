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
  RkTextInput,
  RkButton
} from 'react-native-ui-kitten';
import {Avatar} from '../../components';
import { Foundation, Feather, Ionicons, MaterialIcons, FontAwesome, SimpleLineIcons } from '@expo/vector-icons';
import {scale, base_url, img_url} from '../../utils/scale';
import { Rating } from 'react-native-elements';
import Modal from "react-native-modal";
import { NavigationActions, StackActions } from 'react-navigation';

export class UserInfo extends React.Component {
  static navigationOptions = {
    header: null,
  };
  
  constructor(props) {
    super(props);
    let params = this.props.navigation.state.params;
    let star = params.star
    let trader_id = params.trader_id
    this.state = {
      data: [],
      watching: false,
      trader_id: trader_id,
      star: star,
      modalVisible: false,
      radio1: 1,
      radio2: 0,
      radio3: 0,
      radio4: 0,
    }
  }

  setModalVisible(visible) {
    this.setState({modalVisible: visible});
  }

  componentWillMount() {
    // AsyncStorage.clear();

    const navParams = this.props.navigation.state.params;
    console.log(navParams)
    let user_id = navParams.user_id
    AsyncStorage.getItem("token_data").then((token_data) => {

      if(token_data !== null){
        let token = JSON.parse(token_data)
        let user = JSON.parse(token.user)
        let url = base_url + 'api/users/getDetail?user_id=' + user_id + '&login_user_id=' + user.id + '&room_id=' + navParams.room_id

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
          console.log(data);
          if(data.message){
            Alert.alert('','ユーザー情報の取得に失敗しました。')
            this.setState({
              isLoading: false,
            })
            this.props.navigation.goBack()
          } else {
            let user_data = data.user_data
            let ap_data = data.apartment_data
            let room_data = data.room_data
            let user_img_data = data.user_img_data
            let room_name = ""
            let user_role = 0
            if(user_data.is_trader === 0){
              room_name = room_data.floor + 'F ' + room_data.num + '号室'
              user_role = data.login_user_role_id
              this._radioClick(user_role)
            } else {
              room_name = user_data.introduction
            }
            this.setState({
              user_id: user_data.id,
              nick_name: user_data.nick_name,
              apartment_name: ap_data.name,
              apartment_id: ap_data.id,
              room_name: room_name,
              user_role: user_role,
              birthday: user_data.birthday + '年',
              is_trader: user_data.is_trader,
              user_icon_uri: img_url + user_data.icon_path,
              job_name: user_data.job.name,
              role_name: room_data.role.name,
              current_user_id: user.id,
              check_role: user_role,
              token: token
            }) 
            console.log(this.state)
          }
        })
        .catch((error) => {
          console.log(error);
          Alert.alert('案件情報取得例外エラー', JSON.stringify(error));
          this.setState({
            isLoading: false,
          })
        })

      } else {
        this.setState({ isLoading: false })
      }
    })
  }

  _renderImage() {
    if (this.state.image_add > 0) {
        return (
          <View>
            <Image
              source={{ uri: this.state.imageUri }}
              style={{ width: 280,height: 280, marginTop: 20,marginBottom: 20 }}
            />
          </View>
        );
    } else {
        return null;
    }
  }

  _roleChange(){

    let url = base_url + 'api/users/role-change?select_role=' + this.state.check_role + '&user_id=' + this.state.user_id
    
    console.log('commentClick URL ##### ' + url);
    fetch( url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: 'Bearer ' + this.state.token.access_token,
        },
    })
    .then(response => {
      console.log(JSON.stringify(response, null, 4))
      return response.json()})
    .then((responseJson) => {
        var data = responseJson;
        console.log('権限変更');
        console.log(data);
        if(data.result === 1){
        Alert.alert('', data.message);
        } else {
          this.setState({role_name: data.role.name})
          this.setModalVisible(!this.state.modalVisible)
          Alert.alert('権限が変更されました。')
        }
    })
    .catch((error) => {
        console.log(error);
        Alert.alert('権限変更例外エラー', JSON.stringify(error));
    })
  }

  _userAccountOff = () => {
    console.log('_userAccountOff ##### ');
    let url = base_url + 'api/users/user-account-off?user_id=' + this.state.user_id
    
    console.log('_userAccountOff URL ##### ' + url);
    fetch( url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: 'Bearer ' + this.state.token.access_token,
        },
    })
    .then(response => {
      console.log(response)
      return response.json()})
    .then((responseJson) => {
        var data = responseJson;
        console.log('アカウントオフ');
        console.log(data);
        if(data.result === 1){
        Alert.alert('', data.message);
        } else {
          Alert.alert(
            '',
            'ユーザーが削除されました。',
            [
              {text: 'OK', onPress: () => 
              this.props.navigation.dispatch(StackActions.reset({
                  index: 0,
                  actions: [
                    NavigationActions.navigate({
                      routeName: 'UserList',
                    }),
                  ],}))},
            ],
            { cancelable: false }
          )
        }
    })
    .catch((error) => {
        console.log(error);
        Alert.alert('権限変更例外エラー', JSON.stringify(error));
    })
  }

  _renderEdit(){
    if(this.state.current_user_id === this.state.user_id){
      return (
        <TouchableOpacity onPress={() => 
          this.props.navigation.dispatch(StackActions.reset({
              index: 0,
              actions: [
                NavigationActions.navigate({
                  routeName: 'UserEdit',
                  params: {user_id: this.state.user_id}
                }),
              ],}))}>
          <FontAwesome name="edit" size={30} color="#fff" />
        </TouchableOpacity>
      )
    }
  }

  _renderAccount(){
    if(this.state.user_role === 1){
      return (
        <View style={{flexDirection: 'row'}}>
          <TouchableOpacity onPress={() => {
              this.setModalVisible(!this.state.modalVisible);
            }}>
            <View style={{flex:1, borderRadius: 5, width: 120, padding: 10, alignSelf: 'center', backgroundColor: '#346dc9',margin:10,justifyContent: 'flex-start'}}>
              <Text style={{color: '#fff', textAlign: 'center'}}>権限変更</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => 
            Alert.alert(
              'アカウントオフ',
              '本当に削除しますか？',
              [
                {text: 'キャンセル'},
                {text: '削除', onPress: this._userAccountOff},
              ],
              { cancelable: false }
            )}>
            <View style={{flex:1, borderRadius: 5, width: 120, padding: 10, alignSelf: 'center',backgroundColor: '#c64747',margin:10,justifyContent: 'flex-end'}}>
              <Text style={{color: '#fff', textAlign: 'center'}}>アカウントオフ</Text>
            </View>
          </TouchableOpacity>
        </View>
      )
    }
  }

  render() {
    let { star } = this.state;
    return (
      <View style={{flex: 1, backgroundColor: '#000',paddingTop: (Platform.OS === 'android' ? 0 : 24),paddingBottom: (Platform.OS === 'android' ? 0 : 24)}}>
      <View style={{flex: 1, backgroundColor: '#fff0d1'}}>
        <View style={{ paddingBottom: 0, backgroundColor: '#000', flexDirection: 'row', height: 55,paddingTop: 10}}>
          <View style={{flex: 1, alignItems: 'center', marginBottom: 0}}>
          <TouchableOpacity onPress={() => this.props.navigation.goBack()}>
            <MaterialIcons name="chevron-left" size={30} color="#fff" />
          </TouchableOpacity>
          </View>
          <View style={{flex: 4, alignItems: 'center', marginBottom: 0}}>
            <Text style={{color: '#fff', fontSize: 18}}>{this.state.apartment_name}</Text>
            <Text style={{color: '#fff', fontSize: 12}}>ユーザー情報詳細</Text>
          </View>
          <View style={{flex: 1, alignItems: 'center', marginTop: 5, marginBottom: 0}}>
            {this._renderEdit()}
          </View>
        </View>

        <ScrollView style={{flex:1, padding: 5}}>
            <View style={[styles.container,styles.tabBoxListItem,{paddingBottom: 30}]}>
              <Avatar rkType='big' style={styles.avatar} img={this.state.user_icon_uri}/>
              <RkText rkType='header2 center'>{this.state.nick_name}</RkText>
              <RkText rkType='header4 center'>{this.state.room_name}</RkText>
              <RkText rkType='header5 center' style={{marginTop: 10}}>権限：{this.state.role_name}</RkText>
              <RkText rkType='header5 center' style={{marginTop: 10}}>生年月日：{this.state.birthday}</RkText>
              <RkText rkType='header5 center' style={{marginTop: 10}}>職業：{this.state.job_name}</RkText>
              <RkText rkType='header5 center' style={{marginTop: 10,marginBottom: 20}}>{this.state.introduction}</RkText>
              {this._renderAccount()}
            </View>
        </ScrollView>

        <Modal
          isVisible={this.state.modalVisible}
          onBackdropPress={() => this.setState({ modalVisible: false })}
        >
          <View style={styles.modalContent}>
            {this._radio1()}
            {this._radio2()}
            {this._radio3()}
            {this._radio4()}
          <TouchableOpacity onPress={() => {
              this._roleChange()
            }}>
            <View style={{borderRadius: 5, width: 120, padding: 10, alignSelf: 'center', backgroundColor: '#346dc9',margin:10}}>
              <Text style={{color: '#fff', textAlign: 'center'}}>権限を変更する</Text>
            </View>
          </TouchableOpacity>
          </View>
        </Modal>
      </View>
      </View>
    )
  }

  _radio1(){
    if(this.state.radio1 === 0){
      return (
        <TouchableOpacity onPress={this._radioClick.bind(this,1)}>
          <View style={{margin: 10,flexDirection: 'row'}}>
            <MaterialIcons name="radio-button-unchecked" size={28} color="green" />
            <Text style={{marginLeft: 10, fontSize: 20}}>アプリ担当</Text>
          </View>
        </TouchableOpacity>
      )
    } else {
      return (
        <TouchableOpacity onPress={this._radioClick.bind(this,1)}>
          <View style={{margin: 10,flexDirection: 'row'}}>
            <MaterialIcons name="radio-button-checked" size={28} color="green" />
            <Text style={{marginLeft: 10, fontSize: 20}}>アプリ担当</Text>
          </View>
        </TouchableOpacity>
      )
    }
  }

  _radio2(){
    if(this.state.radio2 === 0){
      return (
        <TouchableOpacity onPress={this._radioClick.bind(this,2)}>
        <View style={{margin: 10,flexDirection: 'row'}}>
          <MaterialIcons name="radio-button-unchecked" size={28} color="green" />
          <Text style={{marginLeft: 10, fontSize: 20}}>理事長</Text>
        </View>
        </TouchableOpacity>
      )
    } else {
      return (
        <TouchableOpacity onPress={this._radioClick.bind(this,2)}>
          <View style={{margin: 10,flexDirection: 'row'}}>
            <MaterialIcons name="radio-button-checked" size={28} color="green" />
            <Text style={{marginLeft: 10, fontSize: 20}}>理事長</Text>
          </View>
        </TouchableOpacity>
      )
    }
  }
  
  _radio3(){
    if(this.state.radio3 === 0){
      return (
        <TouchableOpacity onPress={this._radioClick.bind(this,3)}>
          <View style={{margin: 10,flexDirection: 'row'}}>
            <MaterialIcons name="radio-button-unchecked" size={28} color="green" />
            <Text style={{marginLeft: 10, fontSize: 20}}>役員</Text>
          </View>
        </TouchableOpacity>
      )
    } else {
      return (
        <TouchableOpacity onPress={this._radioClick.bind(this,3)}>
          <View style={{margin: 10,flexDirection: 'row'}}>
            <MaterialIcons name="radio-button-checked" size={28} color="green" />
            <Text style={{marginLeft: 10, fontSize: 20}}>役員</Text>
          </View>
        </TouchableOpacity>
      )
    }
  }
  
  _radio4(){
    if(this.state.radio4 === 0){
      return (
        <TouchableOpacity onPress={this._radioClick.bind(this,4)}>
          <View style={{margin: 10,flexDirection: 'row'}}>
            <MaterialIcons name="radio-button-unchecked" size={28} color="green" />
            <Text style={{marginLeft: 10, fontSize: 20}}>一般</Text>
          </View>
        </TouchableOpacity>
      )
    } else {
      return (
        <TouchableOpacity onPress={this._radioClick.bind(this,4)}>
          <View style={{margin: 10,flexDirection: 'row'}}>
            <MaterialIcons name="radio-button-checked" size={28} color="green" />
            <Text style={{marginLeft: 10, fontSize: 20}}>一般</Text>
          </View>
        </TouchableOpacity>
      )
    }
  }
  
  _radioClick(id){
    switch(id){
      case 1:
        this.setState({
          radio1: 1,
          radio2: 0,
          radio3: 0,
          radio4: 0,
          check_role: 1,
        })
        break
      case 2:
        this.setState({
          radio1: 0,
          radio2: 1,
          radio3: 0,
          radio4: 0,
          check_role: 2,
        })
        break
      case 3:
        this.setState({
          radio1: 0,
          radio2: 0,
          radio3: 1,
          radio4: 0,
          check_role: 3,
        })
        break
      case 4:
        this.setState({
          radio1: 0,
          radio2: 0,
          radio3: 0,
          radio4: 1,
          check_role: 4,
        })
        break
    }
  }
}

let styles = RkStyleSheet.create(theme => ({
  container: {
    paddingLeft: 19,
    paddingRight: 16,
    paddingBottom: 12,
    paddingTop: 7,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: "#ddd"
  },
  content: {
    marginLeft: 16,
    flex: 1,
  },
  avatar: {
    marginTop: 10,
    marginBottom: 20,
  },
  tabBoxListItem: {
    marginLeft: 15,
    marginRight: 15,
    marginTop: 5,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: '#ddd'
  },
  traderName: {
    borderRadius: 50,
    color: 'white',
    fontSize: 12,
    paddingLeft: 10,
    paddingTop: 5,
    paddingRight: 10,
    paddingBottom: 5,
    backgroundColor: '#4c83db'
  },
  userName: {
    borderRadius: 50,
    color: 'white',
    fontSize: 12,
    paddingLeft: 10,
    paddingTop: 5,
    paddingRight: 10,
    paddingBottom: 5,
    backgroundColor: '#3e7a49'
  },
  save: {
    marginVertical: 9,
    backgroundColor: '#d67b46',
  },
  modalContent: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 4,
    borderColor: "rgba(0, 0, 0, 0.1)",
  },
}));