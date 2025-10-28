import React, { useState, useEffect } from 'react';

const CacheBustedImage = ({ src, alt, className, ...props }) => {
  const [url, setUrl] = useState('');

  useEffect(() => {
    if (src) {
      // Add a timestamp parameter to bust cache
      const timestamp = new Date().getTime();
      const separator = src.includes('?') ? '&' : '?';
      setUrl(`${src}${separator}t=${timestamp}`);
    }
  }, [src]);

  return <img src={url} alt={alt} className={className} {...props} />;
};

export default CacheBustedImage;