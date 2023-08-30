import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect } from 'react';

const dbName = 'demo_pdms852';

export default function App() {
  const [url, setUrl] = useState('https://ymwa.deliverysoftware.co.uk/set-pdms-db/' + dbName);

  const injectedJavaScript = `
  (function() {
    // If ReactNativeWebView exists
    if (window.ReactNativeWebView) {
      window.addEventListener('speakToMobileApp', function(event) {
        if(event.detail.type === 'setCustomerCode') {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: event.detail.type,
            customerCode: event.detail.customerCode
          }));
        }
        else if(event.detail.type === 'clearLocalAndRemoteSession')
        {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: event.detail.type
          }));  
        }
      });
    }else{
      alert('ReactNativeWebView not found, unable to speak to React Native');
    }
  })();
`;
  const handleMessage = async (event) => {
    let message = JSON.parse(event.nativeEvent.data);

    if (message.type === 'setCustomerCode') {
      await AsyncStorage.setItem('customerCode', message.customerCode);
    }
    else if (message.type === 'clearLocalAndRemoteSession') {
      setUrl('https://ymwa.deliverysoftware.co.uk/request/forget');
      await AsyncStorage.clear();
    }
  };

  // If app is loaded and already has customerCode, then change the source of the webview
  useEffect(() => {
    AsyncStorage.getItem('customerCode').then((customerCode) => {
      if (customerCode !== null) {
        setUrl('https://ymwa.deliverysoftware.co.uk/set-pdms-db-and-linked-account/' + dbName + '/' + customerCode);
      } else {
        setUrl('https://ymwa.deliverysoftware.co.uk/set-pdms-db/' + dbName);
      }
    });
  }, []); // Empty dependency array means this effect runs once when component mounts

  return (
    <View style={{ width: '100%', height: '100%', backgroundColor: '#EEEEEE' }}>
      <StatusBar style="light" backgroundColor="#1F80E4" translucent={false} />
      <WebView
        originWhitelist={['http://*', 'https://*', 'about:srcdoc']}
        source={{ uri: url }}
        scrollEnabled={true}
        setBuiltInZoomControls={false}
        setDisplayZoomControls={false}
        style={{ width: '100%', resizeMode: 'contain' }}
        injectedJavaScriptBeforeContentLoaded={injectedJavaScript}
        onMessage={handleMessage}
        />
    </View>
  );
}