import React from 'react';
import {
  View,
  Image,
  Dimensions,
  Keyboard,
  Alert,
  AsyncStorage,
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
import {FontAwesome} from '../../assets/icons';
import {base_url, scale, scaleModerate, scaleVertical} from '../../utils/scale';
import Spinner from 'react-native-loading-spinner-overlay';
import { NavigationActions, StackActions } from 'react-navigation';

export class CreateUser extends React.Component {
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

      fetch( url, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tel: this.state.tel,
          invitation: 0,
        }),
      })
      .then((response) => response.json())
      .then((responseJson) => {
        var data = responseJson;

        if(data.exception || data.result === 1){
          this.setState({isReading: false})
          Alert.alert('SMS送信エラー', data.message);
        } else {
          this.setState({isReading: false})
          AsyncStorage.setItem("user_id", String(data.id));
          AsyncStorage.setItem("tel", data.tel);
          let user = {
            id: data.id,
            tel: this.state.tel,
            invitation: 0
          }
          this.props.navigation.dispatch(StackActions.reset({
            index: 0,
            actions: [
              NavigationActions.navigate({
                routeName: 'Certificate',
                params: {user: JSON.stringify(user)}
              }),
            ],}))
        }
      })
      .catch((error) => {
        this.setState({isReading: false})
        Alert.alert('SMS送信例外エラー', 'SMS送信時に例外が発生しました。');
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
          {image}
          <View style={styles.container}>
          <RkTextInput
            style={styles.text}
            placeholder='電話番号'
            onChangeText={(tel) => this.setState({tel: tel})}
            keyboardType={'numeric'}
            />
            <RkButton onPress={ this._send.bind(this) }
              rkType='medium large stretch'
              contentStyle={{color: '#fff', fontSize: 20}} style={styles.save}>送信</RkButton>
            <View style={styles.textRow}>
                <RkText rkType='primary3'>新規登録を行いますのでSMSを送信する電話番号の入力をお願いします。</RkText>
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