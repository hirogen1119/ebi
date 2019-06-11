import React from 'react';
import {
  FlatList,
  View,
  Platform,
  Image,
  TouchableOpacity,
  Keyboard,
  Alert,
  Text,
  platform
} from 'react-native';
import {InteractionManager} from 'react-native';
import {
  RkButton,
  RkText,
  RkTextInput,
  RkAvoidKeyboard,
  RkStyleSheet,
  RkTheme
} from 'react-native-ui-kitten';
import _ from 'lodash';
import {FontAwesome} from '../../assets/icons';
import {Avatar} from '../../components/avatar';
let moment = require('moment');
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import {scale, base_url, img_url, width, height} from '../../utils/scale';
const image = img_url + 'event/event.png';
import { ImagePicker, Permissions } from 'expo';
import Modal from 'react-native-modal';
import { NavigationActions, StackActions } from 'react-navigation';


let getUserId = (navigation) => {
  return navigation.state.params ? navigation.state.params.user_id : undefined;
};


export class Chat extends React.Component {
  static navigationOptions = {
    header: null,
  };
  
  constructor(props) {
    super(props);
    const navParams = this.props.navigation.state.params;
    let type_id = navParams.type_id
    let msg_type = navParams.msg_type
    let user_id = navParams.user_id
    let user_name = navParams.user_name
    let user_icon_path = navParams.user_icon_path
    let max_count = navParams.max_count
    let data = JSON.parse(navParams.data)
    let title = navParams.title
    let backColor = 'black'
    if(navParams.msg_type === 'emergency'){
      backColor = 'red'
    }
    this.state = {
      data: data,
      isDefaulReading: true,
      isReading: false,
      type_id: navParams.type_id,
      msg_type: navParams.msg_type,
      user_id: navParams.user_id,
      default_flg: 0,
      user_name: user_name,
      visibleModal: false,
      title: title,
      max_count: max_count,
      user_icon_path: user_icon_path,
      message: '',
      apartment_name: navParams.apartment_name,
      apartment_id: navParams.apartment_id,
      backColor: backColor
    };
  }

  componentDidMount() {
    InteractionManager.runAfterInteractions(() => {
      this.refs.list.scrollToEnd();
    });
  }

  _keyExtractor(post, index) {
    return post.id;
  }

  _renderItem(info) {
    let inMessage = info.item.type === 'in';
    let backgroundColor = inMessage ? '#fff' : '#ccd8ff';
    let itemStyle = inMessage ? styles.itemIn : styles.itemOut;

    let renderDate = (item) => (
      <View style={{flexDirection: 'row'}}>
      <Avatar rkType='small' style={styles.avatar} img={item.icon_path}/>
      <View>
        <RkText style={styles.time} rkType='secondary7 hintColor'>
          {item.user_name}
        </RkText>
        <RkText style={styles.time} rkType='secondary7 hintColor'>
          {item.comment_dt}
        </RkText>
      </View>
      </View>
    )

    let renderDateOut = (item) => (
      <View style={{flexDirection: 'row'}}>
        <View style={{flex: 1}}>
          <RkText style={styles.timeOut} rkType='secondary7 hintColor'>
            {item.user_name}
          </RkText>
          <RkText style={styles.timeOut} rkType='secondary7 hintColor'>
            {item.comment_dt}
          </RkText>
        </View>
        <Avatar rkType='small' style={styles.avatar} img={item.icon_path}/>
      </View>
    )

    let renderComment = (item) => {
      if(item.is_image > 0){
        return ( 
          <View style={[styles.balloonImage, {backgroundColor}]}>
            <Image key={item.cnt} style={{ borderRadius: 20,width: 200, height: 200 }} source={{ uri: item.image_uri }} />
          </View> )
      } else {
        return (
          <View style={[styles.balloon, {backgroundColor}]}>
            <RkText key={item.cnt} rkType='primary2 mediumLine chat' style={{paddingTop: 5}}>{item.message}</RkText> 
          </View>
        )
      }
    }

    return (
      <View style={{flex: 1}}>
        <View>
        {inMessage && renderDate(info.item)}
        {!inMessage && renderDateOut(info.item)}
        </View>
        <View style={[styles.item, itemStyle]}>
        {renderComment(info.item)}
        </View>
      </View>
    )
  }

  _scroll() {
    if (Platform.OS === 'ios') {
      this.refs.list.scrollToEnd();
    } else {
      _.delay(() => this.refs.list.scrollToEnd(), 100);
    }
  }
  toLocaleString( date ) {
      return [
          date.getFullYear(),
          date.getMonth() + 1,
          date.getDate()
          ].join( '/' ) + ' '
          + date.toLocaleTimeString();
  }

  _clickSelectImage(){
    Alert.alert(
      '',
      '画像選択先を選んで下さい。',
      [
        {text: 'ギャラリー', onPress: () => this._pickImage() },
        {text: 'カメラ', onPress: () =>  this._takePhoto() },
      ],
      { cancelable: false }
    )
    
  }

  _pushMessage() {
    if (!this.state.message){
      return;
    }
    
    let dateTime = this.toLocaleString(new Date())
    
    let msg = {
      id: this.state.data.messages.length,
      comment_dt: dateTime,
      type: 'out',
      message: this.state.message,
      count: this.state.max_count + 1,
      imageUri: '',
      is_image: 0,
      user_name: this.state.user_name,
      user_id: this.state.user_id
    }
    console.log(msg)
    console.log(this.state.type_id)
    let url = base_url + 'api/comments/commentPush';
      
    fetch( url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        comment: msg,
        type_id: this.state.type_id,
        msg_type: this.state.msg_type,
      }),
    })
    .then(response => {
        return response.json()})
    .then((responseJson) => {
        var data = responseJson;
        if(data.exception || data.result === 1){
            Alert.alert('コメントエラー', data.message);
        } else {

          msg.icon_path = this.state.user_icon_path
          this.state.data.messages.push(msg)
          this.setState({message: ''});
          this._scroll(true);
        }
    })
    .catch((error) => {
        console.log(error);
        Alert.alert('コメント例外エラー', JSON.stringify(error));
    })
  }

  // カメラを起動
  _takePhoto = async () => {
    let dateTime = this.toLocaleString(new Date())
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
      let file = {
        uri: result.uri,
        name: filename,
        type: type
      }
      this.setState({image: result.uri})
      let dateTime = this.toLocaleString(new Date())
      let msg = {
        id: this.state.data.messages.length,
        comment_dt: dateTime,
        type: 'out',
        message: this.state.message,
        count: this.state.max_count + 1,
        is_image: 1,
        user_name: this.state.user_name,
        user_id: this.state.user_id
      }
      let url = base_url + 'api/comments/imagePush';
      let formData = new FormData();
  
      formData.append("comment_image", file)
      formData.append("comment", JSON.stringify(msg))
      formData.append("type_id", this.state.type_id)
      formData.append("msg_type", this.state.msg_type)
      
      fetch( url, {
        method: 'POST',
        body: formData
      })
      .then(response => {
          return response.json()})
      .then((responseJson) => {
          var data = responseJson;
          if(data.exception || data.result === 1){
              Alert.alert('コメントエラー', data.message);
          } else {
            
            let image_uri = base_url + data.file_name
            msg.image_uri = image_uri
            msg.icon_path = this.state.user_icon_path
            this.state.data.messages.push(msg)
            this.setState({message: ''});
            this._scroll(true);
          }
      })
      .catch((error) => {
          console.log(error);
          Alert.alert('コメント例外エラー', JSON.stringify(error));
      })
    }
  }

  _pickImage = async () => {
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
      let file = {
        uri: result.uri,
        name: filename,
        type: type
      }
      this.setState({image: result.uri})
      let dateTime = this.toLocaleString(new Date())
      let msg = {
        id: this.state.data.messages.length,
        comment_dt: dateTime,
        type: 'out',
        message: this.state.message,
        count: this.state.max_count + 1,
        is_image: 1,
        user_name: this.state.user_name,
        user_id: this.state.user_id
      }
      let url = base_url + 'api/comments/imagePush';
      let formData = new FormData();
  
      formData.append("comment_image", file)
      formData.append("comment", JSON.stringify(msg))
      formData.append("type_id", this.state.type_id)
      formData.append("msg_type", this.state.msg_type)
      
      fetch( url, {
        method: 'POST',
        body: formData
      })
      .then(response => {
          return response.json()})
      .then((responseJson) => {
          var data = responseJson;
          if(data.exception || data.result === 1){
              Alert.alert('コメントエラー', data.message);
          } else {
            
            let image_uri = base_url + data.file_name
            msg.image_uri = image_uri
            msg.icon_path = this.state.user_icon_path
            this.state.data.messages.push(msg)
            this.setState({message: ''});
            this._scroll(true);
          }
      })
      .catch((error) => {
          console.log(error);
          Alert.alert('コメント例外エラー', JSON.stringify(error));
      })
    }
  }

  _renderCommentInput(){
    if(this.state.msg_type !== 'emergency'){
      return (
        
        <View style={styles.footer}>
          <RkButton onPress={() => this._clickSelectImage()} style={styles.plus} rkType='clear'>
            <RkText rkType='awesome secondaryColor'>{FontAwesome.plus}</RkText>
          </RkButton>

          <RkTextInput
            onFocus={() => this._scroll(true)}
            onBlur={() => this._scroll(true)}
            onChangeText={(message) => this.setState({message: message})}
            value={this.state.message}
            rkType='row sticker'
            placeholder="Add a comment..."/>

          <RkButton onPress={() => this._pushMessage()} style={styles.send} rkType='circle success'>
            <Ionicons name="md-send" size={24} color="#fff" />
          </RkButton>
        </View>
      )
    }
  }
  render() {
    return (
      <RkAvoidKeyboard style={styles.container} onResponderRelease={(event) => {
        Keyboard.dismiss();
      }}>
      <View style={{flex: 1, backgroundColor: '#000'}}>
      <View style={{flex: 1, backgroundColor: '#fff0d1'}}>
        <View style={{ paddingBottom: 0, backgroundColor: this.state.backColor, flexDirection: 'row', height: 55,paddingTop: 5}}>
          <View style={{flex: 1, alignItems: 'center', marginBottom: 0,paddingTop: 7}}>
          <TouchableOpacity onPress={() => 
                this.props.navigation.dispatch(StackActions.reset({
                    index: 0,
                    actions: [
                      NavigationActions.navigate({
                        routeName: 'EventList',
                      }),
                    ],}))}>
            <MaterialIcons name="chevron-left" size={32} color="#fff" />
          </TouchableOpacity>
          </View>
          <View style={{flex: 4, alignItems: 'center', marginBottom: 0}}>
            <Text style={{color: '#fff', fontSize: 18}}>{this.state.apartment_name}</Text>
            <Text style={{color: '#fff', fontSize: 14}}>{this.state.title}</Text>
          </View>
          <View style={{flex: 1, alignItems: 'center', marginTop: 5, marginBottom: 0}}>
          </View>
        </View>

        <FlatList ref='list'
                  extraData={this.state}
                  style={styles.list}
                  data={this.state.data.messages}
                  keyExtractor={this._keyExtractor}
                  renderItem={this._renderItem}/>
        {this._renderCommentInput()}
      </View>
      </View>
    </RkAvoidKeyboard>

    )
  }
}

let styles = RkStyleSheet.create(theme => ({
  header: {
    alignItems: 'center'
  },
  avatar: {
    alignSelf: 'flex-end'
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.screen.base,
    paddingTop: (Platform.OS === 'android' ? 0 : 24),
    backgroundColor: '#000'
  },
  list: {
    marginTop: 10,
    paddingHorizontal: 17,
    backgroundColor: '#fff0d1'
  },
  footer: {
    flexDirection: 'row',
    minHeight: 60,
    padding: 10,
    backgroundColor: 'black'
  },
  item: {
    marginVertical: 14,
    marginTop: 5,
    flex: 1,
  },
  itemIn: {},
  itemOut: {
    alignSelf: 'flex-end'
  },
  balloon: {
    maxWidth: scale(250),
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 15,
    borderRadius: 20,
  },
  msg_balloon: {
    maxWidth: scale(250),
  },
  balloonImage: {
    maxWidth: scale(250),
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 15,
    borderRadius: 20,
  },
  time: {
    marginTop: 0,
    marginRight: 15,
    marginBottom: 3,
    marginLeft: 15,
  },
  timeOut: {
    marginTop: 0,
    marginRight: 15,
    marginBottom: 3,
    marginLeft: 15,
    alignSelf: 'flex-end'
  },
  plus: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginRight: 7
  },
  send: {
    width: 40,
    height: 40,
    marginLeft: 10,
  }
}));