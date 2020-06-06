import React, { Component } from 'react';
import { Segment, Comment } from 'semantic-ui-react';
import MessagesHeader from './MessagesHeader';
import MessagesForm from './MessagesForm';
import firebase from '../../firebase';
import { connect } from 'react-redux';
import Message from './Message';

class Messages extends Component {
    state = {
        privateMessagesRef: firebase.database().ref('privateMessages'),
        messagesRef: firebase.database().ref('messages'),
        messages: [],
        messagesLoading: true,
        numUniqueUsers: '',
        searchTerm: '',
        searchLoading: false,
        searchResults: [],
        isPrivateChannel: this.props.isPrivateChannel
    }

    componentWillReceiveProps(nextProps) {
        this.props = nextProps
        const { user, currentChannel } = this.props;
        if (currentChannel && user) {
            this.addListeners(currentChannel.id)
        }
    }

    addListeners = channelId => {
        this.addMessageListeners(channelId)
    }

    addMessageListeners = channelId => {
        let loadedMesssages = [];

        const ref = this.getMessagesRef();

        ref.child(channelId).on('child_added', snap => {
            loadedMesssages.push(snap.val())
            this.setState({
                messages: loadedMesssages,
                messagesLoading: false
            })
            this.countUniqueUsers(loadedMesssages)
        })


    }

    getMessagesRef = () => {
        const { isPrivateChannel, messagesRef, privateMessagesRef } = this.state;
        return isPrivateChannel ? privateMessagesRef : messagesRef;
    }

    countUniqueUsers = messages => {
        const uniqueUsers = messages.reduce((acc, message) => {
            if (!acc.includes(message.user.name)) {
                acc.push(message.user.name)
            }

            return acc;
        }, [])

        const numUniqueUsers = `${uniqueUsers.length} users`;

        this.setState({ numUniqueUsers })
    }

    displayMessages = messages => (
        messages.length > 0 && messages.map(message => (
            <Message message={message} key={message.timeStamp} user={this.props.user} />
        ))
    )

    handleSearchChange = event => {
        this.setState({
            searchTerm: event.target.value,
            searchLoading: true
        }, () => this.handleSearchMessages())
    }

    handleSearchMessages = () => {
        const channelMessages = [...this.state.messages];
        const regex = new RegExp(this.state.searchTerm, 'gi');
        const searchResults = channelMessages.reduce((acc, message) => {
            if (message.content && message.content.match(regex) ||
                message.user.name.match(regex)) {
                acc.push(message)
            }
            return acc;
        }, [])

        this.setState({ searchResults })
        setTimeout(() => {
            this.setState({ searchLoading: false })
        }, 1000)
    }



    displayChannelName = channel => {
        return channel ? `${this.state.isPrivateChannel ? '@' : '#'}${channel.name}` : '';
    }

    render() {
        const { messagesRef, messages, numUniqueUsers, searchResults, searchTerm, searchLoading,isPrivateChannel } = this.state;
        // console.log(messages, numUniqueUsers)
        return (
            <React.Fragment>
                <MessagesHeader
                    channelName={this.displayChannelName(this.props.currentChannel)}
                    numUniqueUsers={numUniqueUsers}
                    handleSearchChange={this.handleSearchChange}
                    searchLoading={searchLoading}
                    isPrivateChannel={isPrivateChannel} />
                <Segment>
                    <Comment.Group className="messages">
                        {searchTerm ? this.displayMessages(searchResults) : this.displayMessages(messages)}
                    </Comment.Group>
                </Segment>

                <MessagesForm
                    messagesRef={messagesRef}
                    isPrivateChannel={isPrivateChannel}
                    getMessagesRef={this.getMessagesRef} />
            </React.Fragment>
        )
    }
}

const mapStateToProps = state => {
    return {
        currentChannel: state.channel.currentChannel,
        user: state.user.currentUser,
        isPrivateChannel: state.channel.isPrivateChannel
    }
}
export default connect(mapStateToProps)(Messages);