import React from 'react';
import { View, Text, Image } from 'react-native';

function LoadingView() {
    return (
        <View style={{ position: 'fixed', width: '100%', height: '100%', flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 }}>
            <Text style={{ marginBottom: 20, textAlign: 'center', fontSize: 22, color: '#888888' }}>Loading...</Text>
            <Image source={require('../assets/myrtle.png')} style={{ marginBottom: 30 }} />
        </View>
    );
}

export default LoadingView;
