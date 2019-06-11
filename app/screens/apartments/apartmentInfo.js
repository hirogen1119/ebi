import React from 'react';
import {
  FlatList,
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ScrollView,
  AsyncStorage,
  Image,
  CheckBox,
  Alert,
  Platform
} from 'react-native';
import _ from 'lodash';
import {
  RkStyleSheet,
  RkText,
  RkTextInput,
  RkButton
} from 'react-native-ui-kitten';
import {Avatar} from '../../components';
import { Foundation, Feather, Ionicons, MaterialIcons, FontAwesome, SimpleLineIcons } from '@expo/vector-icons';
import {scale, base_url, img_url} from '../../utils/scale';
import { Rating } from 'react-native-elements';
import { NavigationActions, StackActions } from 'react-navigation';

let moment = require('moment');
const image = img_url + 'event/event.png';

const RatingStar = ({count}) => (
  <Rating
    type="star"
    readonly
    imageSize={40}
    ratingCount={5}
    ratingColor='orange'
    startingValue={count}
    style={{ paddingVertical: 10 }}
  />
);
export class ApartmentInfo extends React.Component {
  static navigationOptions = {
    header: null,
  };
  
  constructor(props) {
    super(props);
    let params = this.props.navigation.state.params;
    let star = params.star
    let apartment_id = params.apartment_id
    this.state = {
      data: [],
      watching: false,
      apartment_id: apartment_id,
      star: star,
      apartment_zip: ''
    }
  }

  componentWillMount() {

    const navParams = this.props.navigation.state.params;
    let apartment_id = navParams.apartment_id
    AsyncStorage.getItem("token_data").then((token_data) => {

      if(token_data !== null){
        let token = JSON.parse(token_data)
        let user = JSON.parse(token.user)
        let url = base_url + 'api/apartments/detail?apartment_id=' + apartment_id + '&user_id=' + user.id;

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
            Alert.alert('','マンション情報の取得に失敗しました。')
            this.setState({
              isLoading: false,
            })
            this.props.navigation.goBack()
          } else {
            let apartment = data.apartment
            let comp_dt = apartment.completion_ym
            let str_comp = comp_dt.toString()
            let comp_y = str_comp.substr(0,4)
            let comp_m = str_comp.substr(4)
            let room = data.room
            let apartment_data = data.apartment_data
            console.log(apartment_data)
            this.setState({
              isLoading: false,
              apartment_id: apartment.id,
              apartment_name: apartment.name,
              apartment_pref: apartment.pref.name,
              contact: apartment.contact,
              user_id: user.id,
              iconUri: img_url + apartment_data.icon_path,
              id: apartment_data.id,
              user_role: data.user_role,
              data: apartment_data,
              control: data.control,
              construction: data.construction,
              is_trader: user.is_trader,
              comp_date: comp_y + '年' + comp_m + '月',
              ap_room_count: data.ap_room_count,
              apartment_zip: apartment_data.zip
            })
            
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

  _renderImage() {
    if (this.state.image_add > 0) {
        return (
          <View>
            <Image
              source={{ uri: this.state.imageUri }}
              style={{ width: 280,height: 280, marginTop: 20,marginBottom: 20 }}
            />
          </View>
        );
    } else {
        return null;
    }
  }

  _commentClick(){

    AsyncStorage.getItem("token_data").then((token_data) => {

      let token = JSON.parse(token_data)
      let url = base_url + 'api/comments/get-params?msg_type=trader&type_id=' + this.state.trader_id + '&user_id=' + this.state.user_id
      
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
          var data = responseJson;
          if(data.result === 1){
          Alert.alert('パラメータ取得エラー', 'パラメータの取得処理に失敗しました。');
          } else {
            let msgs = []

            for(key in data.msgs.messages){
              let m = data.msgs.messages[key];
              if(m.is_image > 0){
                m.image_uri = base_url + m.file_name
              }
              msgs.push(m)
          }
          data.msgs.messages = msgs
          this.props.navigation.dispatch(StackActions.reset({
            index: 0,
            actions: [
              NavigationActions.navigate({
                routeName: 'Chat',
                params: {
                  type_id: this.state.trader_id,
                  msg_type: 'trader',
                  user_id: this.state.user_id,
                  user_name: data.user_name,
                  data: JSON.stringify(data.msgs),
                  title: this.state.name,
                  max_count: data.max_count
                }
              }),
            ],}))
          }
      })
      .catch((error) => {
          console.log(error);
          Alert.alert('パラメータ取得例外エラー', JSON.stringify(error));
      });
  });
  }

  _visibleBtn() {
    if(this.state.is_trader === 0 && this.state.user_role < 3){
      return (
        <RkButton onPress={()=> 
          this.props.navigation.dispatch(StackActions.reset({
            index: 0,
            actions: [
              NavigationActions.navigate({
                routeName: 'TraderEvaluation',
                params: { trader_id: this.state.trader_id }
              }),
            ],}))}
        rkType='medium stretch'
        contentStyle={{color: '#fff', fontSize: 18}} style={styles.save}>評価を行う</RkButton>
      )
    }
  }

  _editClick(){

  }

  _renderHeaderEdit(){
    if((this.state.apartment_id === this.state.id) && this.state.is_trader === 0 && this.state.ap_room_count > 0){
      return (

        <View style={{flex: 1, alignItems: 'center', marginTop: 5, marginBottom: 0}}>
        <TouchableOpacity onPress={() => 
          this.props.navigation.dispatch(StackActions.reset({
            index: 0,
            actions: [
              NavigationActions.navigate({
                routeName: 'ApartmentEdit',
                params: {apartment_id: this.state.id, icon_path: this.state.iconUri}
              }),
            ],}))}>
          <FontAwesome name="edit" size={30} color="#fff" />
        </TouchableOpacity>
        </View>
      )
    } else {
      return (

        <View style={{flex: 1, alignItems: 'center', marginTop: 5, marginBottom: 0}}>
        </View>
      )
    }
  }

  _renderComment(){
    if(this.state.is_trader === 0){
      return (
        <View style={{ backgroundColor: '#4c83db', height: 50,padding: 10}}>
          <View style={{flex: 1, alignItems: 'center'}}>
          <TouchableOpacity
            style={{alignItems: 'center', flexDirection: 'row'}}
            onPress={this._commentClick.bind(this)}>
            <FontAwesome name="comments" size={30} color="#fff" />
            <Text style={{color: '#fff',fontSize: 22,marginLeft: 10}}>コメント</Text>
          </TouchableOpacity>
          </View>
        </View>
      )
    }
  }

  render() {
    let { star } = this.state;
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
            <Text style={{color: '#fff', fontSize: 12}}>マンション情報詳細</Text>
          </View>

            {this._renderHeaderEdit()}

        </View>

        <ScrollView style={{flex:1, padding: 5}}>
            <View style={[styles.container,styles.tabBoxListItem,{paddingBottom: 30}]}>
              <Avatar rkType='big' style={styles.avatar} img={this.state.iconUri}/>
              <RkText rkType='header2 center'>{this.state.data.name}</RkText>
              <RkText rkType='header5 center'>{(this.state.apartment_zip)? '〒' + this.state.apartment_zip:''}</RkText>
              <RkText rkType='header5 center'>{this.state.apartment_pref + ' ' + this.state.data.address}</RkText>

              <View style={{marginTop: 20,alignItems: 'center',marginBottom: 20}}>
              <RkText rkType='header5 center'>評価：{this.state.star}</RkText>

              <Rating
                type="star"
                readonly
                imageSize={26}
                ratingCount={10}
                ratingColor='orange'
                startingValue={this.state.star}
                style={{ paddingVertical: 10 }}
              />
              {/* <View style={{flexDirection: 'row', marginTop: 10}}>
                <RkText rkType='header4' style={{fontWeight: 'bold'}}>コンタクト：</RkText>
                <RkText rkType='header4'>{this.state.data.contact === 1 ? '可' : '不可'}</RkText>
              </View> */}
              <View style={{flexDirection: 'row', marginTop: 10}}>
                <RkText rkType='header4' style={{fontWeight: 'bold'}}>管理形態：</RkText>
                <RkText rkType='header4'>{this.state.control}</RkText>
              </View>
              <View style={{flexDirection: 'row', marginTop: 10}}>
                <RkText rkType='header4' style={{fontWeight: 'bold'}}>構造：</RkText>
                <RkText rkType='header4'>{this.state.construction}</RkText>
              </View>
              <View style={{flexDirection: 'row', marginTop: 10}}>
                <RkText rkType='header4' style={{fontWeight: 'bold'}}>竣工年月：</RkText>
                <RkText rkType='header4'>{this.state.comp_date}</RkText>
              </View>
              <View style={{flexDirection: 'row', marginTop: 10}}>
                <RkText rkType='header4' style={{fontWeight: 'bold'}}>総戸数：</RkText>
                <RkText rkType='header4'>{this.state.data.total_units} 戸</RkText>
              </View>
              <View style={{flexDirection: 'row', marginTop: 10}}>
                <RkText rkType='header4' style={{fontWeight: 'bold'}}>ペット：</RkText>
                <RkText rkType='header4'>{this.state.data.pet}</RkText>
              </View>

              </View>
            </View>
        </ScrollView>

      </View>
      </View>
    )
  }
}

let styles = RkStyleSheet.create(theme => ({
  container: {
    paddingLeft: 19,
    paddingRight: 16,
    paddingBottom: 12,
    paddingTop: 7,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: "#ddd"
  },
  content: {
    marginLeft: 16,
    flex: 1,
  },
  avatar: {
    marginTop: 10,
    marginBottom: 20,
  },
  tabBoxListItem: {
    marginLeft: 15,
    marginRight: 15,
    marginTop: 5,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: '#ddd'
  },
  traderName: {
    borderRadius: 50,
    color: 'white',
    fontSize: 12,
    paddingLeft: 10,
    paddingTop: 5,
    paddingRight: 10,
    paddingBottom: 5,
    backgroundColor: '#4c83db'
  },
  userName: {
    borderRadius: 50,
    color: 'white',
    fontSize: 12,
    paddingLeft: 10,
    paddingTop: 5,
    paddingRight: 10,
    paddingBottom: 5,
    backgroundColor: '#3e7a49'
  },
  save: {
    marginVertical: 9,
    backgroundColor: '#d67b46',
  },
}));