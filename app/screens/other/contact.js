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
import {base_url, scale, scaleModerate, scaleVertical} from '../../utils/scale';
import Spinner from 'react-native-loading-spinner-overlay';
import { NavigationActions, StackActions } from 'react-navigation';
import { Foundation, Feather, Ionicons, MaterialIcons, FontAwesome, SimpleLineIcons } from '@expo/vector-icons';

export class Contact extends React.Component {
  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);
    this.state = {
      mail: "",
      isReading: false,
      contact: ""
    }
  }

  _send(){
    if(Platform.OS !== 'ios'){this.setState({isReading: true})}
    if(this.state.mail === "") {
      this.setState({isReading: false})
      Alert.alert("入力チェックエラー","メールアドレスを入力して下さい。");
    } else {
      let url = base_url + 'api/contacts/send';

      fetch( url, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mail: this.state.mail,
          contact: this.state.contact
        }),
      })
      .then((response) => response.json())
      .then((responseJson) => {
        var data = responseJson;
        
        if(data.message){
          this.setState({isReading: false})
          Alert.alert('メール送信エラー', data.message);
        } else {
          this.setState({isReading: false})
          Alert.alert(
            '送信完了',
            'お問い合わせの送信が完了しました。',
            [
              {text: 'OK', onPress: () => 
              this.props.navigation.dispatch(StackActions.reset({
                  index: 0,
                  actions: [
                    NavigationActions.navigate({
                      routeName: 'Contact',
                    }),
                  ],}))},
            ],
            { cancelable: false }
          )
          
        }
      })
      .catch((error) => {
        this.setState({isReading: false})
        Alert.alert('SMS送信例外エラー', JSON.stringify(error));
      });
    }
  }

  render() {

    if (this.state.isLoading) {
      return <View><Text>Loading...</Text></View>;
    } else {
      return (
        <RkAvoidKeyboard
          onStartShouldSetResponder={ (e) => true}
          onResponderRelease={ (e) => Keyboard.dismiss()}
          style={styles.screen}>
        <View style={{ paddingBottom: 0, backgroundColor: '#000', flexDirection: 'row', height: 55,paddingTop: 10}}>
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
            <Text style={{color: '#fff', fontSize: 20}}>お問い合わせ</Text>
          </View>
          <View style={{flex: 1, alignItems: 'center', marginBottom: 0}}>
          </View>
        </View>
        <View style={styles.container}>
          <View style={{flex: 1,paddingTop: 20}} >
            <RkText rkType='header5'>メールアドレス</RkText>
            <RkTextInput
              style={styles.text}
              onChangeText={(mail) => this.setState({mail: mail})}
              keyboardType={'email-address'}
              rkType='bordered'
              />
              <RkText rkType='header5'>お問い合わせ内容</RkText>
              <TextInput
                style={styles.textContact}
                multiline = {true}
                maxLength = {100}
                underlineColorAndroid = 'transparent'
                onChangeText={(contact) => this.setState({contact: contact})}
              />
              <RkButton onPress={ this._send.bind(this) }
                rkType='medium large stretch'
                contentStyle={{color: '#fff', fontSize: 20}} style={styles.save}>送信</RkButton>
              <View style={styles.textRow}>
                  <RkText rkType='primary3'>メールアドレス、お問い合わせ内容を入力し送信して下さい。</RkText>
              </View>
          </View>
          <View style={{flex: 1}} ></View>
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
  }
}));