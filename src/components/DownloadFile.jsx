/**
 * DownloadFile Component
 * 
 * A button component that downloads a file from IPFS.
 */

import React, { useState } from 'react';
import { downloadFromIpfs, getGatewayUrl } from '../ipfs/ipfsClient';

const DownloadFile = ({ cid, fileName }) => {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');

  const handleDownload = async () => {
    setDownloading(true);
    setError('');

    try {
      await downloadFromIpfs(cid, fileName);
    } catch (error) {
      console.error('Download error:', error);
      setError('Failed to download');
      
      // Fallback: open in new tab
      window.open(getGatewayUrl(cid), '_blank');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleDownload}
        disabled={downloading}
        className="download-button"
        title={error || `Download ${fileName}`}
      >
        {downloading ? '...' : 'Download'}
      </button>

      <style>{`
        .download-button {
          padding: 6px 12px;
          background: #18181b;
          color: #fff;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 500;
          transition: all 0.15s ease;
        }

        .download-button:hover:not(:disabled) {
          background: #27272a;
        }

        .download-button:active:not(:disabled) {
          background: #18181b;
        }

        .download-button:disabled {
          background: #d4d4d8;
          cursor: wait;
        }
      `}</style>
    </>
  );
};

export default DownloadFile;
