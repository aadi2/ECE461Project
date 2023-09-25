/*
This file is part of ECE461Project.

ECE461Projectis free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or any later version.

ECE461Project is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Foobar. If not, see https://www.gnu.org/licenses/. 
*/

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

    it('should log a message when processing another URL', () => {
      const consoleLogStub = sinon.stub(console, 'log');
      const url = 'https://another-example.com';
      getInfo(url);
      expect(consoleLogStub.calledWith(`Processing URL: ${url}`)).to.be.true;
      consoleLogStub.restore();
    });

    it('should log a message when processing an empty URL', () => {
      const consoleLogStub = sinon.stub(console, 'log');
      const url = '';
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

    // Additional test cases
    it('should handle and resolve a large number of URLs', async () => {
      const filePath = 'large-urls-file.txt';
      const urls = Array.from({ length: 100 }, (_, i) => `https://url${i + 1}.com`);
      sinon.stub(fs, 'readFile').callsArgWith(2, null, urls.join('\n'));
      const resolvedUrls = await processUrls(filePath);
      expect(resolvedUrls).to.have.lengthOf(100);
    });

    it('should handle and resolve a file with mixed data', async () => {
      const filePath = 'mixed-data-file.txt';
      const data = 'https://url1.com\n \nhttps://url2.com\n';
      sinon.stub(fs, 'readFile').callsArgWith(2, null, data);
      const resolvedUrls = await processUrls(filePath);
      expect(resolvedUrls).to.have.lengthOf(2);
      expect(resolvedUrls).to.deep.equal(['https://url1.com', 'https://url2.com']);
    });

    it('should reject with an error when a file read error occurs', async () => {
      const filePath = 'non-existent-file.txt';
      const rejectStub = sinon.stub().throws(new Error('File not found.'));
      sinon.stub(fs, 'readFile').callsArgWith(2, new Error('File not found.'));
      await processUrls(filePath).catch(rejectStub);
      expect(rejectStub.calledOnce).to.be.true;
    });

    it('should handle a large number of URLs in the file', async () => {
      const filePath = 'large-urls-file.txt';
      const urlList = Array.from({ length: 10000 }, (_, i) => `https://url${i + 1}.com`).join('\n');
      sinon.stub(fs, 'readFile').callsArgWith(2, null, urlList);
      const resolvedUrls = await processUrls(filePath);
      expect(resolvedUrls.length).to.equal(10000);
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

    it('should resolve with an array of URLs when valid data with multiple URLs per line is provided', async () => {
      const filePath = 'multiple-urls-per-line.txt';
      const resolveStub = sinon.stub().returns([]);
      sinon.stub(fs, 'readFile').callsArgWith(2, null, 'https://url1.com https://url2.com');
      await processUrls(filePath).then(resolveStub);
      expect(resolveStub.calledOnce).to.be.true;
      expect(resolveStub.firstCall.args[0]).to.deep.equal(['https://url1.com', 'https://url2.com']);
    });
  });
});
