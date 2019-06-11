import React from 'react';
import {
  View,
  Image,
  Keyboard,
  Picker,
  Item,
  Text,
  Alert,
  ActivityIndicator,
  AsyncStorage,
  ScrollView,
  Button,
  TouchableOpacity,
  Platform
} from 'react-native';
import {
  RkButton,
  RkText,
  RkTextInput,
  RkStyleSheet,
  RkTheme,
  RkAvoidKeyboard,
  RkPicker
} from 'react-native-ui-kitten';
import {GradientButton} from '../../components/';
import {base_url, scale, test_flg, scaleModerate, scaleVertical} from '../../utils/scale';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { NavigationActions, StackActions } from 'react-navigation';

export class TraderCreate extends React.Component {
    static navigationOptions = {
      header: null,
    };
    
    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            name: "",
            introduction: "",
            user_id: "",
            area: "",
            address: "",
            tel: "",
            password_conf: "",
            password: ""
        }
    }

    componentDidMount() {

    const navParams = this.props.navigation.state.params
    let user_id = navParams.user_id
    AsyncStorage.getItem("token_data").then((token_data) => {

        if(token_data !== null){
          let token = JSON.parse(token_data)
          let user = JSON.parse(token.user)
          let url = base_url + 'api/traders/get-params?id=0&user_id=' + user.id;
  
          fetch( url, {
            method: 'GET',
            headers: {
              Accept: 'application/json',
              Authorization: 'Bearer ' + token.access_token,
            },
          })
          .then((response) => response.json())
          .then((responseJson) => {
            var data = responseJson
            if(data.message){
              Alert.alert('','業者登録情報取得エラー')
              this.setState({
                isLoading: false,
              })
            } else {
                let prefectures_data = data.params['prefs']
                let apartment_id = data.params['apartment_id']
                let apartment_name = data.params['apartment_name']

                this.setState({
                    isLoading: false,
                    apartment_id: apartment_id,
                    apartment_name: apartment_name,
                    now_user_id: user.id
                });
            }
          })
          .catch((error) => {
            console.log(error);
            Alert.alert('業者登録例外エラー', JSON.stringify(error));
            this.setState({
              isLoading: false,
            })
          })
  
        } else {
          this.setState({ isLoading: false })
        }
      })
    }

    _send(){

        if(this.state.tel === "") {
            Alert.alert("入力チェックエラー","電話番号を入力して下さい。");
          } else if(this.state.name === "") {
          Alert.alert("入力チェックエラー","業者名を入力して下さい。");
        } else {
          let url = base_url + 'api/traders/create';
          fetch( url, {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                trader: {
                    tel: this.state.tel,
                    name: this.state.name,
                },
                user_id: 0,
                now_user_id: this.state.now_user_id,
                apartment_id: this.state.apartment_id,
            }),
          })
          .then((response) => response.json())
          .then((responseJson) => {
            var data = responseJson
            if(data.exception || data.result === 1){
              Alert.alert('業者情報登録エラー', data.message);
            } else {
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
            console.log(error);
            Alert.alert('業者情報の登録例外エラー', JSON.stringify(error));
          });
        }
      }
    
      _clickBack(){
        Alert.alert(
          '',
          '入力した情報がクリアされますが宜しいですか？',
          [
            {text: 'Cancel'},
            {text: 'Ok', onPress: () => 
              this.props.navigation.goBack()},
          ],
          { cancelable: false }
        )
    }

    render() {
        if (this.state.isLoading) {
            return (
            <View style={[styles.container, styles.horizontal]}>
                <ActivityIndicator size="large" color="#ffb626" />
            </View>
            )
        } else {
            return (
                <View style={{flex: 1, backgroundColor: '#000',paddingTop: (Platform.OS === 'android' ? 0 : 24),paddingBottom: (Platform.OS === 'android' ? 0 : 24)}}>
                <View style={{flex: 1, backgroundColor: '#fff0d1'}}>
                  <View style={{ paddingBottom: 0, backgroundColor: '#000', flexDirection: 'row', height: 55,paddingTop: 10}}>
                    <View style={{flex: 1, alignItems: 'center', marginBottom: 0}}>
                    <TouchableOpacity onPress={()=> 
                        this.props.navigation.dispatch(StackActions.reset({
                            index: 0,
                            actions: [
                                NavigationActions.navigate({
                                routeName: 'EventList',
                                }),
                            ],}))}>
                      <MaterialIcons name="chevron-left" size={30} color="#fff" />
                    </TouchableOpacity>
                    </View>
                    <View style={{flex: 4, alignItems: 'center', marginBottom: 0}}>
                      <Text style={{color: '#fff', fontSize: 18}}>{this.state.apartment_name}</Text>
                      <Text style={{color: '#fff', fontSize: 12}}>業者登録</Text>
                    </View>
                    <View style={{flex: 1, alignItems: 'center', marginBottom: 0}}>
                    </View>
                  </View>
                    <ScrollView style={styles.container}>
                        <View style={styles.content}>
                        <View>
                            <RkText>業者名</RkText>
                            <RkTextInput 
                                onChangeText={(name) => this.setState({name: name})}
                                style={styles.text}
                                />
                            <RkText>電話番号</RkText>
                            <RkTextInput 
                                onChangeText={(tel) => this.setState({tel: tel})}
                                style={styles.text}
                                keyboardType={'numeric'}
                                />
                            <RkButton onPress={ this._send.bind(this) }
                                rkType='medium large stretch'
                                contentStyle={{color: '#fff', fontSize: 20}} style={styles.save}>
                                業者を招待 
                            </RkButton>
                        </View>
                    </View>
                </ScrollView>
            </View>
            </View>
            )
        }
    }
}

let styles = RkStyleSheet.create(theme => ({
    container: {
        flex: 1,
        backgroundColor: '#fff0d1'
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
    select_picker: {
        marginBottom: 15,
        marginBottom: 10,
        backgroundColor: '#fff',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#bdc3c7',
        overflow: 'hidden'
    },
    text: {
        marginTop: 10,
        marginBottom: 15,
        height: 50,
        backgroundColor: '#fff'
    },
    screen: {
        padding: 16,
        flex: 1,
        justifyContent: 'space-around',
        backgroundColor: '#f5f8fa'
    },
    image: {
        marginBottom: 10,
        height:scaleVertical(77),
        resizeMode:'contain'
    },
    content: {
        backgroundColor: '#fff0d1',
        padding: 20
    },
    save: {
        marginVertical: 20,
        marginVertical: 9,
        backgroundColor: '#d67b46',
    },
    buttons: {
        flexDirection: 'row',
        marginBottom: 24,
        marginHorizontal: 24,
        justifyContent: 'space-around'
    },
    footer:{
        justifyContent:'flex-end'
    },
    textRow: {
        flexDirection: 'row',
        justifyContent: 'center'
    },
    horizontal: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 10
    },
    mini_text: {
        width: 80,
        marginRight: 20
    },
    mini_select: {
        width: 80,
        marginTop: 10
    }
}));