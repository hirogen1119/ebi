import React from 'react';
import {
  FlatList,
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  AsyncStorage,
  Text,
  ScrollView,
  Image,
  Dimensions,
  Alert,
  Platform
} from 'react-native';
import _ from 'lodash';
import {
  RkStyleSheet,
  RkText,
  RkTextInput
} from 'react-native-ui-kitten';
import {Avatar} from '../../components';
import { Foundation, FontAwesome, Feather, Ionicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import {scale, base_url, img_url, width, height} from '../../utils/scale';
import { Rating } from 'react-native-elements';
import {Walkthrough} from '../../components/walkthrough';
import {PaginationIndicator} from '../../components';
import Swiper from 'react-native-swiper';
import Modal from "react-native-modal";
import ImageZoom from 'react-native-image-pan-zoom';
import { Footer } from '../other';
import { NavigationActions, StackActions } from 'react-navigation';

let moment = require('moment');
const image = img_url + 'event/event.png';

export class RegistFlyers extends React.Component {
  static navigationOptions = {
    header: null,
  };
  
  constructor(props) {
    super(props);
    
    this.state = {isLoading: true}
    const navParams = this.props.navigation.state.params;
    let user_id = navParams.user_id
    let apartment = navParams.apartment
    let flyers_data = navParams.flyers
    let flyers = []
    let i = 0;
    for(key in flyers_data){
      let flyer = flyers_data[key]
      let checkEndDt = (isEnd) => {
        
        if(isEnd){
          return (
            <View style={styles.endRange}>
              <Text style={{color: '#fff', fontSize: 22, fontWeight: 'bold'}}>期間終了しました</Text>
              <Text style={{color: '#fff', fontSize: 16, fontWeight: 'bold'}}>削除する場合はクリック</Text>
            </View>
          )
        }
      }
      flyers.push(
        <View Style={styles.slide}>
          <TouchableOpacity onPress={()=> 
            this.setState({
              isVisible: true,
              select_flyer_id: flyer.id,
              select_flyer_image: img_url + flyer.image_path,
              select_isEnd: flyer.isEnd
              })
              }>
          <Image key={i} resizeMode='stretch'
            source={{ uri: img_url + flyer.image_path }}
            style={styles.image} />
            {checkEndDt(flyer.isEnd)}
          </TouchableOpacity>
        </View>
      )
      i++;
    }
    this.state = {
      apartment_name: apartment.name,
      user_id: user_id,
      flyers: flyers,
      isVisible: false,
    }
    this.onScrollEnd = this._onScrollEnd.bind(this);
    this.setNavigation = this.setNavigation.bind(this)
  }

  componentDidMount() {
    AsyncStorage.getItem("token_data").then((token_data) => {

      if(token_data !== null){
        let token = JSON.parse(token_data)
        let user = JSON.parse(token.user)
        this.setState({user: user,token: token, is_trader: user.is_trader})
      }
    })
  }
  
  _onScrollEnd(e) {
    let contentOffset = e.nativeEvent.contentOffset;
    let viewSize = e.nativeEvent.layoutMeasurement;
    let pageNum = Math.floor(contentOffset.x / viewSize.width);
    if (this.props.onChanged) {
      this.props.onChanged(pageNum);
    }
  }

  _regist_delete(){
    let flyer_id = this.state.select_flyer_id
    let url = base_url + 'api/flyers/delete'

    fetch( url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
          flyer_id: flyer_id,
          user_id: this.state.user_id,
      }),
    })
    .then((response) => response.json())
    .then((responseJson) => {
      var data = responseJson;
      if(data.message){
        Alert.alert('', data.message);
      } else {
        let params = {
          user_id: this.state.user_id,
          flyers: data.flyers,
          apartment: data.apartment
        }
        
        Alert.alert(
          '',
          'チラシの削除が完了しました。',
          [
            {text: 'OK', onPress: () =>{
              this.setState({ isVisible: false })
              this.props.navigation.dispatch(StackActions.reset({
                  index: 0,
                  actions: [
                    NavigationActions.navigate({
                      routeName: 'Flyers',
                      params: {params: params}
                    }),
                  ],}))
            }
          },
          ],
          { cancelable: false }
        )
      }
    })
    .catch((error) => {
      console.log(error);
      Alert.alert('チラシの保存例外エラー', JSON.stringify(error));
    })
  }

  setNavigation(click,navi, params){
    if(click){
      if(params !== null){
        this.props.navigation.dispatch(StackActions.reset({
            index: 0,
            actions: [
              NavigationActions.navigate({
                routeName: navi,
                params: {params: params}
              }),
            ],}))
      } else {
        this.props.navigation.dispatch(StackActions.reset({
            index: 0,
            actions: [
              NavigationActions.navigate({
                routeName: navi,
              }),
            ],}))
      }
    }
  }

  _back(){

    AsyncStorage.getItem("token_data").then((token_data) => {

      if(token_data !== null){
        let token = JSON.parse(token_data)
        let user = JSON.parse(token.user)
        let url = base_url + 'api/flyers/get-flyers?user_id=' + this.state.user_id;

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
          
        this.props.navigation.dispatch(StackActions.reset({
          index: 0,
          actions: [
            NavigationActions.navigate({
              routeName: 'Flyers',
              params: {params: params}
            }),
          ],}))
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
    if(this.state.is_trader === 0){
      return (
        <View style={{ backgroundColor: '#000', flexDirection: 'row', height: 70,paddingTop: 10}}>
          <View style={{flex: 1, alignItems: 'center'}}>
          <TouchableOpacity style={{alignItems: 'center'}} onPress={() => 
                            this.props.navigation.dispatch(StackActions.reset({
                                index: 0,
                                actions: [
                                  NavigationActions.navigate({
                                    routeName: 'SideMenu',
                                  }),
                                ],}))}>
            <Feather name="menu" size={34} color="#fff" />
            <Text style={{color: '#fff',fontSize: 12}}>Menu</Text>
          </TouchableOpacity>
          </View>
          <View style={{flex: 1, alignItems: 'center'}}>
          <TouchableOpacity style={{alignItems: 'center'}} onPress={() => 
                            this.props.navigation.dispatch(StackActions.reset({
                                index: 0,
                                actions: [
                                  NavigationActions.navigate({
                                    routeName: 'EventList',
                                  }),
                                ],}))}>
            <MaterialIcons name="event-note" size={34} color="#fff" />
            <Text style={{color: '#fff',fontSize: 12}}>案件一覧</Text>
          </TouchableOpacity>
          </View>
          <View style={{flex: 1, alignItems: 'center'}}>
            <TouchableOpacity style={{alignItems: 'center'}} onPress={() => 
                            this.props.navigation.dispatch(StackActions.reset({
                                index: 0,
                                actions: [
                                  NavigationActions.navigate({
                                    routeName: 'ApRanking',
                                  }),
                                ],}))}>
              <Ionicons name="md-checkbox-outline" size={34} color="#fff" />
              <Text style={{color: '#fff',fontSize: 12}}>ランク</Text>
            </TouchableOpacity>
          </View>
          <View style={{flex: 1, alignItems: 'center'}}>
            <TouchableOpacity style={{alignItems: 'center'}} onPress={this._flyersClick.bind(this)}>
              <MaterialIcons name="wallpaper" size={34} color="#fff" />
              <Text style={{color: '#fff',fontSize: 12}}>チラシ</Text>
            </TouchableOpacity>
          </View>
        </View>
      )
    } else {
      return (
        <View style={{ backgroundColor: '#000', flexDirection: 'row', height: 70,paddingTop: 10}}>
          <View style={{flex: 1, alignItems: 'center'}}>
          <TouchableOpacity style={{alignItems: 'center'}} onPress={() => 
                            this.props.navigation.dispatch(StackActions.reset({
                                index: 0,
                                actions: [
                                  NavigationActions.navigate({
                                    routeName: 'SideMenu',
                                  }),
                                ],}))}>
            <Feather name="menu" size={34} color="#fff" />
            <Text style={{color: '#fff',fontSize: 12}}>Menu</Text>
          </TouchableOpacity>
          </View>
          <View style={{flex: 1, alignItems: 'center'}}>
          <TouchableOpacity style={{alignItems: 'center'}} onPress={() => 
                            this.props.navigation.dispatch(StackActions.reset({
                                index: 0,
                                actions: [
                                  NavigationActions.navigate({
                                    routeName: 'EventList',
                                  }),
                                ],}))}>
            <MaterialIcons name="event-note" size={34} color="#fff" />
            <Text style={{color: '#fff',fontSize: 12}}>案件一覧</Text>
          </TouchableOpacity>
          </View>
        </View>
      )
    }
  }

  _flyersClick(){

    let url = base_url + 'api/flyers/get-flyers?user_id=' + this.state.user_id;

    this.setState({ isLoading: true })
    fetch( url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: 'Bearer ' + this.state.token.access_token,
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
          this.setState({ isLoading: false })
          this.props.navigation.dispatch(StackActions.reset({
            index: 0,
            actions: [
              NavigationActions.navigate({
                routeName: 'Flyers',
                params: {params: params}
              }),
            ],}))
        } else {
          this.setState({ isLoading: false })
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
  }

  render() {
    if (this.state.isLoading) {
        return (
        <View style={[styles.container, styles.horizontal]}>
            <ActivityIndicator size="large" color="#ffb626" />
        </View>
        )
    } else {
      let items = this.state.flyers;
  
      return (
        <View style={{flex: 1, backgroundColor: '#000',paddingTop: (Platform.OS === 'android' ? 0 : 24),paddingBottom: (Platform.OS === 'android' ? 0 : 24)}}>
        <View style={{flex: 1, backgroundColor: '#fff0d1'}}>
          <View style={{ paddingBottom: 0, backgroundColor: '#000', flexDirection: 'row', height: 55,paddingTop: 10}}>
            <View style={{flex: 1, alignItems: 'center', marginBottom: 0}}>
            <TouchableOpacity onPress={this._back.bind(this)}>
                <MaterialIcons name="chevron-left" size={34} color="#fff" />
            </TouchableOpacity>
            </View>
            <View style={{flex: 4, alignItems: 'center', marginBottom: 0}}>
              <Text style={{color: '#fff', fontSize: 18}}>{this.state.apartment_name}</Text>
              <Text style={{color: '#fff', fontSize: 12}}>チラシ</Text>
            </View>
            <View style={{flex: 1, alignItems: 'center', marginBottom: 0}}>
            </View>
          </View>
          <View style={{flex: 4}}>
          <Swiper showsButtons={true} style={styles.wrapper}>
            {items}
          </Swiper>
          </View>
          <View style={{flex: 1}}></View>
          {this._renderFooterMenu()}
          <Modal
              isVisible={this.state.isVisible}
              animationInTiming={800}
              animationOutTiming={800}
              backdropTransitionInTiming={800}
              backdropTransitionOutTiming={800}
              >
            <View style={styles.container_item}>
              <ImageZoom cropWidth={300}
                        cropHeight={380}
                        imageWidth={280}
                        imageHeight={350}>
                <Image key={1} resizeMode='stretch'
                  source={{ uri: this.state.select_flyer_image }}
                  style={styles.image} />
              </ImageZoom>
              {this.state.select_isEnd ? <View style={styles.endRangeModal}><Text style={{color: '#fff', fontSize: 22, fontWeight: 'bold'}}>期間終了しました</Text></View> : <View></View>}
              
            </View>
            <View style={{alignItems: 'center', justifyContent: 'center', alignSelf: 'center', backgroundColor: 'transparent', flexDirection: 'row'}}>
              <TouchableOpacity
                style={{alignItems: 'center', flexDirection: 'row', marginRight: 20}}
                onPress={this._regist_delete.bind(this)}
                >
                <Ionicons name="ios-checkmark-circle-outline" size={30} color="#59f442" />
                <Text style={{color: '#59f442',fontSize: 22,marginLeft: 10}}>削除</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{alignItems: 'center', flexDirection: 'row'}}
                onPress={()=> this.setState({isVisible: false})}
                >
                <Ionicons name="ios-close-circle-outline" size={30} color="#fff" />
                <Text style={{color: '#fff',fontSize: 22,marginLeft: 10}}>Close</Text>
              </TouchableOpacity>
            </View>
          </Modal>
        </View>
        </View>
      )
    }
  }
}

let styles = RkStyleSheet.create(theme => ({
  root: {
    backgroundColor: '#fff0d1'
  },
  container_item: {
    paddingLeft: 16
  },
  endRange: {
    borderWidth: 2,
    borderColor: 'red',
    borderRadius: 5,
    backgroundColor: 'rgba(255, 142, 154, 0.8)',
    position: 'absolute',
    top: 160,
    left: 80,
    padding: 15,
  },
  endRangeModal: {
    borderWidth: 2,
    borderColor: 'red',
    borderRadius: 5,
    backgroundColor: 'rgba(255, 142, 154, 0.8)',
    position: 'absolute',
    top: 160,
    left: 60,
    padding: 15,
  },
  image: {
    alignSelf: 'center',
    width: 250,
    height: 320,
    margin: 20
  },
  wrapper: {
    padding: 20,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff0d1',
    alignSelf: 'center',
    padding: 20,
    marginBottom: 10,
    marginLeft: 50,
  },
  searchContainer: {
    backgroundColor: theme.colors.screen.bold,
    paddingHorizontal: 16,
    paddingVertical: 10,
    height: 60,
    alignItems: 'center',
  },
  container: {
    paddingLeft: 19,
    paddingRight: 16,
    paddingBottom: 12,
    paddingTop: 7,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: "#ddd"
  },
  content: {
    marginLeft: 16,
    flex: 8,
  },
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    marginTop: 10
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: theme.colors.border.base
  },
  avatar: {
    marginTop: 10,
    marginRight: 20,
    flex: 1
  },
  tabPage: {
    paddingTop: 20
  },
  tabBoxListItem: {
    marginLeft: 15,
    marginRight: 15,
    marginTop: 5,
    marginBottom: 5,
    borderWidth: 1,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: "#ddd",
    borderColor: '#ddd',
    paddingLeft: 10,
    paddingRight: 20,
    paddingBottom: 12,
    paddingTop: 7,
  }
}));