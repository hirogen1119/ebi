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
import {DatePicker} from '../../components/picker/datePicker';
import {base_url, scale, scaleModerate, scaleVertical} from '../../utils/scale';
import DateTimePicker from 'react-native-modal-datetime-picker';
import { NavigationActions, StackActions, MaterialIcons } from 'react-navigation';

const CustomHeader = ({ title }) => (
    <View style={styles.header}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
export class InsuranceAdd extends React.Component {
    static navigationOptions = {
        header: null
    };

    constructor(props) {
        super(props);
        let date = new Date()
        const navParams = this.props.navigation.state.params;

        this.state = { 
            isLoading: true,
            name1 : "",
            name2 : "",
            name3 : "",
            name4 : "",
            name5 : "",
            isVisible1: false,
            date1: date,
            date_view1: "",
            isVisible2: false,
            date2: date,
            date_view2: "",
            isVisible3: false,
            date3: date,
            date_view3: "",
            isVisible4: false,
            date4: date,
            date_view4: "",
            isVisible5: false,
            date5: date,
            date_view5: "",
            apartment_id: navParams.apartment_id,
            apartment_name: navParams.apartment_name,
            room_id: navParams.room_id,
            user_id: navParams.user_id,
            token_data: null
        }
    }

    componentDidMount() {
        AsyncStorage.getItem("token_data").then((token_data) => {
          if(token_data !== null){
            let token = JSON.parse(token_data)
            let user = JSON.parse(token.user)
            this.setState({
                token_data: token,
                user: user,
                isLoading: false
            })
          } else {
            this.setState({
                token_data: null,
                isLoading: false
            })
          }
        })
    }
    _send(){

        let insurances_data = []
        if(this.state.name1 !== "" && this.state.expire1 !== ""){
            let ins = { name: this.state.name1, period_dt: this.state.date_view1}
            insurances_data.push(ins)
        }
        if(this.state.name2 !== "" && this.state.expire2 !== ""){
            let ins = { name: this.state.name2, period_dt: this.state.date_view2}
            insurances_data.push(ins)
        }
        if(this.state.name3 !== "" && this.state.expire3 !== ""){
            let ins = { name: this.state.name3, period_dt: this.state.date_view3}
            insurances_data.push(ins)
        }
        if(this.state.name4 !== "" && this.state.expire4 !== ""){
            let ins = { name: this.state.name4, period_dt: this.state.date_view4}
            insurances_data.push(ins)
        }
        if(this.state.name5 !== "" && this.state.expire5 !== ""){
            let ins = { name: this.state.name5, period_dt: this.state.date_view5}
            insurances_data.push(ins)
        }
        if(this.state.nickname === "") {
        } else {
          let url = base_url + 'api/insurances/add';
          fetch( url, {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                insurances: insurances_data,
                apartment_id: this.state.apartment_id,
                room_id: this.state.room_id,
                user_id: this.state.user_id
            }),
          })
          .then((response) => response.json())
          .then((responseJson) => {
            var data = responseJson;
            if(data.result === 1){
              Alert.alert('保険情報登録エラー', data.message);
            } else {
                if(this.state.token_data === null){
                    Alert.alert(
                      '',
                      'ユーザー登録されました。\nログインして下さい。',
                      [
                        {text: 'OK', onPress: () =>
                        this.props.navigation.dispatch(StackActions.reset({
                            index: 0,
                            actions: [
                              NavigationActions.navigate({
                                routeName: 'Login',
                              }),
                            ],}))
                        }
                      ],
                      { cancelable: false }
                    )
                } else if(this.state.room_id > 0){
                    this.props.navigation.dispatch(StackActions.reset({
                        index: 0,
                        actions: [
                          NavigationActions.navigate({
                            routeName: 'EventList',
                          }),
                        ],}))
                } else {
                    Alert.alert(
                      '',
                      'ユーザー登録されました。\nログインして下さい。',
                      [
                        {text: 'OK', onPress: () =>
                        this.props.navigation.dispatch(StackActions.reset({
                            index: 0,
                            actions: [
                              NavigationActions.navigate({
                                routeName: 'Login',
                              }),
                            ],}))
                        }
                      ],
                      { cancelable: false }
                    )
                }
            }
          })
          .catch((error) => {
            console.log(error);
            Alert.alert('保険情報の登録例外エラー', JSON.stringify(error));
          });
        }
      }
    
      _visibledPick1 = () => this.setState({ isVisible1: true });
      _hidePick1 = () => this.setState({ isVisible1: false });
  
      _visibledPick2 = () => this.setState({ isVisible2: true });
      _hidePick2 = () => this.setState({ isVisible2: false });
  
      _visibledPick3 = () => this.setState({ isVisible3: true });
      _hidePick3 = () => this.setState({ isVisible3: false });
  
      _visibledPick4 = () => this.setState({ isVisible4: true });
      _hidePick4 = () => this.setState({ isVisible4: false });
  
      _visibledPick5 = () => this.setState({ isVisible5: true });
      _hidePick5 = () => this.setState({ isVisible5: false });
  
      _datePicked1 = (date) => {
          this.setState({
              date1: date,
              date_view1: date.getFullYear() + '/' + (date.getMonth()+1) + '/' + date.getDate(),
          });
          this._hidePick1();
      };
      
      _datePicked2 = (date) => {
          this.setState({
              date2: date,
              date_view2: date.getFullYear() + '/' + (date.getMonth()+1) + '/' + date.getDate(),
          });
          this._hidePick2();
      };
      
      _datePicked3 = (date) => {
          this.setState({
              date3: date,
              date_view3: date.getFullYear() + '/' + (date.getMonth()+1) + '/' + date.getDate(),
          });
          this._hidePick3();
      };
      
      _datePicked4 = (date) => {
          this.setState({
              date4: date,
              date_view4: date.getFullYear() + '/' + (date.getMonth()+1) + '/' + date.getDate(),
          });
          this._hidePick4();
      };
      
      _datePicked5 = (date) => {
          this.setState({
              date5: date,
              date_view5: date.getFullYear() + '/' + (date.getMonth()+1) + '/' + date.getDate(),
          });
          this._hidePick5();
      };
      
    _clickBack(){
        Alert.alert(
            '',
            '保険情報を登録しなくても宜しいですか？',
            [
            {text: 'Cancel'},
            {text: 'Ok', onPress: () => 
            this.props.navigation.dispatch(StackActions.reset({
                index: 0,
                actions: [
                  NavigationActions.navigate({
                    routeName: 'Login',
                  }),
                ],}))},
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
                            <TouchableOpacity onPress={this._clickBack.bind(this)}>
                                <MaterialIcons name="chevron-left" size={34} color="#fff" />
                            </TouchableOpacity>
                        </View>
                        <View style={{flex: 4, alignItems: 'center', marginBottom: 0}}>
                            <Text style={{color: '#fff', fontSize: 18}}>{this.state.apartment_name}</Text>
                            <Text style={{color: '#fff', fontSize: 12}}>保険情報　登録</Text>
                        </View>
                        <View style={{flex: 1, alignItems: 'center', marginBottom: 0}}>
                        </View>
                    </View>
                    <ScrollView style={styles.container}>
                        <View style={styles.content}>
                        <RkText>保険名1</RkText>
                        <RkTextInput
                            value={this.state.name1}
                            onChangeText={(name1) => this.setState({name1: name1})}
                            style={styles.text}
                            />
                        <RkText>期限1</RkText>
                        <View style={[styles.expireDateBlock]}>
                            <DateTimePicker
                                isVisible={this.state.isVisible1}
                                onConfirm={this._datePicked1}
                                onCancel={this._hidePick1}
                                date={this.state.date1}
                                titleIOS="期限1"
                                cancelTextIOS="キャンセル"
                                confirmTextIOS="選択"
                            />
                            <View style={[styles.expireDateDelimiter]}>
                                <View style={[styles.expireDateInput, styles.balloon]}>
                                    <TouchableOpacity onPress={this._visibledPick1}>
                                    <RkText rkType='medium' style={styles.expireDateInnerInput}>
                                    {this.state.date_view1}
                                    </RkText>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                        <RkText>保険名2</RkText>
                        <RkTextInput 
                            value={this.state.name2}
                            onChangeText={(name2) => this.setState({name2: name2})}
                            style={styles.text}
                            />
                        <RkText>期限2</RkText>
                        <View style={[styles.expireDateBlock]}>
                            <DateTimePicker
                                isVisible={this.state.isVisible2}
                                onConfirm={this._datePicked2}
                                onCancel={this._hidePick2}
                                date={this.state.date2}
                                titleIOS="期限2"
                                cancelTextIOS="キャンセル"
                                confirmTextIOS="選択"
                            />
                            <View style={[styles.expireDateDelimiter]}>
                                <View style={[styles.expireDateInput, styles.balloon]}>
                                    <TouchableOpacity onPress={this._visibledPick2}>
                                        <RkText rkType='medium' style={styles.expireDateInnerInput}>
                                        {this.state.date_view2}
                                        </RkText>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                        <RkText>保険名3</RkText>
                        <RkTextInput
                            value={this.state.name3}
                            onChangeText={(name3) => this.setState({name3: name3})}
                            style={styles.text}
                            />
                        <RkText>期限3</RkText>
                        <View style={[styles.expireDateBlock]}>
                            <DateTimePicker
                                isVisible={this.state.isVisible3}
                                onConfirm={this._datePicked3}
                                onCancel={this._hidePick3}
                                date={this.state.date3}
                                titleIOS="期限3"
                                cancelTextIOS="キャンセル"
                                confirmTextIOS="選択"
                            />
                            <View style={[styles.expireDateDelimiter]}>
                                <View style={[styles.expireDateInput, styles.balloon]}>
                                    <TouchableOpacity onPress={this._visibledPick3}>
                                        <RkText rkType='medium' style={styles.expireDateInnerInput}>
                                        {this.state.date_view3}
                                        </RkText>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                        <RkText>保険名4</RkText>
                        <RkTextInput
                            value={this.state.name4}
                            onChangeText={(name4) => this.setState({name4: name4})}
                            style={styles.text}
                            />
                        <RkText>期限4</RkText>
                        <View style={[styles.expireDateBlock]}>
                            <DateTimePicker
                                isVisible={this.state.isVisible4}
                                onConfirm={this._datePicked4}
                                onCancel={this._hidePick4}
                                date={this.state.date4}
                                titleIOS="期限4"
                                cancelTextIOS="キャンセル"
                                confirmTextIOS="選択"
                            />
                            <View style={[styles.expireDateDelimiter]}>
                                <View style={[styles.expireDateInput, styles.balloon]}>
                                    <TouchableOpacity onPress={this._visibledPick4}>
                                        <RkText rkType='medium' style={styles.expireDateInnerInput}>
                                        {this.state.date_view4}
                                        </RkText>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                        <RkText>保険名5</RkText>
                        <RkTextInput
                            value={this.state.name5}
                            onChangeText={(name5) => this.setState({name5: name5})}
                            style={styles.text}
                            />
                        <RkText>期限5</RkText>
                        <View style={[styles.expireDateBlock]}>
                            <DateTimePicker
                                isVisible={this.state.isVisible5}
                                onConfirm={this._datePicked5}
                                onCancel={this._hidePick5}
                                date={this.state.date5}
                                titleIOS="期限5"
                                cancelTextIOS="キャンセル"
                                confirmTextIOS="選択"
                            />
                            <View style={[styles.expireDateDelimiter]}>
                                <View style={[styles.expireDateInput, styles.balloon]}>
                                    <TouchableOpacity onPress={this._visibledPick5}>
                                        <RkText rkType='medium' style={styles.expireDateInnerInput}>
                                        {this.state.date_view5}
                                        </RkText>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                        <RkButton onPress={ this._send.bind(this) }
                            rkType='medium large stretch'
                            contentStyle={{color: '#fff', fontSize: 20}} style={styles.save}>
                            SKIP OR 保険情報登録  ＞ 
                        </RkButton>
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
    },
    expireDateBlock: {
      justifyContent: 'space-between',
      marginTop: 10
    },
    expireDateInput: {
      flex: 1,
      marginVertical: 10,
    },
    expireDateInnerInput: {
      backgroundColor: '#fff',
      height: 50,
      width: 150,
      padding: 15
    },
    expireDateDelimiter: {
      flex: 0.04
    },
    balloon: {
    },
}));