import React from 'react';
import { View, Text, TouchableOpacity, Image, Alert } from 'react-native';
import { Card, Button, IconButton } from 'react-native-paper';
import Video from 'react-native-video';
import { GlobalStyles } from '../Styles/Styles';

const PostCard = ({ item, user, navigation, handleRepost, updatePost }) => {
    const displayAuthorName = item.isRepost ? item.originalAuthorNameFull : item.authorNameFull;
    const displayAuthorUser = item.isRepost ? item.originalAuthorNameUser : item.authorNameUser;
    
    const handlePress = () => {
        navigation.navigate('ViewPost', { 
            post: item, 
            user: user, 
            updatePost 
        });
    }

    const safeHandleRepost = handleRepost || (() => Alert.alert('Error', 'Repost action not available from this view.'));
    
    const isFeedCard = !!handleRepost;
    
    const actionsStyle = isFeedCard ? GlobalStyles.postActions : GlobalStyles.postActionsText;
    
    return (
    <View>
        {item.isRepost && (
            <View style={GlobalStyles.repostContainer}>
                <IconButton icon="repeat-variant" size={16} color="gray" style={{margin: 0, padding: 0}} />
                <Text style={GlobalStyles.repostText}>{item.authorNameFull} Reposted</Text>
            </View>
        )}
        <TouchableOpacity onPress={handlePress}>
          <Card style={item.isRepost ? GlobalStyles.repostCard : GlobalStyles.card}>
            <Card.Content>
              <View style={GlobalStyles.postHeader}>
                <Text style={GlobalStyles.postNames}>
                    {displayAuthorName}
                    <Text style={{fontWeight: 'normal', color: 'gray'}}> @{displayAuthorUser}</Text> 
                </Text>
                <Text style={GlobalStyles.postDate}>{item.createdAt || '...'}</Text>
              </View>
              {item.text ? (<Text style={GlobalStyles.postContent}>{item.text}</Text>) : null}
              {item.mediaType === 'image' && item.mediaUrl && (
                <Image 
                    source={{ uri: item.mediaUrl }} 
                    style={[GlobalStyles.postImage, { width: '100%', maxHeight: 400 }]} 
                    resizeMode="contain" 
                />
              )}
              {item.mediaType === 'video' && item.mediaUrl && (
                  <Video
                      source={{ uri: item.mediaUrl }}
                      style={[GlobalStyles.postVideo, { width: '100%', maxHeight: 400 }]}
                      resizeMode="contain"
                      controls={true}  
                      paused={true}    
                      onError={(e) => console.log("Video Error:", e)}
                  />
              )}
              
              <View style={actionsStyle}>
                    {isFeedCard ? (
                        <>
                            <Button
                                icon={item.hasBeenRepostedByMe ? "repeat" : "repeat-variant"}
                                onPress={() => safeHandleRepost(item)}
                                disabled={item.isRepost && item.authorId !== user.id} 
                                labelStyle={GlobalStyles.actionButtonLabel}
                            >
                                {item.repostCount || 0}
                            </Button>
                            <Button
                                icon={(item.likes || []).includes(user.nameUser) ? 'heart' : 'heart-outline'}
                                onPress={handlePress}
                                labelStyle={GlobalStyles.actionButtonLabel}
                            >
                                {(item.likes || []).length}
                            </Button>
                            <Button
                                icon="comment-outline"
                                onPress={handlePress}
                                labelStyle={GlobalStyles.actionButtonLabel}
                            >
                                {(item.comments || []).length}
                            </Button>
                        </>
                    ) : (
                        <>
                            <Text style={GlobalStyles.actionText}>{(item.repostCount || 0)} Reposts</Text>
                            <Text style={GlobalStyles.actionText}>{(item.likes || []).length} Likes</Text>
                            <Text style={GlobalStyles.actionText}>{(item.comments || []).length} Comments</Text>
                        </>
                    )}
              </View>
            </Card.Content>
          </Card>
        </TouchableOpacity>
    </View>
    );
};

export default PostCard;