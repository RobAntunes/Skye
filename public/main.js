  
  
  const effect = (fn) => {
    subscribers.add(fn);
    fn();
  };
  
  let subscribers = new Set();
  function notifySubscribers() {
    subscribers.forEach(sub => sub());
  }