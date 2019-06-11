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
import {GradientButton, ImgPicker} from '../../components/';
import {base_url, img_url, scale, scaleModerate, scaleVertical} from '../../utils/scale';
import { ImagePicker, Permissions } from 'expo';
import { NavigationActions, StackActions } from 'react-navigation';

export class TraderEdit extends React.Component {
    static navigationOptions = ({ navigation }) => {
        const params = navigation.state.params || {};

        return {
            header: (
            <View style={{backgroundColor: '#000',padding: 15,flexDirection: 'row'}}>
                  <Text style={{flex: 1,color: '#fff',fontSize: 20}}>＜</Text>
              <Text style={{flex: 5,color: '#fff',fontSize: 20}}>業者情報　編集</Text>
            </View>
            ),
        };
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
            password: "",
            localUri: "",
            defaultImg: img_url + 'user/user_default.png',
            default_flg: 1
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
        let trader_id = navParams.trader_id
        AsyncStorage.getItem("token_data").then((token_data) => {
    
          if(token_data !== null){
            let token = JSON.parse(token_data)
            let user = JSON.parse(token.user)
            let url = base_url + 'api/traders/get-params?id=' + trader_id + '&user_id=' + user.id;
    
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
                Alert.alert('','業者情報の取得に失敗しました。')
                this.setState({
                  isLoading: false,
                })
                this.props.navigation.goBack()
              } else {
                let prefectures_data = data.params['prefectures']
                let trader = data.params['trader']
                if(trader !== null){
                    let image_path = img_url + data.params.icon_path
                    this.setState({
                        nick_name: trader.nick_name,
                        introduction: trader.introduction,
                        trader_id: trader.id,
                        area: trader.area,
                        address: trader.address,
                        tel: trader.tel,
                        defaultImg: image_path,
                        apartment_name: navParams.apartment_name
                    })
                }
                let i = 0;
                let prefectures = []
                for(key in prefectures_data){
                    let ap = prefectures_data[key];
                    prefectures.push(
                        <Picker.Item key={h} label={prefectures_data[key]} value={prefectures_data[key]} />
                    );
                    i++;
                }
    
                let types_data = data.params['types']
                let h = 0;
                let types = []
                for(key in types_data){
                    types.push(
                        <Picker.Item key={h} label={types_data[key]} value={types_data[key]} />
                    );
                    h++;
                }
                this.setState({
                    isLoading: false,
                    prefectures: prefectures,
                    types: types
                });
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

    _send(){

        if(Platform.OS !== 'ios'){this.setState({isReading: true})}
        if(this.state.tel === "") {
            this.setState({isReading: false})
            Alert.alert("入力チェックエラー","電話番号を入力して下さい。");
        } else if(this.state.nick_name === "") {
            this.setState({isReading: false})
          Alert.alert("入力チェックエラー","業者名を入力して下さい。");
        } else if(this.state.address === "") {
            this.setState({isReading: false})
            Alert.alert("入力チェックエラー","住所を入力して下さい。");
        } else if(this.state.password !== "") {
            if(this.state.password_confirmation === "") {
                this.setState({isReading: false})
                Alert.alert("入力チェックエラー","パスワード確認を入力して下さい。");
            } else if(this.state.password_confirmation !== this.state.password) {
                this.setState({isReading: false})
                Alert.alert("入力チェックエラー","パスワードとパスワード確認を入力が違います。");
            }
        } else {
            if(!this.state.default_flg){
                if(this.state.img_width > 2000 || this.state.img_height > 2000){
                    Alert.alert("アイコンエラー","アイコンの解像度が大きすぎます。\n解像度 2000×2000 以内に下げて登録してください。");
                    return
                }
            }
            let trader = {
                id: this.state.trader_id,
                tel: this.state.tel,
                nick_name: this.state.nick_name,
                address: this.state.address,
                introduction: this.state.introduction,
                area: this.state.area,
                password: this.state.password
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
                Alert.alert('業者情報登録エラー', data.message);
                } else {
                    this.setState({isReading: false})
                    this.props.navigation.dispatch(StackActions.reset({
                        index: 0,
                        actions: [
                          NavigationActions.navigate({
                            routeName: 'TraderInfo',
                            params: {trader_id: this.state.trader_id}
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
    
    render() {
        if (this.state.isLoading) {
            return (
            <View style={[styles.container, styles.horizontal]}>
                <ActivityIndicator size="large" color="#ffb626" />
            </View>
            )
        } else {
            let { image } = this.state;
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
                            <Text style={{color: '#fff', fontSize: 12}}>業者情報　編集</Text>
                        </View>
                        <View style={{flex: 1, alignItems: 'center', marginBottom: 0}}>
                        </View>
                    </View>
                    <ScrollView style={styles.container}>
                        <View style={styles.content}>
                        <View>
                            <RkText>業者名</RkText>
                            <RkTextInput
                                value={this.state.nick_name}
                                onChangeText={(nick_name) => this.setState({nick_name: nick_name})}
                                style={styles.text}
                                />
                            <RkText>電話番号</RkText>
                            <RkTextInput 
                                value={this.state.tel}
                                onChangeText={(tel) => this.setState({tel: tel})}
                                style={styles.text}
                                keyboardType={'numeric'}
                                />
                            <RkText style={{marginBottom: 10}}>住所</RkText>
                            <Picker
                                selectedValue={this.state.address}
                                style={styles.select_picker}
                                onValueChange={(itemValue, itemIndex) => this.setState({address: itemValue})}>
                                {this.state.prefectures}
                            </Picker>
                            <RkText>パスワード</RkText>
                            <RkTextInput
                                style={styles.text}
                                secureTextEntry={true}
                                onChangeText={(password) => this.setState({password: password})}
                                />
                            <RkText>パスワード確認</RkText>
                            <RkTextInput
                                style={styles.text}
                                secureTextEntry={true}
                                onChangeText={(password_confirmation) => this.setState({password_confirmation: password_confirmation})}
                                />
                            <RkText>サービス提供エリア</RkText>
                            <RkTextInput
                                value={this.state.area}
                                onChangeText={(area) => this.setState({area: area})}
                                style={styles.text}
                                />
                            <RkText style={{marginBottom: 10}}>業務内容</RkText>
                            <Picker
                                selectedValue={this.state.introduction}
                                style={styles.select_picker}
                                onValueChange={(itemValue, itemIndex) => this.setState({introduction: itemValue})}>
                                {this.state.types}
                            </Picker>
                            <RkText>アイコン</RkText>
                            <ImgPicker setImage={this.setImage} imgUrl={this.state.defaultImg} />
                            <RkButton onPress={ this._send.bind(this) }
                                rkType='medium large stretch'
                                contentStyle={{color: '#fff', fontSize: 20}} style={styles.save}>
                                業者情報登録 
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
        backgroundColor: '#fff0d1',
        marginTop: (Platform.OS === 'android' ? 0 : 24)
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
    save_s: {
        marginVertical: 9,
        backgroundColor: '#d67b46',
        fontSize: 14
    },
    image_box: {
        marginTop: 15,
        marginRight: 20,
        marginBottom: 50,
        width: 120,
        height: 120,
        backgroundColor: '#fff',
        borderRadius: 20
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