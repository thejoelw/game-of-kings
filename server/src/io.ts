import fs from 'fs';
import http from 'http';
import socketIO, { Socket } from 'socket.io';

const server = http.createServer((req, res) => {
	fs.readFile(__dirname + '/index.html', (err, data) => {
		if (err) {
			res.writeHead(500);
			return res.end('Error loading index.html');
		}

		res.writeHead(200);
		res.end(data);
	});
});

export const io = socketIO(server);

server.listen(3001);
