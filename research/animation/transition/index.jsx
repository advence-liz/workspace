import React from 'react'
import ReactDOM from 'react-dom'
import { Grid, Button, Well } from 'animation/css-transition/node_modules/react-bootstrap'
import { Transition } from 'react-transition-group'

class Example extends React.Component {
  state = {
    show: false,
    entered: false
  }

  render () {
    const { show } = this.state
    return (
      <Grid style={{ paddingTop: '2rem' }}>
        <Button
          onClick={() => {
            this.setState(state => ({
              show: !state.show
            }))
          }}
        >
          Toggle
        </Button>
        <Well style={{ marginTop: '1rem' }}>
          <Transition in={show} timeout={1000} unmountOnExit>
            {state => {
              switch (state) {
                case 'entering':
                  return 'Entering…'
                case 'entered':
                  return 'Entered!'
                case 'exiting':
                  return 'Exiting…'
                case 'exited':
                  return 'Exited!'
              }
            }}
          </Transition>
        </Well>
      </Grid>
    )
  }
}

ReactDOM.render(<Example />, document.getElementById('root'))
