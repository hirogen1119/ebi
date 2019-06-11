import React from 'react';
import {
  StyleSheet,
  Image,
  View,
  Dimensions,
  StatusBar,
  Platform
} from 'react-native';
import {
  RkText,
  RkTheme
} from 'react-native-ui-kitten'
import {ProgressBar} from '../../components';
import {
  KittenTheme
} from '../../config/theme';
import {NavigationActions, StackActions} from 'react-navigation';
import {scale, scaleModerate, scaleVertical} from '../../utils/scale';

let timeFrame = 500;

export class SplashScreen extends React.Component {
  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);
    this.state = {
      progress: 0
    }
  }

  componentDidMount() {
    StatusBar.setHidden(true, 'none');
    RkTheme.setTheme(KittenTheme);

    this.timer = setInterval(() => {
      if (this.state.progress == 1) {
        clearInterval(this.timer);
        setTimeout(() => {
          StatusBar.setHidden(false, 'slide');
          let toHome = StackActions.reset({
            index: 0,
            actions: [NavigationActions.navigate({routeName: 'Login'})]
          });
          this.props.navigation.dispatch(toHome)
        }, timeFrame);
      } else {
        let random = Math.random() * 0.5;
        let progress = this.state.progress + random;
        if (progress > 1) {
          progress = 1;
        }
        this.setState({progress});
      }
    }, timeFrame)

  }

  render() {
    let width = Dimensions.get('window').width;
    return (
      <View style={styles.container}>
        <View>
          <Image style={[styles.image, {width}]} source={require('../../assets/images/splash.png')}/>
          
        </View>
        <ProgressBar
          color={RkTheme.current.colors.accent}
          style={styles.progress}
          progress={this.state.progress} width={scale(320)}/>
      </View>
    )
  }
}

let styles = StyleSheet.create({
  container: {
    backgroundColor: KittenTheme.colors.screen.base,
    justifyContent: 'space-between',
    flex: 1,
  },
  image: {
    resizeMode: 'cover',
    height: scaleVertical(670),
  },
  text: {
    alignItems: 'center'
  },
  progress: {
    alignSelf: 'center',
    marginBottom: 80,
    backgroundColor: 'transparent'
  }
});