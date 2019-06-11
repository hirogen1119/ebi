import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ScrollView,
  AsyncStorage,
  Image,
  CheckBox,
  Alert,
  Platform,
  Switch
} from 'react-native';

import { RkStyleSheet, RkText, RkButton } from 'react-native-ui-kitten';
import {Avatar} from '../../components';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import {scale, base_url, img_url} from '../../utils/scale';
import { Rating } from 'react-native-elements';
import pushMsg from '../../utils/pushMsg';
import { NavigationActions, StackActions } from 'react-navigation';

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
export class EventInfo extends React.Component {
  static navigationOptions = {
    header: null,
  };
  
  constructor(props) {
    super(props);
    
    let star = this.props.navigation.state.params.star
    this.state = {
      data: [],
      watching: false,
      star: star
    }
  }

  componentWillMount() {

    const navParams = this.props.navigation.state.params;
    
    let event_id = navParams.event_id

    AsyncStorage.getItem("token_data").then((token_data) => {

      if(token_data !== null){
        let token = JSON.parse(token_data)
        let user = JSON.parse(token.user)
        let url = base_url + 'api/events/detail?event_id=' + event_id + '&user_id=' + user.id;

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
            Alert.alert('','案件情報の取得に失敗しました。')
            this.setState({
              isLoading: false,
            })
            this.props.navigation.goBack()
          } else {
            let traderNames = ''
            let residentNames = ''
            let event = data.event
            let traders = data.traderNames

            let h = 0;
            for(key in traders){
                let data = traders[key]
                traderNames = traderNames + data + '、'
                h++;
            }

            let residents = data.residentNames

            let i = 0;
            for(key in residents){
                let data = residents[key]
                residentNames = residentNames + data + '、'
                i++;
            }
            traderNames = traderNames.slice(0, -1);
            residentNames = residentNames.slice(0, -1);
            let icon_radius = 100
            let icon_width = 180
            let icon_height = 180
            if(event.icon_type === 0){
              icon_radius = 0
              icon_width = 120
              icon_height = 120
            }
            this.setState({
              isLoading: false,
              name: event.name,
              category: event.category,
              sub_category: event.sub_category,
              start_dt: event.start_dt,
              end_dt: event.end_dt,
              status: event.status,
              approval: event.approval,
              apartment_id: event.apartment_id,
              content: event.content,
              event_id: event.id,
              image_add: event.image_add,
              access_token: token.access_token,
              user_id: data.user_id,
              watching: data.watch_flg === 1 ? true : false,
              traderNames: traderNames,
              residentNames: residentNames,
              imageUri: img_url + event.image_path,
              image_path: event.image_path,
              iconUri: img_url + event.icon_path,
              star: Number(event.star),
              user_role: data.user_role,
              push_token: data.push_token,
              apartment_name: data.apartment.name,
              icon_radius: icon_radius,
              icon_width: icon_width,
              icon_height: icon_height,
              is_trader: user.is_trader
            })
            if(event.star > 0){
              this.setState({star: event.star})
            }
            
            if(navParams.message){
              Alert.alert('',navParams.message)
            }
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
    if (this.state.image_path !== '') {
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

  _checkWatch(){
    let url = ""
    console.log(this.state.watching);
    if(this.state.watching){
      url = base_url + 'api/events/watch-delete?event_id=' + this.state.event_id + '&user_id=' + this.state.user_id;
    } else {
      url = base_url + 'api/events/watch-add?event_id=' + this.state.event_id + '&user_id=' + this.state.user_id;
    }
    fetch( url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: 'Bearer ' + this.state.access_token,
      },
    })
    .then((response) => response.json())
    .then((responseJson) => {
      var data = responseJson;
      console.log(data);
      if(data.message){
        Alert.alert('','ウォッチ情報の更新に失敗しました。')
        this.setState({
          isLoading: false,
        })
      } else {
        this.setState({ watching: !this.state.watching })
        
      }
    })
    .catch((error) => {
      console.log(error);
      Alert.alert('ウォッチ更新エラー', JSON.stringify(error));
      this.setState({
        isLoading: false,
      })
    })
  }

  _commentClick(){

    AsyncStorage.getItem("token_data").then((token_data) => {

      let token = JSON.parse(token_data)
      let url = base_url + 'api/comments/get-params?msg_type=event&type_id=' + this.state.event_id + '&user_id=' + this.state.user_id
      
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
              m.icon_path = img_url + m.icon_path
              msgs.push(m)
          }
          data.msgs.messages = msgs
          this.props.navigation.dispatch(StackActions.reset({
            index: 0,
            actions: [
              NavigationActions.navigate({
                routeName: 'Chat',
                params: {
                  type_id: this.state.event_id,
                  msg_type: 'event',
                  user_id: this.state.user_id,
                  user_name: data.user_name,
                  data: JSON.stringify(data.msgs),
                  title: this.state.name,
                  max_count: data.max_count,
                  apartment_name: this.state.apartment_name,
                  user_icon_path: img_url + data.user_icon_path
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

  _doneClick(){

    if(this.state.user_role > 3){
      Alert.alert(
        '',
        '案件の完了、評価を依頼しますか？',
        [
          {text: 'いいえ'},
          {text: 'はい', onPress: () =>
            this._completeApprovalRequest() },
        ],
        { cancelable: false }
      )
    } else {
      Alert.alert(
        '',
        '案件を完了しますか？ \n 承認できない場合は、承認できない理由をコメントして下さい。',
        [
          {text: 'キャンセル'},
          {text: '完了承認', onPress: () =>
          this.props.navigation.dispatch(StackActions.reset({
            index: 0,
            actions: [
              NavigationActions.navigate({
                routeName: 'EventDone',
                params: {event_id: this.state.event_id}
              }),
            ],}))
          },
        ],
        { cancelable: false }
      )
    }
  }

  _completeApprovalRequest(){

    let url = base_url + 'api/events/get-apartment-users';
    fetch( url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
          user_id: this.state.user_id,
          event_id: this.state.event_id
      }),
    })
    .then((response) => response.json())
    .then((responseJson) => {
      var data = responseJson;
      if(data.message){
        Alert.alert('ユーザー情報取得エラー', data.message);
      } else {
        let users = data.approvalUsers

        let msg_data = {
          msg_type: 'eventDone',
          message: '',
          event_id: this.state.event_id
        }
        for(key in users){
          let user = users[key]
          let token = user.push_token
          
          pushMsg(
            'エビハゼからのメッセージです',
            '案件の完了承認依頼が届きましたので確認お願いします。',
            msg_data,
            token
          )
        }
        setTimeout(() => {
          Alert.alert(
            '',
            '案件の完了承認を依頼しました。',
            [
              {text: 'OK', onPress: () =>
              this.props.navigation.dispatch(StackActions.reset({
                index: 0,
                actions: [
                  NavigationActions.navigate({
                    routeName: 'EventDone',
                    params: {event_id: this.state.event_id,star: this.state.star}
                  }),
                ],}))
              },
            ],
            { cancelable: false }
          )
        }, 500)

      }
    })
    .catch((error) => {
      console.log(error);
      Alert.alert('保険情報の登録例外エラー', JSON.stringify(error));
    });
  }

  _visibleBtn() {
    if(this.state.user_role > 3 && this.state.approval === 0){
      return (
        <RkButton onPress={this._doneClick.bind(this)}
        rkType='medium stretch'
        contentStyle={{color: '#fff', fontSize: 18}} style={styles.save}>完了承認依頼</RkButton>
      )
    } else if(this.state.user_role < 4 && this.state.approval !== 1){
      return (
        <RkButton onPress={this._doneClick.bind(this)}
        rkType='medium stretch'
        contentStyle={{color: '#fff', fontSize: 18}} style={styles.save}>完了</RkButton>
      )
    } else if(this.state.user_role > 3 && this.state.approval === 9){
      return (
        <Text style={[styles.save,{color: '#fff', fontSize: 18,padding: 10, textAlign: 'center'}]}>完了承認依頼中</Text>
      )
    }
  }

  _renderEdit(){
    if(this.state.is_trader !== 1){
      return (
        <View>
          <TouchableOpacity onPress={() => 
              this.props.navigation.dispatch(StackActions.reset({
                index: 0,
                actions: [
                  NavigationActions.navigate({
                    routeName: 'EventEdit',
                    params: {event_id: this.state.event_id}
                  }),
                ],}))}>
            <FontAwesome name="edit" size={30} color="#fff" />
          </TouchableOpacity>
        </View>
      )
    }
  }

  _renderWatchBtn(){
    if(this.state.is_trader !== 1){
      if(Platform.OS === 'ios'){
        return (
          <View style={{flexDirection: 'row'}}>
          <Switch
            value={this.state.watching}
            onValueChange={this._checkWatch.bind(this)}
          />
            <Text style={{marginTop: 5,fontSize: 16,marginLeft: 10}}>ウォッチリストに追加</Text>
          </View>
        )
      } else {
        return (
          <View>
            <CheckBox
                title=''
                value={this.state.watching}
                onValueChange={this._checkWatch.bind(this)}
            />
            <Text style={{marginTop: 5}}>ウォッチリストに追加</Text>
          </View>
        )
      }
    }
  }

  render() {
    let { star } = this.state;
    return (
      <View style={{flex: 1, backgroundColor: '#000',paddingTop: (Platform.OS === 'android' ? 0 : 24),paddingBottom: (Platform.OS === 'android' ? 0 : 24)}}>
      <View style={{flex: 1, backgroundColor: '#fff0d1'}}>
        <View style={{ paddingBottom: 0, backgroundColor: '#000', flexDirection: 'row', height: 55,paddingTop: 10}}>
          <View style={{flex: 1, alignItems: 'center', marginBottom: 0}}>
          <TouchableOpacity onPress={() => this.props.navigation.dispatch(StackActions.reset({
                                            index: 0,
                                            actions: [
                                              NavigationActions.navigate({
                                                routeName: 'EventList'
                                              }),
                                            ],}))
                                          }>
            <MaterialIcons name="chevron-left" size={30} color="#fff" />
          </TouchableOpacity>
          </View>
          <View style={{flex: 4, alignItems: 'center', marginBottom: 0}}>
            <Text style={{color: '#fff', fontSize: 18}}>{this.state.apartment_name}</Text>
            <Text style={{color: '#fff', fontSize: 12}}>案件情報詳細</Text>
          </View>
          <View style={{flex: 1, alignItems: 'center', marginTop: 5, marginBottom: 0}}>
            {this._renderEdit()}
          </View>
        </View>

        <ScrollView style={{flex:1, padding: 5}}>
            <View style={[styles.container,styles.tabBoxListItem]}>
              <View style={{justifyContent: 'center',alignItems: 'center',marginBottom: 20}}>
                <View style={styles.image_box}>
                  <Image source={{ uri: this.state.iconUri }}
                    style={{
                      borderRadius: this.state.icon_radius,
                      overflow: 'hidden',
                      width: 160,
                      height: 160,
                      borderRadius: 80 }} />
                </View>
              </View>
              <RkText rkType='header2 center'>{this.state.name}</RkText>
              <View style={{marginTop: 20,alignItems: 'center',marginBottom: 20}}>
              <RkText rkType='header5 center'>評価：{this.state.star}</RkText>

              <Rating
                type="star"
                readonly
                imageSize={40}
                ratingCount={5}
                ratingColor='orange'
                startingValue={this.state.star}
                style={{ paddingVertical: 10 }}
              />
              </View>
              <RkText rkType='center' style={{fontSize: 12}}>{this.state.start_dt + ' ~ ' + this.state.end_dt}</RkText>
              <RkText rkType='header5 center' style={{marginTop: 10}}>{this.state.category + ' : ' + this.state.sub_category}</RkText>
              <RkText rkType='header5 center' style={{marginTop: 10, textAlign: 'left'}}>{this.state.content}</RkText>
              {this._renderImage()}
              <View style={{marginTop: 10}}>
                <RkText rkType='header4' style={{fontWeight: 'bold'}}>業者：</RkText>
                <Text>{this.state.traderNames}</Text>
              </View>
              <View style={{marginTop: 10,marginBottom: 20}}>
                <RkText rkType='header4' style={{fontWeight: 'bold'}}>関係者：</RkText>
                <Text>{this.state.residentNames}</Text>
              </View>
              <View style={{flexDirection: 'row', marginTop: 10,marginBottom: 20}}>

              {this._renderWatchBtn()}
              </View>
              {this._visibleBtn()}
            </View>
        </ScrollView>

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
  image_box: {
      borderRadius: 100,
      width: 180,
      height: 180,
      backgroundColor: '#fff',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#ddd',
      flex: 1
  },
}));