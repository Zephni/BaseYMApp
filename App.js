import React, { useState, useEffect, useRef } from 'react';
import { StatusBar, View, BackHandler } from 'react-native';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

import ErrorView from './components/ErrorView.js';
import LoadingView from './components/LoadingView.js';
import { handleMessage, handleBackButton } from './scripts/utils.js';
import { styles } from './scripts/styles.js';

const dbName = "demo_pdms852";
window.primaryColor = '#FFFFFF'; // Should be set in handleMessage passed from web view with key: setPrimaryColor

export default function App() {
  const [url, setUrl] = useState(`https://ymwa.deliverysoftware.co.uk/set-pdms-db/${dbName}`);
  const [isConnected, setIsConnected] = useState(null);
  const webViewRef = useRef(null);

  useEffect(() => {
    AsyncStorage.multiGet(['customerEmail', 'hashedPassword']).then((data) => {
      const customerEmail = data[0][1];
      const hashedPassword = data[1][1];
      
      if (customerEmail !== null && hashedPassword !== null) {
        setUrl(`https://ymwa.deliverysoftware.co.uk/set-pdms-db-and-linked-account/${dbName}/${customerEmail}/${hashedPassword}`);
      } else {
        // alert('Customer email and password not found, please login');
      }
    });
  }, []);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const handleBackPress = () => handleBackButton(webViewRef);
    BackHandler.addEventListener('hardwareBackPress', handleBackPress);
  
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackPress);
    };
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#FFFFFF" animated={true} />
      {(() => {
        // If connected has not yet been set
        if(isConnected == null)
        {
          return <LoadingView />;
        }
        // If connection is false
        else if(isConnected == false)
        {
          return <ErrorView />;
        }
        // If connection is true
        else if(isConnected == true)
        {
          return (<WebView
            ref={webViewRef}
            originWhitelist={["*"]}
            source={{ uri: url }}
            scrollEnabled={true}
            setBuiltInZoomControls={false}
            setDisplayZoomControls={false}
            style={styles.webView}
            cacheEnabled={false}
            javaScriptEnabled={true}
            onMessage={(event) => handleMessage(event, setUrl)}
            onError={ErrorView}
            renderError={ErrorView}
            injectedJavaScriptBeforeContentLoaded={`
              (function() {
                // App mode
                window.appMode = 'mobile';
                window.appVersion = '0.0.1'; // When updating, also update app.json version
                window.device = '${Platform.OS}';
          
                // If ReactNativeWebView exists
                if (window.ReactNativeWebView) {
                  window.addEventListener('speakToMobileApp', function(event) {
                    window.ReactNativeWebView.postMessage(JSON.stringify(event.detail));
                  });
                } else {
                  alert('ReactNativeWebView not found, unable to speak to React Native');
                }
          
                window.messageFromMobileApp = function(messageString) {
                  try {
                    const message = JSON.parse(messageString);
                    if (message.type === 'navigate') {
                      if(window.app && window.router) {
                        window.router.push(message.route);
                      } else {
                        alert('Unable to navigate to ' + message.route);
                      }
                    } else {
                      alert('Unknown message type from React Native: ' + message.type);
                    }
                  } catch (error) {
                    alert('Failed to parse or handle message from React Native:' + error);
                  }
                }    
              })();
            `}
          />);
        }
      })()}
    </View>
  );
}
