import AsyncStorage from '@react-native-async-storage/async-storage';
import { BackHandler } from 'react-native';

export const handleMessage = async (event, setUrl) => {
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
