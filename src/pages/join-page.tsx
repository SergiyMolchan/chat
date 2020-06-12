import * as React from 'react';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { useState } from 'react';
import { useHistory } from "react-router-dom";
import socket from '../socket';

export interface IJoinPageProps {
}

export default function JoinPage (props: IJoinPageProps) {

  let history = useHistory();
  const [room, setRoom] = useState('');
  const [login, setLogin] = useState('');

  const joinRoom = () => {
    const JoinData = {user: login, room: room};
    localStorage.setItem('user', login);
    localStorage.setItem('room', room);
    socket.emit('userJoinInRoom', JSON.stringify(JoinData));
    history.push('/ChatPage');
  }

  return (
    <Container>
    <Row>
        <Col md={{ span: 6, offset: 3 }}>
          <Card style={{marginTop: '50px'}}>
              <Card.Body>
                  <Card.Title style={{textAlign: 'center'}}>Join in room</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted" style={{textAlign: 'center'}}>Enter room id and your login</Card.Subtitle>
                  <hr/>
                  <Form>
                  <Form.Group controlId="formBasicEmail">
                      <Form.Label>Room id</Form.Label>
                      <Form.Control type="text" placeholder="Enter room id" value={room} onChange={e => setRoom(e.target.value)} />
                  </Form.Group>

                  <Form.Group controlId="formBasicEmail">
                      <Form.Label>Login</Form.Label>
                      <Form.Control type="text" placeholder="Enter login" value={login} onChange={e => setLogin(e.target.value)}/>
                  </Form.Group>

                  <Button variant="primary" type="button" style={{width: '100%'}} onClick={joinRoom}>
                      Submit
                  </Button>
                  </Form>
              </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>

  );
}
