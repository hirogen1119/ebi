import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  AsyncStorage,
  Text,
  Alert,
} from 'react-native';
import _ from 'lodash';
import {
  RkStyleSheet,
} from 'react-native-ui-kitten';
import { Foundation, FontAwesome, Feather, Ionicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import {scale, base_url, img_url, width, height} from '../../utils/scale';
import { NavigationActions, StackActions } from 'react-navigation';

export class Footer extends React.Component {
  static navigationOptions = {
    header: null,
  };
  
  constructor(props) {
    super(props);
    
  }

  componentDidMount() {
  }
  
  clickNavigation(click, navi, params){
    this.props.setNavigation(click, navi, params)
  }

  _flyersClick(){

    AsyncStorage.getItem("token_data").then((token_data) => {

      if(token_data !== null){
        let token = JSON.parse(token_data)
        let user = JSON.parse(token.user)
        let url = base_url + 'api/flyers/get-flyers?user_id=' + this.props.user_id;

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
            Alert.alert('','チラシの取得に失敗しました。')
            this.setState({
            isLoading: false,
            })
            this.props.navigation.navigate.goBack()
        } else {
          let params = {
            user_id: this.props.user_id,
            flyers: data.flyers,
            apartment: data.apartment
          }
          if(data.flyers.length > 0){
            this.clickNavigation(true, 'Flyers', params )
          } else {
            Alert.alert('登録されているチラシがありません。')
          }
        }
        })
        .catch((error) => {
            console.log(error);
            Alert.alert('チラシ例外エラー', JSON.stringify(error));
            this.setState({
                isLoading: false,
            })
        })
      } else {
        this.setState({ isLoading: false })
      }
    })
  }

  _renderFooterMenu(){
    if(this.props.isTrader === 0){
      return (
        <View style={{flexDirection: 'row'}}>
          <View style={ styles.footer_tab }>
          <TouchableOpacity style={ styles.tuch } onPress={() => this.clickNavigation(true,'Rank')}>
              <Ionicons name="md-checkbox-outline" size={34} color="#fff" />
              <Text style={ styles.tuch_text }>ランク</Text>
            </TouchableOpacity>
          </View>
          <View style={ styles.footer_tab }>
          <TouchableOpacity style={ styles.tuch } onPress={() => this._flyersClick()}>
              <MaterialIcons name="wallpaper" size={34} color="#fff" />
              <Text style={ styles.tuch_text }>チラシ</Text>
            </TouchableOpacity>
          </View>
        </View>
      )
    }
  }

  render() {
      return (
        <View style={ styles.footer_box }>
          <View style={ styles.footer_tab }>
            <TouchableOpacity style={ styles.tuch } onPress={() => this.clickNavigation(true,'SideMenu')}>
              <Feather name="menu" size={34} color="#fff" />
              <Text style={ styles.tuch_text }>Menu</Text>
            </TouchableOpacity>
          </View>
          <View style={ styles.footer_tab }>
          <TouchableOpacity style={ styles.tuch } onPress={() => this.clickNavigation(true,'EventList')}>
              <MaterialIcons name="event-note" size={34} color="#fff" />
              <Text style={ styles.tuch_text }>案件一覧</Text>
            </TouchableOpacity>
          </View>
          {this._renderFooterMenu()}
        </View>
      )
  }
}

let styles = RkStyleSheet.create(theme => ({
  footer_box: {
    backgroundColor: '#000',
    flexDirection: 'row',
    height: 70,
    paddingTop: 10
  },
  footer_tab: {
    flex: 1,
    alignItems: 'center'
  },
  tuch: {
    alignItems: 'center'
  },
  tuch_text: {
    color: '#fff',
    fontSize: 12
  }
}));