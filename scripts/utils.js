import AsyncStorage from '@react-native-async-storage/async-storage';
import { BackHandler, Platform, StatusBar } from 'react-native';

export const handleMessage = async (_event, setUrl) => {
    let message = JSON.parse(_event.nativeEvent.data);

    // setCustomerEmailAndHashedPassword
    if (message.type === 'setCustomerEmailAndHashedPassword') {
            await AsyncStorage.setItem('customerEmail', message.customerEmail);
            await AsyncStorage.setItem('hashedPassword', message.hashedPassword);
    // clearLocalAndRemoteSession
    } else if (message.type === 'clearLocalAndRemoteSession') {
        setUrl('https://ymwa.deliverysoftware.co.uk/request/forget/linked-account');
        await AsyncStorage.clear();
        alert('Unlinked your Your account from this device.');
    // setPrimaryColor
    } else if (message.type === 'setPrimaryColor') {
        window.primaryColor = message.primaryColor;

        if (Platform.OS === 'android') {
            StatusBar.setBackgroundColor(window.primaryColor, true);
        }
    // quit
    } else if (message.type == 'quit') {
        try {
            BackHandler.exitApp();
        } catch (error) {
            alert(error);
        }
    }
};

export const handleBackButton = (webViewRef) => {
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
