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
  TextInput,
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
import {DatePicker} from '../../components/picker/datePicker';
import {base_url, img_url, scale, scaleModerate, scaleVertical, width} from '../../utils/scale';
import DateTimePicker from 'react-native-modal-datetime-picker';
import { ImagePicker, Permissions } from 'expo';
import Modal from "react-native-modal";
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import {Utils} from '../../utils/Utils';
import {Avatar} from '../../components/avatar';
import {ImgPicker} from '../../components';
import pushMsg from '../../utils/pushMsg';
import RNPickerSelect from 'react-native-picker-select';
import { NavigationActions, StackActions } from 'react-navigation';

const primaryColor = "#1abc9c";
const lightGrey = "#ecf0f1";
const darkGrey = "#bdc3c7";
export class EventAdd extends React.Component {
    static navigationOptions = {
      header: null,
    };
    
    constructor(props) {
        super(props);
        this.inputRefs = {};
        this.state = {
            image: base_url + 'img/no_img.png',
            isLoading: true,
            pickerVisible1: false,
            pickerVisible2: false,
            startDate: new Date(),
            endDate: new Date(),
            isStartDateTimePickerVisible: false,
            isEndDateTimePickerVisible: false,
            event_type: "イベント",
            event_sub: "イベント",
            select_event_type: 1,
            apartment_id: "",
            user_id: "",
            trader: 0,
            participants: 0,
            traders: [],
            users: [],
            categories: [],
            subCategories: [],
            content: "",
            member_names: "選択して下さい",
            isUserModalVisible: false,
            isTraderModalVisible: false,
            SelectedUserList: [],
            SelectedTraderList: [],
            trader_names: "選択して下さい",
            default_flg: 1,
            t_datas: [],
            defaultImg: base_url + 'img/no_img.png',
            localUri: base_url + 'img/no_img.png',
            filename: "no_img.png",
            img_type: "image/jpeg",
            event_icon_url: img_url + 'event/event.png',
            icon_image_url_default: img_url + 'event/event.png',
            icon_default_file_name: 'event.png',
            icon_image: img_url + 'event/event.png',
            icon_localUri: img_url + 'event/event.png',
            icon_filename: 'event.png',
            icon_img_type: "image/jpeg",
            icon_img_width: 0,
            icon_img_height: 0,
            icon_default_flg: 0,
            icon_width: 120,
            icon_height: 120,
            icon_radius: 0,
            trader_click_flg: false,
            checked_datas: [],
            start_dt: '',
            end_dt: '',
            title: ''
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
    
    setIcon(file) {
        this.setState({
          icon_image: file.localUri,
          icon_localUri: file.localUri,
          icon_filename: file.filename,
          icon_img_type: file.img_type,
          icon_img_width: file.img_width,
          icon_img_height: file.img_height,
          icon_default_flg: file.default_flg,
        })
    }
    
    componentDidMount() {
        
        AsyncStorage.getItem("token_data").then((token_data) => {

            let token = JSON.parse(token_data)
            let user = JSON.parse(token.user)
            let url = base_url + 'api/events/get-params?id=0&user_id=' + user.id
            this.setState({push_token: user.push_token})
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
                    Alert.alert('パラメータ取得エラー', data.message)
                    this.props.navigation.goBack()
                } else {
                    let traders_data = data.params['traders']
    
                    let users_data = data.params['users']

                    // 案件種類
                    let categories = []
                    let categorys_data = data.params['categorys']
                    console.log(categorys_data)
                    let subCategories = []
                    for(key in categorys_data){
                        let category = categorys_data[key]
                        let categorie_data = {
                          label: category,
                          value: category
                        }
                        categories.push(categorie_data)
                    }
                    this.setState({categories: categories});
                    console.log('##### categories ######')
                    console.log(categories)
                    console.log('##### sub category ######')
                    console.log(subCategories)
                    // 案件内容
                    let subCategorys_data = data.params['subCategorys']
                    let j = 0;
                    console.log(subCategorys_data)
                    for(key in subCategorys_data){
                        let sub_datas = subCategorys_data[key]
                        let sub_cates = []
                        for(s_key in sub_datas){
                            let sub_data = sub_datas[s_key]
                            let subCates = {
                              label: sub_data,
                              value: sub_data
                            }
                            sub_cates.push(subCates)
                        }
                        subCategories[key] = sub_cates;
                        j++;
                    }
                    console.log('##### sub category ######')
                    console.log(subCategories)
                    this.setState({subCategories: subCategories});
                    
                    let u_datas = []
                    for(key in users_data){
                        let u = users_data[key];
                        let data_u = {
                            id: u['id'],
                            name: u['nick_name'],
                            check: false,
                            recordID: u['id'],
                            push_token: u['push_token']
                        }
                        if(u.id === user.id){
                            data_u['check'] = true;
                            this.state.member_names = data_u['name']
                            this.state.SelectedUserList.push(data_u);
                        }
                        u_datas.push(data_u)
                    }
                    let t_datas = []
                    for(key in traders_data){
                        let t = traders_data[key];
                        let data_t = {
                            id: t['id'],
                            name: t['name'],
                            check: false,
                            recordID: t['id'],
                            push_token: t['push_token']
                        }
                        t_datas.push(data_t)
                    }
                    let t_sel_lavel = "選択して下さい"
                    if(t_datas.length === 1){
                        t_sel_lavel = "選択できる業者が未登録です"
                    }
                    this.setState({
                      isLoading: false,
                      u_datas: u_datas,
                      t_datas: t_datas,
                      old_traders: t_datas,
                      trader_names: t_sel_lavel,
                      user_id: user.id,
                      apartment_name: data.params.apartment.name,
                      categories,
                      subCategories
                    })
                }
            })
            .catch((error) => {
                console.log(error);
                Alert.alert('パラメータ取得例外エラー', JSON.stringify(error));
            });
        });
    }

    toLocaleString(date){
        return [
            date.getFullYear(),
            date.getMonth() + 1,
            date.getDate()
            ].join( '/' )
            + ' ' + date.getHours() + ':' + date.getMinutes() + ':00';
    }
    userPress = (hey) => {
        this.state.u_datas.map((item) => {
          if (item.recordID === hey.recordID) {
            item.check = !item.check
            if (item.check === true) {
              this.state.SelectedUserList.push(item);
            } else if (item.check === false) {
              const i = this.state.SelectedUserList.indexOf(item)
              if (1 != -1) {
                this.state.SelectedUserList.splice(i, 1)
                return this.state.SelectedUserList
              }
            }
          }
        })
        this.setState({fakeContact: this.state.fakeContact})
    }
    
    traderPress = (hey) => {
        
        let datas = this.state.t_datas
        let t_datas = []
        let checked_datas = this.state.checked_datas
        for(key in datas){
            let t = datas[key]
            if (t.id === hey.recordID) {
                t.check = !t.check
                checked_datas.push(t)
            }
            t_datas.push(t)
        }
        this.setState({t_datas: t_datas, checked_datas: checked_datas, fakeContact: this.state.fakeContact})
    }
    
    _startDateTimePicker = () => this.setState({ isStartDateTimePickerVisible: true });

    _endDateTimePicker = () => this.setState({ isEndDateTimePickerVisible: true });

    _startDateTimePickerHide = () => this.setState({ isStartDateTimePickerVisible: false });

    _endDateTimePickerHide = () => this.setState({ isEndDateTimePickerVisible: false });

    _startDatePicked = (date) => {
        let dt = date.getFullYear() + '/' + (date.getMonth()+1) + '/' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes()
        
        this.setState({
            startDate: date,
            start_dt: this.toLocaleString(new Date(dt)),
        });
        this._startDateTimePickerHide();
      };
      
    _endDatePicked = (date) => {
        let dt = date.getFullYear() + '/' + (date.getMonth()+1) + '/' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes()
        
        this.setState({
            endDate: date,
            end_dt: this.toLocaleString(new Date(dt))
        });
        this._endDateTimePickerHide();
      };
      
      _handlePickedDate1(date) {
        this.setState({
            expireMonth1: date.month,
            expireYear1: date.year,
            expireDay1: date.day,
            expire1: date.year + '/' + date.month.key + '/' + date.day,
        });
        this.setState({pickerVisible1: false});
    }

    _handlePickedDate2(date) {
        this.setState({
            expireMonth2: date.month,
            expireYear2: date.year,
            expireDay2: date.day,
            expire2: date.year + '/' + date.month.key + '/' + date.day,
        });
        this.setState({pickerVisible2: false});
    }
    
    _traderModal(){
        this.setState({ isTraderModalVisible: !this.state.isTraderModalVisible })
    }

    _closedTraderModal(){
        let datas = this.state.t_datas
        let t_datas = []
        for(key in datas){
            let t = datas[key]
            let checkeds = this.state.checked_datas
            for(k in checkeds){
                let tc = checkeds[k]
                if(tc.id === t.id){
                    t.check = !tc.check
                }
            }
            t_datas.push(t)
        }
        this.setState({t_datas: t_datas, checked_datas: []})
        this._traderModal()
    }

    _selectTraderClick(){
        let traders = this.state.t_datas
        let selTraders = []
        for(key in traders){
            let t = traders[key];
            if(t.check){
                selTraders = t.name + '\n' + selTraders
            }
        }
        this.setState({checked_datas: [],trader_names: selTraders, t_datas: traders})
        this._traderModal()
    }

    _send(){
        
        if(this.state.title === "") {
          Alert.alert("入力チェックエラー","タイトルを入力して下さい。");
        } else if(this.state.start_dt === "") {
            Alert.alert("入力チェックエラー","開始日時を指定して下さい。");
        } else if(this.state.end_dt === "") {
            Alert.alert("入力チェックエラー","終了日時を指定して下さい。");
        } else if(this.state.event_type === "" || this.state.event_sub === "") {
            Alert.alert("入力チェックエラー","案件種類を選択して下さい。");
        } else {

            let suppliers = []
            let selTraders = this.state.t_datas
            for(key in selTraders){
                let user = selTraders[key]
                if(user.check){
                    suppliers.push(user['id'])
                }
            }
            var startDt = this.state.start_dt
            var endDt = this.state.end_dt
            if(Platform.OS === 'ios'){
                var sdts = startDt.split(' ')
                console.log('### start dt array ####')
                console.log(sdts)
                var times = sdts[1].split(':')
                console.log('### start dt time array ####')
                console.log(times)

                if(startDt.indexOf('AM') != -1 && parseInt(times[0],10) === 12) {
                    times[0] = times[0].replace('12', '0');
                }
                if(startDt.indexOf('PM')  != -1 && parseInt(times[0],10) < 12) {
                    times[0] = times[0].replace(times[0], (parseInt(times[0],10) + 12));
                }
                startDt = sdts[0] + ' ' + times[0] + ':' + times[1] + ':' + times[2]

                var edts = endDt.split(' ')
                console.log('### end dt array ####')
                console.log(edts)
                var etimes = edts[1].split(':')
                console.log('### end dt time array ####')
                console.log(etimes)

                if(endDt.indexOf('AM') != -1 && parseInt(etimes[0],10) === 12) {
                    etimes[0] = etimes[0].replace('12', '0');
                }
                if(endDt.indexOf('PM')  != -1 && parseInt(etimes[0],10) < 12) {
                    etimes[0] = etimes[0].replace(etimes[0], (parseInt(etimes[0],10) + 12));
                }
                endDt = edts[0] + ' ' + etimes[0] + ':' + etimes[1] + ':' + etimes[2]
            }
            console.log('### startDt ####')
            console.log(startDt)
            console.log('### endDt ####')
            console.log(endDt)
            let event = {
                id: 0,
                name: this.state.title,
                start_dt: startDt,
                end_dt: endDt,
                category: this.state.event_type,
                sub_category: this.state.event_sub,
                content: this.state.content,
                traders: suppliers,
                residents: null
            } 
            
            let formData = new FormData();
            let icon_file = null
            if(this.state.icon_default_flg === 1){

                icon_file = {
                 uri: this.state.icon_localUri,
                 name: this.state.icon_filename,
                 type: this.state.icon_img_type
                }
    
                formData.append("icon_image", icon_file)
            }

            let file = {
             uri: this.state.localUri,
             name: this.state.filename,
             type: this.state.img_type
            }

            formData.append("image", file)
            formData.append("event", JSON.stringify(event))
            formData.append("user_id", this.state.user_id)
            formData.append("default_flg", this.state.default_flg)
            formData.append("icon_default_flg", this.state.icon_default_flg)
            let url = base_url + 'api/events/add';
            fetch( url, {
                method: 'POST',
                body: formData
            })
            .then(response => {
                return response.json()})
            .then((responseJson) => {
                var data = responseJson;
                
                if(data.exception || data.result === 1){
                    Alert.alert('案件情報登録エラー', data.message);
                } else {

                    if(data.approval_new_flg){
                        for(key in data.apply_users){
                            let apply_user = data.apply_users[key]

                            let msg_data = {
                                msg_type: 'eventTraderApproval',
                                message: '新しい案件で業者追加されましたので登録の承認をお願いします。',
                            }
                            let token = apply_user.push_token
                            pushMsg(
                              'エビハゼからのメッセージです',
                              '案件で追加された業者の承認をお願いします。',
                              msg_data,
                              token
                            )
                        }
                    }
                    this.props.navigation.dispatch(StackActions.reset({
                      index: 0,
                      actions: [
                        NavigationActions.navigate({
                          routeName: 'EventMemberSelect',
                          params: {event_id: data.event_id, traders: suppliers}
                        }),
                      ],}))
                }
            })
            .catch((error) => {
                console.log(error);
                Alert.alert('案件情報の登録例外エラー', JSON.stringify(error));
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
              
              this.props.navigation.dispatch(StackActions.reset({
                  index: 0,
                  actions: [
                    NavigationActions.navigate({
                      routeName: 'EventList',
                    }),
                  ],}))},
          ],
          { cancelable: false }
        )
    }

    _imageClear(){
        let img_name = this._eventIconChange(this.state.event_type, this.state.event_sub)
        this.setState({
            icon_image: img_url + 'event/' + img_name + '.png',
            icon_localUri: img_url + 'event/' + img_name + '.png',
            icon_filename: img_name + '.png',
            icon_img_type: "image/jpeg",
            icon_default_flg: 0,
            icon_width: 120,
            icon_height: 120,
            icon_radius: 0
        })
    }

    _attachmentImageClear(){
        
        this.setState({
            image: this.state.defaultImg,
            localUri: this.state.defaultImg,
            filename: 'no_img.png',
            img_type: "image/jpeg",
            img_width: 0,
            img_height: 0,
            default_flg: 1,
        })
    }

    _selectEventType = (itemValue, itemIndex) => {
        if(!itemValue){
            this.setState({event_type: '',event_sub: ''})
            return
        }
        console.log('##### select event #####')
        console.log('#### value #### '+itemValue+'##### index #####'+itemIndex)
        this.setState({event_type: itemValue, select_event_type: itemIndex-1})
        let event_sub = this.state.subCategories[itemIndex-1]
        console.log('##### event_sub #####')
        console.log(event_sub)
        let img_name = this._eventIconChange(itemValue, event_sub[0].value)
        this.setState({event_sub: event_sub[0].value, icon_image: img_url + 'event/' + img_name + '.png'})
    }

    _selectSubEventType = (itemValue) => {
        this.setState({event_sub: itemValue})
        let img_name = this._eventIconChange(this.state.event_type, itemValue)
        this.setState({icon_image: img_url + 'event/' + img_name + '.png'})
    }

    _eventIconChange(event_type, event_sub_type){
        console.log('##### _eventIconChange #####')
        console.log(event_type)
        console.log(event_sub_type)
        let img_name = ''
        switch(event_type){
            case 'イベント':
                img_name = 'event'
                break
            case 'その他':
                img_name = 'sonota'
                break
            case '共有':
                if(event_sub_type === 'その他'){
                    img_name = 'common_sonota'
                } else if(event_sub_type === '連絡事項'){
                    img_name = 'common_renraku'
                }
                break
            case '会議':
                if(event_sub_type === 'その他'){
                    img_name = 'k_sonota'
                } else if(event_sub_type === '理事会'){
                    img_name = 'k_rijikai'
                } else if(event_sub_type === '総会'){
                    img_name = 'k_soukai'
                }
                break
            case '管理業務':
                if(event_sub_type === 'その他'){
                    img_name = 'kanri_sonota'
                } else if(event_sub_type === '保険'){
                    img_name = 'kanri_hoken'
                } else if(event_sub_type === '修繕'){
                    img_name = 'kanri_repear'
                } else if(event_sub_type === '清掃'){
                    img_name = 'kanri_clean'
                } else if(event_sub_type === '町内会等'){
                    img_name = 'kanri_town'
                }
                break
            default:
                img_name = ''
                break
        }
        return img_name
    }

    // カメラを起動
    _takePhoto = async (img_type) => {
        const response = await Permissions.askAsync(Permissions.CAMERA);
        let result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 4],
            quality: 0.5,
        });

        if (!result.cancelled) {
            let localUri = result.uri;
            let filename = localUri.split('/').pop();
            
            // Infer the type of the image
            let match = /\.(\w+)$/.exec(filename);
            let type = match ? `image/${match[1]}` : `image`;
            
            if(img_type === 0){
                this.setState({
                    icon_image: result.uri,
                    icon_localUri: localUri,
                    icon_filename: filename,
                    icon_img_type: type,
                    icon_img_width: result.width,
                    icon_img_height: result.height,
                    icon_default_flg: 1,
                    icon_width: 180,
                    icon_height: 180,
                    icon_radius: 90
                })
            } else {
                this.setState({
                    image: localUri,
                    localUri: localUri,
                    filename: filename,
                    img_type: type,
                    img_width: 0,
                    img_height: 0,
                    default_flg: 0,
                })
            }
        }
    }
    _pickImage = async (img_type) => {
        const response = await Permissions.askAsync(Permissions.CAMERA_ROLL);
        let result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [4, 4],
        quality: 0.5,
        });

        if (!result.cancelled) {
            let localUri = result.uri;
            let filename = localUri.split('/').pop();
            
            // Infer the type of the image
            let match = /\.(\w+)$/.exec(filename);
            let type = match ? `image/${match[1]}` : `image`;
            
            if(img_type === 0){
                this.setState({
                    icon_image: result.uri,
                    icon_localUri: localUri,
                    icon_filename: filename,
                    icon_img_type: type,
                    icon_img_width: result.width,
                    icon_img_height: result.height,
                    icon_default_flg: 1,
                    icon_width: 180,
                    icon_height: 180,
                    icon_radius: 90
                })
            } else {
                this.setState({
                    image: localUri,
                    localUri: localUri,
                    filename: filename,
                    img_type: type,
                    img_width: 0,
                    img_height: 0,
                    default_flg: 0,
                })
            }
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
                      <Text style={{color: '#fff', fontSize: 18}}>{this.state.apartment_name}</Text>
                      <Text style={{color: '#fff', fontSize: 12}}>案件登録</Text>
                    </View>
                    <View style={{flex: 1, alignItems: 'center', marginBottom: 0}}>
                    </View>
                  </View>
                    <ScrollView style={styles.container}>
                        <View style={styles.content}>
                            <RkText>タイトル</RkText>
                            <RkTextInput 
                                rkType='bordered'
                                onChangeText={(title) => this.setState({title: title})}
                                style={styles.text}
                                />
                            <RkText>開始施工日時</RkText>
                            <View style={[styles.expireDateBlock]}>
                                <DateTimePicker
                                    isVisible={this.state.isStartDateTimePickerVisible}
                                    onConfirm={this._startDatePicked}
                                    onCancel={this._startDateTimePickerHide}
                                    mode="datetime"
                                    is24Hour={true}
                                    date={this.state.startDate}
                                    locale="ja"
                                    titleIOS="開始施工日時選択"
                                    cancelTextIOS="キャンセル"
                                    confirmTextIOS="選択"
                                />
                                <View style={[styles.expireDateDelimiter]}/>
                                <View style={[styles.expireDateInput, styles.balloon]}>
                                    <TouchableOpacity onPress={this._startDateTimePicker}>
                                        <RkText rkType='medium' style={styles.expireDateInnerInput}>
                                        {this.state.start_dt}
                                        </RkText>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <RkText>終了施工日時</RkText>
                            <View style={[styles.expireDateBlock]}>
                                <DateTimePicker
                                    isVisible={this.state.isEndDateTimePickerVisible}
                                    onConfirm={this._endDatePicked}
                                    onCancel={this._endDateTimePickerHide}
                                    mode="datetime"
                                    is24Hour={true}
                                    date={this.state.endDate}
                                    minimumDate={this.state.startDate}
                                    locale="ja"
                                    titleIOS="終了施工日時選択"
                                    cancelTextIOS="キャンセル"
                                    confirmTextIOS="選択"
                                />
                                <View style={[styles.expireDateDelimiter]}/>
                                <View style={[styles.expireDateInput, styles.balloon]}>
                                    <TouchableOpacity onPress={this._endDateTimePicker}>
                                        <RkText rkType='medium' style={styles.expireDateInnerInput}>
                                        {this.state.end_dt}
                                        </RkText>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <RkText style={{marginBottom: 10}}>案件種類</RkText>
                                <RNPickerSelect
                                  placeholder={{
                                    label: '選択して下さい',
                                    value: '',
                                  }}
                                  doneText={'選択'}
                                  items={this.state.categories}
                                  onValueChange={this._selectEventType.bind(this)}
                                  onUpArrow={() => {
                                    this.inputRefs.name.focus();
                                  }}
                                  onDownArrow={() => {
                                    this.inputRefs.picker1.togglePicker();
                                  }}
                                  style={{ ...pickerSelectStyles }}
                                  value={this.state.event_type}
                                  ref={(el) => {
                                    this.inputRefs.picker = el;
                                  }}
                                />
                            <RkText style={{marginBottom: 10}}>案件内容</RkText>
                                <RNPickerSelect
                                  placeholder={{
                                    label: '選択して下さい',
                                    value: '',
                                  }}
                                  doneText={'選択'}
                                  items={this.state.subCategories[this.state.select_event_type]}
                                  onValueChange={this._selectSubEventType.bind(this)}
                                  onUpArrow={() => {
                                    this.inputRefs.name.focus();
                                  }}
                                  onDownArrow={() => {
                                    this.inputRefs.picker2.togglePicker();
                                  }}
                                  style={{ ...pickerSelectStyles }}
                                  value={this.state.event_sub}
                                  ref={(el) => {
                                    this.inputRefs.picker = el;
                                  }}
                                />
                            <RkText>案件説明</RkText>
                            <TextInput
                                multiline = {true}
                                numberOfLines = {4}
                                onChangeText={(content) => this.setState({content})}
                                value={this.state.content}
                                underlineColorAndroid="transparent"
                                style={styles.textarea}
                            />
                            <View style={{flexDirection: 'row'}}>
                                <RkText style={{marginBottom: 0}}>業者</RkText>
                                <TouchableOpacity onPress={this._traderModal.bind(this)} style={{borderRadius: 2, backgroundColor: 'green',padding: 5, paddingLeft: 15, paddingRight: 15,marginLeft:10}}>
                                    <Text style={{color: '#fff'}}>選択</Text>
                                </TouchableOpacity>
                            </View>
                            <Text style={{marginTop: 15,marginBottom: 20, lineHeight: 30,fontSize: 16}}>{this.state.trader_names}</Text>
                            <RkText>アイコン</RkText>
                            <View style={{flexDirection: 'row', marginTop: 15, marginBottom: 15}}>
                                <View style={styles.image_box}>
                                    <Image source={{ uri: this.state.icon_image }} style={{ borderRadius: this.state.icon_radius,overflow: 'hidden', width: this.state.icon_width, height: this.state.icon_height }} />
                                </View>
                                <View style={{marginTop: 0,marginLeft: 15}}>
                                    <RkButton onPress={this._pickImage.bind(this,0)}
                                        rkType='medium stretch'
                                        contentStyle={{color: '#fff'}} style={styles.save_s}>
                                        ギャラリー
                                    </RkButton>
                                    <RkButton onPress={this._takePhoto.bind(this,0)}
                                        rkType='medium stretch'
                                        contentStyle={{color: '#fff'}} style={styles.save_s}>
                                        カメラ
                                    </RkButton>
                                    <RkButton onPress={this._imageClear.bind(this)}
                                        rkType='medium stretch'
                                        contentStyle={{color: '#fff'}} style={styles.save_sc}>
                                        クリア
                                    </RkButton>
                                </View>
                            </View>
                            <RkText style={{marginBottom: 10}}>添付画像</RkText>
                            <View style={{flexDirection: 'row', marginTop: 15, marginBottom: 15}}>
                                <View>
                                    <Image source={{ uri: this.state.image }} style={{ width: 180, height: 180 }} />
                                </View>
                                <View style={{marginTop: 0,marginLeft: 15}}>
                                    <RkButton onPress={this._pickImage.bind(this,1)}
                                        rkType='medium stretch'
                                        contentStyle={{color: '#fff'}} style={styles.save_s}>
                                        ギャラリー
                                    </RkButton>
                                    <RkButton onPress={this._takePhoto}
                                        rkType='medium stretch'
                                        contentStyle={{color: '#fff'}} style={styles.save_s}>
                                        カメラ
                                    </RkButton>
                                    <RkButton onPress={this._attachmentImageClear.bind(this)}
                                        rkType='medium stretch'
                                        contentStyle={{color: '#fff'}} style={styles.save_sc}>
                                        クリア
                                    </RkButton>
                                </View>
                            </View>
                            <RkButton onPress={ this._send.bind(this) }
                                rkType='medium large stretch'
                                contentStyle={{color: '#fff', fontSize: 20}} style={styles.save}>
                                関係者を選択
                            </RkButton>
                        </View>
                    <View style={styles.container_modal}>
                        <Modal
                            isVisible={this.state.isTraderModalVisible}
                            animationInTiming={800}
                            animationOutTiming={800}
                            backdropTransitionInTiming={800}
                            backdropTransitionOutTiming={800}
                            >
                            <View style={styles.container_item}>
                                <View style={{flexDirection: 'row'}}>
                                    <View style={{ flex: 7,alignItems: 'flex-start',justifyContent: 'center',alignContent: 'center'}}>
                                        <Text>関連する業者を選択して下さい。</Text>
                                    </View>
                                    <View style={{flex: 1,alignItems: 'flex-end',justifyContent: 'center'}}>
                                        <TouchableOpacity style={{ padding: 0 }} onPress={this._closedTraderModal.bind(this)}>
                                            <Ionicons name="md-close" size={30} color="black"></Ionicons>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <View style={styles.storyContainer}>
                                    <FlatList data={this.state.t_datas}
                                        keyExtractor={item => item.recordID}
                                        extraData={this.state}
                                        renderItem={({item}) => {
                                            return <TouchableOpacity style={{
                                                            flexDirection: 'row',
                                                            padding: 10,
                                                            borderBottomWidth: 1,
                                                            borderStyle: 'solid',
                                                            borderColor: '#ecf0f1'
                                                            }} onPress={() => {
                                                            this.traderPress(item)
                                                        }}>
                                                        <View style={{ flex: 3,alignItems: 'flex-start',justifyContent: 'center'}}>
                                                            {
                                                                item.check ? ( <Text style={{fontWeight: 'bold'}}>{`${item.name}`}</Text>)
                                                                    : (<Text>{`${item.name}`}</Text> )
                                                            }
                                                        </View>
                                                        <View style={{flex: 1,alignItems: 'flex-end',justifyContent: 'center' }}>
                                                            {item.check ? (
                                                                <Ionicons name="ios-checkbox" size={30} color={primaryColor}></Ionicons>
                                                            )
                                                            : (
                                                                <Ionicons name="ios-square-outline" size={30} color={darkGrey}></Ionicons>
                                                            )}
                                                        </View>
                                                </TouchableOpacity>
                                            }}/>
                                </View>
                                <View>
                                    <View style={styles.containerFooter}>
                                        <View style={{justifyContent: 'center'}}>
                                            <TouchableOpacity style={{ padding: 10 }} onPress={this._selectTraderClick.bind(this)}>
                                                <Text style={{color: '#fff',fontSize:20,textAlign: 'center'}}>業者を選択</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </Modal>
                    </View>
                </ScrollView>
                </View>
                </View>
            )
        }
    }
}

const Header = (props) => (
    <RkTextInput 
        onChangeText={(content) => this.setState({content: content})}
        style={styles.text}
        placeholder="Search..."
        />
  );

let styles = RkStyleSheet.create(theme => ({
    container: {
        flex: 1,
        backgroundColor: '#fff0d1'
    },
    containerFooter: {
        height: 50,
        backgroundColor: '#1abc9c',
        padding: 5,
    },
    input: {
        flex:1
    },
    modal_text: {
        fontSize: 20,
        marginLeft: 10
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
        flexDirection: 'row'
    },
    modal_button: {
        padding: 10,
        borderColor: "#ddd",
        borderWidth: 2,
        borderRadius: 5,
        marginBottom: 10,
        fontSize: 30,
        backgroundColor: '#abc7f4',
        alignItems: 'center',
        marginLeft: 10,
        marginRight: 10,
        width: 120,
    },
    container_modal: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },
    container_item: {
      backgroundColor: theme.colors.screen.scroll,
      paddingVertical: 8,
      padding: 10,
    },
    modalContent: {
      backgroundColor: "white",
      padding: 22,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 4,
      borderColor: "rgba(0, 0, 0, 0.1)",
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
    imageContainer: {
      height:100,
      width: 100,
      borderRadius: 64,
      marginTop: 25,
      marginRight: 20,
      marginBottom: 50,
      backgroundColor: '#fff',
    },
    image: {
      height:70,
      width: 70,
    },
    image_box: {
        marginTop: 15,
        marginRight: 20,
        marginBottom: 50,
        width: 180,
        height: 180,
        backgroundColor: '#fff',
        borderRadius: 20
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
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#ddd'
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
    text_u: {
        marginTop: 10,
        marginBottom: 15,
        height: 50,
        backgroundColor: '#fff',
        padding: 5,
        borderWidth: 1,
        borderColor: '#ddd'
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
    expireDateBlock: {
      justifyContent: 'space-between',
      flexDirection: 'row',
      marginTop: 10,
      marginLeft: 0,
      paddingLeft: 0
    },
    expireDateInput: {
      flex: 1,
      marginVertical: 10,
      marginLeft: 0,
      paddingLeft: 0
    },
    expireDateInnerInput: {
      textAlign: 'left',
      backgroundColor: '#fff',
      height: 50,
      padding: 15,
      borderWidth: 1,
      borderColor: '#ddd'
    },
    expireDateDelimiter: {
      flex: 0.04
    },
    mini_select: {
        width: 80,
        marginTop: 10
    },
    clearBtn: {
        marginLeft: 20
    },
    image_box: {
        borderRadius: 100,
        width: 180,
        height: 180,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd'
    },
    save_sc: {
        marginVertical: 9,
        backgroundColor: '#abc7f4',
        fontSize: 14
    },
    textarea: {
        marginTop: 10,
        marginBottom: 15,
        height: 50,
        padding: 10,
        height: 150,
        fontSize: 16,
        textAlignVertical: 'top',
        backgroundColor: '#fff',
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