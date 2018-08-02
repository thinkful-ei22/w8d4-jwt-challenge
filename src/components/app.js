import React from 'react';
import {connect} from 'react-redux';
import {Route, withRouter} from 'react-router-dom';

import HeaderBar from './header-bar';
import LandingPage from './landing-page';
import Dashboard from './dashboard';
import RegistrationPage from './registration-page';
import {refreshAuthToken, clearAuth, showTimeoutWarning, hideTimeoutWarning} from '../actions/auth';

export class App extends React.Component {
    componentDidUpdate(prevProps) {
        if (!prevProps.loggedIn && this.props.loggedIn) {
            // When we are logged in, refresh the auth token periodically
            this.startPeriodicRefresh();

        } else if (prevProps.loggedIn && !this.props.loggedIn) {
            // Stop refreshing when we log out
            this.stopPeriodicRefresh();
        }
    }

    componentWillUnmount() {
        this.stopPeriodicRefresh();
    }

    startPeriodicRefresh() {
        this.refreshInterval = setInterval(
            () => this.props.dispatch(refreshAuthToken()),
            10 * 60 * 1000 // 10 minutes
        );
    }

    timer() {
        this.startTimer = setTimeout(
            () => this.props.dispatch(clearAuth()),
            5 * 60 * 1000 // 5 minutes
        );
    }

    timerBox() {
        this.dialogBox = setTimeout(
            () => this.props.dispatch(showTimeoutWarning()),
              4 * 60 * 1000 // 4 minutes
          )
    }

    inactivityTimer = () => {
      if(this.startTimer){
        clearTimeout(this.startTimer)
      }
      if(this.dialogBox){
        clearTimeout(this.dialogBox)
      }
      this.timer();
      this.timerBox();
    }

    stopPeriodicRefresh() {
        if (!this.refreshInterval) {
            return;
        }

        clearInterval(this.refreshInterval);
    }

    render() {
      let timeoutMessage;
      if(this.props.timeoutWarning === true){
        timeoutMessage = <button >Click to stay logged in</button>
      }

        return (
            <div onClick={() => {
              this.inactivityTimer();
              this.props.dispatch(hideTimeoutWarning());
            }} 
              className="app">
                <HeaderBar />
                <Route exact path="/" component={LandingPage} />
                <Route exact path="/dashboard" component={Dashboard}/>
                <Route exact path="/register" component={RegistrationPage} />
                <div>{timeoutMessage}</div>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    hasAuthToken: state.auth.authToken !== null,
    loggedIn: state.auth.currentUser !== null,
    timeoutWarning: state.auth.timeoutWarning
});

// Deal with update blocking - https://reacttraining.com/react-router/web/guides/dealing-with-update-blocking
export default withRouter(connect(mapStateToProps)(App));
