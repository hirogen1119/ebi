import React from 'react';
import {
  View,
  Image,
  Keyboard,
  Picker,
  Item,
  Text,
  Alert,
  AsyncStorage,
  ScrollView,
  ActivityIndicator,
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
import {GradientButton} from '../../components/';
import {base_url, img_url, scale, scaleModerate, scaleVertical} from '../../utils/scale';
import { ImagePicker, Permissions } from 'expo';
import Spinner from 'react-native-loading-spinner-overlay';
import {ImgPicker} from '../../components';
import RNPickerSelect from 'react-native-picker-select';
import { NavigationActions, StackActions } from 'react-navigation';

const CustomHeader = ({ title }) => (
    <View style={styles.header}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
export class UserAdd extends React.Component {
    static navigationOptions = {
        header: null
    };

    constructor(props) {
        super(props);
        this.inputRefs = {};
        this.state = {
            defaultImg: img_url + 'user/user_default.png',
            image: null,
            pickedValue: 1,
            pikerVisible: true,
            job: 1,
            nick_name: "",
            birthday: "",
            password: "",
            password_confirmation: "",
            gender: '男性',
            Jobs: null,
            user_role: 0,
            localUri: "",
            filename: "",
            img_type: "",
            default_flg: true,
            isDefaulReading: true,
            isReading: false,
            email: ""
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
        const navParams = this.props.navigation.state.params
        let user_id = navParams.user_id
        let invitation = navParams.invitation

        let url = base_url + 'api/users/get-params?user_id=' + user_id
        fetch( url, {
            method: 'GET',
            headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            },
        })
        .then((response) => response.json())
        .then((responseJson) => {
            var data = responseJson
            if(data.exception || data.result === 1){
                Alert.alert('パラメータ取得エラー', 'パラメータの取得処理に失敗しました。');
                this.props.navigation.goBack()
            } else {
                let jobs_data = data.params['jobs']
                let i = 0;
                let Jobs = []
                for(key in jobs_data){
                    let j = jobs_data[key]
                    let job = {
                      label: j['name'],
                      value: j['id']
                    }
                    Jobs.push(job)
                }
                this.setState({
                    isDefaulReading: false,
                    user_id: user_id,
                    jobs: Jobs,
                    invitation: invitation
                });
            }
        })
        .catch((error) => {
            Alert.alert('パラメータ取得例外エラー', 'パラメータの取得で例外が発生しました。')
            this.props.navigation.goBack()
        })
    }

    _send(){

        if(Platform.OS !== 'ios'){this.setState({isReading: true})}
        if(this.state.name === "") {
            this.setState({isReading: false})
          Alert.alert("入力チェックエラー","ニックネームを入力して下さい。");
        } else if(this.state.email === "") {
            this.setState({isReading: false})
            Alert.alert("入力チェックエラー","メールを入力して下さい。");
        } else if(this.state.birthday === "") {
            this.setState({isReading: false})
            Alert.alert("入力チェックエラー","生まれた年を入力して下さい。");
        } else if(this.state.password === "") {
            this.setState({isReading: false})
            Alert.alert("入力チェックエラー","パスワードを入力して下さい。");
        } else if(this.state.gender === "") {
            this.setState({isReading: false})
            Alert.alert("入力チェックエラー","性別を選択して下さい。");
        } else if(this.state.job === "") {
            this.setState({isReading: false})
            Alert.alert("入力チェックエラー","職業を選択して下さい。");
        } else if(this.state.password_confirmation === "") {
            this.setState({isReading: false})
            Alert.alert("入力チェックエラー","パスワード確認を入力して下さい。");
        } else if(this.state.password_confirmation !== this.state.password) {
            this.setState({isReading: false})
            Alert.alert("入力チェックエラー","パスワードとパスワード確認を入力が違います。");
        } else {
            if(!this.state.default_flg){
                // if(this.state.img_width > 2000 || this.state.img_height > 2000){
                //     this.setState({isReading: false})
                //     Alert.alert("アイコンエラー","アイコンの解像度が大きすぎます。\n解像度 2000×2000 以内に下げて登録してください。");
                //     return
                // }
            }

            let user = {
                nick_name: this.state.nick_name,
                birthday: this.state.birthday,
                password: this.state.password,
                job: this.state.job,
                id: Number(this.state.user_id),
                gender: this.state.gender,
                email: this.state.email
            }
            
            let formData = new FormData();
            let file = {
             uri: this.state.localUri,
             name: this.state.filename,
             type: this.state.img_type
            }

            formData.append("image", file)
            formData.append("user", JSON.stringify(user))
            formData.append("default_flg", this.state.default_flg)
            
            let url = base_url + 'api/users/add';

            fetch( url, {
                method: 'POST',
                body: formData
            })
            .then((response) => response.json())
            .then((responseJson) => {
                var data = responseJson;
                
                if(data.exception || data.result === 1){
                    this.setState({isReading: false})
                Alert.alert('ユーザー情報登録エラー', data.message);
                } else {
                    this.setState({isReading: false})
                    if(this.state.invitation > 0){
                        this.props.navigation.dispatch(StackActions.reset({
                            index: 0,
                            actions: [
                              NavigationActions.navigate({
                                routeName: 'ApartmentInvitationAdd',
                                params: {user_id: this.state.user_id}
                              }),
                            ],}))
                    } else {
                        this.props.navigation.dispatch(StackActions.reset({
                            index: 0,
                            actions: [
                              NavigationActions.navigate({
                                routeName: 'ApartmentAdd',
                                params: {user_id: this.state.user_id,apartment_id: 0}
                              }),
                            ],}))
                    }
                }
            })
            .catch((error) => {
                
                this.setState({isReading: false})
                Alert.alert('ユーザー情報の登録例外エラー', 'ユーザー情報の登録で例外が発生しました。');
            });
        }
    }
    
    render() {
        if (this.state.isDefaulReading) {
            return (
            <View style={[styles.container, styles.horizontal]}>
                <Spinner
                    visible={this.state.isDefaulReading}
                    textContent="Connecting・・・"
                    textStyle={{ color: 'orange' }}
                    />
            </View>
            )
        } else {
            let { image } = this.state;
            return (
                <View style={{flex: 1, backgroundColor: '#000',paddingTop: (Platform.OS === 'android' ? 0 : 24),paddingBottom: (Platform.OS === 'android' ? 0 : 24)}}>
                  <View style={{flex: 1, backgroundColor: '#fff0d1'}}>
                    <View style={{ paddingBottom: 0, backgroundColor: '#000', flexDirection: 'row', height: 55,paddingTop: 10}}>
                      <View style={{flex: 1, alignItems: 'center', marginBottom: 0,justifyContent: 'center'}}>
                        
                      </View>
                      <View style={{flex: 4, alignItems: 'center', marginBottom: 0,justifyContent: 'center'}}>
                        <Text style={{color: '#fff', fontSize: 22}}>ユーザー情報　登録</Text>
                      </View>
                      <View style={{flex: 1, alignItems: 'center', marginBottom: 0}}>
                      </View>
                    </View>
                <ScrollView style={styles.container}>
                    <View style={styles.content}>
                        <View>
                            <RkText>ニックネーム ＊</RkText>
                            <RkTextInput 
                                onChangeText={(nick_name) => this.setState({nick_name: nick_name})}
                                style={styles.text}
                                />
                            <RkText>メールアドレス ＊</RkText>
                            <RkTextInput 
                                onChangeText={(email) => this.setState({email: email})}
                                style={styles.text}
                                />
                            <RkText>生まれ年（西暦） ＊</RkText>
                            <RkTextInput 
                                style={styles.text}
                                onChangeText={(birthday) => this.setState({birthday: birthday})}
                                keyboardType={'numeric'}
                                />
                            <RkText>パスワード ＊</RkText>
                            <RkTextInput 
                                style={styles.text}
                                secureTextEntry={true}
                                onChangeText={(password) => this.setState({password: password})}
                                />
                            <RkText>パスワード確認 ＊</RkText>
                            <RkTextInput 
                                style={styles.text}
                                secureTextEntry={true}
                                onChangeText={(password_confirmation) => this.setState({password_confirmation: password_confirmation})}
                                />
                            <RkText style={{marginBottom: 10}}>性別</RkText>
                            <RNPickerSelect
                                placeholder={{
                                label: '選択して下さい',
                                value: '',
                                }}
                                doneText={'選択'}
                                items={[
                                    {label:'男性',value:'男性'},
                                    {label:'女性',value:'女性'},
                                    {label:'不明',value:'不明'},
                                ]}
                                onValueChange={(value) => {
                                this.setState({
                                    gender: value,
                                })
                                }}
                                onUpArrow={() => {
                                this.inputRefs.name.focus();
                                }}
                                onDownArrow={() => {
                                this.inputRefs.picker4.togglePicker();
                                }}
                                style={{ ...pickerSelectStyles }}
                                value={this.state.gender}
                                ref={(el) => {
                                this.inputRefs.picker = el;
                                }}
                            />
                            <RkText style={{marginBottom: 10}}>職業</RkText>
                            <RNPickerSelect
                                placeholder={{
                                label: '選択して下さい',
                                value: '',
                                }}
                                doneText={'選択'}
                                items={this.state.jobs}
                                onValueChange={(value) => {
                                this.setState({
                                    job: value,
                                })
                                }}
                                onUpArrow={() => {
                                this.inputRefs.name.focus();
                                }}
                                onDownArrow={() => {
                                this.inputRefs.picker5.togglePicker();
                                }}
                                style={{ ...pickerSelectStyles }}
                                value={this.state.job}
                                ref={(el) => {
                                this.inputRefs.picker = el;
                                }}
                            />
                            <RkText>ユーザーアイコン</RkText>
                            <ImgPicker setImage={this.setImage} filename='user_default.png' imgUrl={this.state.defaultImg} />
                            <RkButton onPress={ this._send.bind(this) }
                                rkType='medium medium stretch'
                                contentStyle={{color: '#fff'}} style={styles.save}>
                                STEP2 マンション情報登録  ＞ 
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
        backgroundColor: '#fff0d1',
    },
    header: {
        backgroundColor: '#000',
        padding: 15,
        flexDirection: 'row',
        marginTop: (Platform.OS === 'android' ? 0 : 24)
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
    content: {
        backgroundColor: '#fff0d1',
        padding: 20
    },
    save: {
        marginVertical: 20
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
    save: {
        marginVertical: 9,
        backgroundColor: '#d67b46',
        fontSize: 20
    },
    horizontal: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 10
    },
    textRow: {
        flexDirection: 'row',
        justifyContent: 'center'
    },
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