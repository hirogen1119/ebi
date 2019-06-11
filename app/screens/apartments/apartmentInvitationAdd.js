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
  CheckBox,
  TouchableOpacity,
  FlatList,
  Platform,
  StyleSheet
} from 'react-native';
import {
  RkButton,
  RkText,
  RkTextInput,
  RkStyleSheet,
} from 'react-native-ui-kitten';
import {base_url, img_url, scale, scaleModerate, scaleVertical} from '../../utils/scale';
import Modal from "react-native-modal";
import Spinner from 'react-native-loading-spinner-overlay';
import {ImgPicker} from '../../components';
import RNPickerSelect from 'react-native-picker-select';
import { MaterialIcons } from '@expo/vector-icons';
import { NavigationActions, StackActions } from 'react-navigation';

const CustomHeader = ({ title }) => (
    <View style={styles.header}>
        <View style={{flex: 1, alignItems: 'center', marginBottom: 0,justifyContent: 'center'}}>
            <TouchableOpacity onPress={()=> 
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
        <View style={{flex: 4, alignItems: 'center', marginBottom: 0,justifyContent: 'center'}}>
            <Text style={{color: '#fff', fontSize: 22}}>{title}</Text>
        </View>
        <View style={{flex: 1, alignItems: 'center', marginBottom: 0}}>
        </View>
    </View>
  );
export class ApartmentInvitationAdd extends React.Component {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        this.inputRefs = {};
        this.state = {
            data: null,
            owned: 1,
            isLoading: true,
            apartment_name: "",
            apartment_id: 0,
            construction: 1,
            pet: '不可',
            facilities: 0,
            address: "",
            room_num: "",
            room_floor: "",
            floor_plan: "",
            control: "",
            completion_ym: "",
            floor_plan_num: 1,
            floor_plan_type: "K",
            total_units: 0,
            user_id: "",
            checked1: false,
            checked2: false,
            checked3: false,
            checked4: false,
            checked5: false,
            localUri: "",
            isModalVisible: false,
            apartments: [],
            image: null,
            default_flg: 1,
            apInfo: 'add',
            isReading: false,
            defaultImg: img_url + 'apartment/m_default.png',
            check_ap_name: '',
            check_ap_address: '',
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

        let url = base_url + 'api/apartments/room-add-params?user_id=' + user_id;
        fetch( url, {
            method: 'GET',
            headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            },
        })
        .then((response) => response.json())
        .then((responseJson) => {
            let data = responseJson
            
            if(data.message){

                Alert.alert('', data.message);
                this.setState({ isReading: false })
                this.props.navigation.goBack()

            } else {

                let params = data.params
                let apartment = data.apartment

                this.setState({
                    apartment_name: apartment.name,
                    apartment_id: apartment.id,
                    address: apartment.address,
                    isReading: false,
                    user_id: user_id,
                    zip: apartment.zip
                })
                
            }
        })
        .catch((error) => {
            console.log(error)
            Alert.alert('', 'マンション情報の取得で例外が発生しました。');
            this.setState({ isReading: false })
            this.props.navigation.goBack()
        })
    }

    _send(){

        if(this.state.room_floor === "") {
            Alert.alert("入力チェックエラー","階層を入力して下さい。")
        } else if(this.state.room_number === "") {
            Alert.alert("入力チェックエラー","部屋番号を入力して下さい。");
        } else if(this.state.floor_plan_type === "") {
            Alert.alert("入力チェックエラー","間取りタイプを入力して下さい。");
          } else if(this.state.owned === "") {
            Alert.alert("入力チェックエラー","所有形態（部屋）を選択して下さい。");
          } else {

            let url = base_url + 'api/apartments/room-add';

            fetch( url, {
                method: 'POST',
                headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    apartment_id: this.state.apartment_id,
                    room: {
                        num: this.state.room_number,
                        floor: this.state.room_floor,
                        floor_plan_num: this.state.floor_plan_num,
                        floor_plan: this.state.floor_plan_type,
                        owned: this.state.owned
                    },
                    user_id: this.state.user_id,
                }),
            })
            .then((response) => response.json())
            .then((responseJson) => {
                var data = responseJson;
                if(data.message){
                Alert.alert('マンション情報登録エラー', data.message);
                } else {
                    this.props.navigation.dispatch(StackActions.reset({
                      index: 0,
                      actions: [
                        NavigationActions.navigate({
                          routeName: 'InsuranceAdd',
                          params: { user_id: this.state.user_id, apartment_id: this.state.apartment_id,room_id: data.room_id}
                        }),
                      ],}))
                }
            })
            .catch((error) => {
                console.log(error);
                Alert.alert('マンション情報の登録例外エラー', JSON.stringify(error));
            })
        }
      }
    
    render() {
        return (
            <View style={{flex: 1, backgroundColor: '#000',paddingTop: (Platform.OS === 'android' ? 0 : 24),paddingBottom: (Platform.OS === 'android' ? 0 : 24)}}>
            <View style={{flex: 1, backgroundColor: '#fff0d1'}}>
              <View style={{ paddingBottom: 0, backgroundColor: '#000', flexDirection: 'row', height: 55,paddingTop: 10}}>
                <View style={{flex: 1, alignItems: 'center', marginBottom: 0,justifyContent: 'center'}}>
                  <TouchableOpacity onPress={()=> 
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
                <View style={{flex: 4, alignItems: 'center', marginBottom: 0,justifyContent: 'center'}}>
                  <Text style={{color: '#fff', fontSize: 22}}>マンション部屋　登録</Text>
                </View>
                <View style={{flex: 1, alignItems: 'center', marginBottom: 0}}>
                </View>
              </View>
            <ScrollView style={styles.container}>
                <View style={styles.content}>
                    <View>
                        <RkText>マンション名</RkText>
                        <RkText style={{marginBottom: 10,height:40}}>{this.state.apartment_name}</RkText>
                        <RkText>{(this.state.zip)? '〒' + this.state.zip:''}</RkText>
                        <RkText>マンション住所</RkText>
                        <RkText style={{marginBottom: 10}}>{this.state.address}</RkText>
                        <RkText>部屋の階 *</RkText>
                        <RkTextInput
                            value={this.state.room_floor}
                            onChangeText={(room_floor) => this.setState({room_floor: room_floor})}
                            style={styles.text}
                            keyboardType={'numeric'}
                            />
                        <RkText>部屋番号 *</RkText>
                        <RkTextInput
                            value={this.state.room_number}
                            onChangeText={(room_number) => this.setState({room_number: room_number})}
                            style={styles.text}
                            keyboardType={'numeric'}
                            />
                        <RkText>間取り</RkText>
                        <View style={{flexDirection:'row'}}>
                            <RkTextInput
                                value={this.state.floor_plan_num}
                                onChangeText={(floor_plan_num) => this.setState({floor_plan_num: floor_plan_num})}
                                style={[styles.text, styles.mini_text]}
                                keyboardType={'numeric'}
                                />
                            <View style={{marginTop: 10}}>
                                <RNPickerSelect
                                placeholder={{
                                    label: '選択して下さい',
                                    value: '',
                                }}
                                doneText={'選択'}
                                items={[
                                    {label:'R',value:'R'},
                                    {label:'K',value:'K'},
                                    {label:'DK',value:'DK'},
                                    {label:'LDK',value:'LDK'},
                                ]}
                                onValueChange={(value) => {
                                    this.setState({
                                    floor_plan_type: value,
                                    })
                                }}
                                onUpArrow={() => {
                                    this.inputRefs.name.focus();
                                }}
                                onDownArrow={() => {
                                    this.inputRefs.picker1.togglePicker();
                                }}
                                style={{ ...pickerSelectStyles }}
                                value={this.state.floor_plan_type}
                                ref={(el) => {
                                    this.inputRefs.picker = el;
                                }}
                                />
                            </View>
                        </View>
                        <RkText style={{marginBottom: 10}}>所有形態(部屋)</RkText>
                                <RNPickerSelect
                                    placeholder={{
                                        label: '選択して下さい',
                                        value: '',
                                    }}
                                    doneText={'選択'}
                                    items={[
                                        {label:'オーナー（居住）',value:1},
                                        {label:'オーナー（貸出）',value:2},
                                        {label:'入居（賃借）',value:3},
                                    ]}
                                    onValueChange={(value) => {
                                        this.setState({
                                            owned: value,
                                        })
                                    }}
                                    onUpArrow={() => {
                                        this.inputRefs.name.focus();
                                    }}
                                    onDownArrow={() => {
                                        this.inputRefs.picker2.togglePicker();
                                    }}
                                    style={{ ...pickerSelectStyles }}
                                    value={this.state.owned}
                                    ref={(el) => {
                                        this.inputRefs.picker = el;
                                    }}
                                />
                        <RkButton onPress={ this._send.bind(this) }
                            rkType='medium large stretch'
                            contentStyle={{color: '#fff', fontSize: 18}} style={styles.save}>
                            保険情報登録  ＞ 
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

let styles = RkStyleSheet.create(theme => ({
    container: {
        flex: 1,
        backgroundColor: '#fff0d1',
        
    },
    modal_text: {
        fontSize: 20
    },
    modal_flat: {
        padding: 8,
    },
    modal_view: {
        padding: 10,
        borderColor: "#ddd",
        borderWidth: 2,
        borderRadius: 5,
        marginBottom: 10,
        fontSize: 30,
    },
    modal_button: {
        padding: 5,
        borderColor: "#ddd",
        borderWidth: 2,
        borderRadius: 5,
        marginBottom: 10,
        fontSize: 14,
        alignItems: 'center',
        marginLeft: 5,
        marginRight: 5
    },
    clear: {
        backgroundColor: '#8fc15d',
        padding:10,
        width:150
    },
    cancel: {
        backgroundColor: '#abc7f4',
        padding:10,
        width:150
    },
    searchBtn: {
        backgroundColor: '#abc7f4'
    },
    smallButton: {
        padding: 5,
        borderColor: "#6fa1f2",
        borderWidth: 2,
        borderRadius: 5,
        marginBottom: 0,
        alignItems: 'center',
        marginLeft: 10,
        alignSelf: 'flex-end',
        flex: 1
    },
    container_modal: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },
    container_item: {
      backgroundColor: theme.colors.screen.scroll,
      paddingVertical: 8,
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
    check_view: {
        flexDirection: 'row',
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