import React from 'react';
import {
  View,
  Picker,
  Item,
  Text,
  Alert,
  ActivityIndicator,
  AsyncStorage,
  ScrollView,
  Button,
  TouchableOpacity,
  TextInput,
  Platform,
  StyleSheet
} from 'react-native';
import {
  RkButton,
  RkText,
  RkTextInput,
  RkStyleSheet,
} from 'react-native-ui-kitten';
import {base_url, scale, scaleVertical} from '../../utils/scale';
import { MaterialIcons } from '@expo/vector-icons';
import Spinner from 'react-native-loading-spinner-overlay';
import DateTimePicker from 'react-native-modal-datetime-picker';
import RNPickerSelect from 'react-native-picker-select';
import { NavigationActions, StackActions } from 'react-navigation';

export class AccountAdd extends React.Component {
    static navigationOptions = {
      header: null,
    };
    
    constructor(props) {
        super(props);
        this.inputRefs = {};
        let date = new Date()
        this.state = {
            isVisible1: false,
            date1: date,
            date_view1: date.getFullYear() + '/' + (date.getMonth()+1) + '/' + date.getDate(),
            isLoading: true,
            user_id: 0,
            amount: 0,
            use_comment: "",
            isReading: false,
            account_type: 1,
            deposit_type_id: 1,
            account_id: 0,
            deposit_title: '入',
            btnColor: 'green'
        }
    }

    componentDidMount() {

      AsyncStorage.getItem("token_data").then((token_data) => {

        if(token_data !== null){
          let token = JSON.parse(token_data)
          let user = JSON.parse(token.user)
          let url = base_url + 'api/accounts/get-edit-params?user_id=' + user.id + '&account_id=0'
  
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
              let ap_data = data.apartment

              let deposit_types_data = data.deposit_types
              let s = 0;
              let deposits = []
              for(key in deposit_types_data){
                  let data = deposit_types_data[key]
                  let deposit_type = {
                    label: data['name'],
                    value: data['id']
                  }
                  deposits.push(deposit_type)
                  s++;
              }
              this.setState({
                user_id: user.id,
                apartment_id: ap_data.id,
                apartment_name: ap_data.name,
                isLoading: false,
                deposits: deposits,
                role_id: data.role_id,
                deposit_types: data.deposit_types
              }) 
            }
          })
          .catch((error) => {
            Alert.alert('情報取得例外エラー', JSON.stringify(error));
            this.setState({
              isLoading: false,
            })
          })
        }
      })
    }

    _send(){

        if(this.state.amount === "") {
            this.setState({isReading: false})
            Alert.alert("入力チェックエラー","入出金金額を入力して下さい。");
        } else if(this.state.deposits_dt === "") {
            this.setState({isReading: false})
            Alert.alert("入力チェックエラー","日付を選択して下さい。");
        } else if(this.state.account_type === "") {
            this.setState({isReading: false})
            Alert.alert("入力チェックエラー","入・出金口座を選択して下さい。");
        } else if(this.state.deposit_type_id === "") {
            this.setState({isReading: false})
            Alert.alert("入力チェックエラー","取引内容を選択して下さい。");
        } else {
            let hiduke=new Date(); 

            let account = {
                user_id: this.state.user_id,
                apartment_id: this.state.apartment_id,
                amount: Number(this.state.amount.replace(/,/g, '')),
                deposits_dt: this.state.date_view1,
                use_comment: this.state.use_comment,
                account_type: this.state.account_type,
                deposit_type_id: this.state.deposit_type_id,
                accout_id: this.state.account_id
            }
            
            let url = base_url + 'api/accounts/add';
            fetch( url, {
                method: 'POST',
                headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                },
                body: JSON.stringify(account),
            })
            .then((response) => response.json())
            .then((responseJson) => {
                var data = responseJson;
                if(data.message){
                    this.setState({isReading: false})
                Alert.alert('口座情報登録エラー', data.message);
                } else {
                    this.setState({isReading: false})
                    this.props.navigation.dispatch(StackActions.reset({
                        index: 0,
                        actions: [
                          NavigationActions.navigate({
                            routeName: 'AccountList',
                            params: { role_id: this.state.role_id },
                          }),
                        ],}))
                }
            })
            .catch((error) => {
                console.log(error);
                this.setState({isReading: false})
                Alert.alert('口座情報の登録例外エラー', JSON.stringify(error));
            })
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

    toLocaleString(date, format){
      
      format = format.replace(/yyyy/g, date.getFullYear());
      format = format.replace(/MM/g, ('0' + (date.getMonth() + 1)).slice(-2));
      format = format.replace(/dd/g, ('0' + date.getDate()).slice(-2));

      return format;
    }

    _visibledPick1 = () => this.setState({ isVisible1: true });
    _hidePick1 = () => this.setState({ isVisible1: false });

    _datePicked1 = (date) => {
        this.setState({
            date1: date,
            date_view1: date.getFullYear() + '/' + (date.getMonth()+1) + '/' + date.getDate(),
        });
        this._hidePick1();
    };
    
    _changeDepositType(type){
        if(!type){
            return
        }
        let depo_type = 0
        let deposit_types = this.state.deposit_types
        for(key in deposit_types){
            let d = deposit_types[key]
            if(d.id === type){
                depo_type = d.dp_type
            }
        }
        this.setState({
            deposit_type_id: type,
            deposit_title: (depo_type === 0)? '入': '出',
            btnColor: (depo_type === 0)? 'green': 'orange'
        })
    }

    _numberKanma(num){
        let n = Number(num.replace(/,/g, ''))
        let kanma_number = String(n).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
        this.setState({amount: kanma_number})
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
                      <Text style={{color: '#fff', fontSize: 12}}>口座情報追加</Text>
                    </View>
                    <View style={{flex: 1, alignItems: 'center', marginBottom: 0}}>
                    </View>
                  </View>
                    <ScrollView style={styles.container}>
                        <View style={styles.content}>
                        <View>
                            <RkText style={{marginBottom: 10}}>{this.state.deposit_title}金口座</RkText>
                            
                            <RNPickerSelect
                            placeholder={{
                                label: '選択して下さい',
                                value: '',
                            }}
                            doneText={'選択'}
                            items={[
                                {label: '修繕積立金',value: 1},
                                {label: '管理費',value: 2},
                                {label: 'その他',value: 3},
                            ]}
                            onValueChange={(value) => {
                                this.setState({
                                    account_type: value,
                                })
                            }}
                            onUpArrow={() => {
                                this.inputRefs.name.focus();
                            }}
                            onDownArrow={() => {
                                this.inputRefs.picker1.togglePicker();
                            }}
                            style={{ ...pickerSelectStyles }}
                            value={this.state.account_type}
                            ref={(el) => {
                                this.inputRefs.picker = el;
                            }}
                            />
                            <RkText style={{marginBottom: 10}}>取引内容</RkText>
                            <RNPickerSelect
                            placeholder={{
                                label: '選択して下さい',
                                value: '',
                            }}
                            doneText={'選択'}
                            items={this.state.deposits}
                            onValueChange={(value) => {
                                this._changeDepositType(value)
                            }}
                            onUpArrow={() => {
                                this.inputRefs.name.focus();
                            }}
                            onDownArrow={() => {
                                this.inputRefs.picker2.togglePicker();
                            }}
                            style={{ ...pickerSelectStyles }}
                            value={this.state.deposit_type_id}
                            ref={(el) => {
                                this.inputRefs.picker = el;
                            }}
                            />
                            <RkText>{this.state.deposit_title}金額 * </RkText>
                            <TextInput
                                onChangeText={(amount) => this._numberKanma(amount)}
                                value={this.state.amount}
                                style={[styles.text,{textAlign: 'right'}]}
                                underlineColorAndroid="transparent"
                                keyboardType={'numeric'}
                                />
                            <RkText>日付</RkText>
                            <View style={[styles.expireDateBlock]}>
                                <DateTimePicker
                                    isVisible={this.state.isVisible1}
                                    onConfirm={this._datePicked1}
                                    onCancel={this._hidePick1}
                                    date={this.state.date1}
                                    titleIOS="日付"
                                    cancelTextIOS="キャンセル"
                                    confirmTextIOS="選択"
                                />
                                <View style={[styles.expireDateDelimiter]}>
                                    <View style={[styles.expireDateInput, styles.balloon]}>
                                        <TouchableOpacity onPress={this._visibledPick1}>
                                        <Text
                                            disabled={true}
                                            style={[styles.text,{paddingTop: 10}]}
                                        >{this.state.date_view1}</Text>
                                        
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                            <View style={{marginTop: 30}} >
                                <RkButton onPress={ this._send.bind(this) }
                                rkType='medium stretch'
                                contentStyle={{color: '#fff', fontSize: 20,backgroundColor: this.state.btnColor}}
                                style={{backgroundColor: this.state.btnColor}}>
                                {this.state.deposit_title}金
                                </RkButton>
                            </View>
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
    select_picker: {
        marginBottom: 15,
        marginBottom: 10,
        backgroundColor: '#fff',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#bdc3c7',
        overflow: 'hidden',
    },
    text: {
        marginTop: 10,
        marginBottom: 15,
        height: 50,
        backgroundColor: '#fff',
        color: '#000',
        padding: 5,
        fontSize: 18,
        paddingLeft: 15,
        width: 150,
        textAlign: 'center',
        paddingRight: 15,
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 4,
        backgroundColor: 'white'
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
    horizontal: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 10
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