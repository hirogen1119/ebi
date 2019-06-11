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
  StyleSheet,
  Switch
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
import { colors } from 'react-native-elements';
import { MaterialIcons } from '@expo/vector-icons';
import { NavigationActions, StackActions } from 'react-navigation';

const CustomHeader = ({ title }) => (
    <View style={styles.header}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
export class ApartmentAdd extends React.Component {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        this.renderItem = this._renderItem.bind(this)
        this.renderZipItem = this._renderZipItem.bind(this)
        const navParams = this.props.navigation.state.params;
        this.inputRefs = {};

        let now = new Date();
        let nowyear = now.getFullYear()
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
            control: 1,
            completion_ym: "",
            floor_plan_num: '',
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
            pref: 1,
            pref_view: '',
            isSelectAp: false,
            user_id: navParams.user_id,
            year: nowyear.toString(),
            month: '01',
            isZipAddressSelectModal: false,
            pref_datas: [],
            owneds: [],
            room_types: [],
            years: [],
            months: [],
            controls: [],
            constructions: [],
            pets: [],
            zip_datas: []
        }
        this.setImage = this.setImage.bind(this)
        this.send = this._send.bind(this)
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
        
      let url = ""

      AsyncStorage.getItem("token_data").then((token_data) => {
        url = base_url + 'api/apartments/add-get-params?user_id=' + this.state.user_id;
        if(token_data !== null){
          let token = JSON.parse(token_data)
          let user = JSON.parse(token.user)
          headers = {
            Accept: 'application/json',
            Authorization: 'Bearer ' + token.access_token,
          }
        } else {
          headers = {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          }
        }

        fetch( url, {
          method: 'GET',
          headers: headers,
        })
        .then((response) => response.json())
        .then((responseJson) => {
          var data = responseJson;
          if(data.message){
            Alert.alert('', 'パラメータの取得に失敗しました。');
            this.setState({ isLoading: false })
          } else {
            let controls = [];
            let constructions = [];
            let prefs = [];
            let facilities = [];
            
            let controls_data = data.params['controls']
            let h = 0;
            for(key in controls_data){
              let data = controls_data[key]
              let control = {
                label: data['name'],
                value: data['id']
              }
              controls.push(control)
              h++;
            }
            let prefs_data = data.params['prefs']
            let p = 1;
            for(key in prefs_data){
              let data = prefs_data[key]
              let pref = {
                label: data['name'],
                value: data['id']
              }
              prefs.push(pref)
              p++;
            }
            let constructions_data = data.params['constructions']
            let s = 0;
            for(key in constructions_data){
              let data = constructions_data[key]
              let construction = {
                label: data['name'],
                value: data['id']
              }
              constructions.push(construction)
              s++;
            }
            let facilities_data = data.params['facilities']
            let f = 0;
            for(key in facilities_data){
              let data = facilities_data[key]
              let facilitie = {
                label: data['name'],
                value: data['id']
              }
              facilities.push(facilitie)
              f++;
            }

            let now = new Date();
            let nowyear = now.getFullYear()
            let years = []
            for(var y = 1920;y<=nowyear;y++){
              let year = {
                label: y.toString(),
                value: y.toString()
              }
              years.push(year)
            }
            let months = []
            for(var m = 1;m<=12;m++){
              let month_str = ''
              if(m<10){
                month_str = '0'+m.toString()
              } else {
                month_str = m.toString()
              }
              let month = {
                label: month_str,
                value: month_str
              }
              months.push(month)
            }
            let room_types = [
              {label: 'R',value: 'R'},
              {label: 'K',value: 'K'},
              {label: 'DK',value: 'DK'},
              {label: 'LDK',value: 'LDK'},
            ]
            let pets = [
              {label: '不可',value: '不可'},
              {label: '可',value: '可'},
            ]
            let owneds = [
              {label: 'オーナー（居住）',value: 1},
              {label: 'オーナー（貸出）',value: 2},
              {label: '入居（賃借）',value: 3},
            ]

            if(data.room && data.room.role_id !== 1){
              this.setState({
                isSelectAp: true,
                apartment_name: data.apartment.name,
                pref_view: data.apartment.pref.name,
                address: data.apartment.address,
              })
            }
            this.setState({
              isLoading: false,
              controls: controls,
              constructions: constructions,
              pets: pets,
              prefs: prefs,
              facilities: facilities,
              user_role: data.params['role_id'],
              room: data.room,
              apartment: data.apartment,
              years: years,
              months: months,
              pref_datas: prefs,
              owneds: owneds,
              room_types: room_types,
            })
          }
        })
        .catch((error) => {
          console.log(error);
          Alert.alert('', '情報の取得で例外が発生しました。');
          this.setState({ isLoading: false })
          this.props.navigationAction.goback()
        })
      })
    }

    isNumber(val){
      let regex = new RegExp(/^[0-9]+$/);
      return regex.test(val);
    }

    _send(){
      let total_units_check = this.isNumber(this.state.total_units)
      let zip_data = this.state.zip
      if(this.state.apartment_name === "") {
        Alert.alert("入力チェックエラー","マンション名を入力して下さい。")
      } else if(!zip_data.match(/^\d{3}[-]\d{4}$|^\d{7}$/)) {
        Alert.alert("入力チェックエラー","正しい郵便番号を入力してください。");
      } else if(this.state.pref === "") {
        Alert.alert("入力チェックエラー","都道府県を選択して下さい。");
      } else if(this.state.address === "") {
        Alert.alert("入力チェックエラー","マンション住所を入力して下さい。")
      } else if(this.state.room_floor === "") {
        Alert.alert("入力チェックエラー","階層を入力して下さい。");
      } else if(this.state.room_num === "") {
        Alert.alert("入力チェックエラー","部屋番号を入力して下さい。");
      } else if(this.state.floor_plan_num === "") {
        Alert.alert("入力チェックエラー","間取りを入力して下さい。");
      } else if(this.state.year === "" || this.state.month === "") {
        Alert.alert("入力チェックエラー","竣工年・月を選択して下さい。");
      } else if(this.state.control === "") {
        Alert.alert("入力チェックエラー","管理形態を選択して下さい。");
      } else if(this.state.construction === "") {
        Alert.alert("入力チェックエラー","構造して下さい。");
      } else if(this.state.pet === "") {
        Alert.alert("入力チェックエラー","ペットの可・不可を選択して下さい。");
      } else if(this.state.floor_plan_type === "") {
        Alert.alert("入力チェックエラー","間取りタイプを入力して下さい。");
      } else if(this.state.owned === "") {
        Alert.alert("入力チェックエラー","所有形態（部屋）を選択して下さい。");
      } else if(!this.state.isSelectAp && this.state.total_units === 0) {
        Alert.alert("入力チェックエラー","総戸数を入力して下さい。");
      } else if(!this.state.isSelectAp && !total_units_check) {
        Alert.alert("入力チェックエラー","総戸数は半角数値で入力して下さい。");
      } else {

        if(Platform.OS !== 'ios'){this.setState({isReading: true})}
        
        let apartment = null
        let facilities = []
        if(this.state.checked1){
          facilities.push(1)
        }
        if(this.state.checked2){
          facilities.push(2)
        }
        if(this.state.checked3){
          facilities.push(3)
        }
        if(this.state.checked4){
          facilities.push(4)
        }
        if(this.state.checked5){
          facilities.push(5)
        }
        let ap_id = 0
        if((this.state.check_ap_name !== '' && this.state.check_ap_address !== '' )
          && (this.state.check_ap_name !== this.state.apartment_name
          || this.state.check_ap_address !== this.state.address)){
            ap_id = 0
        } else {
          ap_id = this.state.apartment_id
        }
        let zip = ''
        if(zip_data.match(/^\d{7}$/)){
          zip = zip_data.slice(0, 3) + '-' + zip_data.slice(3);
        } else {
          zip = zip_data
        }
        apartment = {
          id: this.state.apartment_id,
          completion_ym: this.state.year + this.state.month,
          name: this.state.apartment_name,
          address: this.state.address,
          control: this.state.control,
          construction: this.state.construction,
          total_units: this.state.total_units,
          pet: this.state.pet,
          pref: this.state.pref,
          facilities: facilities,
          zip: zip
        }
        
        console.log('##### apartment #####')
        console.log(apartment)
        let room = {
          num: this.state.room_num,
          floor: this.state.room_floor,
          floor_plan_num: this.state.floor_plan_num ,
          floor_plan: this.state.floor_plan_type,
          owned: this.state.owned
        }
        let formData = new FormData();
        let file = {
            uri: this.state.localUri,
            name: this.state.filename,
            type: this.state.img_type
        }

        formData.append("image", file)
        formData.append("apartment", JSON.stringify(apartment))
        formData.append("room", JSON.stringify(room))
        formData.append("user_id", this.state.user_id)
        formData.append("default_flg", this.state.default_flg)
        let url = ''
        if(this.state.isSelectAp){
          url = base_url + 'api/apartments/allreadyApartmentRoomAdd';
        } else {
          url = base_url + 'api/apartments/newAdd';
        }
            
        fetch( url, {
          method: 'POST',
          body: formData
        })
        .then(response => {
          return response.json()})
        .then((responseJson) => {
          var data = responseJson
                
          if(data.result === 1){
            Alert.alert('', data.message);
            this.setState({isReading: false})
          } else {
            if(data.matchApFlg===1){
              Alert.alert(
                '',
                '同じマンション名、住所のマンションに登録しました。\nマンションの管理者が承認されるとご利用できます。',
                [
                  {text: 'OK', onPress: () => 
                  this.props.navigation.dispatch(StackActions.reset({
                      index: 0,
                      actions: [
                        NavigationActions.navigate({
                          routeName: 'InsuranceAdd',
                          params: {apartment_name: this.state.apartment_name, apartment_id: data.apartment_id, room_id: data.room_id }
                        }),
                      ],}))
                  },
                ],
                { cancelable: false }
              )
              this.setState({isReading: false})
            } else if(this.state.isSelectAp){
              Alert.alert(
                '',
                'マンションを登録しました。\n登録したマンションの管理者が承認されるとご利用できます。',
                [
                  {text: 'OK', onPress: () => 
                  this.props.navigation.dispatch(StackActions.reset({
                      index: 0,
                      actions: [
                        NavigationActions.navigate({
                          routeName: 'InsuranceAdd',
                          params: { apartment_id: data.apartment_id, room_id: data.room_id }
                        }),
                      ],}))
                    },
                ],
                { cancelable: false }
              )
              this.setState({isReading: false})
            } else {
              this.props.navigation.dispatch(StackActions.reset({
                  index: 0,
                  actions: [
                    NavigationActions.navigate({
                      routeName: 'InsuranceAdd',
                      params: { apartment_id: data.apartment_id, room_id: data.room_id }
                    }),
                  ],}))
              this.setState({isReading: false})
            }
          }
        })
        .catch((error) => {
          console.log(error);
          this.setState({isReading: false})
          Alert.alert('', 'マンション情報の登録で例外が発生しました。')
        })
      }
    }
    
    _changeAp(index){
      let ap = this.state.apartments_data[index]
      this.setState({address: "", apartment_id: 0})
      this.setState({
        apartment_name: ap['name'],
        address: ap['address'],
        apartment_id: ap['id'],
        apInfo: 'exist',
        pref: ap['pref'],
      })
    }

    _checked(num){
      switch(num){
        case 1:
          return "機械式駐車場"
          break
        case 2:
          return "平面駐車場"
          break
        case 3:
          return "エレベーター"
          break
        case 4:
          return "オートロック式エントランス"
          break
        case 5:
          return "宅配ボックス"
          break
      }
    }

    _checkApName(){
      if(this.state.apartment_name === "" && this.state.address === ""){
        Alert.alert('','マンション名、住所どちらかを入力して下さい。')
        return
      }
      
      if(Platform.OS !== 'ios'){this.setState({isReading: true})}

      let url = base_url + 'api/apartments/search?name=' + this.state.apartment_name + '&address=' + this.state.address
        
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

          Alert.alert('', data.message);
          this.setState({isReading: false})

        } else if(data.result === 0) {

          let datas = []
          let apartments = data.apartments
          for(key in apartments){
            let ap = apartments[key];
            let data_ap = {
              id: ap['id'],
              name: ap['name'],
              address: ap['address'],
              pref_id: ap['pref_id'],
            }
            datas.push(data_ap)
          }
          this.setState({ datas: datas, isModalVisible: true, isReading: false })
        }

      })
      .catch((error) => {

        console.log(error);
        Alert.alert('', 'マンション情報の検索で例外が発生しました。');
        this.setState({ isReading: false, isModalVisible: true })

      })
    }

    _toggleModal = () =>
        this.setState({ isModalVisible: !this.state.isModalVisible })

    _toggleZipModal = () =>
      this.setState({ isZipAddressSelectModal: !this.state.isZipAddressSelectModal })

    _apItemClick(item){

      this.setState({
        apartment_id: item.id,
        apartment_name: item.name,
        check_ap_name: item.name,
        check_ap_address: item.address,
        address: item.address,
        pref: item.pref_id,
        check_pref: item.pref_id,
        apInfo: "now",
        isSelectAp: true,
      })
      this._toggleModal()
    }

    _zipItemClick(item){
      this.setState({
        address: item.address,
        pref: parseInt(item.prefcode),
        check_pref: parseInt(item.prefcode),
        zip: item.zipcode,
      })
      this._toggleZipModal()
    }

    _searchClear(){
      this.setState({
        apartment_name: "",
        apartment_id: 0,
        address: "",
        isModalVisible: false,
        apInfo: 'add',
        isSelectAp: false
      })
    }

    _renderItem(info) {

      return (

        <TouchableOpacity
          delayPressIn={70}
          activeOpacity={0.8}
          onPress={ this._apItemClick.bind(this,info.item)}>
            <View style={styles.modal_view}>
              <Text style={styles.modal_text}>{`${info.item.name}`}</Text>
              <Text style={[styles.modal_text,{fontSize:12}]}>{`${info.item.address}`}</Text>
            </View>
        </TouchableOpacity>
      )
    }
    
    _renderZipItem(info) {

      return (

        <TouchableOpacity
          delayPressIn={70}
          activeOpacity={0.8}
          onPress={ this._zipItemClick.bind(this,info.item)}>
            <View style={styles.modal_view}>
              <Text style={styles.modal_text}>{`${info.item.address}`}</Text>
            </View>
        </TouchableOpacity>

      )
    }
    
    _renderCheck1(){
      if(Platform.OS === 'ios'){
        return (
          <View style={styles.check_view}>
          <Switch
            value={this.state.checked1}
            onValueChange={() => this.setState({ checked1: !this.state.checked1 })}
          />
          <Text style={{marginTop: 5,fontSize: 20,marginLeft: 10}}>機械式駐車場</Text>
          </View>
        )
      } else {
        return (
          <View style={styles.check_view}>
            <CheckBox
              title='機械式駐車場'
              value={this.state.checked1}
              onValueChange={() => this.setState({ checked1: !this.state.checked1 })}
            /><Text style={{marginTop: 5}}>機械式駐車場</Text>
          </View>
        )
      }
    }

    _renderCheck2(){
        if(Platform.OS === 'ios'){
            return (
                <View style={styles.check_view}>
                <Switch
                  value={this.state.checked2}
                  onValueChange={() => this.setState({ checked2: !this.state.checked2 })}
                />
                <Text style={{marginTop: 5,fontSize: 20,marginLeft: 10}}>平面駐車場</Text>
                </View>
            )
        } else {
            return (
                <View style={styles.check_view}>
                <CheckBox
                    title="平面駐車場"
                    value={this.state.checked2}
                    onValueChange={() => this.setState({ checked2: !this.state.checked2 })}
                /><Text style={{marginTop: 5}}>平面駐車場</Text>
                </View>
            )
        }
    }

    _renderCheck3(){
        if(Platform.OS === 'ios'){
            return (
                <View style={styles.check_view}>
                <Switch
                  value={this.state.checked3}
                  onValueChange={() => this.setState({ checked3: !this.state.checked3 })}
                />
                <Text style={{marginTop: 5,fontSize: 20,marginLeft: 10}}>エレベーター</Text>
                </View>
            )
        } else {
            return (
                <View style={styles.check_view}>
                <CheckBox
                    title="エレベーター"
                    value={this.state.checked3}
                    onValueChange={() => this.setState({ checked3: !this.state.checked3 })}
                /><Text style={{marginTop: 5}}>エレベーター</Text>
                </View>
            )
        }
    }

    _renderCheck4(){
        if(Platform.OS === 'ios'){
            return (
                <View style={styles.check_view}>
                <Switch
                  value={this.state.checked4}
                  onValueChange={() => this.setState({ checked4: !this.state.checked4 })}
                />
                <Text style={{marginTop: 5,fontSize: 20,marginLeft: 10}}>オートロック式エントランス</Text>
                </View>
            )
        } else {
            return (
                <View style={styles.check_view}>
                <CheckBox
                    title="オートロック式エントランス"
                    value={this.state.checked4}
                    onValueChange={() => this.setState({ checked4: !this.state.checked4 })}
                /><Text style={{marginTop: 5}}>オートロック式エントランス</Text>
                </View>
            )
        }
    }

    _renderCheck5(){
        if(Platform.OS === 'ios'){
            return (
                <View style={styles.check_view}>
                <Switch
                  value={this.state.checked5}
                  onValueChange={() => this.setState({ checked5: !this.state.checked5 })}
                />
                <Text style={{marginTop: 5,fontSize: 20,marginLeft: 10}}>宅配ボックス</Text>
                </View>
            )
        } else {
            return (
                <View style={styles.check_view}>
                <CheckBox
                    title="宅配ボックス"
                    value={this.state.checked5}
                    onValueChange={() => this.setState({ checked5: !this.state.checked5 })}
                /><Text style={{marginTop: 5}}>宅配ボックス</Text>
                </View>
            )
        }
    }

    _renderApAdd(){
      if(!this.state.isSelectAp){
        return (
          <View>
            <RkText>施工年月 ＊</RkText>
              <View style={{flexDirection: 'row'}}>
                <RNPickerSelect
                  placeholder={{
                    label: '選択して下さい',
                    value: '',
                  }}
                  doneText={'選択'}
                  items={this.state.years}
                  onValueChange={(value) => {
                    this.setState({
                      year: value,
                    })
                  }}
                  onUpArrow={() => {
                    this.inputRefs.name.focus();
                  }}
                  onDownArrow={() => {
                    this.inputRefs.picker1.togglePicker();
                  }}
                  style={{ ...pickerSelectStyles }}
                  value={this.state.year}
                  ref={(el) => {
                    this.inputRefs.picker = el;
                  }}
                />
                <RNPickerSelect
                  placeholder={{
                    label: '選択して下さい',
                    value: '',
                  }}
                  doneText={'選択'}
                  items={this.state.months}
                  onValueChange={(value) => {
                    this.setState({
                      month: value,
                    })
                  }}
                  onUpArrow={() => {
                    this.inputRefs.name.focus();
                  }}
                  onDownArrow={() => {
                    this.inputRefs.picker3.togglePicker();
                  }}
                  style={{ ...pickerSelectStyles }}
                  value={this.state.month}
                  ref={(el) => {
                    this.inputRefs.picker = el;
                  }}
                />
              </View>
                <RkText style={{marginBottom: 10}}>管理形態</RkText>
                <RNPickerSelect
                  placeholder={{
                    label: '選択して下さい',
                    value: '',
                  }}
                  doneText={'選択'}
                  items={this.state.controls}
                  onValueChange={(value) => {
                    this.setState({
                      control: value,
                    })
                  }}
                  onUpArrow={() => {
                    this.inputRefs.name.focus();
                  }}
                  onDownArrow={() => {
                    this.inputRefs.picker4.togglePicker();
                  }}
                  style={{ ...pickerSelectStyles }}
                  value={this.state.control}
                  ref={(el) => {
                    this.inputRefs.picker = el;
                  }}
                />
                <RkText>総戸数 ＊</RkText>
                <RkTextInput 
                  onChangeText={(total_units) => this.setState({total_units: total_units})}
                  style={styles.text}
                  keyboardType={'numeric'}
                />
                <RkText style={{marginBottom: 10}}>構造</RkText>
                <RNPickerSelect
                  placeholder={{
                    label: '選択して下さい',
                    value: '',
                  }}
                  doneText={'選択'}
                  items={this.state.constructions}
                  onValueChange={(value) => {
                    this.setState({
                      construction: value,
                    })
                  }}
                  onUpArrow={() => {
                    this.inputRefs.name.focus();
                  }}
                  onDownArrow={() => {
                    this.inputRefs.picker5.togglePicker();
                  }}
                  style={{ ...pickerSelectStyles }}
                  value={this.state.construction}
                  ref={(el) => {
                    this.inputRefs.picker = el;
                  }}
                />
                <RkText style={{marginBottom: 10}}>ペット</RkText>
                <RNPickerSelect
                  placeholder={{
                    label: '選択して下さい',
                    value: '',
                  }}
                  doneText={'選択'}
                  items={this.state.pets}
                  onValueChange={(value) => {
                    this.setState({
                      pet: value,
                    })
                  }}
                  onUpArrow={() => {
                    this.inputRefs.name.focus();
                  }}
                  onDownArrow={() => {
                    this.inputRefs.picker6.togglePicker();
                  }}
                  style={{ ...pickerSelectStyles }}
                  value={this.state.pet}
                  ref={(el) => {
                    this.inputRefs.picker = el;
                  }}
                />
                <RkText style={{marginBottom: 10}}>付帯設備</RkText>
                  {this._renderCheck1()}
                  {this._renderCheck2()}
                  {this._renderCheck3()}
                  {this._renderCheck4()}
                  {this._renderCheck5()}
                <RkText>マンションアイコン</RkText>
                <ImgPicker setImage={this.setImage} imgUrl={this.state.defaultImg} />
          </View>
        )
      }
    }

    _apNameChange(name){
      this.setState({apartment_name: name})
      if(this.state.check_ap_name && name !== this.state.check_ap_name){
        this.setState({isSelectAp: false})
      } else if(this.state.check_ap_name && name === this.state.check_ap_name
        && this.state.check_ap_address === this.state.address
        && this.state.check_pref === this.state.pref){
        this.setState({isSelectAp: true})
      }
    }

    _apAddressChange(address){
      this.setState({address: address})
      if(this.state.check_ap_address && address !== this.state.check_ap_address){
        this.setState({isSelectAp: false})
      } else if(this.state.check_ap_address && address === this.state.check_ap_address
        && this.state.check_ap_name === this.state.apartment_name
        && this.state.check_pref === this.state.pref){
        this.setState({isSelectAp: true})
      }
    }

    _apPrefChange(pref){
      this.setState({pref: pref})
      if(this.state.check_pref && pref !== this.state.check_pref){
        this.setState({isSelectAp: false})
      } else if(this.state.check_pref && pref === this.state.check_pref
        && this.state.check_ap_name === this.state.apartment_name
        && this.state.check_ap_address === this.state.address){
        this.setState({isSelectAp: true})
      }
    }

    _zipChange(zip){
      if(zip.length < 7){
        return
      }
      if(Platform.OS !== 'ios'){this.setState({isReading: true})}
      
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
          this.setState({isReading: false})

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
            this.setState({ zip_datas: zip_datas, isZipAddressSelectModal: true, isReading: false })
          } else {
            let zip_data = results[0]
            this.setState({
              address: zip_data.address2 + zip_data.address3,
              pref: parseInt(zip_data.prefcode),
              zip: zip_data.zipcode,
              isReading: false
            })
          }
        }
      })
      .catch((error) => {

        console.log(error);
        Alert.alert('', 'マンション情報の検索で例外が発生しました。')
        this.setState({ isReading: false, isZipAddressSelectModal: false })

      })
    }

    renderApInfo(){
      if(!this.state.apartment){
        return (
          <View>
            <RkText style={{fontSize: 12,marginBottom: 10}}>マンション名、住所を一部入力で検索することができます。</RkText>
            <View style={{flexDirection: 'row'}}>
              <RkText style={{flex:2,paddingTop: 10}}>マンション名 ＊</RkText>
              <TouchableOpacity onPress={this._checkApName.bind(this)}>
                <View style={[styles.smallButton,styles.searchBtn]}>
                  <Text style={{color: '#FFF', fontSize:16}}>マンション検索</Text>
                </View>
              </TouchableOpacity>
            </View>
            <RkTextInput
              onChangeText={(apartment_name) => this._apNameChange(apartment_name)}
              style={styles.text}
            />
            <RkText>郵便番号 ＊</RkText>
            <RkTextInput 
              onChangeText={(zip) => this._zipChange(zip)}
              style={styles.text}
            />
            <RkText style={{marginBottom: 10}}>都道府県</RkText>
            <RNPickerSelect
              placeholder={{
                label: '選択して下さい',
                value: null,
              }}
              doneText={'選択'}
              items={this.state.pref_datas}
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
            <RkText>マンション住所(都道府県以降) ＊</RkText>
            <RkTextInput 
              onChangeText={(address) => this._apAddressChange(address)}
              style={styles.text}
            />
          </View>
        )
      } else {
        return (
          <View>
            <RkText style={{fpaddingTop: 10}}>マンション名 : </RkText>
            <RkText style={{paddingTop: 10, marginBottom: 15}}>{this.state.apartment_name}</RkText>
            <RkText style={{paddingTop: 10}}>都道府県 : </RkText>
            <RkText style={{paddingTop: 10, marginBottom: 15}}>{this.state.pref_view}</RkText>
            <RkText style={{paddingTop: 10}}>マンション住所(都道府県以降) : </RkText>
            <RkText style={{paddingTop: 10, marginBottom: 15}}>{this.state.address}</RkText>
          </View>
        )
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
                  <Text style={{color: '#fff', fontSize: 22}}>マンション　登録</Text>
                </View>
                <View style={{flex: 1, alignItems: 'center', marginBottom: 0}}>
                </View>
              </View>
              <ScrollView style={styles.container}>
                <View style={styles.content}>
                {this.renderApInfo()}

                  <View>
                    <RkText>部屋の階 ＊</RkText>
                      <RkTextInput 
                        onChangeText={(room_floor) => this.setState({room_floor: room_floor})}
                        style={styles.text}
                        keyboardType={'numeric'}
                      />
                      <RkText>部屋番号 ＊</RkText>
                      <RkTextInput 
                        onChangeText={(room_num) => this.setState({room_num: room_num})}
                        style={styles.text}
                        keyboardType={'numeric'}
                      />
                        <RkText>間取り ＊</RkText>
                        <View style={{flexDirection:'row'}}>
                          <RkTextInput 
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
                              items={this.state.room_types}
                              onValueChange={(value) => {
                                this.setState({
                                  floor_plan_type: value,
                                })
                              }}
                              onUpArrow={() => {
                                this.inputRefs.name.focus();
                              }}
                              onDownArrow={() => {
                                this.inputRefs.picker6.togglePicker();
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
                          items={this.state.owneds}
                          onValueChange={(value) => {
                            this.setState({
                              owned: value,
                            })
                          }}
                          onUpArrow={() => {
                            this.inputRefs.name.focus();
                          }}
                          onDownArrow={() => {
                            this.inputRefs.picker7.togglePicker();
                          }}
                          style={{ ...pickerSelectStyles }}
                          value={this.state.owned}
                          ref={(el) => {
                            this.inputRefs.picker = el;
                          }}
                        />
                        {this._renderApAdd()}
                        <RkButton onPress={ this._send.bind(this) }
                          rkType='medium medium stretch'
                          contentStyle={{color: '#fff', fontSize: 20}} style={styles.save}>
                            STEP3 保険情報登録 ＞
                        </RkButton>
                    </View>
                </View>
                <View style={styles.container_modal}>
                  <Modal
                    isVisible={this.state.isModalVisible}
                    animationInTiming={800}
                    animationOutTiming={800}
                    backdropTransitionInTiming={800}
                    backdropTransitionOutTiming={800}
                    >
                    <View style={styles.container_item}>
                      <View style={{padding: 10}}>
                        <Text>同名のマンションがあります。</Text><Text>一覧からクリックして選択して下さい。</Text>
                      </View>
                      <FlatList
                      data={this.state.datas}
                      renderItem={this.renderItem}
                      style={styles.modal_flat}/>
                      <View style={{flexDirection: 'row'}}>
                        <TouchableOpacity onPress={this._searchClear.bind(this)}>
                          <View style={[styles.modal_button,styles.clear]}>
                            <Text style={{color: '#FFF', fontSize:18}}>Clear</Text>
                          </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={this._toggleModal}>
                          <View style={[styles.modal_button,styles.cancel]}>
                            <Text style={{color: '#FFF', fontSize:18}}>Cancel</Text>
                          </View>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </Modal>
                  <Modal
                    isVisible={this.state.isZipAddressSelectModal}
                    animationInTiming={800}
                    animationOutTiming={800}
                    backdropTransitionInTiming={800}
                    backdropTransitionOutTiming={800}
                  >
                    <View style={styles.container_item}>
                      <View style={{padding: 10}}>
                        <Text>入力された郵便番号に複数の住所が登録されています。</Text><Text>一覧からクリックして選択して下さい。</Text>
                      </View>
                      <FlatList
                        data={this.state.zip_datas}
                        renderItem={this.renderZipItem}
                        style={styles.modal_flat}/>
                    </View>
                  </Modal>
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
        marginTop: (Platform.OS === 'android' ? 0 : 24)
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
        backgroundColor: '#abc7f4',
        justifyContent: 'center'
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
    },
    title: {
        flex: 5,
        color: '#fff',
        fontSize: 20
    },
    check_view: {
        flexDirection: 'row',
        marginBottom: 10
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
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 4,
        backgroundColor: 'white'
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