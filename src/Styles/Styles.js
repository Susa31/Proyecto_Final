import { StyleSheet } from 'react-native';

export const GlobalStyles = StyleSheet.create({
    
    feedContainer: { 
        flex: 1, 
        backgroundColor: '#f0f2f5' 
    },
    whiteContainer: {
        flex: 1, 
        backgroundColor: '#fff',
    },
    
    errorText: {
        textAlign: 'center', 
        marginTop: 30, 
        fontSize: 18,
        color: 'red',
    },
    emptyTextGeneral: { 
        textAlign: 'center', 
        marginTop: 20,
        fontSize: 16,
        color: 'gray',
    },
    
    //ZHeader
    headerSafeArea: {
        backgroundColor: '#8A2BE2'
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 10,
        height: 60,
    },
    headerAvatarWrapper: {
        width: 52, 
        height: 52,
        borderRadius: 26,
        borderWidth: 1,
        borderColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    headerAvatarFallback: {
        backgroundColor: '#BCA1E8', 
    },
    headerUsername: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
        flex: 1, 
        textAlign: 'center',
        marginHorizontal: 10,
    },
    headerLogoutText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 16,
        paddingLeft: 5,
    },

    //Login and Register
    authContainer: { 
        flex: 1,
        backgroundColor: '#f0f2f5' 
    },
    authInner: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    authScrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 16,
    },
    authTitle: {
        fontSize: 32, 
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 24,
        color: '#333'
    },
    authRegisterTitle: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    authCard: {
        borderRadius: 12,
        elevation: 3,
        paddingTop: 10, 
    },
    authProfileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom: 20,
        alignSelf: 'center'
    },
    authHeaderContainer: {
        alignItems: 'center',
        marginBottom: 16,
    },
    authAvatar: {
        marginBottom: 12,
        backgroundColor: '#e0e0e0' 
    },
    authInput: {
        marginBottom: 12,
    },
    authInputRegister: {
        marginBottom: 4, 
    },
    authButton: {
        marginTop: 10,
        paddingVertical: 8,
    },
    authDivider: {
        marginVertical: 20,
        height: 1,
    },
    authInfoContainer: {
        marginTop: 8,
        marginBottom: 16,
    },
    authInfoText: {
        fontSize: 12,
        color: '#666',
    },

    //OublishPost
    publishContainer: {
        flex: 1,
        backgroundColor: '#f0f2f5'
    },
    publishInnerContainer: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        paddingTop: 50
    },
    publishCard: {
        borderRadius: 12,
        elevation: 2,
    },
    publishTitle: {
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 15,
        fontWeight: 'bold'
    },
    charCount: { //PublishPost and ViewPost
        textAlign: 'right',
        color: 'gray',
        marginBottom: 10
    },
    mediaPreviewContainer: {
        position: 'relative',
        marginVertical: 10,
    },
    mediaPreviewImage: {
        width: '100%',
        height: 200, 
        borderRadius: 8,
        resizeMode: 'cover',
    },
    mediaPreviewVideoPlaceholder: {
        padding: 20,
        backgroundColor: '#eee',
        textAlign: 'center',
        borderRadius: 8,
        color: '#555'
    },
    mediaRemoveButton: {
        position: 'absolute',
        top: 5,
        right: 5,
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderRadius: 15,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    mediaRemoveText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    mediaButtonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    mediaButton: {
        flex: 1, 
        marginHorizontal: 5, 
    },
    
    //ViewPost
    viewPostInnerContainer: {
        padding: 16,
    },
    postContentDetail: { 
        marginTop: 10,
        fontSize: 18, 
        lineHeight: 26,
    },
    postImageDetail: { 
        width: '100%',
        height: 350, 
        borderRadius: 8,
        marginTop: 15,
        backgroundColor: '#000',
    },
    commentTitle: {
        fontWeight: 'bold',
        fontSize: 18,
        marginBottom: 10,
    },
    commentsList: {
        marginTop: 20,
    },
    commentCard: {
        marginBottom: 8,
        backgroundColor: '#fff'
    },
    commentAuthor: {
        fontWeight: 'bold'
    },
    commentDate: {
        color: 'gray',
        fontSize: 11
    },
    commentText: {
        marginTop: 4
    },
    viewPostActions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center', 
        marginTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 15,
    },
    
    //ViewProfile
    profileHeader: { 
        alignItems: 'center', 
        padding: 20, 
        backgroundColor: '#fff',
    },
    avatar: { 
        marginBottom: 10, 
        backgroundColor: '#8A2BE2',
    },
    uploadingOverlay: {
        ...StyleSheet.absoluteFillObject, 
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 50,
    },
    editIcon: {
        position: 'absolute',
        bottom: 5,
        right: -5,
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 2,
    },
    profileName: { 
        fontSize: 22, 
        fontWeight: 'bold', 
    },
    profileUsername: { 
        fontSize: 16, 
        color: 'gray', 
    },
    followContainer: { 
        flexDirection: 'row', 
        justifyContent: 'space-around', 
        paddingVertical: 15,
        backgroundColor: '#f9f9f9',
        borderTopWidth: 1, 
        borderBottomWidth: 1, 
        borderColor: '#eee', 
    },
    followBox: {
        alignItems: 'center',
        flex: 1, 
    },
    followCount: { 
        fontSize: 18, 
        fontWeight: 'bold', 
        textAlign: 'center', 
    },
    followLabel: { 
        fontSize: 14, 
        color: 'gray', 
        textAlign: 'center', 
    },
    buttonContainer: { 
        padding: 20, 
        backgroundColor: '#fff',
    },
    profileCard: { 
        margin: 15, 
        marginTop: 0,
        elevation: 1,
    },
    sectionTitle: { 
        fontSize: 18, 
        fontWeight: 'bold', 
    },
    biography: { 
        fontSize: 16, 
    },
    input: {
        fontSize: 16,
        padding: 0,
        marginBottom: 10,
        backgroundColor: '#f9f9f9',
    },
    sectionTitleFeed: {
        fontSize: 18, 
        fontWeight: 'bold', 
        paddingHorizontal: 15,
        paddingTop: 10,
        paddingBottom: 5,
        backgroundColor: '#fff',
        color: '#333'
    },
    
    //Followers/Following List
    listItem: { 
        padding: 10, 
    },
    listItemTitle: { 
        fontWeight: 'bold', 
    },
    listItemDescription: { 
        fontSize: 12, 
    },
    divider: { 
        height: 1, 
        backgroundColor: '#eee', 
    },
    paginationContainerList: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: 15, 
        borderTopWidth: 1, 
        borderColor: '#eee', 
    },
    paginationTextList: { 
        fontSize: 16, 
        color: '#333', 
    },
    emptyTextList: { 
        textAlign: 'center', 
        marginTop: 20, 
        color: '#8A2BE2'
    },

    //Feed
    emptyContainer: {
        padding: 20,
        alignItems: 'center',
        marginTop: 50,
    },
    emptyText: {
        fontSize: 16,
        color: 'gray',
    },
    fab: {
      position: 'absolute',
      margin: 16,
      right: 0,
      bottom: 0,
      backgroundColor: '#8A2BE2',
    },
    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 15,
        alignItems: 'center',
        backgroundColor: '#fff',
        marginBottom: 80,
    },
    paginationText: {
        fontSize: 16,
        color: '#333',
        fontWeight: 'bold',
    },
    
    //Post Card
    card: {
        marginVertical: 8,
        marginHorizontal: 10,
        elevation: 1,
        backgroundColor: '#fff',
    },
    repostCard: {
        marginVertical: 0,
        marginHorizontal: 10,
        elevation: 1,
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        marginBottom: 8,
        backgroundColor: '#fff',
    },
    repostContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 15,
        paddingTop: 8,
        backgroundColor: 'transparent',
    },
    repostText: {
        color: 'gray',
        fontSize: 13,
        fontWeight: '500',
        marginLeft: -5,
    },
    postHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    postNames: {
        fontWeight: 'bold',
        fontSize: 16,
        maxWidth: '80%',
    },
    postDate: {
        color: 'gray',
        fontSize: 12,
        alignSelf: 'flex-start',
    },
    postContent: {
        fontSize: 15,
        lineHeight: 22,
        marginBottom: 10,
    },
    postImage: {
        width: '100%',
        height: 400,
        borderRadius: 8,
        marginTop: 5,
    },
    postVideo: {
        width: '100%',
        height: 300,
        borderRadius: 8,
        marginTop: 5,
        backgroundColor: '#000',
    },
    //Feed actions
    postActions: {
        flexDirection: 'row',
        marginTop: 12,
        justifyContent: 'space-around',
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 0,
    },
    actionButtonLabel: {
        fontSize: 14,
        color: '#555',
    },
    //PostList and Repost actions
    postActionsText: {
        flexDirection: 'row',
        marginTop: 12,
        justifyContent: 'space-around', 
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 10,
    },
    actionText: {
        color: '#555',
        fontWeight: 'bold',
    },
});