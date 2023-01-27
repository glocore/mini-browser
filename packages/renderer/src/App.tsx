import './index.css';
import {versions, electronApi} from '#preload';
import {useCallback, useEffect, useRef, useState} from 'react';

console.log(versions);

const App = () => {
  const [url, setUrl] = useState('');

  const hasSubscribedToUrlChanges = useRef<boolean>(false);
  useEffect(() => {
    if (hasSubscribedToUrlChanges.current) return;

    electronApi.subscribeToUrlChanges(url => {
      console.log('url changed', url);
      setUrl(url);
    });

    hasSubscribedToUrlChanges.current = true;
  }, []);

  const handleSubmit = useCallback(
    (e: any) => {
      e.preventDefault();
      console.log('submit', url);
      electronApi.updateUrl(url);
    },
    [url],
  );

  return (
    <form
      style={{
        display: 'flex',
      }}
      onSubmit={handleSubmit}
    >
      <input
        value={url}
        onChange={e => setUrl(e.target.value)}
        style={{
          flex: 0.9,
          height: 45,
        }}
      />
    </form>
  );
};
export default App;
