import React from 'react';
import {
  View,
  Image,
  Dimensions,
  Keyboard,
  Text,
  AsyncStorage,
  Alert,
  Platform
} from 'react-native';
import {
  RkButton,
  RkText,
  RkTextInput,
  RkAvoidKeyboard,
  RkStyleSheet,
} from 'react-native-ui-kitten';
import {base_url, scale, scaleModerate, scaleVertical} from '../../utils/scale';
import Spinner from 'react-native-loading-spinner-overlay';
import { NavigationActions, StackActions } from 'react-navigation';

export class Certificate extends React.Component {
  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);
    this.state = { 
      user_id: 0,
      certification_code: "",
      isReading: false
    }
  }
  
  componentDidMount() {
    let user = {
      id: 0,
      tel: ""
    }
    if(this.props.navigation.state.params !== undefined){
      user = JSON.parse(this.props.navigation.state.params.user)
      this.setState({
        user_id: user.id,
        tel: user.tel
      })
    }
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
    if(this.state.tesl === "") {
      this.setState({isReading: false})
      Alert.alert("入力チェックエラー","電話番号を入力して下さい。");
    } else if(this.state.certification_code === "") {
      this.setState({isReading: false})
      Alert.alert("入力チェックエラー","認証コードを入力して下さい。");
    } else {
      let url = base_url + 'api/users/certificate';

      fetch( url, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          certification_code: this.state.certification_code,
          tel: this.state.tel
        }),
      })
      .then((response) => response.json())
      .then((responseJson) => {
        var data = responseJson;
        
        if(data.exception || data.result === 1){
          this.setState({isReading: false})
          Alert.alert('認証エラー', data.message);
        } else {
          if(data.user.is_trader === 1){
            this.setState({isReading: false})
            this.props.navigation.dispatch(StackActions.reset({
                index: 0,
                actions: [
                  NavigationActions.navigate({
                    routeName: 'TraderAdd',
                    params: {user_id: data.user.id}
                  }),
                ],}))
          } else {
            if(data.regCode === 1){
              this.setState({isReading: false})
              this.props.navigation.dispatch(StackActions.reset({
                  index: 0,
                  actions: [
                    NavigationActions.navigate({
                      routeName: 'ApartmentAdd',
                      params: {newAddFlg: true}
                    }),
                  ],}))
            } else if(data.regCode === 2){
              this.setState({isReading: false})
              Alert.alert(
                '登録確認',
                'マンション情報まで登録されています。\n保険情報を登録しますか？',
                [
                  {text: 'いいえ', onPress: () =>  
                  this.props.navigation.dispatch(StackActions.reset({
                      index: 0,
                      actions: [
                        NavigationActions.navigate({
                          routeName: 'Login',
                        }),
                      ],})), style: 'cancel'},
                  {text: 'はい', onPress: () => 
                  this.props.navigation.dispatch(StackActions.reset({
                      index: 0,
                      actions: [
                        NavigationActions.navigate({
                          routeName: 'InsuranceAdd',
                          params: {apartment_id: data.apartment_id, newAddFlg: true}
                        }),
                      ],}))
                    },
                ],
                { cancelable: false }
              )
            } else {
              this.setState({isReading: false})
              this.props.navigation.dispatch(StackActions.reset({
                  index: 0,
                  actions: [
                    NavigationActions.navigate({
                      routeName: 'UserAdd',
                      params: {user_id: data.user.id, invitation: data.user.invitation}
                    }),
                  ],}))
            }
          }
        }
      })
      .catch((error) => {
        console.log(error);
        this.setState({isReading: false})
        Alert.alert('認証例外エラー', JSON.stringify(error));
      });
    }
  }

  render() {
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
          placeholder='電話番号'
          value={this.state.tel}
          onChangeText={(tel) => this.setState({tel: tel})}
          keyboardType={'numeric'}
          />
        <RkTextInput
          style={styles.text}
          placeholder='認証コード'
          onChangeText={(certification_code) => this.setState({certification_code: certification_code})}
          keyboardType={'numeric'}
          />
          <RkButton onPress={ this._send.bind(this) }
            rkType='medium large stretch'
            contentStyle={{color: '#fff', fontSize: 20}} style={styles.save}>送信</RkButton>
          <View style={styles.textRow}>
              <RkText rkType='primary3'>ユーザー認証を行いますのでSMSで送信された認証コードの入力をお願いします。</RkText>
          </View>
        </View>
        <Spinner
          visible={this.state.isReading}
          textContent="Connecting・・・"
          textStyle={{ color: 'white' }}
          />
      </RkAvoidKeyboard>
    )
  }
}

let styles = RkStyleSheet.create(theme => ({
  screen: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#fff0d1',
    marginTop: (Platform.OS === 'android' ? 0 : 24)
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
      backgroundColor: '#fff'
  },
  textRow: {
    justifyContent: 'center',
    flexDirection: 'row',
  }
}));