import { Notifications } from 'expo'
import {base_url} from './scale';

export default (async function pushToken (user_id) {
  // Get the token that uniquely identifies this device
  let token = await Notifications.getExpoPushTokenAsync()
  fetch(base_url + 'api/push-tokens/add', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      token: token,
      user_id: user_id,
    }),
  })
  .then((response) => response.json())
  .then((responseJson) => {
    var data = responseJson
  })
  .catch((error) => {
    Alert.alert('ログイン例外エラー', JSON.stringify(error));
  });
})