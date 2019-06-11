import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ScrollView,
  AsyncStorage,
  Alert,
  Platform,
  Image
} from 'react-native';
import _ from 'lodash';
import {
  RkStyleSheet,
  RkText,
  RkTextInput,
  RkButton
} from 'react-native-ui-kitten';
import {Avatar} from '../../components';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import {scale, base_url, img_url} from '../../utils/scale';
import { Rating } from 'react-native-elements';
import Spinner from 'react-native-loading-spinner-overlay';
import { NavigationActions, StackActions } from 'react-navigation';

const image = img_url + 'event/event.png';

export class EventDone extends React.Component {
  static navigationOptions = {
    header: null,
  };
  
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      star: 0
    }
  }

  componentDidMount() {
    // AsyncStorage.clear();

    const navParams = this.props.navigation.state.params;
    let event_id = navParams.event_id
    let user_id = navParams.user_id
    AsyncStorage.getItem("token_data").then((token_data) => {

      if(token_data !== null){
        let token = JSON.parse(token_data)
        let url = base_url + 'api/events/detail?event_id=' + event_id;

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

            let event = data.event
            
            this.setState({
              isLoading: false,
              name: event.name,
              category: event.category,
              sub_category: event.sub_category,
              start_dt: event.start_dt,
              end_dt: event.end_dt,
              content: event.content,
              event_id: event.id,
              access_token: token.access_token,
              user_id: data.user_id,
              apartment_name: data.apartment.name,
              iconUri: img_url + event.icon_path,
            })
            if(event.star > 0){
              this.setState({star: event.star})
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

  _send(){
    let url = base_url + 'api/events/done?event_id=' + this.state.event_id + '&star=' + this.state.star;

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
      if(data.message){
        Alert.alert('','案件完了に失敗しました。')
        this.setState({
          isLoading: false,
        })
      } else {
        this.props.navigation.dispatch(StackActions.reset({
          index: 0,
          actions: [
            NavigationActions.navigate({
              routeName: 'EventList',
            }),
          ],}))
      }
    })
    .catch((error) => {
      console.log(error);
      Alert.alert('案件情完了例外エラー', JSON.stringify(error));
      this.setState({
        isLoading: false,
      })
    })
  }

  ratingCompleted(rating){
    this.setState({star: rating})
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

  render() {
    if (this.state.isDefaulReading) {
        return (
        <View style={[styles.container, styles.horizontal]}>
          <Spinner
              visible={this.state.isDefaulReading}
              textContent="Connecting・・・"
              textStyle={{ color: 'orange' }}
              />
        </View>
        )
    } else {
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
              <Text style={{color: '#fff', fontSize: 12}}>案件完了評価</Text>
            </View>
            <View style={{flex: 1, alignItems: 'center', marginTop: 5, marginBottom: 0}}>
            </View>
          </View>

          <ScrollView style={{flex:1, padding: 5, marginTop: 10}}>
              <View style={[styles.container,styles.tabBoxListItem]}>
                <View style={styles.image_box}>
                  <Image source={{ uri: this.state.iconUri }}
                    style={{
                      borderRadius: this.state.icon_radius,
                      overflow: 'hidden',
                      width: 160,
                      height: 160,
                      borderRadius: 80 }} />
                </View>
                {/* <Avatar rkType='big' style={styles.avatar} img={this.state.iconUri}/> */}
                <RkText rkType='header1 center'>{this.state.name}</RkText>
                <RkText rkType='header5 center'>{this.state.content}</RkText>
                <View style={{marginTop: 20,alignItems: 'center',marginBottom: 20}}>
                <RkText rkType='header3 center'>{this.state.star}/5</RkText>
                <Rating
                  onFinishRating={this.ratingCompleted.bind(this)}
                  style={{ paddingVertical: 10 }}
                  startingValue={this.state.star}
                  imageSize={40}
                />
                <RkText rkType='header5 center'>スライドして評価を設定して下さい。</RkText>
              </View>
              <RkButton onPress={ this._send.bind(this) }
                rkType='medium stretch'
                contentStyle={{color: '#fff', fontSize: 18}} style={styles.save}>完了承認</RkButton>
              </View>
              <Spinner
                  visible={this.state.isReading}
                  textContent="Connecting・・・"
                  textStyle={{ color: 'white' }}
                  />
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
}

let styles = RkStyleSheet.create(theme => ({
  container: {
    paddingLeft: 19,
    paddingRight: 16,
    paddingBottom: 12,
    paddingTop: 7,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: "#ddd",
    justifyContent: 'center',
    alignItems: 'center'
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
      flex: 1,
      marginBottom: 15,
      marginTop: 15
  },
}));