const fs = require('fs'); // pull in the file system module
const path = require('path');

// callback function
// if err field if not null, then there was an error
// if error code is ENOENT (Error NO ENTry), then file could not be found
const handleError = (response, err) => {
  if (err.code === 'ENOENT') {
    response.writeHead(404);
    return response.end('File not found');
  }
  return response.end(`Error: ${err.message}`);
};

// grab byte range from request's range header
// first, replace bytes= with nothing to get 0000-0001
// second, parse starting range
// lastly, check if we get end position from client.
// If not, set end position to end of file. If yes, parse into base 10.
const getRange = (range, total) => {
  const positions = range.replace(/bytes=/, '').split('-');

  let start = parseInt(positions[0], 10); // 10 is which number base to use, readable numbers
  const end = positions[1] ? parseInt(positions[1], 10) : total - 1;

  if (start > end) {
    start = end - 1;
  }

  return { start, end };
};

// determine how big of a chunk we are sending to browser
// need to set headers for client
const setHeaders = (response, {
  start, end, total, fileType,
}) => {
  const chunksize = (end - start) + 1;

  response.writeHead(206, {
    'Content-Range': `bytes ${start}-${end}/${total}`, // how much we are sending out in total
    'Accept-Ranges': 'bytes', // tell browser what type of data to expect the range in
    'Content-Length': chunksize, // tell browser how big this chunk is in bytes
    'Content-Type': fileType, // tell browser encoding type so it reassemble byte correctly
  });
};

const loadFile = (request, response, fileName, fileType) => {
  // resolve: create File object, takes a directory and relative path to a file from that directory
  // does NOT load file, but create file object based on that file
  const file = path.resolve(__dirname, `../client/${fileName}`);

  // stat: provide statistics about file, async function
  // takes file object and a callback function of what to do next
  fs.stat(file, (err, stats) => {
    if (err) {
      handleError(response, err);
    }

    // requests to stream media are sent with a range header that requests a byte range of the file
    // send bytes that are requested and valid to keep memory low and processing efficient
    let { range } = request.headers; // ES6 destructoring assignment

    if (!range) {
      range = 'bytes=0-';
    }

    const total = stats.size;
    const { start, end } = getRange(range, total);

    setHeaders(response, {
      start, end, total, fileType,
    });

    // file stream: take a file object and an object containing start and end points in bytes
    // provide callback functions for when stream is in open/error states since they're synchronous

    // second param creates an object with the names passed in
    const stream = fs.createReadStream(file, { start, end });

    stream.on('open', () => {
      stream.pipe(response); // stream function in node to set output of stream to another stream
    });

    stream.on('error', (streamErr) => {
      response.end(streamErr);
    });

    return stream;
  });
};

const getParty = (request, response) => {
  loadFile(request, response, 'party.mp4', 'video/mp4');
};

const getBling = (request, response) => {
  loadFile(request, response, 'bling.mp3', 'audio/mpeg');
};

const getBird = (request, response) => {
  loadFile(request, response, 'bird.mp4', 'video/mp4');
};

module.exports = {
  getParty,
  getBling,
  getBird,
};
