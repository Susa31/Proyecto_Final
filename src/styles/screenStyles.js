import { StyleSheet } from 'react-native';

const screenStyles = StyleSheet.create({
    container: {
            flex: 1,
            backgroundColor: '#FFFFFF',
            padding: 0,
    },
    profileHeader: {
            alignItems: 'center',
            marginVertical: 20,
    },
    avatar: {
            backgroundColor: '#7C4DFF',
            marginBottom: 10,
    },
    profileName: {
            fontSize: 22,
            fontWeight: '600',
            color: '#4A148C',
    },
    followContainer: {
            flexDirection: 'row',
            justifyContent: 'space-around',
            marginVertical: 20,
    },
    followCount: {
            fontSize: 18,
            fontWeight: '600',
            textAlign: 'center',
            color: '#7C4DFF',
    },
    followLabel: {
            fontSize: 14,
            textAlign: 'center',
            color: '#9575CD',
    },
    buttonContainer: {
            alignItems: 'center',
            marginBottom: 20,
    },
    profileCard: {
            marginVertical: 10,
            borderRadius: 12,
            backgroundColor: '#FFFFFF',
            elevation: 3,
            borderWidth: 1,
            borderColor: '#E1BEE7',
    },
    sectionTitle: {
            fontSize: 18,
            fontWeight: '600',
            marginBottom: 6,
            color: '#7C4DFF',
    },
    divider: {
            backgroundColor: '#7C4DFF',
            marginVertical: 0,
            height: 1,
    },
    biography: {
            fontSize: 15,
            color: '#000000',
            lineHeight: 22,
    },
    listItem: {
            backgroundColor: '#FFFFFF',
            paddingVertical: 8,
            paddingHorizontal: 16,
    },
    listItemTitle: {
            color: '#4A148C',
            fontWeight: '500',
    },
    listItemDescription: {
            color: '#7E57C2',
    },
    fab: {
            position: 'absolute',
            right: 20,
            bottom: 20,
            backgroundColor: '#7C4DFF',
    },
    paginationContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            padding: 16,
            alignItems: 'center',
            backgroundColor: '#FFFFFF',
    },
    paginationText: {
            fontSize: 16,
            color: '#4A148C',
    },
});

export default screenStyles;
