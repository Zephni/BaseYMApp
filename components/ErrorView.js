import React from 'react';
import { View, Text, Image } from 'react-native';

function ErrorView() {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 }}>
            <Text style={{ marginBottom: 20, textAlign: 'center', fontSize: 22 }}>Must be connected to the internet to link to your YourMoo account.</Text>
            <Image source={require('../assets/myrtle.png')} style={{ marginBottom: 30 }} />
            <Text style={{ marginBottom: 20, textAlign: 'center', fontSize: 18, paddingHorizontal: 20 }}>Please check your Internet connection or try again later.</Text>
        </View>
    );
}

export default ErrorView;
