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
  Platform,
  StyleSheet
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
import {ImgPicker} from '../../components/';
import {base_url, img_url, scale, scaleModerate, scaleVertical} from '../../utils/scale';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import Spinner from 'react-native-loading-spinner-overlay';
import RNPickerSelect from 'react-native-picker-select';
import { NavigationActions, StackActions } from 'react-navigation';

export class TraderAdd extends React.Component {
    static navigationOptions = {
      header: null,
    };
    
    constructor(props) {
        super(props);
        this.inputRefs = {};
        this.state = {
            isLoading: true,
            name: "",
            introduction: 1,
            user_id: 0,
            pref: 1,
            area: "",
            address: "",
            tel: "",
            password_conf: "",
            password: "",
            defaultImg: img_url + 'user/user_default.png',
            isReading: false,
            prefs: [],
            types: []
        }
        this.setImage = this.setImage.bind(this)
    }

    setImage(file) {
        this.setState({
          image: file.localUri,
          localUri: file.localUri,
          filename: file.filename,
          img_type: file.img_type,
          img_width: file.img_width,
          img_height: file.img_height,
          default_flg: file.default_flg,
        })
    }
    
    componentDidMount() {

        const navParams = this.props.navigation.state.params;
        let user_id = navParams.user_id

        let url = base_url + 'api/traders/get-params?id=' + user_id + '&user_id=' + user_id;

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
            Alert.alert('ログインエラー','再度、ログインして下さい。')
            this.setState({
            isLoading: false,
            })
        } else {
            
            let trader = data.params['trader']
            if(trader !== null){
                this.setState({
                    nick_name: trader.nick_name,
                    trader_id: trader.id,
                    tel: trader.tel,
                })
            }

            let types_data = data.params['trader_types']
            let h = 0;
            let types = []
            for(key in types_data){
                let ty = types_data[key]
                let type = {
                  label: ty['name'],
                  value: ty['id']
                }
                types.push(type)
                h++;
            }
            let prefs_data = data.params['prefs']
            let pr = 1;
            let prefs = []
            for(key in prefs_data){
                let p = prefs_data[key]
                let pref = {
                  label: p['name'],
                  value: p['id']
                }
                prefs.push(pref)
                pr++;
            }
            let apartment_id = data.params['apartment_id']
            let apartment_name = data.params['apartment_name']

            this.setState({
                isLoading: false,
                types: types,
                prefs: prefs,
                apartment_id: apartment_id,
                apartment_name: apartment_name
            })
        }
        })
        .catch((error) => {
            console.log(error);
            Alert.alert('業者情報取得例外エラー', JSON.stringify(error));
            this.setState({
                isLoading: false,
            })
        })
        
    }

    _send(){

        if(Platform.OS !== 'ios'){this.setState({isReading: true})}
        let zip_data = this.state.zip
        if(this.state.tel === "") {
            this.setState({isReading: false})
            Alert.alert("入力チェックエラー","電話番号を入力して下さい。");
        } else if(this.state.nick_name === "") {
            this.setState({isReading: false})
          Alert.alert("入力チェックエラー","業者名を入力して下さい。");
        } else if(this.state.address === "") {
            this.setState({isReading: false})
            Alert.alert("入力チェックエラー","住所を入力して下さい。");
        } else if(this.state.password === "") {
            this.setState({isReading: false})
            Alert.alert("入力チェックエラー","パスワードを入力して下さい。");
        } else if(this.state.password_confirmation === "") {
            this.setState({isReading: false})
            Alert.alert("入力チェックエラー","パスワード確認を入力して下さい。");
        } else if(this.state.password_confirmation !== this.state.password) {
            this.setState({isReading: false})
            Alert.alert("入力チェックエラー","パスワードとパスワード確認を入力が違います。");
        } else if(!zip_data.match(/^\d{3}[-]\d{4}$|^\d{7}$/)) {
            Alert.alert("入力チェックエラー","正しい郵便番号を入力してください。");
        } else if(this.state.pref === "") {
            this.setState({isReading: false})
            Alert.alert("入力チェックエラー","都道府県を選択して下さい。");
        } else if(this.state.introduction === "") {
            this.setState({isReading: false})
            Alert.alert("入力チェックエラー","業務内容を選択して下さい。");
        } else {
            let zip = ''
            if(zip_data.match(/^\d{7}$/)){
              zip = zip_data.slice(0, 3) + '-' + zip_data.slice(3);
            } else {
              zip = zip_data
            }
            let trader = {
                id: this.state.trader_id,
                tel: this.state.tel,
                nick_name: this.state.nick_name,
                address: this.state.address,
                introduction: this.state.introduction,
                area: this.state.area,
                password: this.state.password,
                pref: this.state.pref,
                zip: zip
            }
            let formData = new FormData();
            let file = {
                uri: this.state.localUri,
                name: this.state.filename,
                type: this.state.img_type
            }

            formData.append("image", file)
            formData.append("trader", JSON.stringify(trader))
            formData.append("default_flg", this.state.default_flg)
            
            let url = base_url + 'api/traders/add';
            fetch( url, {
                method: 'POST',
                body: formData
            })
            .then((response) => response.json())
            .then((responseJson) => {
                var data = responseJson
                if(data.message){
                    this.setState({isReading: false})
                Alert.alert('', data.message);
                } else {
                    this.setState({isReading: false})
                    this.props.navigation.dispatch(StackActions.reset({
                        index: 0,
                        actions: [
                          NavigationActions.navigate({
                            routeName: 'Login',
                          }),
                        ],}))
                }
            })
            .catch((error) => {
                console.log(error);
                this.setState({isReading: false})
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

    _zipChange(zip){
        if(!zip.match(/^\d{3}[-]\d{4}$|^\d{7}$/)){
          return
        }
        let url = 'http://zipcloud.ibsnet.co.jp/api/search?zipcode=' + zip
        
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
          if(data.message || !data.results){
  
            Alert.alert('', '不正な値です。');
  
          } else {
            let results = data.results
            let zip_datas = []
            if(results.length > 1){
              for(key in results){
                let result = results[key];
                zip_data = {
                  prefcode: result.prefcode,
                  address: result.address1 + result.address2 + result.address3,
                  zipcode: result.zipcode,
                }
                zip_datas.push(zip_data)
              }
              this.setState({ zip_datas: zip_datas, isZipAddressSelectModal: true})
            } else {
              let zip_data = results[0]
              this.setState({
                address: zip_data.address2 + zip_data.address3,
                pref: parseInt(zip_data.prefcode),
                zip: zip,
              })
            }
          }
        })
        .catch((error) => {
  
          console.log(error);
          Alert.alert('', 'マンション情報の検索で例外が発生しました。')
          this.setState({ isZipAddressSelectModal: false })
  
        })
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
                            <RkText>業者名 *</RkText>
                            <RkTextInput
                                value={this.state.nick_name}
                                onChangeText={(nick_name) => this.setState({nick_name: nick_name})}
                                style={styles.text}
                                />
                            <RkText>電話番号 *</RkText>
                            <RkTextInput
                                value={this.state.tel}
                                onChangeText={(tel) => this.setState({tel: tel})}
                                style={styles.text}
                                keyboardType={'numeric'}
                                />
                            <RkText>パスワード *</RkText>
                            <RkTextInput 
                                style={styles.text}
                                secureTextEntry={true}
                                onChangeText={(password) => this.setState({password: password})}
                                />
                            <RkText>パスワード確認 *</RkText>
                            <RkTextInput 
                                style={styles.text}
                                secureTextEntry={true}
                                onChangeText={(password_confirmation) => this.setState({password_confirmation: password_confirmation})}
                                />
                                <RkText>郵便番号 *</RkText>
                                <RkTextInput
                                    value={this.state.zip}
                                    onChangeText={(zip) => this._zipChange(zip)}
                                    style={styles.text}
                                    />
                            <RkText style={{marginBottom: 10}}>都道府県</RkText>
                            <RNPickerSelect
                              placeholder={{
                                label: '選択して下さい',
                                value: '',
                              }}
                              doneText={'選択'}
                              items={this.state.prefs}
                              onValueChange={(value) => {
                                this.setState({
                                  pref: value,
                                })
                              }}
                              onUpArrow={() => {
                                this.inputRefs.name.focus();
                              }}
                              onDownArrow={() => {
                                this.inputRefs.picker2.togglePicker();
                              }}
                              style={{ ...pickerSelectStyles }}
                              value={this.state.pref}
                              ref={(el) => {
                                this.inputRefs.picker = el;
                              }}
                            />
                            <RkText style={{marginBottom: 10}}>住所（都道府県以降）</RkText>
                            <RkTextInput
                                value={this.state.address}
                                onChangeText={(address) => this.setState({address: address})}
                                style={styles.text}
                                />
                            <RkText>サービス提供エリア</RkText>
                            <RkTextInput
                                value={this.state.area}
                                onChangeText={(area) => this.setState({area: area})}
                                style={styles.text}
                                />
                            <RkText style={{marginBottom: 10}}>業務内容</RkText>
                            <RNPickerSelect
                              placeholder={{
                                label: '選択して下さい',
                                value: '',
                              }}
                              doneText={'選択'}
                              items={this.state.types}
                              onValueChange={(value) => {
                                this.setState({
                                    introduction: value,
                                })
                              }}
                              onUpArrow={() => {
                                this.inputRefs.name.focus();
                              }}
                              onDownArrow={() => {
                                this.inputRefs.picker3.togglePicker();
                              }}
                              style={{ ...pickerSelectStyles }}
                              value={this.state.introduction}
                              ref={(el) => {
                                this.inputRefs.picker = el;
                              }}
                            />
                            <RkText>アイコン</RkText>
                            <ImgPicker setImage={this.setImage} imgUrl={this.state.defaultImg} />
                            <RkButton onPress={ this._send.bind(this) }
                                rkType='medium large stretch'
                                contentStyle={{color: '#fff', fontSize: 20}} style={styles.save}>
                                業者情報登録 
                            </RkButton>
                        </View>
                    </View>
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
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 4,
        backgroundColor: 'white',
        color: 'black',
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
const pickerSelectStyles = StyleSheet.create({
    inputIOS: {
        fontSize: 16,
        paddingTop: 13,
        paddingHorizontal: 10,
        paddingBottom: 12,
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 4,
        backgroundColor: 'white',
        color: 'black',
        marginBottom: 10
    },
    inputAndroid: {
        fontSize: 16,
        paddingTop: 13,
        paddingHorizontal: 10,
        paddingBottom: 12,
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 4,
        backgroundColor: 'white',
        color: 'black',
        marginBottom: 10
    },
});