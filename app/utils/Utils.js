import React from 'react';
import {
  Picker,
  Item,
} from 'react-native';
import { ImagePicker, Permissions } from 'expo';
import {base_url, img_url, client_id, client_secret} from './scale';

export class Utils extends React.Component {

  static selectPicker(datas) {
    let pickDatas = []
    let i = 0
    for(key in datas){
        let data = datas[key]
        pickDatas.push(
            <Picker.Item key={key} label={data} value={data} />
        )
        i++
    }
    return pickDatas
  }

  static selectPicker2(datas) {
    let pickDatas = []
    let constructions = []
    let i = 0
    for(key in datas){
      pickDatas.push(
        <Picker.Item key={i} label={datas[key]} value={datas[key]} />
        );
        i++;
    }
    return pickDatas
  }

  static async getRequest(url) {
    await fetch( url, {
        method: 'GET',
        headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        },
    })
    .then((response) => response.json())
    .then((responseJson) => {
        return responseJson
    })
    .catch((error) => {
        return error
    });
  }
}
