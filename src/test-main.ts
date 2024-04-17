import "./styles.css";

import { TestFile } from "./test-file";
import { SecondTestFile } from "./test-file-2";

import { createApp, h } from "vue";
import App from "./App.vue";

new TestFile();

new SecondTestFile();

const app = createApp({
  render: () => h(App),
});

class CustomElement extends HTMLElement {
  connectedCallback() {
    const mountPoint = document.querySelector("custom-element");
    if (mountPoint) {
      app.mount(mountPoint);
    }
  }
}

window.customElements.define("custom-element", CustomElement);
