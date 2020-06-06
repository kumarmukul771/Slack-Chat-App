import React, { Component } from 'react';
import { Segment, Header, Input, Button } from 'semantic-ui-react';
import { connect } from 'react-redux';
import firebase from '../../firebase';
import FileModal from './FileModal';
import uuidv4 from 'uuid/v4';
import ProgressBar from './ProgressBar';

class MessagesForm extends Component {
    state = {
        message: '',
        loading: false,
        errors: [],
        modal: false,
        storageRef: firebase.storage().ref(),
        uploadTask: null,
        uploadState: '',
        percentUploaded: 0
    }

    handlechange = event => {
        this.setState({ [event.target.name]: event.target.value })
    }

    setMessage = (fileUrl = null) => {
        const message = {
            user: {
                name: this.props.user.displayName,
                avatar: this.props.user.photoURL,
                id: this.props.user.uid
            },
            timeStamp: firebase.database.ServerValue.TIMESTAMP
        }

        if (fileUrl !== null) {
            message['image'] = fileUrl
        } else {
            message['content'] = this.state.message
        }

        return message;
    }

    sendMessage = () => {
        const { getMessagesRef, currentChannel } = this.props;
        const { message } = this.state;

        console.log(currentChannel);

        if (message) {
            this.setState({ loading: true })
            getMessagesRef()
                .child(currentChannel.id)
                .push()
                .set(this.setMessage())
                .then(() => {
                    this.setState({
                        loading: false,
                        errors: [],
                        message: ''
                    })
                })
                .catch(err => {
                    this.setState({
                        loading: false,
                        errors: this.state.errors.concat(err)
                    })
                })
        } else {
            this.setState({
                errors: this.state.errors.concat({ message: 'Add a message' })
            })
        }
    }

    getPath = () => {
        if (this.props.isPrivateChannel) {
            return `chat/private-${this.props.currentChannel.id}`;
        } else {
            return `chat/public`
        }
    }

    openModal = () => this.setState({ modal: true })
    closeModal = () => this.setState({ modal: false })

    uploadFile = (file, metaData) => {
        const { messagesRef, currentChannel } = this.props;
        const pathToUpload = currentChannel.id;
        const ref = this.props.getMessagesRef();
        const filePath = `chat/public/${uuidv4()}.jpg`;

        console.log('uploadFile', ref)

        this.setState({
            uploadState: 'uploading',
            uploadTask: this.state.storageRef.child(filePath).put(file, metaData)
        }, () => {
            this.state.uploadTask.on('state_changed', snap => {
                const percentUploaded = Math.round((snap.bytesTransferred / snap.totalBytes) * 100)
                console.log(snap.bytesTransferred, snap.totalBytes)
                this.setState({ percentUploaded: percentUploaded })
            },
                err => {
                    // console.log(err)
                    console.error(err);
                    this.setState({
                        errors: this.state.errors.concate(err),
                        uploadState: 'error',
                        uploadTask: null
                    })
                },
                () => {
                    // console.log(this.state.uploadTask)
                    this.state.uploadTask.snapshot.ref.getDownloadURL().then(downloadUrl => {
                        console.log(downloadUrl, ref, pathToUpload)
                        this.sendFileMessage(downloadUrl, ref, pathToUpload)
                    })
                        .catch(err => {
                            console.error(err);
                            this.setState({
                                errors: this.state.errors.concat(err),
                                uploadState: 'error',
                                uploadTask: null
                            })
                        })
                }
            )
        }
        )
    }

    sendFileMessage = (fileUrl, ref, pathToUpload) => {
        console.log(ref)
        ref.child(pathToUpload)
            .push()
            .set(this.setMessage(fileUrl))
            .then(() => {
                this.setState({
                    uploadState: 'done'
                })
            })
            .catch(err => {
                console.error(err)
                this.setState({
                    errors: this.state.errors.concat(err),

                })
            })
    }

    render() {
        const { errors, message, loading, modal, percentUploaded, uploadState } = this.state;
        console.log(uploadState)

        return (
            <Segment className="message_form">
                <Input
                    fluid
                    name="message"
                    onChange={this.handlechange}
                    value={message}
                    style={{ marginBottom: '0.7em' }}
                    label={<Button icon={"add"} />}
                    placeholder="Write your message"
                    className={
                        errors.some(error => error.message.includes('message')) ? 'error' : ''
                    }
                />
                <Button.Group icon widths="2">
                    <Button color="orange"
                        content="Add reply"
                        disabled={loading}
                        onClick={this.sendMessage}
                        labelPosition="left"
                        icon="edit"
                    />
                    <Button color="teal"
                        content="Upload media"
                        labelPosition="right"
                        icon="cloud upload"
                        onClick={this.openModal}
                        disabled={uploadState === 'uploading'}
                    />
                </Button.Group>
                <FileModal
                    modal={modal}
                    closeModal={this.closeModal}
                    uploadFile={this.uploadFile} />
                <ProgressBar uploadState={uploadState} percentUploaded={percentUploaded} />
            </Segment>
        )
    }
}

const mapStateToProps = state => ({
    currentChannel: state.channel.currentChannel,
    user: state.user.currentUser
})
export default connect(mapStateToProps)(MessagesForm);