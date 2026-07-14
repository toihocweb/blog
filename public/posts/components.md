# Components and Props

Components let you split the UI into independent, reusable pieces, and think about each piece in isolation.

## What is a Component?
Conceptually, components are like JavaScript functions. They accept arbitrary inputs (called "props") and return React elements describing what should appear on the screen.

```jsx
function Welcome(props) {
  return <h1>Hello, {props.name}</h1>;
}
```

## Props are Read-Only
Whether you declare a component as a function or a class, it must never modify its own props. React is pretty flexible but it has a single strict rule:

> All React components must act like pure functions with respect to their props.
