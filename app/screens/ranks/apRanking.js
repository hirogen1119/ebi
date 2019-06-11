import React from 'react';
import {
  FlatList,
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ScrollView,
  AsyncStorage,
  Alert,
  Image,
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
import {scale, base_url, img_url} from '../../utils/scale';
import { Rating } from 'react-native-elements';
import { NavigationActions, StackActions } from 'react-navigation';

let moment = require('moment');
const image = img_url + 'event/event.png';

export class ApRanking extends React.Component {
  static navigationOptions = {
    header: null,
  };
  
  constructor(props) {
    super(props);
    // this.renderItem = this._renderItem.bind(this);
    this.state = {
      data: [],
      isVisible1: false,
      data1: [new Date('2018','6','4'),new Date('2018','6','12')]
    }
    this.setNavigation = this.setNavigation.bind(this)
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

  componentDidMount() {
    AsyncStorage.getItem("token_data").then((token_data) => {

      if(token_data !== null){
        let token = JSON.parse(token_data)
        let user = JSON.parse(token.user)
        this.setState({is_trader: user.is_trader})
        let url = base_url + 'api/apartments/ap-rank?user_id=' + user.id;

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
            Alert.alert(
              '',
              data.message,
              [
                {text: 'OK', onPress: () => 
                  this.props.navigation.goBack()},
              ],
              { cancelable: false }
            )
          } else {
            let apartment = data.apartment
            this.setState({
              ap_ranks: data.ap_ranks,
              user_id: user.id,
              is_trader: user.is_trader,
              token: token,
              apartment_name: apartment.name,
              isLoading: false,
            });
          }
        })
        .catch((error) => {
          console.log(error);
          Alert.alert(
            '',
            data.message,
            [
              {text: 'OK', onPress: () => 
                this.props.navigation.goBack()},
            ],
            { cancelable: false }
          )
          this.setState({
            isLoading: false,
          })
        })
      }
    })
  }
  _visibledPick1 = () => this.setState({ isVisible1: true });
  _hidePick1 = () => this.setState({ isVisible1: false });

  _keyExtractor(item, index) {
    return item.id;
  }

  _renderSeparator() {
    return (
      <View style={styles.separator}/>
    )
  }

  _renderItem(info) {
    
    let name = `${info.item.apartment_name}`;
    let rank_number = info.index + 1
    let numIcon = 'numeric-' + rank_number + '-box'
    let numbers = null
    image_path = img_url + info.item.apartment.icon_path
    if(rank_number < 4){
      numbers = <MaterialCommunityIcons name={numIcon} size={34} color="orange" />
    } else {
      numbers = <Text style={{fontSize: 24,color: 'orange',marginLeft: 10,marginRight: 10}}>{rank_number}</Text>
    }
    return (
      <TouchableOpacity onPress={() => 
        this.props.navigation.dispatch(StackActions.reset({
            index: 0,
            actions: [
              NavigationActions.navigate({
                routeName: 'ApartmentInfo',
                params: {apartment_id: item.id,star: item.star}
              }),
            ],}))}>
        <View style={styles.tabBoxListItem}>
          <View style={{align: 'left',paddingTop: 20}}>
            {numbers}
          </View>
          <View style={styles.content}>
            <View style={styles.contentHeader}>
              <RkText rkType='header5'>{name}</RkText>
            </View>
            <View style={{flexDirection: 'row'}}>
            <Rating
              type="star"
              fractions={1}
              readonly
              imageSize={20}
              startingValue={info.item.star}
              style={{ paddingVertical: 10 }}
            />
            <RkText rkType='secondary4 hintColor' style={{marginLeft: 15, marginTop: 10}}>
              {info.item.star}
            </RkText>
            </View>
          </View>
          <Image style={styles.avatar} source={{ uri: image_path }} />
          <Avatar rkType='circle middle' style={styles.avatar} img={image_path}/>
        </View>
      </TouchableOpacity>
    )
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

  _apartmentAdd(apartment_id){

    Alert.alert(
      'マンション情報追加',
      '新規でマンションを追加しますか？\n現在のマンションに部屋のみを追加しますか？',
      [
        {text: 'マンション追加', onPress: () =>
        this.props.navigation.dispatch(StackActions.reset({
            index: 0,
            actions: [
              NavigationActions.navigate({
                routeName: 'ApartmentAdd',
                params: {apartment_id: 0,user_id: this.state.user_id}
              }),
            ],}))
          },
        {text: '部屋追加', onPress: () => 
        this.props.navigation.dispatch(StackActions.reset({
            index: 0,
            actions: [
              NavigationActions.navigate({
                routeName: 'ApartmentInvitationAdd',
                params: {user_id: this.state.user_id}
              }),
            ],}))
          },
      ],
      { cancelable: false }
    )
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

  render() {
    return (
      <View style={{flex: 1, backgroundColor: '#000',paddingTop: (Platform.OS === 'android' ? 0 : 24),paddingBottom: (Platform.OS === 'android' ? 0 : 24)}}>
      <View style={{flex: 1, backgroundColor: '#fff0d1'}}>
        <View style={{ paddingBottom: 0, marginBottom: 20, backgroundColor: '#000', flexDirection: 'row', height: 55,paddingTop: 10}}>
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
            <Text style={{color: '#fff', fontSize: 12}}>マンションランキング</Text>
          </View>
          <View style={{flex: 1, alignItems: 'center', marginBottom: 0}}>
            <TouchableOpacity onPress={this._apartmentAdd.bind(this)}>
              <MaterialIcons name="playlist-add" size={34} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <FlatList
          style={styles.root}
          data={this.state.ap_ranks}
          extraData={this.state}
          ItemSeparatorComponent={this._renderSeparator}
          keyExtractor={this._keyExtractor}
          renderItem={({item,index}) => {
            let name = `${item.apartment_name}`;
            let rank_number = index + 1
            let numIcon = 'numeric-' + rank_number + '-box'
            let numbers = null
            image_path = img_url + item.apartment.icon_path
            if(rank_number < 4){
              numbers = <MaterialCommunityIcons name={numIcon} size={34} color="orange" />
            } else {
              numbers = <Text style={{fontSize: 24,color: 'orange',marginLeft: 10,marginRight: 10}}>{rank_number}</Text>
            }
            return (
              <TouchableOpacity onPress={() => 
                this.props.navigation.dispatch(StackActions.reset({
                    index: 0,
                    actions: [
                      NavigationActions.navigate({
                        routeName: 'ApartmentInfo',
                        params: {user_id: this.state.user_id,apartment_id: item.apartment_id,star: item.point}
                      }),
                    ],}))}>
                <View style={styles.tabBoxListItem}>
                  <View style={{align: 'left',paddingTop: 20}}>
                    {numbers}
                  </View>
                  <View style={styles.content}>
                    <View style={styles.contentHeader}>
                      <RkText rkType='header5'>{name}</RkText>
                    </View>
                    <View style={{flexDirection: 'row'}}>
                    <Text>Rank : {item.rank} </Text>
                    <Text>  ポイント : {item.point}</Text>
                    </View>
                  </View>
                  <Image source={{ uri: image_path }}
                    style={{
                      borderRadius: 30,
                      overflow: 'hidden',
                      width: 60,
                      height: 60,
                      marginTop: 5 }} />
                </View>
              </TouchableOpacity>
            )}}/>

          {this._renderFooterMenu()}
      </View>
      </View>
    )
  }
}

let styles = RkStyleSheet.create(theme => ({
  root: {
    backgroundColor: '#fff0d1'
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
    marginRight: 5,
    marginTop: 5,
    marginBottom: 5,
    borderWidth: 1,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: "#ddd",
    borderColor: '#ddd',
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 12,
    paddingTop: 7,
  }
}));