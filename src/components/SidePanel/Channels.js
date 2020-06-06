import React, { Component } from 'react';
import { Menu, Icon, Modal, Form, Input, Button, List } from 'semantic-ui-react';
import firebase from '../../firebase';
import { connect } from 'react-redux';
import { setCurrentChannel, setPrivateChannel } from '../../actions/index';

class Channels extends Component {
    state = {
        channels: [],
        modal: false,
        channelName: null,
        channelDetails: null,
        channelsRef: firebase.database().ref('channels'),
        messagesRef: firebase.database().ref('messages'),
        firstLoad: true,
        activeChannel: '',
        channel: null,
        notifications: []
    }

    componentDidMount() {
        this.addListeners()
    }

    addListeners = () => {
        let loadedChannels = [];

        this.state.channelsRef.on('child_added', snap => {
            loadedChannels.push(snap.val())
            this.setState({ channels: loadedChannels }, () => this.setFirstChannel())
            this.addNotificationListener(snap.key);
        })
    }

    addNotificationListener = channelId => {
        this.state.messagesRef.child(channelId).on('value', snap => {
            if (this.state.channel) {
                this.handleNotifications(channelId, this.state.channel.id, this.state.notifications, snap);
            }
        })
    }

    handleNotifications = (channelId, currentChannelId, notifications, snap) => {
        let lastTotal = 0;

        let index = notifications.findIndex(notification => notification.id === channelId)

        if (index !== -1) {
            lastTotal = notifications[index].total;

            if (snap.numChildren() - lastTotal > 0) {
                notifications[index].count = snap.numChildren() - lastTotal;
            }
            notifications[index].lastKnownTotal = snap.numChildren()
        } else {
            notifications.push({
                id: channelId,
                total: snap.numChildren(),
                lastKnownTotal: snap.numChildren(),
                count: 0
            })
        }

        this.setState({ notifications })
    }

    setFirstChannel = () => {
        const firstChannel = this.state.channels[0];
        if (this.state.firstLoad && this.state.channels.length > 0) {
            this.props.setCurrentChannel(firstChannel)
            this.props.setPrivateChannel(false)
            this.setActiveChannel(firstChannel)
            this.setState({ channel: firstChannel })
        }
        this.setState({ firstLoad: false })
    }

    closeModal = () => this.setState({
        modal: false
    })

    openModal = () => this.setState({
        modal: true
    })

    handleChange = event => {
        this.setState({ [event.target.name]: event.target.value })
    }

    handleSubmit = event => {
        event.preventDefault();
        if (this.isFormValid()) {
            this.addChannel()
        }
    }

    addChannel = () => {
        const { channelsRef, channelName, channelDetails } = this.state;

        const key = channelsRef.push().key;

        const newChannel = {
            id: key,
            name: channelName,
            details: channelDetails,
            createdBy: {
                name: this.props.user.displayName,
                avatar: this.props.user.photoURL
            }
        }

        channelsRef
            .child(key)
            .update(newChannel)
            .then(() => {
                this.setState({ channelName: '', channelDetails: '' })
                this.closeModal();
                // console.log('Channel added')
            })
            .catch(err => {
                console.error(err)
            })
    }

    isFormValid = () => this.state.channelDetails && this.state.channelName

    displayChannels = () => {
        const { channels } = this.state;

        channels.length > 0 && channels.map(channel => (
            <Menu.Item
                key={channel.id}
                onClick={() => console.log(channel)}
                name={channel.name}
                style={{ apacity: 0.7 }}>
                #{channel.name}
            </Menu.Item>
        ))
    }


    changeChannel = channel => {
        this.setActiveChannel(channel);
        this.clearNotifications();
        this.props.setCurrentChannel(channel)
        this.props.setPrivateChannel(false)
        this.setState({ channel })
    }

    clearNotifications = () => {
        let index = this.state.notifications.findIndex(notification => notification.id === this.state.channel.id)

        if (index !== -1) {
            let updatedNotifications = [...this.state.notifications];
            updatedNotifications[index].total = this.state.notifications[index].lastKnownTotal;
            updatedNotifications[index].count = 0;

            this.setState({ notifications: updatedNotifications })
        }
    }

    setActiveChannel = channel => {
        // console.log(channel.id)
        this.setState({ activeChannel: channel.id })
    }

    getNotificationCount = channel => {
        let count = 0;

        this.state.notifications.forEach(notification => {
            if (notification.id === channel.id) {
                count = notification.count
            }
        })

        if (count > 0) return count;
    }

    render() {
        const { channels, modal } = this.state;

        return (
            <React.Fragment>
                <Menu.Menu className="menu">
                    <Menu.Item>
                        <span>
                            <Icon name="exchange" /> CHANNELS
                    </span> {" "}
                    ({channels.length}) <Icon name="add" onClick={this.openModal} />
                    </Menu.Item>
                    {/* Channels */}
                    {/* {this.displayChannels()} */}
                    {channels.map(channel => {
                        // console.log(channel.name)
                        return <Menu.Item
                            key={channel.id}
                            onClick={() => this.changeChannel(channel)}
                            name={channel.name}
                            style={{ apacity: 0.7 }}
                            active={channel.id === this.state.activeChannel}
                        >
                            {this.getNotificationCount(channel) && (
                                <List color="red">
                                    {this.getNotificationCount(channel)}
                                </List>
                            )}
                            #{channel.name}
                        </Menu.Item>
                    })}
                </Menu.Menu>

                {/* Add channel modal */}
                <Modal basic open={modal} onClose={this.closeModal}>
                    <Modal.Header>Add a channel</Modal.Header>
                    <Modal.Content>
                        <Form onSubmit={this.handleSubmit}>
                            <Form.Field>
                                <Input
                                    fluid
                                    label="Name of channel"
                                    onChange={this.handleChange}
                                    name="channelName"
                                />

                                <Input
                                    fluid
                                    label="About the channel"
                                    onChange={this.handleChange}
                                    name="channelDetails"
                                />

                            </Form.Field>
                        </Form>
                    </Modal.Content>

                    <Modal.Actions>
                        <Button color="green" inverted onClick={this.handleSubmit}>
                            <Icon name="checkmark" />Add
                    </Button>

                        <Button color="red" inverted onClick={this.closeModal}>
                            <Icon name="remove" />Cancel
                    </Button>

                    </Modal.Actions>
                </Modal>
            </React.Fragment>
        )
    }
}
const mapStateToProps = state => ({
    user: state.user.currentUser
})

export default connect(mapStateToProps, { setCurrentChannel, setPrivateChannel })(Channels);