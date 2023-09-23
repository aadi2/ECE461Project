const fs = require('fs');
const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const { getInfo, processUrls } = require('./parser');

describe('parser.js', () => {
  describe('getInfo', () => {
    it('should log a message when processing a URL', () => {
      const consoleLogStub = sinon.stub(console, 'log');
      const url = 'https://example.com';
      getInfo(url);
      expect(consoleLogStub.calledWith(`Processing URL: ${url}`)).to.be.true;
      consoleLogStub.restore();
    });
  });

  describe('processUrls', () => {
    it('should reject with an error if the file is empty', async () => {
      try {
        const filePath = 'empty-file.txt';
        const rejectStub = sinon.stub().throws(new Error('File is empty or contains only whitespace.'));
        sinon.stub(fs, 'readFile').callsArgWith(2, null, '');
        await processUrls(filePath).catch(rejectStub);
        expect(rejectStub.calledOnce).to.be.true;
      } finally {
        fs.readFile.restore();
      }
    });

    it('should reject with an error if no URLs are found in the file', async () => {
      try {
        const filePath = 'no-urls-file.txt';
        const rejectStub = sinon.stub().throws(new Error('No URLs found in the file.'));
        sinon.stub(fs, 'readFile').callsArgWith(2, null, '\n \n \n');
        await processUrls(filePath).catch(rejectStub);
        expect(rejectStub.calledOnce).to.be.true;
      } finally {
        fs.readFile.restore();
      }
    });

    it('should resolve with an array of URLs when valid data is provided', async () => {
      const filePath = 'valid-urls-file.txt';
      const resolveStub = sinon.stub().returns([]);
      sinon.stub(fs, 'readFile').callsArgWith(2, null, 'https://url1.com\nhttps://url2.com\n');
      await processUrls(filePath).then(resolveStub);
      expect(resolveStub.calledOnce).to.be.true;
      expect(resolveStub.firstCall.args[0]).to.deep.equal(['https://url1.com', 'https://url2.com']);
    });
  });
});
