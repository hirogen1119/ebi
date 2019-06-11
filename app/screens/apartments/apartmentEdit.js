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
  RkTheme,
  RkAvoidKeyboard,
  RkPicker,
  RkCard
} from 'react-native-ui-kitten';
import {GradientButton} from '../../components/';
import {base_url, img_url, scale, scaleModerate, scaleVertical} from '../../utils/scale';
import { Foundation, Feather, Ionicons, MaterialIcons, FontAwesome, SimpleLineIcons } from '@expo/vector-icons';
import { ImagePicker, Permissions } from 'expo';
import Modal from "react-native-modal";
import Spinner from 'react-native-loading-spinner-overlay';
import {ImgPicker} from '../../components';
import RNPickerSelect from 'react-native-picker-select';
import { colors } from 'react-native-elements';
import { NavigationActions, StackActions } from 'react-navigation';

const CustomHeader = ({ title }) => (
    <View style={styles.header}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
export class ApartmentEdit extends React.Component {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        let navParams = this.props.navigation.state.params;
        let icon_path = navParams.icon_path
        this.renderItem = this._renderItem.bind(this);
        this.inputRefs = {};
        let now = new Date();
        let nowyear = now.getFullYear()
        this.state = {
            data: null,
            owned: 1,
            isReading: false,
            apartment_name: "",
            apartment_id: 0,
            construction: '鉄筋鉄骨コンクリート',
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
            icon_path: icon_path,
            pref: 0,
            year: nowyear.toString(),
            month: '01',
            isZipAddressSelectModal: false,
            prefs: [],
            owneds: [],
            room_types: [],
            years: [],
            months: [],
            controls: [],
            constructions: [],
            pets: [],
            zip_datas: [],
            pref: 1,
            public: '1',
            publics: [],
            contacts: [],
            contact: '1'
        }
        this.setImage = this.setImage.bind(this)
    }
    shouldComponentUpdate(nextProps,nextState){
      if(this.state.value !== nextState.value){
        return false;
      }
    
      return true;
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

        let navParams = this.props.navigation.state.params;
        let apartment_id = navParams.apartment_id

        AsyncStorage.getItem("token_data").then((token_data) => {
    
            if(token_data !== null){

                let token = JSON.parse(token_data)
                let user = JSON.parse(token.user)
                let url = base_url + 'api/apartments/edit-get-params?user_id='
                    + user.id + '&apartment_id=' + apartment_id;
                
                fetch( url, {
                    method: 'GET',
                    headers: {
                    Accept: 'application/json',
                    Authorization: 'Bearer ' + token.access_token,
                    }
                })
                .then((response) => response.json())
                .then((responseJson) => {

                    var data = responseJson;
                    
                    if(data.message){

                        Alert.alert('', 'パラメータの取得に失敗しました。');
                        this.setState({ isLoading: false })
                        this.props.navigation.goback()

                    } else {

                        let controls = [];
                        let constructions = [];
                        let facilities = [];
                        let prefs = []
                        let params = data.params
                        let controls_data = params['controls']

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
                        let publics = [
                          {label: '可',value: 1},
                          {label: '不可',value: 0},
                        ]
                        let contacts = [
                          {label: '可',value: 1},
                          {label: '不可',value: 0},
                        ]
                        let owneds = [
                          {label: 'オーナー（居住）',value: '1'},
                          {label: 'オーナー（貸出）',value: '2'},
                          {label: '入居（賃借）',value: '3'},
                        ]
            
                        let rm_data = data.rm_data

                        for(key in data.ap_data.facilities){
                            this._checked(data.ap_data.facilities[key])
                        }
                        let comp_ym = data.ap_data.completion_ym.toString()
                        let comp_y = comp_ym.slice(0, 4)
                        let comp_m = comp_ym.slice(-2)
                        console.log('########### ap data #########')
                        console.log(data.ap_data)
                        this.setState({
                          contacts: contacts,
                          publics: publics,
                          isReading: false,
                          user_id: user.id,
                          controls: controls,
                          control: data.ap_data.control_id,
                          constructions: constructions,
                          construction: data.ap_data.construction_id,
                          pets: pets,
                          prefs: prefs,
                          pref: data.ap_data.pref_id,
                          apartment_id: data.ap_data.id,
                          public: data.ap_data.public,
                          contact: data.ap_data.contact,
                          pet: data.ap_data.pet,
                          facilities: facilities,
                          user_role: data.user_role,
                          apartment: params['apartment'],
                          ap_data: data.ap_data,
                          apartment_name: data.ap_data.name,
                          address: data.ap_data.address,
                          room_floor: String(rm_data.floor),
                          room_num: String(rm_data.num),
                          floor_plan_num: String(rm_data.floor_plan_num),
                          floor_plan_type: rm_data.floor_plan.toString(),
                          owned: rm_data.owned,
                          total_units: String(data.ap_data.total_units),
                          room_id: rm_data.id,
                          icon_path: img_url + data.ap_data.icon_path,
                          years: years,
                          months: months,
                          year: comp_y,
                          month: comp_m,
                          owneds: owneds,
                          room_types: room_types,
                          zip: data.ap_data.zip
                        });
                    }
                })
                .catch((error) => {

                    console.log(error);
                    Alert.alert('', '編集するマンションの情報取得で例外が発生しました。');
                    this.setState({ isReading: false })
                    this.props.navigationAction.goback()

                })
            }
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
                public: this.state.public,
                contact: this.state.contact
            }
            
            let room = {
                id: this.state.room_id,
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
            
            let url = base_url + 'api/apartments/edit';
            
            fetch( url, {
                method: 'POST',
                body: formData
            })
            .then((response) => response.json())
            .then((responseJson) => {

                var data = responseJson;
                
                if(data.message){

                    Alert.alert('', data.message);
                    this.setState({ isReading: false })

                } else {

                    this.setState({ isReading: false })
                    this.props.navigation.dispatch(StackActions.reset({
                      index: 0,
                      actions: [
                        NavigationActions.navigate({
                          routeName: 'ApartmentInfo',
                          params: {apartment_id: data.apartment_id,star: data.star}
                        }),
                      ],}))

                }

            })
            .catch((error) => {

                console.log(error);
                Alert.alert('', 'マンション情報の更新時に例外が発生しました。');
                this.setState({ isReading: false })

            })
        }
      }
    
    _changeAp(index){

        let ap = this.state.apartments_data[index]

        this.setState({
            apartment_name: ap['name'],
            address: ap['address'],
            apartment_id: ap['id'],
            apInfo: 'exist'
        })
        
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
  
    _checked(num){

        switch(num){
            case 1:
                this.setState({checked1: true})
                break
            case 2:
                this.setState({checked2: true})
                break
            case 3:
                this.setState({checked3: true})
                break
            case 4:
                this.setState({checked4: true})
                break
            case 5:
                this.setState({checked5: true})
                break
        }

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
  
    render() {
        return (
            <View style={{flex: 1, backgroundColor: '#000',paddingTop: (Platform.OS === 'android' ? 0 : 24),paddingBottom: (Platform.OS === 'android' ? 0 : 24)}}>
            <View style={{flex: 1, backgroundColor: '#fff0d1'}}>
                <View style={{ paddingBottom: 0, backgroundColor: '#000', flexDirection: 'row', height: 55,paddingTop: 10}}>
                    <View style={{flex: 1, alignItems: 'center', marginBottom: 0}}>
                        <TouchableOpacity onPress={() => this.props.navigation.goBack()}>
                            <MaterialIcons name="chevron-left" size={30} color="#fff" />
                        </TouchableOpacity>
                    </View>
                    <View style={{flex: 4, alignItems: 'center', marginBottom: 0}}>
                        <Text style={{color: '#fff', fontSize: 18}}>{this.state.apartment_name}</Text>
                        <Text style={{color: '#fff', fontSize: 12}}>マンション情報詳細</Text>
                    </View>
                    <View style={{flex: 1, alignItems: 'center', marginTop: 5, marginBottom: 0}}>
                    </View>
                </View>
        
                <ScrollView style={styles.container}>
                    <View style={styles.content}>
                        <View>
                            <RkText style={{flex:2,paddingTop: 10}}>マンション名 *</RkText>
                            <RkTextInput 
                                value={this.state.apartment_name}
                                onChangeText={(apartment_name) => this.setState({apartment_name: apartment_name})}
                                style={styles.text}
                                />
                                <RkText>郵便番号 ＊</RkText>
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
                            <RkText>マンション住所(都道府県以降) ＊</RkText>
                            <RkTextInput 
                                value={this.state.address}
                                onChangeText={(address) => this.setState({address: address})}
                                style={styles.text}
                                />
                            <RkText>部屋の階 *</RkText>
                            <RkTextInput
                                value={this.state.room_floor}
                                onChangeText={(room_floor) => this.setState({room_floor: room_floor})}
                                style={styles.text}
                                keyboardType={'numeric'}
                                />
                            <RkText>部屋番号 *</RkText>
                            <RkTextInput 
                                value={this.state.room_num}
                                onChangeText={(room_num) => this.setState({room_num: room_num})}
                                style={styles.text}
                                keyboardType={'numeric'}
                                />
                            <RkText>間取り ＊</RkText>
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
                            <RkText style={{marginBottom: 10}}>マンション公開</RkText>
                            <RNPickerSelect
                              placeholder={{
                                label: '選択して下さい',
                                value: null,
                              }}
                              doneText={'選択'}
                              items={this.state.publics}
                              onValueChange={(value) => {
                                this.setState({
                                    public: value,
                                })
                              }}
                              onUpArrow={() => {
                                this.inputRefs.name.focus();
                              }}
                              onDownArrow={() => {
                                this.inputRefs.picker7.togglePicker();
                              }}
                              style={{ ...pickerSelectStyles }}
                              value={this.state.public}
                              ref={(el) => {
                                this.inputRefs.picker = el;
                              }}
                            />
                            <RkText style={{marginBottom: 10}}>コンタクト</RkText>
                            <RNPickerSelect
                              placeholder={{
                                label: '選択して下さい',
                                value: null,
                              }}
                              doneText={'選択'}
                              items={this.state.contacts}
                              onValueChange={(value) => {
                                this.setState({
                                    contact: value,
                                })
                              }}
                              onUpArrow={() => {
                                this.inputRefs.name.focus();
                              }}
                              onDownArrow={() => {
                                this.inputRefs.picker8.togglePicker();
                              }}
                              style={{ ...pickerSelectStyles }}
                              value={this.state.contact}
                              ref={(el) => {
                                this.inputRefs.picker = el;
                              }}
                            />
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
                                this.inputRefs.picker9.togglePicker();
                              }}
                              style={{ ...pickerSelectStyles }}
                              value={this.state.owned}
                              ref={(el) => {
                                this.inputRefs.picker = el;
                              }}
                            />
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
                                value={this.state.total_units}
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
                            <ImgPicker setImage={this.setImage} imgUrl={this.state.icon_path} />
                            <RkButton onPress={ this._send.bind(this) }
                                rkType='medium medium stretch'
                                contentStyle={{color: '#fff', fontSize: 20}} style={styles.save}>
                                更新
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
        backgroundColor: '#fff0d1'
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
    smallButtonText: {
        fontSize: 16
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
    modalContent: {
      backgroundColor: "white",
      padding: 22,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 4,
      borderColor: "rgba(0, 0, 0, 0.1)"
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
        overflow: 'hidden'
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