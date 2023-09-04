import { StatusBar , View, Text, Image, BackHandler } from 'react-native';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import React, { useState, useEffect, useRef } from 'react';

export default function App() {
  const dbName = "demo_pdms852";
  const primaryColor = "#ed1c52";
  const [url, setUrl] = useState('https://ymwa.deliverysoftware.co.uk/set-pdms-db/' + dbName);
  const [isConnected, setIsConnected] = useState(true);
  const webViewRef = useRef(null);

  const injectedJavaScript = `
    (function() {
      // App mode
      window.appMode = 'mobile';
      window.appVersion = '0.0.1'; // When updating, also update app.json version
      window.primaryColor = '${primaryColor}';

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
  `;

  // Messages from web view
  const handleMessage = async (event) => {
    let message = JSON.parse(event.nativeEvent.data);

    if (message.type === 'setCustomerCode') {
      await AsyncStorage.setItem('customerCode', message.customerCode);
    } else if (message.type === 'clearLocalAndRemoteSession') {
      setUrl('https://ymwa.deliverysoftware.co.uk/request/forget/linked-account');
      await AsyncStorage.clear();
      alert('Unlinked your Your account from this device.');
    } else if (message.type == 'quit') {
      try {
        BackHandler.exitApp();
      } catch (error) {
        alert(error);
      }
    }
  };

  useEffect(() => {
    AsyncStorage.getItem('customerCode').then((customerCode) => {
      if (customerCode !== null) {
        setUrl('https://ymwa.deliverysoftware.co.uk/set-pdms-db-and-linked-account/' + dbName + '/' + customerCode);
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

  // In case for some reason the status bar is not set correctly
  useEffect(() => {
    setTimeout(() => {
      StatusBar.setBarStyle('light-content');
      StatusBar.setBackgroundColor(primaryColor, true);
    }, 500);
  }, []);

  // Back handling and useEffect
  const handleNavigationStateChange = (navState) => {
    
  };

  useEffect(() => {
    const handleBackButton = () => {
      if (webViewRef.current) {
        const script = `
          messageFromMobileApp('${JSON.stringify({
            type: 'navigate',
            route: '/dashboard'
          })}');
        `;
        webViewRef.current.injectJavaScript(script);
      }
      return true;
    };
  
    BackHandler.addEventListener('hardwareBackPress', handleBackButton);
  
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackButton);
    };
  });

  const renderErrorView = () => {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 }}>
        <Text style={{ marginBottom: 20, textAlign: 'center', fontSize: 22 }}>Must be connected to the internet to link to your YourMoo account.</Text>
        <Image source={require('./assets/myrtle.png')} style={{  marginBottom: 30 }} />
        <Text style={{ marginBottom: 20, textAlign: 'center', fontSize: 18, paddingHorizontal: 20 }}>Please check your Internet connection or try again later.</Text>
      </View>
    );
  };

  return (
    <View style={{ width: '100%', height: '100%', backgroundColor: '#EEEEEE' }}>
      <StatusBar barStyle="light-content" backgroundColor={primaryColor || '#ed1c52'} animated={true} />
      { isConnected ? (
        <WebView
          ref={webViewRef}
          // originWhitelist={['http://*', 'https://*', 'about:srcdoc']}
          originWhitelist={["*"]}
          source={{ uri: url }}
          scrollEnabled={true}
          setBuiltInZoomControls={false}
          setDisplayZoomControls={false}
          style={{ width: '100%', resizeMode: 'contain' }}
          injectedJavaScriptBeforeContentLoaded={injectedJavaScript}
          cacheEnabled={false}
          javaScriptEnabled={true}
          onNavigationStateChange={handleNavigationStateChange}
          onMessage={handleMessage}
          onError={renderErrorView}
          renderError={renderErrorView}
        />
      ) : (
        renderErrorView()
      )}
    </View>
  );
}