import * as React from 'react';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ListGroup from 'react-bootstrap/ListGroup'
import { useState, useEffect, useRef } from 'react';
import socket from '../socket';
import { useHistory } from 'react-router-dom';
import Alert from 'react-bootstrap/Alert'

export interface IChatPageProps {
}

const ChatPage: React.FC = (props: IChatPageProps) => {
	let history = useHistory();
	const [message, setMessage] = useState<string>('');
	const [messages, setMessages] = useState<never[]>([]);
	const [users, setUsers] = useState<never[]>([]);
	const messagesRef: any = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		if (!localStorage.getItem('user') && !localStorage.getItem('room')) {
			history.push('/');
		}
		socket.once('message', (data: never) => {
			const newMessages: never[] = [...messages, JSON.parse(data)] as never[];
			setMessages(newMessages);
		});
		socket.once('updateUsers', (data: never) => {
			setUsers(JSON.parse(data).users);
		});
		messagesRef.current.scrollTo(0, 9999);
	}, [messages, history]);
	
	const sendMessage = () => {
		if (message) {
			const newMessage = {
				author: localStorage.getItem('user'),
				message: message,
				room: localStorage.getItem('room')
			}
			socket.emit('message', JSON.stringify(newMessage));
			setMessage('');
		}
	}

	const heandlePressEnter = (event: React.KeyboardEvent<HTMLFormElement>) => {
		event.preventDefault();
		sendMessage();
	}

	return (
		<Container>
			<Row>
				<Col xs={{ span: 12, offset: 0 }} md={{ span: 10, offset: 0 }} style={{ padding: '0px' }}>
					<Card>
						<Card.Body>
							<Card.Title style={{ textAlign: 'center' }}>{`Room: ${localStorage.getItem('room')}`}</Card.Title>
							<hr />
							<Card ref={messagesRef} style={{ overflowY: 'scroll', maxHeight: '80vh', height: '75vh' }}>
								<ListGroup variant="flush">
									{
										messages.map((message: any, index) => <ListGroup.Item key={`${message}-${index}`} style={{border: 'none'}}>
											<Alert variant='primary' style={{margin: '0'}}>
												{message.author + ': ' + message.message}
  										</Alert>
										</ListGroup.Item>)
									}
								</ListGroup>
							</Card>

							<Form style={{ display: 'flex' }} onSubmit={heandlePressEnter}>
								<Form.Group controlId="formBasicEmail" style={{ width: '100%' }}>
									<Form.Control type="text" placeholder="Enter room id" value={message} onChange={e => setMessage(e.target.value)}/>
								</Form.Group>

								<Button variant="primary" type="button" style={{ height: '50%' }} onClick={sendMessage}>
									Send
                </Button>
							</Form>
						</Card.Body>
					</Card>
				</Col>
				<Col xs={{ span: 12, offset: 0 }} md={{ span: 2, offset: 0 }} style={{ padding: '0px' }}>
					<Card style={{ height: '100%' }}>
						<Card.Body style={{ padding: '20px 0px' }}>
							<Card.Title style={{ textAlign: 'center' }}>{`Online: ${users.length}`}</Card.Title>
							<hr />
							<Card style={{ overflowY: 'scroll', maxHeight: '80vh', height: '75vh' }}>
								<ListGroup variant="flush">
									{
										users.map((user: any, index) => <ListGroup.Item key={`${message}-${index}`}>{user.user}</ListGroup.Item>)
									}
								</ListGroup>
							</Card>
						</Card.Body>
					</Card>
				</Col>
			</Row>
		</Container>
	);
}

export default ChatPage;