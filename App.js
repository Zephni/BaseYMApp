import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect } from 'react';

export default function App() {
  const dbName = "demo_pdms852";
  const [url, setUrl] = useState('https://ymwa.deliverysoftware.co.uk/set-pdms-db/' + dbName);

  const injectedJavaScript = `
  (function() {
    // App mode
    window.appMode = 'mobile';

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

  // Messages from web view
  const handleMessage = async (event) => {
    let message = JSON.parse(event.nativeEvent.data);

    // Set customer code in local storage
    if (message.type === 'setCustomerCode') {
      await AsyncStorage.setItem('customerCode', message.customerCode);
    }
    // Clear local and remote session
    else if (message.type === 'clearLocalAndRemoteSession') {
      setUrl('https://ymwa.deliverysoftware.co.uk/request/forget/linked-account');
      await AsyncStorage.clear();
      alert('Unlinked your YourMoon account from this device.');
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

  // Render the error view if the webview fails to load (This may happen if A. The user is offline or B. The server is down)
  const renderErrorView = () => {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ marginBottom: 20 }}>Oops! Something went wrong.</Text>
        <Text style={{ marginBottom: 20 }}>Please check your Internet connection or try again later.</Text>
        <Button title="Restart App" onPress={() => setUrl('https://ymwa.deliverysoftware.co.uk/set-pdms-db/' + dbName)} />
      </View>
    );
  };

  return (
    <View style={{ width: '100%', height: '100%', backgroundColor: '#EEEEEE' }}>
      <StatusBar style="light" backgroundColor={"#ed1c52"} translucent={false} />
      <WebView
        originWhitelist={['http://*', 'https://*', 'about:srcdoc']}
        source={{ uri: url }}
        scrollEnabled={true}
        setBuiltInZoomControls={false}
        setDisplayZoomControls={false}
        style={{ width: '100%', resizeMode: 'contain' }}
        injectedJavaScriptBeforeContentLoaded={injectedJavaScript}
        onMessage={handleMessage}
        cacheEnabled={false}
        javaScriptEnabled={true}
        onError={() => renderErrorView()}
        renderError={renderErrorView}
        />
    </View>
  );
}