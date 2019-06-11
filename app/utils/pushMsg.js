import { Notifications } from 'expo'
import {base_url} from './scale';

// this is the expo push server, normally you wouldn't directly POST
// here, instead if you need to send a notification immediately it's better
// to use local notifications.
// The typical case will POST to your server, and then there will be some
// server-side code to handle sending the notification. You can see an example
// of this in the code tab, or online on the expo push notification guide
const PUSH_ENDPOINT = 'https://expo.io/--/api/v2/push/send'

export default (async function pushMsg (title, body, data, token) {
  // Get the token that uniquely identifies this device
  // let token = await Notifications.getExpoPushTokenAsync()
  // fetch(base_url + 'api/push-tokens/add', {
  //   method: 'POST',
  //   headers: {
  //     Accept: 'application/json',
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({
  //     token: token,
  //     user_id: user_id,
  //   }),
  // })
  // .then((response) => response.json())
  // .then((responseJson) => {
  //   var data = responseJson;
  // });
  
  // POST the token to our backend so we can use it to send pushes from there
  return window.fetch(PUSH_ENDPOINT, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify([
      {
        to: token,
        title,
        body,
        data
      }
    ])
  })
})