import React, { Component } from 'react';
import { Text, View, Image, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import {scale, base_url, img_url} from '../utils/scale';

class ImageModal extends Component {
    constructor(props){
        super(props);
        this.state = {
           modalIsOpen: false
        }
    }
    handleModal = () => {
        this.setState({
            modalIsOpen: !this.state.modalIsOpen,
        });
    }
    render() {
        return (
          <View style={[styles.balloonImage, {backgroundColor: this.props.backColor}]}>
            <TouchableOpacity onPress={this.handleModal()}>
              <Image style={{ borderRadius: 20,width: 200, height: 200 }} source={{ uri: this.props.data.image_uri }} />
            </TouchableOpacity>
            <Modal
              visible={this.state.modalIsOpen}
              animationInTiming={2000}
              animationOutTiming={2000}
              backdropTransitionInTiming={2000}
              backdropTransitionOutTiming={2000}
            >
              <View style={styles.modalContent}>
                <Text>Hello!</Text>
                <TouchableOpacity onPress={this.handleModal()}>
                  <View style={styles.button}>
                    <Text>Close</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </Modal>
          </View>
        );
    }
}

const styles = StyleSheet.create({
  balloonImage: {
    maxWidth: scale(250),
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 15,
    borderRadius: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
});

export default ImageModal;