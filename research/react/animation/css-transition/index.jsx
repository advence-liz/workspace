import React from 'react'
import ReactDOM from 'react-dom'
import {
  Grid,
  Button,
  FormGroup,
  ControlLabel,
  FormControl,
  HelpBlock
} from 'react-bootstrap'
import { CSSTransition } from 'react-transition-group'

import './style.scss'

class Example extends React.Component {
  state = {
    name: '',
    showValidationMessage: false,
    showValidationButton: false
  }

  render() {
    const { name, showValidationMessage, showValidationButton } = this.state
    return (
      <Grid style={{ paddingTop: '2rem' }}>
        <HelpBlock>ddd</HelpBlock>
        <form style={{ marginTop: '1rem' }}>
          <FormGroup validationState={showValidationMessage ? 'success' : null}>
            <ControlLabel>Your name</ControlLabel>
            <FormControl
              type="text"
              value={name}
              onFocus={() => {
                this.setState({
                  showValidationMessage: false
                })
              }}
              onChange={event => {
                this.setState({
                  name: event.target.value,
                  showValidationButton: true
                })
              }}
            />
            <CSSTransition
              in={showValidationMessage}
              timeout={5000}
              classNames="message"
              // unmountOnExit
              onExited={() => {
                this.setState({
                  showValidationButton: true
                })
              }}
            >
              {state => (
                <HelpBloc>
                  Your name rocks!
                  <CSSTransition
                    in={state === 'entered'}
                    timeout={300}
                    classNames="star"
                    // unmountOnExit
                  >
                    <div className="star">⭐</div>
                  </CSSTransition>
                </HelpBlock>
              )}
            </CSSTransition>
          </FormGroup>
        </form>
        {showValidationButton ? (
          <Button
            onClick={() => {
              this.setState(state => ({
                showValidationButton: false,
                showValidationMessage: true
              }))
            }}
          >
            Validate form
          </Button>
        ) : null}
      </Grid>
    )
  }
}

ReactDOM.render(<Example />, document.getElementById('root'))
