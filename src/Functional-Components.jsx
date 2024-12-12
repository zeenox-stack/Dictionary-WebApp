import React, { Component } from "react";

class ErrorBoundary extends Component {
  constructor(message) {
    super(message);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error(
      error,
      info,
      `Timestamp: ${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}--${new Date().getDate()}/${new Date().getMonth()}/${new Date().getFullYear()}`
    );
  }

  render() {
    if (this.state.hasError) {
      return <h1>Error occured! try reloading or you can try again</h1>;
    }
    return this.props.children;
  }
}

export function setAnimation(toAttach, toAnimate) {
  toAttach.addEventListener("click", () => {
    const currentTransform = window.getComputedStyle(toAnimate).transform;

    const isAtEnd =
      currentTransform === "none" ||
      currentTransform.includes("matrix(1, 0, 0, 1, 0, 0)");

    toAnimate.style.transform = isAtEnd ? "translateX(85%)" : "translateX(0%)";
    toAnimate.style.animation = `${
      isAtEnd ? "slideRight" : "slideLeft"
    } 1s ease`;

    toAnimate.addEventListener(
      "animationend",
      () => {
        toAnimate.style.animation = "";
      },
      { once: true }
    );
  });
}

export default ErrorBoundary;
