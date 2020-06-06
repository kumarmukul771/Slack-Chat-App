import React, { Component } from 'react';
import { Modal, Input, Button, Icon } from 'semantic-ui-react';
import mime from 'mime';

class FileModal extends Component {
    state = {
        file: null,
        authorized: ['image/jpeg', 'image/png']
    }

    addFile = event => {
        const file = event.target.files[0]
        if (file) {
            this.setState({
                file: file
            })
        }
    }

    sendFile = () => {
        const { file } = this.state;
        const { uploadFile, closeModal } = this.props;

        console.log(file)

        if (file !== null) {
            if (this.isAuthorized(file.name)) {
                console.log('Authorized')
                const metaData = { contentType: mime.lookup(file.name) }
                uploadFile(file, metaData);
                closeModal();
                this.setState({ file: null })
            }
        }
    }

    isAuthorized = (fileName) => this.state.authorized.includes(mime.lookup(fileName))

    render() {
        const { modal, closeModal } = this.props;

        return (
            <Modal basic open={modal} onClose={closeModal}>
                <Modal.Header>Select an image</Modal.Header>
                <Modal.Content>
                    <Input fluid
                        label="File types: jpg, png"
                        name="file"
                        type="file"
                        onChange={this.addFile} />
                </Modal.Content>
                <Modal.Actions>
                    <Button
                        color="green"
                        onClick={this.sendFile}
                        inverted>
                        <Icon name="checkmark"
                        />Send
                    </Button>
                    <Button
                        color="red"
                        onClick={closeModal}
                        inverted>
                        <Icon name="remove" />Cancel
                    </Button>
                </Modal.Actions>
            </Modal>
        )
    }
}

export default FileModal;