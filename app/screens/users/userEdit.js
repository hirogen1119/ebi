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
import {GradientButton, ImgPicker} from '../../components/';
import {base_url, scale, scaleModerate, scaleVertical, img_url} from '../../utils/scale';
import Utils from '../../utils/Utils';
import { ImagePicker, Permissions } from 'expo';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import RNPickerSelect from 'react-native-picker-select';
import { NavigationActions, StackActions } from 'react-navigation';

export class UserEdit extends React.Component {
    static navigationOptions = {
      header: null,
    }

    constructor(props) {
        super(props);
        this.inputRefs = {};
        this.state = { 
            image: null,
            pickedValue: 1,
            pikerVisible: true,
            job: 1,
            owned: 1,
            isLoading: true,
            nickname: "",
            birthday: "",
            password: "",
            password_confirmation: "",
            gender: '男性',
            Jobs: null,
            owneds: null,
            rolePickVisible: false,
            role_id: 1,
            localUri: "",
            email: '',
            prefs: [],
            types: [],
            pref: 0
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
        let id = navParams.user_id

        AsyncStorage.getItem("token_data").then((token_data) => {

            let token = JSON.parse(token_data)
            let user = JSON.parse(token.user)
            let url = base_url + 'api/users/get-params?user_id=' + id;
    
            fetch( url, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                Authorization: 'Bearer ' + token.access_token,
            },
            })
            .then(response => {
              return response.json()})
            .then((responseJson) => {
                var data = responseJson
                if(data.message){
                Alert.alert('パラメータ取得エラー', 'パラメータの取得処理に失敗しました。');
                } else {
                    let jobs_data = data.params['jobs']
                    let users_data = data.params['users']
                    let user_role = data.params['user_role']
                    console.log(data)
                    if(user_role === 1){
                        this.setState({rolePickVisible: true})
                    }
                    
                    let Jobs = []
                    for(key in jobs_data){
                        let j = jobs_data[key]
                        let job = {
                          label: j['name'],
                          value: j['id']
                        }
                        Jobs.push(job)
                    }
                    let rolePickVisible = false;
                    if(user_role === 1){
                        rolePickVisible = true;
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
                    this.setState({
                        user_id: users_data.id,
                        nick_name: users_data.nick_name,
                        birthday: users_data.birthday,
                        job: users_data.job_id,
                        gender: users_data.gender,
                        image: img_url + users_data.icon_path,
                        isLoading: false,
                        role_id: user_role,
                        old_role_id: user_role,
                        rolePickVisible: rolePickVisible,
                        jobs: Jobs,
                        defaultImg: img_url + users_data.icon_path,
                        app_staff_cnt: data.params['app_staff_cnt'],
                        apartment: data.params.apartment,
                        email: users_data.email,
                        prefs: prefs,
                        types: types,
                        pref: users_data.pref_id,
                        zip: users_data.zip,
                        tel: users_data.tel,
                        address: users_data.address,
                        area: users_data.area,
                        introduction: users_data.introduction
                    });

                }
            })
            .catch((error) => {
                Alert.alert('パラメータ取得例外エラー', JSON.stringify(error));
            });

        })
    }

    _send(){

        if(this.state.role_id === 5){
            let zip_data = this.state.zip
        }
        if(this.state.nick_name === "") {
          Alert.alert("入力チェックエラー","ニックネームを入力して下さい。");
        } else if(this.state.birthday === "") {
            Alert.alert("入力チェックエラー","生まれた年を入力して下さい。");
        } else if(this.state.user_role < 5 && this.state.gender === "") {
            Alert.alert("入力チェックエラー","性別を選択して下さい。");
        } else if(this.state.user_role < 5 && this.state.job === "") {
            Alert.alert("入力チェックエラー","職業を選択して下さい。");
        } else if(this.state.user_role === 5 && this.state.pref === "") {
            Alert.alert("入力チェックエラー","都道府県を選択して下さい。");
        } else if(this.state.user_role === 5 && this.state.introduction === "") {
            Alert.alert("入力チェックエラー","業務内容を選択して下さい。");
        } else if(this.state.user_role === 1 && this.state.role_id === "") {
            Alert.alert("入力チェックエラー","権限を選択して下さい。");
        } else if(this.state.password !== "" && this.state.password_confirmation === "") {
            Alert.alert("入力チェックエラー","パスワード確認を入力して下さい。");
        } else if((this.state.password !== "" && this.state.password_confirmation !== "")
            && (this.state.password_confirmation !== this.state.password)) {
            Alert.alert("入力チェックエラー","パスワードとパスワード確認を入力が違います。");
        } else if(this.state.role_id === 5 && !zip_data.match(/^\d{3}[-]\d{4}$|^\d{7}$/)) {
            Alert.alert("入力チェックエラー","正しい郵便番号を入力してください。");
        } else {
            if(this.state.old_role_id !== this.state.role_id
                && this.state.app_staff_cnt === 0){
                    Alert.alert('','アプリ担当者がいなくなります。\n一つのマンションにアプリ担当者は必ず一人はいなければなりません。')
                    return
                }
            let password = ""
            if(this.state.password !== "" && this.state.password_confirmation !== "") {
                password = this.state.password
            }
            let user = null
            if(this.state.role_id < 5){
                user = {
                    nick_name: this.state.nick_name,
                    birthday: this.state.birthday,
                    password: password,
                    job: this.state.job,
                    id: this.state.user_id,
                    gender: this.state.gender,
                    email: this.state.email
                }
            } else {
                let zip = ''
                if(zip_data.match(/^\d{7}$/)){
                  zip = zip_data.slice(0, 3) + '-' + zip_data.slice(3);
                } else {
                  zip = zip_data
                }
                user = {
                    birthday: this.state.birthday,
                    password: password,
                    job: this.state.job,
                    id: this.state.user_id,
                    gender: this.state.gender,
                    email: this.state.email,
                    tel: this.state.tel,
                    nick_name: this.state.nick_name,
                    address: this.state.address,
                    introduction: this.state.introduction,
                    area: this.state.area,
                    pref: this.state.pref,
                    zip: zip,
                }
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
                if(data.message){
                    Alert.alert('ユーザー情報登録エラー', data.message);
                } else {
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
                Alert.alert('ユーザー情報の登録例外エラー', JSON.stringify(error));
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
  
    _roleVisible(){
        if(this.state.rolePickVisible)
            return (
                <View>
                    <RkText style={{marginBottom: 10}}>権限</RkText>
                    <RNPickerSelect
                        placeholder={{
                        label: '選択して下さい',
                        value: '',
                        }}
                        doneText={'選択'}
                        items={[
                            {label:'アプリ担当',value:1},
                            {label:'理事長',value:2},
                            {label:'役員',value:3},
                            {label:'一般',value:4}
                        ]}
                        onValueChange={(value) => {
                        this.setState({
                            role_id: value,
                        })
                        }}
                        onUpArrow={() => {
                        this.inputRefs.name.focus();
                        }}
                        onDownArrow={() => {
                        this.inputRefs.picker3.togglePicker();
                        }}
                        style={{ ...pickerSelectStyles }}
                        value={this.state.role_id}
                        ref={(el) => {
                        this.inputRefs.picker = el;
                        }}
                    />
                </View>
            )
        
    }

    _roleViewChange(){
        if(this.state.role_id < 5){
            return (
                <View style={styles.content}>
                    <View>
                        <RkText>ニックネーム</RkText>
                        <RkTextInput
                            value={this.state.nick_name}
                            onChangeText={(nick_name) => this.setState({nick_name: nick_name})}
                            style={styles.text}
                            />
                        <RkText>メールアドレス ＊</RkText>
                        <RkTextInput 
                            value={this.state.email}
                            onChangeText={(email) => this.setState({email: email})}
                            style={styles.text}
                            />
                        <RkText>生まれ年（西暦）</RkText>
                        <RkTextInput
                            value={this.state.birthday}
                            style={styles.text}
                            onChangeText={(birthday) => this.setState({birthday: birthday})}
                            keyboardType={'numeric'}
                            />
                            { this._roleVisible() }
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
                        <ImgPicker setImage={this.setImage} imgUrl={this.state.defaultImg} />
                        <RkButton onPress={ this._send.bind(this) }
                            rkType='medium medium stretch'
                            contentStyle={{color: '#fff'}} style={styles.save}>
                            ユーザー情報更新
                        </RkButton>
                    </View>
                </View>
            )
        } else {
            return (

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
                        業者情報更新
                    </RkButton>
                </View>
            </View>
            )
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
                            <TouchableOpacity onPress={this._clickBack.bind(this)}>
                                <MaterialIcons name="chevron-left" size={34} color="#fff" />
                            </TouchableOpacity>
                        </View>
                        <View style={{flex: 4, alignItems: 'center', marginBottom: 0}}>
                            <Text style={{color: '#fff', fontSize: 18}}>{this.state.apartment.name}</Text>
                            <Text style={{color: '#fff', fontSize: 12}}>ユーザー情報編集</Text>
                        </View>
                        <View style={{flex: 1, alignItems: 'center', marginBottom: 0}}>
                        </View>
                    </View>
                    <ScrollView style={styles.container}>
                        {this._roleViewChange()}
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
    image_box: {
        marginTop: 15,
        marginRight: 20,
        marginBottom: 50,
        width: 120,
        height: 120,
        backgroundColor: '#fff',
        borderRadius: 20
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
    },
    save_s: {
        marginVertical: 9,
        backgroundColor: '#d67b46',
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