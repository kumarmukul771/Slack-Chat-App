import React, { Component } from 'react';
import { Grid, Header, Icon, Dropdown, Image } from 'semantic-ui-react';
import firebase from '../../firebase';
import { connect } from 'react-redux';

class UserPanel extends Component {
    state = {
        user: null
    }

    handleSignOut = () => {
        firebase
            .auth()
            .signOut()
            .then(() => console.log('Signed out'))
    }

    dropDownOptions = () => [
        {
            key: 'user',
            text: <span>Signed in as <strong>
                {this.state.user && this.state.user.displayName}
            </strong></span>,
            disabled: true
        },
        {
            key: 'avatar',
            text: <span>Change avatar</span>
        },
        {
            key: 'signout',
            text: <span onClick={this.handleSignOut}>Sign Out</span>
        }
    ]

    componentDidMount() {
        this.setState({
            user: this.props.currentUser
        })
    }
    render() {
        return (
            <Grid style={{ background: '#4c3c4c' }}>
                <Grid.Column>
                    <Grid.Row style={{ padding: '1.2rem', margin: 0 }}>
                        <Header inverted floated="left" as="h2">
                            <Icon name="code" />
                            <Header.Content>Devchat</Header.Content>
                        </Header>


                        {/* User Dropdown  */}
                        <Header style={{ padding: '0.25em' }} as="h4" inverted>
                            <Dropdown trigger={
                                <span>
                                    <Image src={this.state.user && this.state.user.photoURL} avatar spaced="right" />
                                    {this.state.user && this.state.user.displayName}
                                </span>
                            } options={this.dropDownOptions()} />
                        </Header>

                    </Grid.Row>
                </Grid.Column>
            </Grid>
        )
    }
}
const mapStateToProps = state => ({
    currentUser: state.user.currentUser
})

export default connect(mapStateToProps)(UserPanel);