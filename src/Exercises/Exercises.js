import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { SyncLoader } from 'react-spinners';
import axios from 'axios';
import auth0Client from '../Auth';

var name = '';
var description = '';
const loadingDiv = {
  padding: '100px'
}
const loadingCss = {
  margin: 'auto'
}

class Exercises extends Component {
  constructor(props) {
    super(props);
    this.state = {
      exercises: [],
      user_id: auth0Client.isAuthenticated() ? auth0Client.getProfile().sub.split('|')[1] : null,
      loading: true
    };

    this.handleName = this.handleName.bind(this);
    this.handleDescription = this.handleDescription.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
  }

  async componentDidMount() {
    if (auth0Client.isAuthenticated()) {
      const userId = this.state.user_id;
      var exercises = [];
      try {
        exercises = await axios.get('https://extracker-api.herokuapp.com/api/exercises?userId=' + userId, {
          headers: {
            'Authorization': `Bearer ${auth0Client.getAccessToken()}`,
            crossDomain: true
          }
        });
        this.setState({ exercises: exercises.data, loading: false });
      } catch (exception) {
        console.log(exception);
      }
    }
  }

  handleName(event) {
    name = event.target.value;
  }

  handleDescription(event) {
    description = event.target.value;
  }

  async handleDelete(id) {
    const userId = this.state.user_id;
    const headers = {
      'Authorization': `Bearer ${auth0Client.getAccessToken()}`,
      crossDomain: true
    }

    this.setState({ loading: true });

    await axios.delete('https://extracker-api.herokuapp.com/api/exercises/' + id, {}, {
      headers: headers
    });

    var exercises = await axios.get('https://extracker-api.herokuapp.com/api/exercises?userId=' + userId, { headers: headers });
    this.setState({ exercises: exercises.data, loading: false  });
  }

  async handleSubmit(event) {
    event.preventDefault();
    const userId = this.state.user_id;
    const headers = {
      'Authorization': `Bearer ${auth0Client.getAccessToken()}`,
      crossDomain: true
    }

    this.setState({ loading: true });
    // set loading screen
    await axios.post('https://extracker-api.herokuapp.com/api/exercises', {
      name: name,
      description: description,
      userId: userId
    }, {
      headers: headers
    });
    var exercises = await axios.get('https://extracker-api.herokuapp.com/api/exercises?userId=' + userId, { headers: headers });
    this.setState({ exercises: exercises.data, loading: false  });
  }

  render() {
    return (
      <div className="container">
        { !auth0Client.isAuthenticated() && <div className="row"><p>Please sign in to add/view exercises.</p></div> }
        {
          (auth0Client.isAuthenticated() && this.state.loading) &&
          <div className="row" style={loadingDiv}>
            <SyncLoader
              css={loadingCss}
              sizeUnit={"px"}
              size={10}
              color={'#2C3E50'}
              loading={this.state.loading}
            />
          </div>
        }
        { (auth0Client.isAuthenticated() && !this.state.loading)
          &&
          <div className="row">
            <div className="card" className="displayCard">
              <div className="card-body">
                <h5 className="card-title">Add Exercise</h5>
                <form onSubmit={this.handleSubmit} className="form-group">
                  <div className="row">
                    <div className="col">
                      <label>
                        Exercise Name:
                        <input type="text" onChange={this.handleName} className="form-control"/>
                      </label>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col">
                      <label>
                        Exercise Description:
                        <textarea type="text" onChange={this.handleDescription} className="form-control"/>
                      </label>
                    </div>
                  </div>
                  <input type="submit" value="Submit" />
                </form>
              </div>
            </div>
            <div className="card" className="displayCard">
              <div className="card-body">
                <h5 className="card-title">Exercises</h5>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Description</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                  {this.state.exercises && this.state.exercises.map(exercise => (
                    <tr>
                      <td><Link to={'/exercises/' + exercise.exerciseId}>{exercise.name}</Link></td>
                      <td>{exercise.description}</td>
                      <td><button onClick={() => this.handleDelete(exercise.exerciseId)}>Delete</button></td>
                    </tr>
                  ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        }
      </div>
    )
  }
}

export default Exercises;
