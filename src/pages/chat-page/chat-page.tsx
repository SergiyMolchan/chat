import * as React from 'react';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ListGroup from 'react-bootstrap/ListGroup'
import { useState, useEffect } from 'react';
import socket from '../../socket';

export interface IChatPageProps {
}

export default function ChatPage (props: IChatPageProps) {

    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        socket.once('message', (data: never) => {
            const newMessages: never[] = [...messages, JSON.parse(data)] as never[];
            setMessages(newMessages);
        }); 
    }, [messages]);
    
    const sendMessage = () => {
        const newMessage = {
            author: localStorage.getItem('user'),
            message: message,
            room: localStorage.getItem('room')
        }
        socket.emit('message', JSON.stringify(newMessage));
        setMessage('');
    }

    return (
        <Container>
            <Row>
            <Col md={{ span: 6, offset: 3 }}>
                <Card>
                    <Card.Body>
                        <Card.Title style={{textAlign: 'center'}}>room name</Card.Title>
                        <hr/>
                        <Card style={{overflowY: 'scroll', maxHeight: '450px', height: '450px' }}>
                            <ListGroup variant="flush">
                                {
                                    messages.map((message: any, index) => <ListGroup.Item key={`${message}-${index}`}>{message.author + ': ' + message.message}</ListGroup.Item>)
                                }
                            </ListGroup>
                        </Card>

                        <Form style={{display: 'flex', marginTop: '10px'}}>

                        <Form.Group controlId="formBasicEmail" style={{width: '100%'}}>
                            <Form.Control type="text" placeholder="Enter room id" value={message} onChange={e => setMessage(e.target.value)} />
                        </Form.Group>

                        <Button variant="primary" type="button" style={{height: '50%'}} onClick={sendMessage}>
                            Send
                        </Button>
                        </Form>
                    </Card.Body>
                </Card>
            </Col>
            </Row>
        </Container>
    );
}