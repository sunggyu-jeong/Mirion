import 'react-native-get-random-values';
import './src/shared/lib/utils/shims';
import { AppRegistry } from 'react-native';
import App from './src/app/App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
