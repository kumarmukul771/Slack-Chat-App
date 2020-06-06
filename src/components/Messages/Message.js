import React, { Component } from 'react';
import { Image, Comment } from 'semantic-ui-react';
import { connect } from 'react-redux';
import moment from 'moment';

const isOwnMessage = (message, user) => {
    return message.user.id === user.uid ? 'message_self' : '';
}

const isImage = (message) => {
    return message.hasOwnProperty('image') && !message.hasOwnProperty('content')
}

const timeFromNow = timeStamp => moment(timeStamp).fromNow();

const Message = ({ message, user }) => {
    return (
        <Comment>
            <Comment.Avatar src={message.user.avatar} />
            <Comment.Content className={isOwnMessage(message, user)}>
                <Comment.Author as="a">{message.user.name} </Comment.Author>
                <Comment.Metadata>{timeFromNow(message.timeStamp)} </Comment.Metadata>
                {isImage(message)
                    ? <Image src={message.image} className="message_image" />
                    : <Comment.Text>{message.content} </Comment.Text>}

            </Comment.Content>
        </Comment>
    )
}

export default Message;