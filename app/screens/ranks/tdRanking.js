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
  Picker,
  Platform,
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
import Spinner from 'react-native-loading-spinner-overlay';
import RNPickerSelect from 'react-native-picker-select';
import { NavigationActions, StackActions } from 'react-navigation';

let moment = require('moment');
const image = img_url + 'event/event.png';

export class TdRanking extends React.Component {
  static navigationOptions = {
    header: null,
  };
  
  constructor(props) {
    super(props);
    this.inputRefs = {};
    this.state = {
      apartment_name: '',
      isVisible1: false,
      ranks: [],
      introduction: 0,
      isReading: true,
      types: []
    }
  }

  componentDidMount() {
    AsyncStorage.getItem("token_data").then((token_data) => {

      if(token_data !== null){
        let token = JSON.parse(token_data)
        let user = JSON.parse(token.user)
        let url = base_url + 'api/traders/traderRankList?user_id=' + user.id + 'searchFlg=0&searchKey=0'

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
            
            let types_data = data.trader_types
            let h = 0;
            let types = []
            for(key in types_data){
                let ty = types_data[key]
                let type = {
                  label: ty['name'],
                  value: ty['id']
                }
                types.push(type)
                h++;
            }
            this.setState({
              isReading: false,
              user_id: user.id,
              apartment_name: data.apartment.name,
              apartment: data.apartment,
              room: data.room,
              user: user,
              types: types,
              ranks: data.trader_ranks,
              is_trader: user.is_trader,
              token: token
            }) 
            
          }
        })
        .catch((error) => {
          console.log(error);
          Alert.alert('情報取得例外エラー', JSON.stringify(error));
          this.setState({
            isLoading: false,
          })
        })
      }
    })
  }

  _search = (itemValue, itemIndex) => {

    console.log(itemValue)
    
    if(itemValue !== ""){
      
      this.setState({introduction: itemValue})

      let token = this.state.token
      let url = base_url + 'api/traders/traderRankList?user_id=' + this.state.user_id + '&searchFlg=1&searchKey=' + itemValue

      console.log(url)
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
        
        console.log(data)
        if(data.message){
          Alert.alert('','情報取得エラー')
        } else {
          
          let types_data = data.trader_types
          let h = 0;
          let types = []
          // for(key in types_data){
          //     let ty = types_data[key]
          //     types.push(
          //         <Picker.Item key={h} label={ty['name']} value={ty['id']} />
          //     );
          //     h++;
          // }
          this.setState({
            isReading: false,
            apartment_name: data.apartment.name,
            apartment: data.apartment,
            room: data.room,
            // types: types,
            ranks: data.trader_ranks,
          }) 
          
        }
      })
      .catch((error) => {
        console.log(error);
        Alert.alert('情報取得例外エラー', JSON.stringify(error));
        this.setState({
          isLoading: false,
        })
      })
    }
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
    let name = `${info.item.name}`;
    let numIcon = 'numeric-' + info.item.num + '-box'
    let numbers = null
    if(info.item.num < 4){
      numbers = <MaterialCommunityIcons name={numIcon} size={34} color="orange" />
    } else {
      numbers = <Text style={{fontSize: 24,color: 'orange',marginLeft: 10,marginRight: 10}}>{info.item.num}</Text>
    }
    return (
      <TouchableOpacity onPress={() => 
        this.props.navigation.dispatch(StackActions.reset({
            index: 0,
            actions: [
              NavigationActions.navigate({
                routeName: 'Chat',
                params: {userId: info.item.id}
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
          <Image style={styles.avatar} source={{ uri: img_url + item.icon_path }} />
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
            <Text style={{color: '#fff', fontSize: 12}}>業者ランキング</Text>
          </View>
          <View style={{flex: 1, alignItems: 'center', marginBottom: 0}}>
          </View>
        </View>
        <View style={{padding: 0,marginLeft: 15,marginRight: 15,marginBottom: 15}}>
          <RNPickerSelect
            placeholder={{
              label: '選択して下さい',
              value: '',
            }}
            doneText={'選択'}
            items={this.state.types}
            onValueChange={ this._search.bind(this) }
            onUpArrow={() => {
              this.inputRefs.name.focus();
            }}
            onDownArrow={() => {
              this.inputRefs.picker3.togglePicker();
            }}
            style={{ ...pickerSelectStyles }}
            value={this.state.introduction}
            ref={(el) => {
              this.inputRefs.picker = el;
            }}
          />
        </View>
        <FlatList
          style={styles.root}
          data={this.state.ranks}
          extraData={this.state}
          ItemSeparatorComponent={this._renderSeparator}
          keyExtractor={this._keyExtractor}
          renderItem={({ item, index }) => {
            let num = index + 1
            let numIcon = 'numeric-' + num + '-box'
            let numbers = null
            if(num < 4){
              numbers = <MaterialCommunityIcons name={numIcon} size={34} color="orange" />
            } else {
              numbers = <Text style={{fontSize: 24,color: 'orange',marginLeft: 10,marginRight: 10}}>{num}</Text>
            }
            return (
              <TouchableOpacity >
                <View style={styles.tabBoxListItem}>
                  <View style={{align: 'left',paddingTop: 20}}>
                    {numbers}
                  </View>
                  <View style={styles.content}>
                    <View style={styles.contentHeader}>
                      <RkText rkType='header5'>{item.nick_name}</RkText>
                    </View>
                    <View style={{flexDirection: 'row'}}>
                    <Rating
                      type="star"
                      fractions={1}
                      readonly
                      imageSize={20}
                      startingValue={item.point}
                      style={{ paddingVertical: 10 }}
                    />
                    <RkText rkType='secondary4 hintColor' style={{marginLeft: 15, marginTop: 10}}>
                      {item.point}
                    </RkText>
                    </View>
                  </View>
                  <Image style={styles.avatar} source={{ uri: img_url + item.icon_path }} />
                </View>
              </TouchableOpacity>
            )
          }}
          />

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
    marginRight: 5,
    width: 60,
    height: 60,
    borderRadius: 100
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
    paddingRight: 5,
    paddingBottom: 5,
    paddingTop: 5,
  },
  select_picker: {
      marginLeft: 0,
      marginRight: 0,
      marginBottom: 0,
      backgroundColor: '#fff',
      borderRadius: 10,
      borderWidth: 1,
      borderColor: '#bdc3c7',
      overflow: 'hidden'
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