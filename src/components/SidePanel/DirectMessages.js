import React, { Component } from 'react';
import { Menu, Icon } from 'semantic-ui-react';
import { connect } from 'react-redux';
import firebase from '../../firebase';
import { setCurrentChannel, setPrivateChannel } from '../../actions/index';

class DirectMessages extends Component {
    state = {
        users: [],
        user: this.props.user,
        usersRef: firebase.database().ref('users'),
        connectedRef: firebase.database().ref('.info/connected'),
        presenceRef: firebase.database().ref('presence'),
        activeChannel: ''
    }

    componentDidMount() {
        if (this.state.user) {
            this.addListeners(this.state.user.uid)
        }
    }

    addListeners = currentUserId => {
        let loadedUsers = [];

        this.state.usersRef.on('child_added', snap => {
            if (snap.key !== currentUserId) {
                let user = snap.val();
                user['status'] = 'offline';
                user['uid'] = snap.key;
                loadedUsers.push(user);

                console.log(loadedUsers)
                this.setState({ users: loadedUsers })
            }

        });

        this.state.connectedRef.on('value', snap => {
            if (snap.val() === true) {
                const ref = this.state.presenceRef.child(currentUserId);
                ref.set(true);
                ref.onDisconnect().remove(err => {
                    if (err !== null) {
                        console.error(err);
                    }
                })
            }
        })

        this.state.presenceRef.on('child_added', snap => {
            if (snap.key !== currentUserId) {
                this.addStatusToUser(snap.key)
            }
        })

        this.state.presenceRef.on('child_removed', snap => {
            if (snap.key !== currentUserId) {
                this.addStatusToUser(snap.key, false)
            }
        })
    }

    addStatusToUser = (userId, connected = true) => {
        const updatedUsers = this.state.users.reduce((acc, user) => {
            if (user.uid === userId) {
                user['status'] = `${connected ? 'online' : 'offline'}`
            }
            return acc.concat(user);
        }, [])

        this.setState({
            users: updatedUsers
        })
    }

    isUserOnline = user => user.status === 'online'

    changeChannel = user => {
        // console.log(user)
        const channelId = this.getChannelId(user.uid);
        console.log(channelId)

        const channelData = {
            id: channelId,
            name: user.name
        };

        this.props.setCurrentChannel(channelData);
        this.props.setPrivateChannel(true);
        this.setActiveChannel(user.uid);
    }

    setActiveChannel = userId => {
        this.setState({ activeChannel: userId })
    }

    getChannelId = userId => {
        const currentUserId = this.state.user.uid;
        return userId < currentUserId ? `${currentUserId}/${userId}` : `${userId}/${currentUserId}`;
    }

    render() {
        const { users, activeChannel } = this.state;

        return (
            <Menu.Menu className="menu">
                <Menu.Item>
                    <span>
                        <Icon name="mail" />Direct Messages
                    </span>{' '}
                    ({users.length})
                </Menu.Item>
                {/* Users to send direct Messages */}
                {users.map(user => (
                    <Menu.Item
                        key={user.uid}
                        active={activeChannel === user.uid}
                        onClick={() => this.changeChannel(user)}
                        style={{ opacity: 0.7, fontStyle: 'italic' }} >
                        <Icon name="circle"
                            color={this.isUserOnline(user) ? 'green' : 'red'} />
                            @{user.name}
                    </Menu.Item>
                ))}
            </Menu.Menu>
        )
    }
}

const mapStateToProps = state => ({
    user: state.user.currentUser
})
export default connect(mapStateToProps, { setCurrentChannel, setPrivateChannel })(DirectMessages);