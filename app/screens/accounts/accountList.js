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
  Platform
} from 'react-native';
import {
  RkStyleSheet,
  RkText,
  RkButton,
} from 'react-native-ui-kitten';
import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import {scale, base_url, img_url} from '../../utils/scale';
import { createMaterialTopTabNavigator, NavigationActions, StackActions } from 'react-navigation';

let accounts1 = null
let accounts2 = null
let accounts3 = null
let totalAccount1 = null
let totalAccount2 = null
let totalAccount3 = null
let totalAccunt1Color = null
let totalAccunt2Color = null
let totalAccunt3Color = null
let account1CheckMsg = null
let account1CheckMsgBack = null
let account1CheckMsgColor = null
let role_id = 0

export class AccountList extends React.Component {
  static navigationOptions = {
    header: null,
  };
  constructor(props) {
    super(props);
    const navParams = this.props.navigation.state.params;
    role_id = navParams.role_id
    
    this.state = {
      data: [],
    }
    this._visibleAddBtn = this._visibleAddBtn.bind(this);
    this.selectInfo = this.selectInfo.bind(this);
    this.accountAdd = this.accountAdd.bind(this);
  }

  componentDidMount() {

    AsyncStorage.getItem("token_data").then((token_data) => {

      if(token_data !== null){
        let token = JSON.parse(token_data)
        let user = JSON.parse(token.user)
        let url = base_url + 'api/accounts/get-params?user_id=' + user.id;

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
            accounts1 = data.accounts1
            accounts2 = data.accounts2
            accounts3 = data.accounts3
            totalAccount1 = data.account1NowAmount
            totalAccount2 = data.account2NowAmount
            totalAccount3 = data.account3NowAmount
            totalAccount3 = data.account3NowAmount
            totalAccunt1Color = data.totalAccunt1Color
            totalAccunt2Color = data.totalAccunt2Color
            totalAccunt3Color = data.totalAccunt3Color
            account1CheckMsg = data.account1CheckMsg
            account1CheckMsgBack = data.account1CheckMsgBack
            account1CheckMsgColor = data.account1CheckMsgColor
            let apartment = data.apartment

            this.setState({
              user_id: user.id,
              is_trader: user.is_trader,
              apartment_id: apartment.id,
              apartment_name: apartment.name,
              token: token,
              user_role: data.role_id
            }) 
          }
        })
        .catch((error) => {
          console.log(error);
          Alert.alert('', '口座情報リストの取得に失敗しました。');
          this.setState({
            isLoading: false,
          })
          this.props.navigation.goBack()
        })
      }
    })
  }

  _visibleAddBtn(role_id, type){
    if(role_id === 1){
      return 
      <View style={{flex: 1}}>
        <RkButton
          onPress={() =>  this.accountAdd(type)}
          rkType='small success'
          style={{marginLeft: 20, marginTop: 5}}
          contentStyle={{color: '#fff'}}>
          追加 
        </RkButton>
      </View>
    }
  }
  selectInfo(id) {
    if(this.state.user_role < 4){
      this.props.navigation.dispatch(StackActions.reset({
          index: 0,
          actions: [
            NavigationActions.navigate({
              routeName: 'AccountEdit',
              params: { account_id: id },
            }),
          ],}))
    }
  }

  accountAdd(account_type) {
    this.props.navigation.dispatch(StackActions.reset({
        index: 0,
        actions: [
          NavigationActions.navigate({
            routeName: 'AccountAdd',
            params: { account_type: account_type },
          }),
        ],}))
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
                  params: { params: params },
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

  _renderHeaderEdit(){
    if(this.state.is_trader === 0 && this.state.user_role === 1){
      return (

        <View style={{flex: 1, alignItems: 'center', marginTop: 5, marginBottom: 0}}>
        <TouchableOpacity onPress={() => 
                            this.props.navigation.dispatch(StackActions.reset({
                                index: 0,
                                actions: [
                                  NavigationActions.navigate({
                                    routeName: 'AccountAdd',
                                  }),
                                ],}))}>
        <MaterialIcons name="playlist-add" size={34} color="#fff" />
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
        <View style={{ paddingBottom: 0, backgroundColor: '#000', flexDirection: 'row', height: 55,paddingTop: 10}}>
        <TouchableOpacity onPress={()=> this.props.navigation.goBack()}>
            <MaterialIcons name="chevron-left" size={34} color="#fff" />
        </TouchableOpacity>
          <View style={{flex: 4, alignItems: 'center', marginBottom: 0}}>
            <Text style={{color: '#fff', fontSize: 18}}>{this.state.apartment_name}</Text>
            <Text style={{color: '#fff', fontSize: 12}}>口座残高</Text>
          </View>
          {this._renderHeaderEdit()}
        </View>

        <TabNavi screenProps={{ selectInfo: this.selectInfo, accountAdd: this.accountAdd, role_id: role_id, _visibleAddBtn: this._visibleAddBtn }} />

          {this._renderFooterMenu()}
      </View>
      </View>
    )
  }
}


const TradingRepairReserveFunds = ({ screenProps }) => (
  <ScrollView style={styles.tabPage}>
  <View style={[styles.tabPageTopBox,{backgroundColor: account1CheckMsgBack}]}>
    <View style={{flex:1}}>
      <RkText rkType='primary3 mediumLine'
        style={[styles.tabTopBoxTitle,{color: account1CheckMsgColor,fontWeight: 'bold'}]}>{account1CheckMsg}</RkText>
    </View>
  </View>
  <View style={styles.tabPageTopBox}>
    <View style={{flex:1}}>
      <RkText rkType='primary3 mediumLine' style={styles.tabTopBoxTitle}>残高</RkText>
    </View>
    <View style={{flex:1}}>
      <Text style={[styles.tabBoxTopAmount,{color: totalAccunt1Color}]}>{totalAccount1}</Text>
    </View>
  </View>
  <View style={{marginBottom: 30, flexDirection: 'row'}}>
    <View style={{flex: 2, justifyContent: 'flex-start'}}>
      <RkText rkType='primary3 mediumLine' style={[styles.tabBoxSubTitle]}>取引履歴</RkText>
    </View>
  </View>
    <FlatList
      style={[styles.root,styles.tabBoxFlList]}
      data={accounts1}
      extraData={accounts1}
      keyExtractor={(item, index) => item.id}
      renderItem={({ item, index }) => {
        return (
          <TouchableOpacity onPress={() =>  screenProps.selectInfo(item.id)}>
          <View style={{flex:1,backgroundColor: '#fff',paddingLeft: 10,flexDirection: 'row'}}>
            <Text style={{fontSize: 14, marginTop:6,flex: 1}}>{item.deposit_type.name}</Text>
            <Text style={{fontSize: 10, marginTop:6, marginRight: 5,flex: 1,textAlign:'right'}}>{item.updated_at} 更新</Text>
          </View>
            <View style={styles.container}>
              <View style={{flex:2}}>
                <Text style={{fontSize: 14, marginTop:6}}>取引日：{item.deposits_dt}</Text>
              </View>
              <View style={styles.content}>
                <Text style={[styles.tabBoxFlListItem, {color: item.amount_color}]}>{item.amount_view}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )
      }}/>
  </ScrollView>
)

const AdministrationFees = ({ screenProps }) => (
  <ScrollView style={styles.tabPage}>
  <View style={styles.tabPageTopBox}>
    <View style={{flex:1}}>
      <RkText rkType='primary3 mediumLine' style={styles.tabTopBoxTitle}>残高</RkText>
    </View>
    <View style={{flex:1}}>
      <Text style={[styles.tabBoxTopAmount,{color: totalAccunt2Color}]}>{totalAccount2}</Text>
    </View>
  </View>
  <View style={{marginBottom: 30, flexDirection: 'row'}}>
    <View style={{flex: 2, justifyContent: 'flex-start'}}>
      <RkText rkType='primary3 mediumLine' style={[styles.tabBoxSubTitle]}>取引履歴</RkText>
    </View>
  </View>
    <FlatList
      style={[styles.root,styles.tabBoxFlList]}
      data={accounts2}
      extraData={accounts2}
      keyExtractor={(item, index) => item.id}
      renderItem={({ item, index }) => {
        return (
          <TouchableOpacity onPress={() =>  screenProps.selectInfo(item.id)}>
          <View style={{flex:1,backgroundColor: '#fff',paddingLeft: 10,flexDirection: 'row'}}>
            <Text style={{fontSize: 14, marginTop:6}}>{item.deposit_type.name}</Text>
            <Text style={{fontSize: 10, marginTop:6, marginRight: 5,flex: 1,textAlign:'right'}}>{item.updated_at} 更新</Text>
          </View>
            <View style={styles.container}>
              <View style={{flex:2}}>
                <Text style={{fontSize: 14, marginTop:6}}>取引日：{item.deposits_dt}</Text>
              </View>
              <View style={styles.content}>
                <Text style={[styles.tabBoxFlListItem, {color: item.amount_color}]}>{item.amount_view}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )
      }}/>
  </ScrollView>
)

const Others = ({ screenProps }) => (
  <ScrollView style={styles.tabPage}>
  <View style={styles.tabPageTopBox}>
    <View style={{flex:1}}>
      <RkText rkType='primary3 mediumLine' style={styles.tabTopBoxTitle}>残高</RkText>
    </View>
    <View style={{flex:1}}>
      <Text style={[styles.tabBoxTopAmount,{color: totalAccunt3Color}]}>{totalAccount3}</Text>
    </View>
  </View>
  <View style={{marginBottom: 30, flexDirection: 'row'}}>
    <View style={{flex: 2, justifyContent: 'flex-start'}}>
      <RkText rkType='primary3 mediumLine' style={[styles.tabBoxSubTitle]}>取引履歴</RkText>
    </View>
  </View>
    <FlatList
      style={[styles.root,styles.tabBoxFlList]}
      data={accounts3}
      extraData={accounts3}
      keyExtractor={(item, index) => item.id}
      renderItem={({ item, index }) => {
        return (
          <TouchableOpacity onPress={() =>  screenProps.selectInfo(item.id)}>
          <View style={{flex:1,backgroundColor: '#fff',paddingLeft: 10,flexDirection: 'row'}}>
            <Text style={{fontSize: 14, marginTop:6,flex: 1}}>{item.deposit_type.name}</Text>
            <Text style={{fontSize: 10, marginTop:6, marginRight: 5,flex: 1,textAlign:'right'}}>{item.updated_at} 更新</Text>
          </View>
            <View style={styles.container}>
              <View style={{flex:2}}>
                <Text style={{fontSize: 14, marginTop:6}}>取引日：{item.deposits_dt}</Text>
              </View>
              <View style={styles.content}>
                <Text style={[styles.tabBoxFlListItem, {color: item.amount_color}]}>{item.amount_view}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )
      }}/>
  </ScrollView>
)

const TabNavi = createMaterialTopTabNavigator({
  TradingRepairReserveFunds: {
    screen: TradingRepairReserveFunds,
    navigationOptions: { title: '修繕積立金' }
  },
  AdministrationFees: {
    screen: AdministrationFees,
    navigationOptions: { title: '管理費' }
  },
  Others: {
    screen: Others,
    navigationOptions: { title: 'その他' }
  }
},{
  tabBarOptions: {
    // ...createMaterialTopTabNavigator.Presets.AndroidTopTabs,
    indicatorStyle: {
        backgroundColor:'#000',
    },
    activeTintColor: 'orange',
    activeBackgroundColor: '#000',
    inactiveTintColor: 'white',
    inactiveBackgroundColor: 'black',
    tabStyle: {
      borderWidth: 1,
      borderColor: '#ddd',
      fontSize: 10,
      paddingTop: Platform.OS === 'android' ? 10 : 0,
      paddingBottom: 0,
      paddingTop: 10,
      height: 50,
    },
    labelStyle: {
      fontSize: 16,fontWeight: 'bold'
    },
    style: {
      backgroundColor: 'black',
      tabBarfontSize: 24,
    },
  },
  tabBarPosition: "top"});

let styles = RkStyleSheet.create(theme => ({
  root: {
    backgroundColor: '#fff0d1'
  },
  container: {
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 5,
    paddingTop: 0,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: "#ddd"
  },
  content: {
    marginLeft: 16,
    flex: 1,
    fontSize: 14,
    marginTop: 4
  },
  avatar: {
    marginTop: 10,
  },
  tabPage: {
    borderWidth: 1,
    borderColor: '#ddd'
  },
  tabPageTopBox: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    margin:15,
    paddingTop: 15,
    paddingBottom:15,
    borderWidth: 1,
    borderColor: '#ddd'
  },
  tabTopBoxTitle: {
    paddingLeft: 10,
    paddingTop: 5
  },
  tabBoxTopAmount: {
    paddingTop: 5,
    textAlign: 'right',
    paddingRight: 15
  },
  tabBoxSubTitle: {
    margin:15,
    marginBottom: 0,
    fontWeight: 'bold'
  },
  tabBoxFlList: {
    marginLeft: 15,
    marginRight: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 30
  },
  tabBoxFlListItem: {
    paddingTop: 5,
    textAlign: 'right',
    paddingRight: 0
  }
}));