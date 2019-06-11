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
import {base_url, test_flg, scale, scaleModerate, scaleVertical} from '../../utils/scale';
import Spinner from 'react-native-loading-spinner-overlay';
import { NavigationActions, StackActions } from 'react-navigation';
import { Foundation, Feather, Ionicons, MaterialIcons, FontAwesome, SimpleLineIcons } from '@expo/vector-icons';

export class UserInvitation extends React.Component {
  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);
    this.state = {
      tel: "",
      isReading: false,
      image: ""
    }
  }

  componentDidMount() {

    AsyncStorage.getItem("token_data").then((token_data) => {

        let token = JSON.parse(token_data)
        let user = JSON.parse(token.user)
        this.setState({user_id: user.id, })
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
            if(room_data !== null){
              room_name = room_data.floor + 'F ' + room_data.num + '号室'
              user_role = room_data.role_id
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
              ap_cnt: data.ap_cnt,
              is_trader: user_data.is_trader,
            }) 
          }
        })
        .catch((error) => {
          Alert.alert('情報取得例外エラー', JSON.stringify(error));
          this.setState({
            isLoading: false,
          })
        })

    })
  }
  _renderImage(image) {
    let contentHeight = scaleModerate(375, 1);
    let height = Dimensions.get('window').height - contentHeight;
    let width = Dimensions.get('window').width;

      image = (<Image style={[styles.image, {height, width}]}
                      source={require('../../assets/images/top_back.png')}/>);
    return image;
  }

  _send(){
    if(Platform.OS !== 'ios'){this.setState({isReading: true})}
    if(this.state.tel === "") {
      this.setState({isReading: false})
      Alert.alert("入力チェックエラー","電話番号を入力して下さい。");
    } else {
      let url = base_url + 'api/users/create';
      let invitation = 1
      fetch( url, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tel: this.state.tel,
          invitation: invitation,
          user_id: this.state.user_id
        }),
      })
      .then((response) => response.json())
      .then((responseJson) => {
        var data = responseJson;
        if(data.message){
          this.setState({isReading: false})
          Alert.alert('SMS送信エラー', data.message);
        } else {
          this.setState({isReading: false})
          if(test_flg){
            Alert.alert(
              '招待ユーザー情報',
              'TEL:'+data.tel+'\n認証コード:'+data.certification_code
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
        this.setState({isReading: false})
        Alert.alert('SMS送信例外エラー', JSON.stringify(error));
      });
    }
  }

  render() {
    let image = this._renderImage();

    if (this.state.isLoading) {
      return <View><Text>Loading...</Text></View>;
    } else {
      return (
        <RkAvoidKeyboard
          onStartShouldSetResponder={ (e) => true}
          onResponderRelease={ (e) => Keyboard.dismiss()}
          style={styles.screen}>
          <View style={{flex: 1, backgroundColor: '#000',paddingTop: (Platform.OS === 'android' ? 0 : 24),paddingBottom: (Platform.OS === 'android' ? 0 : 24)}}>
        <View style={{ paddingBottom: 0, backgroundColor: '#000', flexDirection: 'row', height: 55,paddingTop: 10}}>
          <View style={{flex: 1, alignItems: 'center', marginBottom: 0}}>
            <TouchableOpacity onPress={() => this.props.navigation.goBack()}>
              <MaterialIcons name="chevron-left" size={34} color="#fff" />
            </TouchableOpacity>
          </View>
          <View style={{flex: 4, alignItems: 'center', marginBottom: 0}}>
            <Text style={{color: '#fff', fontSize: 18}}>{this.state.apartment_name}</Text>
            <Text style={{color: '#fff', fontSize: 12}}>ユーザー招待</Text>
          </View>
          <View style={{flex: 1, alignItems: 'center', marginBottom: 0}}>
          </View>
        </View>
        <View style={styles.container}>
          <View style={{flex: 1}} ></View>
          <View style={{flex: 1}} >
            <RkTextInput
              style={styles.text}
              placeholder='電話番号'
              onChangeText={(tel) => this.setState({tel: tel})}
              keyboardType={'numeric'}
              rkType='bordered'
              />
              <RkButton onPress={ this._send.bind(this) }
                rkType='medium large stretch'
                contentStyle={{color: '#fff', fontSize: 20}} style={styles.save}>送信</RkButton>
              <View style={styles.textRow}>
                  <RkText rkType='primary3'>新規ユーザーを招待しますので電話番号の入力をお願いします。</RkText>
              </View>
          </View>
          <View style={{flex: 1}} ></View>
        </View>
        <Spinner
          visible={this.state.isReading}
          textContent="Connecting・・・"
          textStyle={{ color: 'white' }}
          />
          </View>
        </RkAvoidKeyboard>
      )
    }
  }
}

let styles = RkStyleSheet.create(theme => ({
  screen: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#fff0d1',
  },
  image: {
    resizeMode: 'cover',
    marginBottom: scaleVertical(0),
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
  textRow: {
    justifyContent: 'center',
    flexDirection: 'row',
  }
}));