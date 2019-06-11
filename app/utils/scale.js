import { Dimensions } from 'react-native';
const { width, height } = Dimensions.get('window');

//Guideline sizes are based on standard ~5" screen mobile device
const guidelineBaseWidth = 350;
const guidelineBaseHeight = 680;

const scale = size => width / guidelineBaseWidth * size;
const scaleVertical = size => height / guidelineBaseHeight * size;
const scaleModerate = (size, factor = 0.5) => size + ( scale(size) - size ) * factor;

// base URL
// const base_url = "http://54.92.70.169/";// 本番？AWS master
// const base_url = "http://192.168.0.10/";// ←ローカル
const base_url = "http://api.ebihaze.com/"; // ←AWS Staging
const img_url = base_url + 'img/resources/'; // 画像パス
const client_id = 2; // laravel Passport クライアントID
const client_secret = "cvMcV3Mz9eRH8w8mQvDbTIDKcp0Zvi8kfSp209nM"; // larave Passport用 staging
// const client_secret = "ttxe8STVtPK2ZSnKGmYLwcRtYS51ibOvqr7tAnOz"; // larave Passport用 vagrant local
const test_flg = true
export {test_flg, width, height, client_secret, client_id, base_url, img_url, scale, scaleVertical, scaleModerate};