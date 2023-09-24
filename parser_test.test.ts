import * as fs from 'fs';
import { expect } from 'chai';
import * as sinon from 'sinon';
import proxyquire from 'proxyquire';

// Import the module you want to test using proxyquire
const { getInfo, processUrls } = proxyquire('./parser', {
  fs: {
    // Mock the fs.readFile function
    readFile: (filePath: string, encoding: string, callback: (err: NodeJS.ErrnoException | null, data: string) => void) => {
      // Simulate successful file read
      callback(null, 'dummy file content');
    },
  },
});


describe('parser.js', () => {
  describe('getInfo', () => {
    it('should log a message when processing a URL', () => {
      const consoleLogStub = sinon.stub(console, 'log');
      const url = 'https://example.com';
      getInfo(url);
      expect(consoleLogStub.calledWith(`Processing URL: ${url}`)).to.be.true;
      consoleLogStub.restore();
    });

    // ... (other getInfo test cases)

    it('should log a message when processing an empty URL', () => {
      const consoleLogStub = sinon.stub(console, 'log');
      const url = '';
      getInfo(url);
      expect(consoleLogStub.calledWith(`Processing URL: ${url}`)).to.be.true;
      consoleLogStub.restore();
    });
  });

  describe('processUrls', () => {
    // ... (previous processUrls test cases)

    it('should reject with an error if file content contains only whitespace', async () => {
      const filePath = 'whitespace-file.txt';
      const rejectStub = sinon.stub().throws(new Error('File contains only whitespace.'));
      sinon.stub(fs, 'readFile').callsArgWith(2, null, ' \n  \t  \n ');
      await processUrls(filePath).catch(rejectStub);
      expect(rejectStub.calledOnce).to.be.true;
    });

    it('should resolve with an array of URLs when valid data with mixed whitespace is provided', async () => {
      const filePath = 'mixed-whitespace-file.txt';
      const resolveStub = sinon.stub().returns([]);
      sinon.stub(fs, 'readFile').callsArgWith(2, null, 'https://url1.com\n  \nhttps://url2.com\n \n');
      await processUrls(filePath).then(resolveStub);
      expect(resolveStub.calledOnce).to.be.true;
      expect(resolveStub.firstCall.args[0]).to.deep.equal(['https://url1.com', 'https://url2.com']);
    });

    it('should reject with an error if the file read encounters an error', async () => {
      const filePath = 'error-file.txt';
      const errorStub = sinon.stub().throws(new Error('File read error.'));
      sinon.stub(fs, 'readFile').callsArgWith(2, new Error('File read error.'));
      await processUrls(filePath).catch(errorStub);
      expect(errorStub.calledOnce).to.be.true;
    });

    it('should reject with an error if the file read returns empty content', async () => {
      const filePath = 'empty-content-file.txt';
      const rejectStub = sinon.stub().throws(new Error('File is empty.'));
      sinon.stub(fs, 'readFile').callsArgWith(2, null, '');
      await processUrls(filePath).catch(rejectStub);
      expect(rejectStub.calledOnce).to.be.true;
    });
  });
});
