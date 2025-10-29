import { StyleSheet } from 'react-native';

const screenStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
        padding: 16,
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
        color: '#FFFFFF',
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
        color: '#E1BEE7',
    },
    followLabel: {
        fontSize: 14,
        textAlign: 'center',
        color: '#B0A3D4',
    },
    buttonContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    profileCard: {
        marginVertical: 10,
        borderRadius: 12,
        backgroundColor: '#1E1E1E',
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 6,
        color: '#BB86FC',
    },
    divider: {
        backgroundColor: '#7C4DFF',
        marginVertical: 8,
    },
    biografia: {
        fontSize: 15,
        color: '#D1C4E9',
        lineHeight: 22,
    },
    listItem: {
        backgroundColor: '#1E1E1E',
    },
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        backgroundColor: '#7C4DFF',
    },
});

export default screenStyles;