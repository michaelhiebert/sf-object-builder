import React from 'react';

import NavBar from './NavBar.js';
import LoginPanel from './LoginPanel.js';

export default class App extends React.Component {
  state = {
    user: null
  };

  componentDidMount() {
    // Get logged in user
    fetch('/auth/whoami', {
      method: 'get',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    }).then((response) => {
      if (response.ok) {
        response.json().then((json) => {
          this.setState({ user: json });
        });
      } else if (response.status !== 401) {
        // Ignore 'unauthorized' responses before logging in
        console.error('Failed to retrieve logged user.', JSON.stringify(response));
      }
    });
  }

  render() {
    return (
      <div>
        <NavBar user={this.state.user} />
        {this.state.user == null ? (
          <LoginPanel />
        ) : (
          <div className="slds-m-around--xx-large">
            {/* TODO: add CSV component */}
          </div>
        )}
      </div>
    );
  }
}
