/*
This file is part of ECE461Project.

ECE461Projectis free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or any later version.

ECE461Project is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Foobar. If not, see https://www.gnu.org/licenses/. 
*/

import * as fs from 'fs';
import { expect } from 'chai';
import * as sinon from 'sinon';
import proxyquire from 'proxyquire';

const { getInfo, processUrls } = proxyquire('./parser', {
  fs: {
    readFile: (filePath: string, encoding: string, callback: (err: NodeJS.ErrnoException | null, data: string) => void) => {
      callback(null, 'dummy file content');
    },
  },
});

describe('parser.js', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('getInfo', () => {
    it('should log a message when processing a URL', () => {
      const consoleLogStub = sinon.stub(console, 'log');
      const url = 'https://example.com';
      getInfo(url);
      expect(consoleLogStub.calledWith(`Processing URL: ${url}`)).to.be.true;
    });

    it('should log a message when processing another URL', () => {
      const consoleLogStub = sinon.stub(console, 'log');
      const url = 'https://another-example.com';
      getInfo(url);
      expect(consoleLogStub.calledWith(`Processing URL: ${url}`)).to.be.true;
    });

    it('should log a message when processing an empty URL', () => {
      const consoleLogStub = sinon.stub(console, 'log');
      const url = '';
      getInfo(url);
      expect(consoleLogStub.calledWith(`Processing URL: ${url}`)).to.be.true;
    });
  });

  describe('processUrls', () => {
    it('should reject with an error if file content contains only whitespace', async () => {
      const filePath = 'whitespace-file.rtf';
      const rejectStub = sinon.stub().throws(new Error('File contains only whitespace.'));
      sinon.stub(fs, 'readFile').callsArgWith(2, null, ' \n  \t  \n ');
      await processUrls(filePath).catch(rejectStub);
      expect(rejectStub.calledOnce).to.be.true;
    });

    it('should resolve with an array of URLs when valid data with mixed whitespace is provided', async () => {
      const filePath = 'mixed-whitespace-file.rtf';
      const resolveStub = sinon.stub().returns([]);
      sinon.stub(fs, 'readFile').callsArgWith(2, null, 'https://url1.com\n  \nhttps://url2.com\n \n');
      await processUrls(filePath).then(resolveStub);
      expect(resolveStub.calledOnce).to.be.true;
      expect(resolveStub.firstCall.args[0]).to.deep.equal(['https://url1.com', 'https://url2.com']);
    });

    it('should reject with an error if the file read encounters an error', async () => {
      const filePath = 'error-file.rtf';
      const errorStub = sinon.stub().throws(new Error('File read error.'));
      sinon.stub(fs, 'readFile').callsArgWith(2, new Error('File read error.'));
      await processUrls(filePath).catch(errorStub);
      expect(errorStub.calledOnce).to.be.true;
    });

    it('should reject with an error if the file read returns empty content', async () => {
      const filePath = 'empty-content-file.rtf';
      const rejectStub = sinon.stub().throws(new Error('File is empty.'));
      sinon.stub(fs, 'readFile').callsArgWith(2, null, '');
      await processUrls(filePath).catch(rejectStub);
      expect(rejectStub.calledOnce).to.be.true;
    });

    // Additional test cases...
    it('should process URLs from a file and filter out invalid ones', async () => {
      const filePath = 'mixed-content-file.rtf';
      const content = 'https://valid-url.com\nnot-a-url\nhttps://another-valid-url.com';
      const resolveStub = sinon.stub().returns([]);
      sinon.stub(fs, 'readFile').callsArgWith(2, null, content);
      await processUrls(filePath).then(resolveStub);
      expect(resolveStub.calledOnce).to.be.true;
      expect(resolveStub.firstCall.args[0]).to.deep.equal(['https://valid-url.com', 'https://another-valid-url.com']);
    });

    it('should process URLs and trim whitespace', async () => {
      const filePath = 'trimmed-whitespace-file.rtf';
      const content = '   https://valid-url.com   \n   not-a-url   \n   https://another-valid-url.com   ';
      const resolveStub = sinon.stub().returns([]);
      sinon.stub(fs, 'readFile').callsArgWith(2, null, content);
      await processUrls(filePath).then(resolveStub);
      expect(resolveStub.calledOnce).to.be.true;
      expect(resolveStub.firstCall.args[0]).to.deep.equal(['https://valid-url.com', 'https://another-valid-url.com']);
    });

    it('should handle large files efficiently', async () => {
      const filePath = 'large-file.rtf';
      const largeFileContent = 'https://example.com\n'.repeat(10000);
      const resolveStub = sinon.stub().returns([]);
      sinon.stub(fs, 'readFile').callsArgWith(2, null, largeFileContent);
      await processUrls(filePath).then(resolveStub);
      expect(resolveStub.calledOnce).to.be.true;
      expect(resolveStub.firstCall.args[0]).to.have.lengthOf(10000);
    });

        it('should process URLs and ignore commented lines', async () => {
          const filePath = 'commented-file.rtf';
          const content = 'https://valid-url.com\n# This is a comment line\nhttps://another-valid-url.com';
          const resolveStub = sinon.stub().returns([]);
          sinon.stub(fs, 'readFile').callsArgWith(2, null, content);
          await processUrls(filePath).then(resolveStub);
          expect(resolveStub.calledOnce).to.be.true;
          expect(resolveStub.firstCall.args[0]).to.deep.equal(['https://valid-url.com', 'https://another-valid-url.com']);
      });
  
      it('should ignore lines with only whitespace when processing URLs', async () => {
          const filePath = 'whitespace-lines-file.rtf';
          const content = 'https://valid-url.com\n\nhttps://another-valid-url.com';
          const resolveStub = sinon.stub().returns([]);
          sinon.stub(fs, 'readFile').callsArgWith(2, null, content);
          await processUrls(filePath).then(resolveStub);
          expect(resolveStub.calledOnce).to.be.true;
          expect(resolveStub.firstCall.args[0]).to.deep.equal(['https://valid-url.com', 'https://another-valid-url.com']);
      });
  
      it('should process and decode URLs with special characters', async () => {
          const filePath = 'encoded-url-file.rtf';
          const content = 'https://example.com/%20space\nhttps://example.com/%3Fquery';
          const resolveStub = sinon.stub().returns([]);
          sinon.stub(fs, 'readFile').callsArgWith(2, null, content);
          await processUrls(filePath).then(resolveStub);
          expect(resolveStub.calledOnce).to.be.true;
          expect(resolveStub.firstCall.args[0]).to.deep.equal(['https://example.com/ space', 'https://example.com/?query']);
      });
  
      it('should process URLs and add the "https://" prefix if missing', async () => {
        const filePath = 'no-https-file.rtf';
        const content = 'example.com\nwww.another-example.com';
        const resolveStub = sinon.stub().returns([]);
        sinon.stub(fs, 'readFile').callsArgWith(2, null, content);
        await processUrls(filePath).then(resolveStub);
        expect(resolveStub.calledOnce).to.be.true;
        expect(resolveStub.firstCall.args[0]).to.deep.equal(['https://example.com', 'https://www.another-example.com']);
      });

      it('should process only unique URLs', async () => {
          const filePath = 'duplicate-urls-file.rtf';
          const content = 'https://example.com\nhttps://example.com';
          const resolveStub = sinon.stub().returns([]);
          sinon.stub(fs, 'readFile').callsArgWith(2, null, content);
          await processUrls(filePath).then(resolveStub);
          expect(resolveStub.calledOnce).to.be.true;
          expect(resolveStub.firstCall.args[0]).to.deep.equal(['https://example.com']);
      });
  
      it('should handle files with a large number of unique URLs', async () => {
          const filePath = 'many-unique-urls-file.rtf';
          const manyUrls = Array.from({ length: 5000 }, (_, i) => `https://example${i}.com`).join('\n');
          const resolveStub = sinon.stub().returns([]);
          sinon.stub(fs, 'readFile').callsArgWith(2, null, manyUrls);
          await processUrls(filePath).then(resolveStub);
          expect(resolveStub.calledOnce).to.be.true;
          expect(resolveStub.firstCall.args[0]).to.have.lengthOf(5000);
      });
  
      it('should process URLs and filter out non-HTTP/HTTPS schemes', async () => {
          const filePath = 'mixed-schemes-file.rtf';
          const content = 'ftp://invalid-url.com\nhttps://valid-url.com\nmailto:email@example.com';
          const resolveStub = sinon.stub().returns([]);
          sinon.stub(fs, 'readFile').callsArgWith(2, null, content);
          await processUrls(filePath).then(resolveStub);
          expect(resolveStub.calledOnce).to.be.true;
          expect(resolveStub.firstCall.args[0]).to.deep.equal(['https://valid-url.com']);
      });
  
      it('should process URLs with port numbers correctly', async () => {
          const filePath = 'port-number-file.rtf';
          const content = 'https://example.com:8080\nhttps://another-example.com:443';
          const resolveStub = sinon.stub().returns([]);
          sinon.stub(fs, 'readFile').callsArgWith(2, null, content);
          await processUrls(filePath).then(resolveStub);
          expect(resolveStub.calledOnce).to.be.true;
          expect(resolveStub.firstCall.args[0]).to.deep.equal(['https://example.com:8080', 'https://another-example.com:443']);
      });
  
      it('should handle files with both IPv4 and domain URLs', async () => {
          const filePath = 'ipv4-domain-file.rtf';
          const content = 'https://192.168.1.1\nhttps://example.com';
          const resolveStub = sinon.stub().returns([]);
          sinon.stub(fs, 'readFile').callsArgWith(2, null, content);
          await processUrls(filePath).then(resolveStub);
          expect(resolveStub.calledOnce).to.be.true;
          expect(resolveStub.firstCall.args[0]).to.deep.equal(['https://192.168.1.1', 'https://example.com']);
      });
  });
  });

