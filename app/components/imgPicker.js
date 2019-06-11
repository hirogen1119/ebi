import React from 'react';
import {
  View,
  Image
} from 'react-native';
import {
  RkButton,
  RkStyleSheet
} from 'react-native-ui-kitten';
import {FontAwesome} from '../assets/icons';
import { ImagePicker, Permissions } from 'expo';
import {img_url} from '../utils/scale';

export class ImgPicker extends React.Component {

    constructor(props) {
        super(props);
        let img_url_default = this.props.imgUrl
        let default_file_name = ''
        if(this.props.filename){
            default_file_name = this.props.filename
        }
        this.state = {
          image: img_url_default,
          img_url_default: img_url_default
        }
        let file = {
            image: img_url_default,
            localUri: img_url_default,
            filename: default_file_name,
            default_file_name: default_file_name,
            img_type: "image/jpeg",
            default_flg: 1,
            img_width: 0,
            img_height: 0
        }

        this.props.setImage(file)
    }

    _imageClear(){
        let file = {
            image: this.state.img_url_default,
            localUri: this.state.img_url_default,
            filename: this.state.default_file_name,
            img_type: "image/jpeg",
            default_flg: 1,
            img_width: 0,
            img_height: 0
        }
        
        this.setState({image: this.state.img_url_default})
        this.props.setImage(file)
    }

    // カメラを起動
    _takePhoto = async () => {
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
                image: result.uri,
                localUri: localUri,
                filename: filename,
                img_type: type,
                default_flg: 0,
                img_width: result.width,
                img_height: result.height
            }
            this.setState({image: result.uri})
            this.props.setImage(file)
        }
    }
    _pickImage = async () => {
        const response = await Permissions.askAsync(Permissions.CAMERA_ROLL);
        let result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [4, 4],
        quality: 0.5,
        })

        if (!result.cancelled) {
            let localUri = result.uri;
            let filename = localUri.split('/').pop();
            
            // Infer the type of the image
            let match = /\.(\w+)$/.exec(filename);
            let type = match ? `image/${match[1]}` : `image`;
            
            let file = {
                image: result.uri,
                localUri: localUri,
                filename: filename,
                img_type: type,
                default_flg: 0,
                img_width: result.width,
                img_height: result.height
            }
            this.setState({image: result.uri})
            this.props.setImage(file)
        }
    }

  render() {
    let { image } = this.state;

    return (
      <View style={{flexDirection: 'row'}}>
          <View style={styles.image_box}>
              <Image source={{ uri: image }} style={{ width: 180, height: 180 }} />
          </View>
          <View style={{marginTop: 12}}>
              <RkButton onPress={this._pickImage}
                  rkType='medium stretch'
                  contentStyle={{color: '#fff'}} style={styles.save_s}>
                  ギャラリー
              </RkButton>
              <RkButton onPress={this._takePhoto}
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
    )
  }
}

let styles = RkStyleSheet.create(theme => ({
  image_box: {
      marginTop: 15,
      marginRight: 20,
      marginBottom: 50,
      width: 180,
      height: 180,
      backgroundColor: '#fff',
      borderWidth: 1,
      borderColor: '#ddd'
  },
  save_s: {
      marginVertical: 9,
      backgroundColor: '#d67b46',
      fontSize: 14
  },
  save_sc: {
      marginVertical: 9,
      backgroundColor: '#abc7f4',
      fontSize: 14
  },
}));