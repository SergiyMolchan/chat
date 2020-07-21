import * as React from 'react';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { useState, useEffect } from 'react';
import { useHistory } from "react-router-dom";
import socket from '../socket';

export interface IJoinPageProps {
}

const JoinPage: React.FC = (props: IJoinPageProps) => {

  let history = useHistory();
  const [room, setRoom] = useState<string>('');
  const [login, setLogin] = useState<string>('');

  useEffect(() => {
    localStorage.removeItem('user');
    localStorage.removeItem('room');

  });

  const isValidForm = () => {
    if (!!login && !!room) {
      return true;
    } else {
      return false;
    }
  };

  const joinRoom = () => {
    if (isValidForm()) {
      const JoinData = JSON.stringify({
          type: 'userJoinInRoom',
          data: {user: login, room: room}
        });
      localStorage.setItem('user', login);
      localStorage.setItem('room', room);
      socket.send(JoinData);
      history.push('/ChatPage');
    }
  };

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

                    <Button variant="primary" type="button" style={{width: '100%'}} onClick={joinRoom} disabled={!isValidForm()}>
                        Join
                    </Button>
                  </Form>
              </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default JoinPage;
