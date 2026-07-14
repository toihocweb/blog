# State and Lifecycle

State allows React components to change their output over time in response to user actions, network responses, and anything else, without violating this rule.

## Adding Local State to a Class
In older React versions, state was primarily used in Class components.

## Using State Hooks
With modern React, we use the `useState` hook.

```jsx
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
```

This makes managing state intuitive and keeps the component clean.
