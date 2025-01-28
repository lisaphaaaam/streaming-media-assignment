// Streaming media because it keeps memory low and processing efficient,
// whereas hosting is too memory intensive for server and browser.
// Streaming: sending data in pieces, rather than all at once
const fs = require('fs'); // pull in the file system module

const index = fs.readFileSync(`${__dirname}/../client/client.html`);
const pageTwo = fs.readFileSync(`${__dirname}/../client/client2.html`);
const pageThree = fs.readFileSync(`${__dirname}/../client/client3.html`);

const getIndex = (request, response) => {
  // writeHead: allows you to write a status code and JSON object of the headers to send back
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.write(index);
  response.end();
};

const getPageTwo = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.write(pageTwo);
  response.end();
};

const getPageThree = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.write(pageThree);
  response.end();
};

module.exports.getIndex = getIndex;
module.exports.getPageTwo = getPageTwo;
module.exports.getPageThree = getPageThree;
