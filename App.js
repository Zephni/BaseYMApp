import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState } from 'react';

export default function App() {
  const [url, setUrl] = useState('https://ymwa.deliverysoftware.co.uk/set-pdms-db/demo_pdms852');

  const injectedJavaScript = `
  (function() {
    // If ReactNativeWebView exists
    if (window.ReactNativeWebView) {
      // Listen for the successfulRegistration event
      window.addEventListener('successfulRegistration', function(event) {
        // Post the message to React Native
        window.ReactNativeWebView.postMessage(JSON.stringify(event.detail));
      });
    }else{
      alert('ReactNativeWebView not found, unable to speak to React Native');
    }
  })();
`;
  const handleMessage = async (event) => {
    let customerId = JSON.parse(event.nativeEvent.data);
    await AsyncStorage.setItem('customerId', customerId);
  };

  // If app is loaded and already has customerId, then change the source of the webview
  AsyncStorage.getItem('customerId').then((customerId) => {
    if (customerId !== null) {
      setUrl('https://ymwa.deliverysoftware.co.uk/set-pdms-db-and-linked-account/demo_pdms852/' + customerId);
    }
  });

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